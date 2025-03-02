const mq = require('./mq');
// const cron = require('./cron');
const smtp = require('./smtp');
const pg = require('./pg');
const sms = require('./sms');

const appServices = {
  services: [pg, mq, smtp, sms]
}

module.exports = appServices;
