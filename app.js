const http = require('http');
const next = require('next');
const ShareDB = require('sharedb');
const Router = require('koa-router');
const koa = require('koa');
const json1 = require('ot-json1');
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


/* NEXTJS APP BEGN */
const nextApp = next({
  dev: process.env.NODE_ENV === 'development'
});
const handler = nextApp.getRequestHandler();
const router = new Router();

async function startApp() {
  await nextApp.prepare();
  router.use(serverApi.routes());
  router.use(serverApi.allowedMethods());

  router.get(/^[^(api)].*$/, async ctx => {
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
}

/* NEXTJS APP END */


/* SHAREDB BEGIN */
const { parse } = require('url');
const wsServer = new WebSocketServer({ noServer: true });
ShareDB.types.register(json1.type);
const backend = new ShareDB({ db });

backend.use('connect', ({ steam, req }, next) => {
  // console.log('新连接接入', cookie.parse(req.headers.cookie));
  next();
});

backend.use('op', function({collection, id, op}, next) {
  console.log('收到:', collection, id, op);
  next();
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  if (pathname === '/share') {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
      const stream = new WebSocketJSONStream(ws);
      backend.listen(stream, request);
    });
  }
});

/* SHAREDB END */

startApp();
