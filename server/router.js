const Router  = require('koa-router');
const crypto = require('crypto');
const axios = require('axios');
const bodyParser = require('koa-bodyparser');
const config = require('../config');
const helper = require('./helpers');
const R = require('ramda');
const Services = require('./services');

const router = new Router({
  prefix: '/api'
});

router.use(bodyParser());

async function login(ctx, user) {
  const expire = 365 * 60 * 60 * 24 * 1000 + Date.now();
  const session = await helper.generateSessionByUser(ctx, user._id, expire);
  // 一天过期时间
  ctx.cookies.set('ud', session, {
    httpOnly: true,
    domain: config.cookieDomain || '',
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
    await services.createGithubUser({
      githubId: userReq.data.id,
      createDate: Date.now(),
      userName: userReq.data.name,
      avatar: userReq.data.avatar_url,
      defaultTableId: crypto.randomUUID()
    });
  }

  return await login(ctx, await services.getGithubUser(userReq.data.id));
});

router.get('/count', async (ctx) => {
  const { listId } = ctx.query;
  const services = new Services(ctx);

  if (!listId) {
    ctx.status = 400;
    return;
  }

  const cnt = services.getCount(listId);
  ctx.body = {
    count: cnt,
    exceed: cnt > 50
  };
});


router.get('/user', async (ctx) => {
  const services = new Services(ctx);
  const user = await services.getUser();
  if (user) {
    ctx.body = user;
  } else {
    ctx.status = 401;
  }
});

router.get('/contributes', async (ctx) => {
  const services = new Services(ctx);
  const cbs = await services.getContributes();
  if (cbs) {
    ctx.body = cbs;
  } else {
    ctx.status = 500;
  }
});

router.put('/user/:property', async (ctx) => {
  const { value } = ctx.request.body;
  const { property } = ctx.params;

  // 仅允许修改特定字段
  if (!R.includes(property, ['userName'])) {
    ctx.status = 401;
    ctx.body = {
      message: 'forbidden'
    };
  }
  const services = new Services(ctx);
  if (property === 'userName') {
    await services.updateUserName(value);
    ctx.body = await services.getUser();
  } else {
    ctx.status = 401;
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
  const services = new Services(ctx);
  try {
    await services.sendCaptcha(phone);
    ctx.body = { data: '发送成功' };
  } catch(e) {
    ctx.status = 401;
    ctx.body = {
      message: e.message
    };
  }
});

router.post('/suggest', async (ctx, next) => {
  const { sender, content } = ctx.request.body;
  const services = new Services(ctx);
  await services.addSuggest(content, sender);
  ctx.status = 200;
  ctx.body = {
    message: '提交成功'
  };
});

router.post('/captcha/login', async (ctx, next) => {
  const { phone, number } = ctx.request.body;
  const defaultTableId = crypto.randomUUID();
  const services = new Services(ctx);

  try {
    const user = await services.getPhoneUserByCaptcha(phone, number, defaultTableId);
    return login(ctx, user);
  } catch(e) {
    console.error(e);
    ctx.status = 400;
    ctx.body = {
      message: e.message
    };
  }
});

module.exports = router;
