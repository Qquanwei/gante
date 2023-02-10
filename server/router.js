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
  uri: config.MONGO_ADDR,
  max: 100,
  min: 1
}));

async function login(ctx, user) {
  const session = await helper.generateSessionByUser(ctx, user._id);
  // 一天过期时间
  ctx.cookies.set('ud', session, {
    httpOnly: true,
    expires: new Date(60 * 60 * 24 * 1000 + Date.now())
  });
  ctx.redirect('/');
}

// github 回调地址
router.get('/cb/login/github', async (ctx, next) => {
  // github 临时 code 参数，用于获取详用户细信息
  const githubCode = ctx.query.code;

  console.log('->', githubCode);

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

  console.log('get token success', tokenReq.data);
  let userReq = null;

  try {
    userReq = await axios({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `Bearer ${tokenReq.data.access_token}`
      }
    });
  } catch((e) => {
    throw new Error('服务器访问github发生错误: ' + e.message );
  });

  console.log('get user success', userReq.data);
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
    const session = await helper.generateSessionByUser(ctx, user._id);
    ctx.cookies.set('ud', session, {
      httpOnly: true,
      expires: new Date(60 * 60 * 24 * 1000 + Date.now())
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
      expires: new Date(60 * 60 * 24 * 1000 + Date.now())
    });

    if (ctx.query && ctx.query.return) {
      ctx.redirect(ctx.query.return);
    } else {
      ctx.redirect('/');
    }
  }
});

module.exports = router;
