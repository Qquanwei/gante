## GANTE

目标是打造一款纯粹的个人效率管理软件。

在线访问地址，浏览器打开 https://gante.link

![image](https://user-images.githubusercontent.com/9263655/219541219-dded8681-4e2c-4fab-addc-e543ff9d767c.png)

目前支持功能

1. 项目流程基础排版
2. 多人实时在线协作
3. 允许登录，并拥有私人文档，对外不可见
4. 图钉工具，时间轴上创建节点提醒
5. 搜索面板
6. todo 功能更自然地结合

准备做的功能

1. 优化短期任务，例如1d/2d时长的任务展示
2. 允许单人拥有多个甘特图面板（工作生活可以分开）
3. 年度试图，渲染成高级时间轴，更漂亮，以年为维度
4. 优化 todo 在 timeline 上的提醒功能
5. 优化事件系统，让全局元素更丝滑拖拽


我是一个效率工具的爱好者，因为这种工具对我帮助太大了，我可能是一个对日常杂事不太会很上心的人，老是会忘掉一些应该做的事情，或者有时对未来的事情不清晰，再加上我平时主要以电脑作为生产力工具，所以对各种app不太感冒。在此之前，我希望有个电脑端的个人效率工具软件(最好是云端，因为我有多台电脑)，我使用过 trello，teambition, notion, tower 等等. 这些软件都是使用了一阵子，我思考了一下，其主要原因可能在于我使用的功能只占了这些软件的 10%，对我来说太重了，很多功能都在围绕“团队”，而不是个人。我在一年前就写了这款软件，一点一点地完善，提高流畅度，提高颜值，并且作为我的日常管理软件使用至今，他将甘特图时间轴作为核心，未来还会辅以todo功能，将日常生活、工作中遇到的项目管理，任务管理功能结合在一起，目的是纯粹地将个人的生产效率提高，解放大脑去思考这些琐事。最后，欢迎诸位提出一些使用上的建议，让这个工具变得越来越舒服。

## Agenda

[./agenda.md](./agenda.md)

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
5. GANTE_MONG_ADDR mongodb数据库连接地址，当设置此选项后，会忽略上述MONGO选项，默认值 mongodb://root:example@localhost:27017/gante_store?authSource=admin
6. PORT 启动端口号
7. NODE_ENV 生产环境 development, production
8. GANTE_PUBLIC_PATH cdn加速配置
9. GANTE_SMS_accessKeyId 阿里云短信keyid
10. GANTE_SMS_accessKeySecret 阿里云短信secret

### 容器

可以自己构建容器，也可以使用我发布的构建好的镜像启动（注意，镜像需要连接外部数据库才能使用）

1. 构建镜像

```
podman build . --tag gante:local
```

2. 启动镜像

```
podman run --rm --net host -e GANTE_MONG_ADDR="mongodb://root:example@localhost:27017/gante_store?authSource=admin" gante:local
```


### 启动外部数据库(测试使用)

podman  run --rm --name gante-mongo --net host -e "MONGO_INITDB_ROOT_USERNAME=root" -e "MONGO_INITDB_ROOT_PASSWORD=example" mongo
