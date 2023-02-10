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

  it ('should be ok', async () => {
    const response = await app.post('/api/login')
          .send({ username: 'foo', password: 'bar' });

    expect(response.status).toBe(200);
  });
});
