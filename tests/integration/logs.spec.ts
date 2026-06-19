import request from 'supertest';
import {
  buildTestApp,
  createAdminToken,
  TestContext,
} from '../helpers/build-test-app';

describe('Logs endpoints', () => {
  let ctx: TestContext;
  let token: string;

  beforeEach(async () => {
    ctx = buildTestApp();
    token = (await createAdminToken(ctx)).token;
  });

  it('records requests and exposes them with filters', async () => {
    await request(ctx.app)
      .get('/countries')
      .set('Authorization', `Bearer ${token}`);

    await new Promise((resolve) => setImmediate(resolve));

    const res = await request(ctx.app)
      .get('/logs')
      .query({ endpoint: '/countries' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(
      res.body.data.every((log: { endpoint: string }) =>
        log.endpoint.includes('/countries'),
      ),
    ).toBe(true);
  });

  it('forbids non-admin users', async () => {
    const register = await request(ctx.app).post('/auth/register').send({
      name: 'Regular',
      email: 'regular@example.com',
      password: 'password123',
    });
    const userToken = register.body.token;

    const res = await request(ctx.app)
      .get('/logs')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
