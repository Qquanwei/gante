const crypto = require('crypto');
const sessions = {};
const userMap = {};

// in memory session
module.exports = {
  getUserIdBySession(ctx) {
    const ud = ctx.cookies.get('ud');
    console.log('ud->', ud);
    if (!ud) {
      return null;
    }
    return sessions[ud];
  },

  generateSessionByUser(id) {
    const rid = crypto.randomUUID();
    sessions[rid] = id;
    return rid;
  }
};
