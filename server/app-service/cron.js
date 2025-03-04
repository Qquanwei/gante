const cron = require('node-cron');

module.exports = async function(app) {
  app.cron = (() => {
    cron.schedule('0 0 8 * * *', async() => {
      try {
        console.log('cron 任务执行开始');
        await app.mailTask.triggerAllMailTask();
        console.log("cron 任务执行结束");
      } catch(error) {
        console.error('cron 任务执行失败', error)
      }
    })
    return {};
  })();
}
