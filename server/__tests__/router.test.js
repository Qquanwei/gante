const request = require('supertest');
const koa = require('koa');

function getApp() {
  const router = require('../router');

  const app = new koa();
  app.use(router.routes());
  return request(app.callback());
}


describe('router test', () => {
  let app = null;

  beforeEach(() => {
    app = getApp();
  });
});
