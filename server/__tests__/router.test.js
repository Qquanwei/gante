const router = require('../router');
const request = require('supertest');
const koa = require('koa');

function getApp() {
  const app = new koa();
  app.use(router.routes());
  return request(app.callback());
}


describe('router test', () => {
  let app = null;

  beforeEach(() => {
    app = getApp();
  });

  it.skip ('should be ok', async () => {
    const response = await app.post('/api/login')
          .send({ username: 'foo', password: 'bar' });

    console.log(response);
    expect(response.status).toBe(200);
  });
});
