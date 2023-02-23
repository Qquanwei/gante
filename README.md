## GANTE

目标是打造一款纯粹的个人效率管理软件。

在线访问地址，浏览器打开 https://gante.link

![image](https://user-images.githubusercontent.com/9263655/219541219-dded8681-4e2c-4fab-addc-e543ff9d767c.png)

目前支持功能

1. 项目流程基础排版
2. 多人实时在线协作
3. 允许登录，并拥有私人文档，对外不可见
4. 图钉工具，时间轴上创建节点提醒

准备做的功能

1. todo 功能结合
2. 搜索面板
3. 优化短期任务，例如1d/2d时长的任务展示
4. 允许单人拥有多个甘特图面板（工作生活可以分开）


### Developer 

配置文件

config/config.dev.js

config/config.online.js

开发

npm run dev


部署生产(需要设置环境变量)

npm run build

npm run start


环境变量

1. GANTE_GITHUB_CLIENT_ID
2. GANTE_GITHUB_CLIENT_SECRET
3. GANTE_MONGO_UNAME
4. GANTE_MONGO_PASS
5. PORT 启动端口号
6. NODE_ENV 生产环境 development, production
7. GANTE_PUBLIC_PATH cdn加速配置
