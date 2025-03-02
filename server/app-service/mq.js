/**
 * 消息队列抽象，内存实现或外部服务实现。
 * 内置内存消息队列，使用 psql 服务
 */

const MQMemImpl = require("./mq-mem-impl");

function mq(app) {
  app.mq = (function(impl) {
    const mq = {
      impl,
    };

    // impl.subscribe((data) => {
    //   // 当收到消息，则处理开始发送邮件
    // });

    return mq;

  })(new MQMemImpl());
}

module.exports = mq;
