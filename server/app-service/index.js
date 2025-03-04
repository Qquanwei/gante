const mq = require('./mq');
const cron = require('./cron');
const smtp = require('./smtp');
const pg = require('./pg');
const sms = require('./sms');
const mailTask = require('./mail-task');

const appServices = {
  services: [pg, cron, mq, smtp, sms, mailTask]
}

module.exports = appServices;
