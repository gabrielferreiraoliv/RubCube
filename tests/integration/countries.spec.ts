import request from 'supertest';
import {
  buildTestApp,
  createAdminToken,
  TestContext,
} from '../helpers/build-test-app';

describe('Countries endpoints', () => {
  let ctx: TestContext;
  let token: string;

  beforeEach(async () => {
    ctx = buildTestApp();
    token = (await createAdminToken(ctx)).token;
  });

  it('requires authentication', async () => {
    const res = await request(ctx.app).get('/countries');
    expect(res.status).toBe(401);
  });

  it('lists and filters countries', async () => {
    const res = await request(ctx.app)
      .get('/countries')
      .query({ region: 'Americas' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Brazil');
  });
});
