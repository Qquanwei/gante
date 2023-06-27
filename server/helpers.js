const crypto = require('crypto');

// in memory session
let helpers = null;
module.exports = helpers = {
  getUserIdBySession: async (ctx) => {
    const ud = ctx.cookies.get('ud');

    if (!ud) {
      return null;
    }

    const data = (await ctx.pgClient.query('select * from sessions where token = $1', [ud])).rows[0];

    if (data && data.uid) {
      if (Number(data.expire) >= Date.now()) {
        return data.uid;
      } else {
        return null;
      }
    }
    return null;
  },

  generateSessionByUser: async (ctx, id, expire) => {
    const rid = crypto.randomUUID();
    await ctx.pgClient.query('INSERT INTO sessions(uid, token, expire) values($1, $2, $3)', [
      id,
      rid,
      expire
    ]);
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
