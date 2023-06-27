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

Services.prototype.getUser = async function () {
  const uid = await helper.getUserIdBySession(this.ctx);
  const user = (await helper.queryOne(this.ctx.pgClient.query('select _id, defaultTableId as \"defaultTableId\", userName as \"userName\"  from users where _id = $1', [uid])));
  return user;
};

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

module.exports = Services;
