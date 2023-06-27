const router = require('../router');
const request = require('supertest');
const koa = require('koa');

function getApp() {
  const app = new koa();
  app.use(router.routes());
  return request(app.callbacks());
}


describe('router test', () => {
  let app = null;

  beforeEach(() => {
    app = getApp();
  });
});
