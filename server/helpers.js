const crypto = require('crypto');

// in memory session
module.exports = {
  // 给websocket使用
  getUserByUD: async (ud, db) => {
    if (!ud || !db) {
      return null;
    }
    const session = await db.collection('session');
    const user = await db.collection('users');
    const data = await session.findOne({
      token: ud
    });
    if (data && data.uid) {
      if (data.expire >= Date.now()) {
        return await user.findOne({
          _id: data.uid
        });
      }
      return null;
    }
    return null;
  },

  getUserIdBySession: async (ctx) => {
    const ud = ctx.cookies.get('ud');

    if (!ud) {
      return null;
    }

    const session = await ctx.db.collection('session');
    const data = await session.findOne({
      token: ud
    });

    if (data && data.uid) {
      if (data.expire >= Date.now()) {
        return data.uid;
      } else {
        return null;
      }
    }
    return null;
  },

  generateSessionByUser: async (ctx, id) => {
    const session = await ctx.db.collection('session');

    const rid = crypto.randomUUID();

    await session.insertOne({
      token: rid,
      uid: id,
      expire: Date.now() + 24 * 60 * 60 * 1000
    });

    return rid;
  }
};
