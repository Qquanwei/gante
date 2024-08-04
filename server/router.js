const Router  = require('koa-router');
const crypto = require('crypto');
const axios = require('axios');
const mongo = require('koa-mongo');
const bodyParser = require('koa-bodyparser');
const config = require('../config');
const helper = require('./helpers');

const router = new Router({
  prefix: '/api'
});

router.use(bodyParser());
router.use(mongo({
  uri: process.env.GANTE_MONGO_ADDR || config.MONGO_ADDR,
  max: 100,
  min: 1
}));

async function login(ctx, user) {
  const expire = 6 * 60 * 60 * 24 * 1000 + Date.now();
  const session = await helper.generateSessionByUser(ctx, user._id, expire);
  // 一天过期时间
  ctx.cookies.set('ud', session, {
    httpOnly: true,
    expires: new Date(expire)
  });
  ctx.redirect('/');
}

// github 回调地址
router.get('/cb/login/github', async (ctx, next) => {
  // github 临时 code 参数，用于获取详用户细信息
  const githubCode = ctx.query.code;

  console.log('->', githubCode);
  try {
    const tokenReq = await axios({
      url: 'https://github.com/login/oauth/access_token',
      method: 'post',
      responseType: 'json',
      headers: {
        accept: 'application/json'
      },
      data: {
        client_id: process.env.GANTE_GITHUB_CLIENT_ID,
        client_secret: process.env.GANTE_GITHUB_CLIENT_SECRET,
        code: githubCode
      }
    });

    let userReq = null;

    userReq = await axios({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `Bearer ${tokenReq.data.access_token}`
      }
    });
  } catch(e) {
    throw new Error('服务器访问github发生错误: ' + e.message );
  };

  console.log('get github user success', userReq.data);
  const User = ctx.db.collection('users');

  const currentUser = await User.findOne({
    githubUserId: userReq.data.id
  });

  if (currentUser) {
    // 如果已经是平台用户，则登录
    // pass
  } else {
    // 默认注册
    await User.insertOne({
      createDate: Date.now(),
      githubUserId: userReq.data.id,
      userName: userReq.data.name,
      avatar: userReq.data.avatar_url,
      defaultTableId: crypto.randomUUID()
    });
  }

  return await login(ctx, await User.findOne({
    githubUserId: userReq.data.id
  }));
});

// controller 和 service 先不拆开了。
router.post('/login', async (ctx, next) => {
  const User = ctx.db.collection('users');
  const { uname, password } = ctx.request.body;

  const user = await User.findOne({
    uname,
    password
  });

  if (user) {
    const expire = 6 * 60 * 60 * 24 * 1000 + Date.now();
    const session = await helper.generateSessionByUser(ctx, user._id, expire);
    ctx.cookies.set('ud', session, {
      httpOnly: true,
      expires: new Date(expire)
    });
    ctx.body = user;
    ctx.status = 200;
  } else {
    ctx.status = 401;
    ctx.body = {
      message: '身份凭证校验失败'
    };
  }
});

router.get('/count', async (ctx) => {
  const { listId } = ctx.query;
  const col = ctx.db.collection('mem');

  if (!listId) {
    ctx.status = 400;
    return;
  }

  const doc = await col.findOne({
    listId
  });
  if (!doc) {
    ctx.body = {
      count: 0,
      exceed: false
    }
  } else {
    ctx.body = {
      count: doc.count,
      exceed: doc.count >=  50
    }
  }
});

router.get('/user', async (ctx) => {
  const uid = await helper.getUserIdBySession(ctx);

  if (!uid) {
    ctx.status = 401;
    return;
  }

  const User = ctx.db.collection('users');
  const user = await User.findOne({
    _id: uid
  });

  if (user) {
    ctx.body = user;
  } else {
    ctx.status = 401;
  }
});

// 注册
// query: { return: encodeURIComponent('/editor')}
router.post('/reg', async (ctx, next) => {
  const { uname, password } = ctx.request.body;
  const User = ctx.db.collection('users');
  const user = await User.findOne({
    uname
  });
  if (user) {
    ctx.status = 401;
    ctx.body = {
      message: 'user exists'
    };
  } else {
    const uuid = crypto.randomBytes(24).toString('hex');
    const u = await User.insert({
      uname,
      password,
      defaultTableId: uuid
    });
    // 设置cookie
    const session = await helper.generateSessionByUser(ctx, u._id);
    ctx.cookies.set('ud', session, {
      httpOnly: true,
      expires: new Date(6 * 60 * 60 * 24 * 1000 + Date.now())
    });

    if (ctx.query && ctx.query.return) {
      ctx.redirect(ctx.query.return);
    } else {
      ctx.redirect('/');
    }
  }
});

const sms = require('./sms');

router.post('/captcha', async (ctx, next) => {
  const { phone } = ctx.request.body;
  if (!/^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/.test(phone)) {
    ctx.status = 401;
    ctx.body = {
      message: '手机号不合法'
    };
    return;
  }
  const captcha = ctx.db.collection('captcha');
  const captchaItem = await captcha.findOne({
    phone,
    sendTime: {
      '$gte': Date.now() - 60 * 1000
    }
  });

  if (!captchaItem) {
    const num = helper.generateCaptchaNumber();
    await sms.sendCaptchaSms({
      phone,
      number: num
    });
    await captcha.insertOne({
      phone,
      sendTime: Date.now(),
      number: num
    });
    ctx.body = { data: '发送成功' };
    return;
  }
  ctx.status = 401;
  ctx.body = {
    message: '发送太频繁'
  };
});

router.post('/captcha/login', async (ctx, next) => {
  const { phone, number } = ctx.request.body;
  const captcha = ctx.db.collection('captcha');
  const captchaItem = await captcha.findOne({
    phone,
    number,
    sendTime: {
      '$gte': Date.now() - 60 * 1000
    }
  });

  if (captchaItem) {
    const User = ctx.db.collection('users');
    const currentUser = await User.findOne({
      phone
    });

    if (currentUser) {
      // 如果已经是平台用户，则登录
      // pass
    } else {
      // 默认注册
      await User.insertOne({
        userName: '',
        phone,
        createDate: Date.now(),
        avatar: null,
        defaultTableId: crypto.randomUUID()
      });
    }

    return await login(ctx, await User.findOne({
      phone
    }));
  } else {
    ctx.status = 400;
    ctx.body = {
      message: '验证码不正确'
    };
  }

});

module.exports = router;
