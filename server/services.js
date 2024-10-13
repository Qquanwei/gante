const helper = require('./helpers');
function Services(ctx) {
  if (!ctx) {
    throw new Error('create services cannot provide ctx');
  }

  if (!(this instanceof Services)) {
    return new Services(ctx);
  }

  this.ctx = ctx;
};

Services.prototype.getGithubUser = async function(githubId) {
  const user = (await helper.queryOne(this.ctx.pgClient.query('select _id, defaultTableId as \"defaultTableId\", userName as \"userName\"  from users where githubUserId = $1', [githubId])));
  return user;
};

Services.prototype.getPhoneUser = async function(phone) {
  const user = (await helper.queryOne(this.ctx.pgClient.query('select _id, defaultTableId as \"defaultTableId\", userName as \"userName\"  from users where phone = $1', [phone])));
  return user;
};

Services.prototype.createPhoneUser = async function(phone, defaultTableId) {
  console.log('INSERT INTO users(phone, defaultTableId, createDate) values($1, $2, $3)', [
    phone, defaultTableId, Date.now() + ''
  ]);
  return await helper.queryOne(this.ctx.pgClient.query('INSERT INTO users(phone, defaultTableId, createDate) values($1, $2, $3)', [
    phone, defaultTableId, Date.now() + ''
  ]));
};

Services.prototype.createGithubUser = async function({
  githubId,
  userName,
  avatar,
  defaultTableId,
  createDate
}) {
  return await helper.queryOne(this.ctx.pgClient.query('INSERT INTO users(createDate, githubUserId, userName, avatar, defaultTableId) values($1, $2, $3, $4, $5)', [
    createDate, githubId, userName, avatar, defaultTableId
  ]));
};

Services.prototype.getUser = async function () {
  const uid = await helper.getUserIdBySession(this.ctx);
  const user = (await helper.queryOne(this.ctx.pgClient.query('select users._id, users.avatar, users.defaultTableId as \"defaultTableId\", users.userName as \"userName\", case when contributes.phone is NULL then false else true end as is_contributor  from users left join contributes on users.phone = contributes.phone where users._id = $1', [uid])));
  return user;
};

Services.prototype.getContributes = async function() {
  const contributes = (await helper.queryAll(this.ctx.pgClient.query('select username, content, contribute_date from contributes order by contribute_date desc')));
  return contributes;
}

// 从session里获取用户
Services.prototype.getUserByUD = async function(ud, { allowExpire = false }) {
  const data = await helper.queryOne(this.ctx.pgClient.query('select uid,expire from sessions where token = $1', [ud]));

  if (data && data.uid) {
    if (allowExpire || Number(data.expire) >= Date.now()) {
      return await this.getUser();
    }
    return null;
  }
  return null;
};

Services.prototype.addSuggest = async function(content, sender) {
  const user = await this.getUser();
  await helper.queryOne(this.ctx.pgClient.query('insert into suggests(content, sender, uid) values($1, $2, $3)', [
    content,
    sender,
    user._id
  ]));
};

Services.prototype.getCount = async function(listId) {
  const msm = await helper.queryOne(this.ctx.pgClient.query('select cnt from mem where listId = $1', [listId]));
  if (msm) {
    return msm.cnt;
  }
  return 0;
};

Services.prototype.updateUserName = async function(value) {
  const user = await this.getUser();
  if (!user) {
    throw new Error('forbidden');
  }
  await helper.queryOne(this.ctx.pgClient.query('update users set userName = $1 where _id = $2', [value, user._id]));
};

const sms = require('./sms');
Services.prototype.sendCaptcha = async function(phone) {
  const { cnt } = await helper.queryOne(this.ctx.pgClient.query('select count(1) as cnt from captcha where phone = $1 and sendTime >= $2', [
    phone,
    Date.now() - 60 * 1000
  ]));

  if (cnt > 0) {
    throw new Error('发送太频繁');
  }

  const num = helper.generateCaptchaNumber();
  if (process.env.NODE_ENV === 'production') {
    await sms.sendCaptchaSms({
      phone,
      number: num
    });
  } else {
    console.log('开发环境不会真正发送短信, 当前验证码为:', num);
  }
  await this.ctx.pgClient.query('INSERT INTO captcha(phone, number, sendTime) values($1, $2, $3)', [
    phone,
    num,
    Date.now()
  ]);
  return true;
};

Services.prototype.getPhoneUserByCaptcha = async function(phone, captcha, defaultTableId) {
  const { cnt } = await helper.queryOne(this.ctx.pgClient.query('select count(1) as cnt from captcha where phone = $1 and number = $2 and sendTime > $3', [
    phone, captcha, (Date.now() - 180 * 1000) + ''
  ]));

  // 验证码成功，检查是否已创建
  if (cnt != 0) {
    const user = await this.getPhoneUser(phone);
    if (user) {
      return user;
    } else {
      await this.createPhoneUser(phone, defaultTableId);
      return await this.getPhoneUser(phone);
    }
  } else {
    throw new Error('验证码错误');
  }
}

module.exports = Services;
