const EventEmitter = require("events");

class MQMemImpl extends EventEmitter {
  datas = [];

  push(data) {
    this.datas.push(data);
    this.emit('message', data);
  }

  take() {
    return this.datas.shift();
  }
}

module.exports =  MQMemImpl;
