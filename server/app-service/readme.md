这个目录存放的是一个node进程的单例对象。会在所有请求中复用。


app-service 和 service 的区别:

1. app-service 是 app 维度，而 service 是请求维度。请求维度每个请求结束后都会释放，一般不会有数据隔离问题，但是app-service会，使用时需要注意。
2. app 维度则要求进行执行状态的存储，app 崩溃重启后能够继续执行未成功的任务。


如果使用成熟的框架这些概念分别对应于 eggjs 中的 plugin 和 service。
