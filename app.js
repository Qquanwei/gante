const http = require('http');
const next = require('next');
const ShareDB = require('sharedb');
const Router = require('koa-router');
const koa = require('koa');
const json1 = require('ot-json1');
const { MongoClient } = require('mongodb');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const { WebSocketServer } = require('ws');
const cookie = require('cookie');
const serverApi = require('./server/router');
const config = require('./config');
const db = require('sharedb-mongo')(config.MONGO_ADDR, {
  mongoOptions: {
    appname: 'gante'
  }
});

const app = new koa();
const server = http.createServer(app.callback());
const mongoClient = new MongoClient(config.MONGO_ADDR);

/* NEXTJS APP BEGN */
const nextApp = next({
  dev: process.env.NODE_ENV === 'development'
});
const handler = nextApp.getRequestHandler();
const router = new Router();

async function startApp() {
  await nextApp.prepare();
  await mongoClient.connect();
  const mem = mongoClient.db().collection('mem');
  if (await mem.count() !== 0) {
    await mem.drop();
  }

  router.use(serverApi.routes());
  router.use(serverApi.allowedMethods());
  router.get(/^[^(api)].*$/, async ctx => {
    console.log('next:', ctx.req.url);
    await handler(ctx.req, ctx.res);
    ctx.respond = false;
  });
  app.use(router.routes());
  const port = process.env.PORT || 8088;

  server.listen({
    host: '0.0.0.0',
    port
  }, () => {
    console.log(`start on localhost:${port}`);
  });

  const wsServer = new WebSocketServer({ noServer: true });
  server.on('upgrade', function upgrade(request, socket, head) {
    console.log('begin upgrade');
    const { pathname } = parse(request.url);
    console.log('upgrade', pathname);
    if (pathname === '/share') {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        const stream = new WebSocketJSONStream(ws);
        backend.listen(stream, request);
      });
    }
  });
}

/* NEXTJS APP END */


/* SHAREDB BEGIN */
const { parse } = require('url');
ShareDB.types.register(json1.type);
const backend = new ShareDB({ db });

const Url = require('url');
const queryString = require('querystring');

backend.use('connect', async (ctx, next) => {
  console.log('新连接接入', ctx.req.url);

  try {
    const qs = queryString.parse(Url.parse(ctx.req.url).query);
    const listId = qs.id;
    const mem = mongoClient.db().collection('mem');

    const memList = await mem.findOne({ listId });
    if (memList && memList.count >= 5) {
      throw new Error('连接数量超过最大限制');
    }

    await mem.updateOne({ listId }, {
      '$inc': {
        count: 1
      },
      '$push': {
        clients: ctx.agent.clientId
      }
    }, {
      upsert: true
    });
    // 注入 listId, 所有操作的item必须在listId下.
    ctx.agent.custom.listId = listId;

    ctx.stream.on('close', () => {
      mem.updateOne({ listId }, {
        '$inc': {
          count: -1
        },
        '$pull': {
          clients: ctx.agent.clientId
        }
      });
    });
    next();
  } catch(e) {
    next(e || new Error('连接串不合法'));
  }
});

backend.use('apply', function({agent, collection, id, op}, next) {
  const { listId } = agent.custom;
  if (
      (listId === id || `${id}`.startsWith(listId + '.'))
     ) {
    next();
  } else {
    console.log('error 跨文档操作对象');
    next(new Error('不允许操作跨文档对象'));
  }
});
/* SHAREDB END */

startApp();
