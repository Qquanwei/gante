const { Pool } = require('pg');

module.exports = async function (app, config) {
  let pgClient = new Pool(config.pg);
  await pgClient.query('update mem set cnt = 0');
  app.pgClient = pgClient;
}
