const http = require('http');
const next = require('next');
const { Pool } = require('pg');
const ShareDB = require('sharedb');
const Router = require('koa-router');
const koa = require('koa');
const json1 = require('ot-json1');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const { WebSocketServer } = require('ws');
const cookie = require('cookie');
const serverApi = require('./server/router');
const config = require('./config');
const Services = require('./server/services');
const app = new koa();
const server = http.createServer(app.callback());

/* NEXTJS APP BEGN */
const nextApp = next({
  dev: process.env.NODE_ENV === 'development'
});
const handler = nextApp.getRequestHandler();
const router = new Router();
let pgClient = null;

async function startApp() {
  pgClient = new Pool(config.pg);
  await pgClient.connect();
  await pgClient.query('update mem set cnt = 0');
  await nextApp.prepare();



  router.use(serverApi.routes());
  router.use(serverApi.allowedMethods());
  router.get(/^[^(api)].*$/, async ctx => {
    console.log('next:', ctx.req.url);
    await handler(ctx.req, ctx.res);
    ctx.respond = false;
  });

  app.use(async (ctx, next) => {
    ctx.pgClient = pgClient;
    await next();
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
        const agent = backend.listen(stream, request);
        stream.on('error', (error) => {
          agent.close(error);
        });
        // 当连接中断，中断stream
        ws.on('error', (error) => {
          agent.close(error);
        });
      });
    }
  });
}

/* NEXTJS APP END */

const { parse } = require('url');
const backend = new ShareDB({
  db: require('@plotdb/sharedb-postgres')({user: 'postgres', password: '1234', host: 'localhost', database: 'gantedb', port: 5432}),
  presence: true,
  doNotForwardSendPresenceErrorsToClient: true
});

/* SHAREDB BEGIN */
async function shareBackend() {

  ShareDB.types.register(json1.type);

  const Url = require('url');
  const queryString = require('querystring');
  const helpers = require('./server/helpers');
  backend.use('connect', async (ctx, next) => {
    console.log('新连接接入', ctx.req.url);

    try {
      const qs = queryString.parse(Url.parse(ctx.req.url).query);
      const listId = qs.id;
      // 这里可能会出现cookie失效的情况，例如页面一直打开超过24h，此时页面未刷新，ws会自动重连
      // 当重连时会发生cookie失效问题，此时页面就会一直处在连接中状态
      // 此时，允许cookie过期，即便cookie过期ws依然可以连接，但是页面不可以。
      const cookieObj = cookie.parse(ctx.req.headers.cookie || '');

      const msServices = new Services({
        pgClient,
        cookies: {
          get: (key) => {
            return cookieObj[key];
          }
        }
      });

      const user = await msServices.getUserByUD(cookieObj.ud, {
        allowExpire: true
      });

      if (listId && (listId === 'guest' || listId === user?.defaultTableId)) {
        // 允许
        // pass
      } else {
        // 不允许访问
        throw new Error('无权限访问');
      }

      const memList = await helpers.queryOne(pgClient.query('select * from mem where listId = $1', [listId]));
      if (memList && memList.cnt >= 50) {
        throw new Error('连接数量超过最大限制');
      }

      await pgClient.query('INSERT INTO mem(listId, cnt) values($1, $2) ON CONFLICT (listId) DO UPDATE SET cnt = $3', [listId, 1, (memList?.cnt || 0) + 1]);
      // 注入 listId, 所有操作的item必须在listId下.
      ctx.agent.custom.listId = listId;
      ctx.agent.custom.user = user;

      ctx.stream.on('close', async () => {
        await pgClient.query('update mem set cnt = cnt - 1 where listId = $1', [listId]);
      });
      next();
    } catch(e) {
      console.error(e);
      next(e || new Error('连接串不合法'));
    }
  });

  backend.use('query', function({ query}, next) {
    console.log('query:', query);
    next();
  });

  backend.use('receive', function({ data}, next) {
    next();
  });

  backend.use('apply', function({agent, collection, id, op}, next) {
    const { listId } = agent.custom;
    if (
      (listId === id || `${id}`.startsWith(listId + '.'))
    ) {
      console.log('apply:', id, op);
      next();
    } else {
      console.log('error 跨文档操作对象');
      next(new Error('不允许操作跨文档对象'));
    }
  });
}
/* SHAREDB END */

async function main() {
  await startApp();
  await shareBackend();
}

main();
