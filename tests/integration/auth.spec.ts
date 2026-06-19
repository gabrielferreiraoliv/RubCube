import request from 'supertest';
import { buildTestApp, TestContext } from '../helpers/build-test-app';

describe('Auth endpoints', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = buildTestApp();
  });

  it('registers a user', async () => {
    const res = await request(ctx.app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects invalid payloads with 422', async () => {
    const res = await request(ctx.app)
      .post('/auth/register')
      .send({ name: 'x', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with valid credentials', async () => {
    await request(ctx.app).post('/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    const res = await request(ctx.app).post('/auth/login').send({
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects invalid credentials with 401', async () => {
    const res = await request(ctx.app).post('/auth/login').send({
      email: 'jane@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });
});
