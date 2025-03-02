const cron = require('node-cron');

module.exports = function(app) {
  app.cron = (() => {
    cron.schedule('0 * * * * *', () => {
      console.log('cron 每分钟输出一次');
      app.smtp.sendMail('quanwei9958@126.com', 'cron every minutes send a mail', 'test', '<body> orange</body>');
    })
    return {};
  })();
}
