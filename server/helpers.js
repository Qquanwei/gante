const crypto = require('crypto');

// in memory session
module.exports = {
  // 给websocket使用
  getUserByUD: async (ud, pgClient, { allowExpire = false}) => {
    if (!ud || !pgClient) {
      return null;
    }
    const data = await pgClient.query('select * from sessions where token = $1', [ud]);

    if (data && data.uid) {
      if (data.expire >= Date.now() || allowExpire) {
        return await pgClient.query('select * from users where _id = $1', [data.uid]);
      }
      return null;
    }
    return null;
  },

  getUserIdBySession: async (ctx) => {
    const ud = ctx.cookies.get('ud');

    console.log(ud);
    if (!ud) {
      return null;
    }

    const data = (await ctx.pgClient.query('select * from sessions where token = $1', [ud])).rows[0];
    console.log('->', data);

    if (data && data.uid) {
      if (data.expire >= Date.now()) {
        return data.uid;
      } else {
        return null;
      }
    }
    return null;
  },

  generateSessionByUser: async (ctx, id, expire) => {
    const session = await ctx.db.collection('session');

    const rid = crypto.randomUUID();

    await session.insertOne({
      token: rid,
      uid: id,
      expire
    });

    return rid;
  },

  generateCaptchaNumber() {
    let s = '';
    while (s.length < 6) {
      const n = Math.floor(Math.random()*10);
      if (n === 4) {
        continue;
      }
      s += n;
    }
    return s;
  },

  async queryOne(queryObj) {
    return (await queryObj).rows[0];
  }
};
