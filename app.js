const http = require('http');
const next = require('next');
const ShareDB = require('sharedb');
const Router = require('koa-router');
const koa = require('koa');
const json1 = require('ot-json1');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const { WebSocketServer } = require('ws');
const { MongoClient } = require('mongodb');
const db = require('sharedb-mongo')('mongodb://root:example@localhost:27017');

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
  router.get(/.*/, async ctx => {
    await handler(ctx.req, ctx.res);
    ctx.respond = false;
  });
  app.use(router.routes());
  server.listen({
    host: '0.0.0.0',
    port: process.env.PORT || 8088
  }, () => {
    console.log('start');
  });
}

/* NEXTJS APP END */


/* SHAREDB BEGIN */
const { parse } = require('url');
const wsServer = new WebSocketServer({ noServer: true });
ShareDB.types.register(json1.type);
const backend = new ShareDB({ db });

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  if (pathname === '/share') {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
      const stream = new WebSocketJSONStream(ws);
      backend.listen(stream);
    });
  }
});

/* SHAREDB END */

startApp();
