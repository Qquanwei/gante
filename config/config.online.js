
const psql_uname = process.env.GANTE_PSQL_UNAME;
const psql_pass = process.env.GANTE_PSQL_PASS;

module.exports = {
  pg: {
    user: psql_uname,
    password: psql_pass,
    host: 'pgm-bp14z805s1wrc544.rwlb.rds.aliyuncs.com',
    database: 'gantedb',
    port: 5432,
    max: 200,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000

  },
  cookieDomain: '.gante.link'
};
