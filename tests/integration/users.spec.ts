import request from 'supertest';
import {
  buildTestApp,
  createAdminToken,
  TestContext,
} from '../helpers/build-test-app';

describe('Users endpoints', () => {
  let ctx: TestContext;
  let token: string;

  beforeEach(async () => {
    ctx = buildTestApp();
    token = (await createAdminToken(ctx)).token;
  });

  const auth = (req: request.Test) =>
    req.set('Authorization', `Bearer ${token}`);

  it('requires authentication', async () => {
    const res = await request(ctx.app).get('/users');
    expect(res.status).toBe(401);
  });

  it('creates and retrieves a user', async () => {
    const created = await auth(
      request(ctx.app).post('/users'),
    ).send({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });

    expect(created.status).toBe(201);
    const id = created.body.id;

    const fetched = await auth(request(ctx.app).get(`/users/${id}`));
    expect(fetched.status).toBe(200);
    expect(fetched.body.email).toBe('new@example.com');
  });

  it('lists users with pagination metadata', async () => {
    await auth(request(ctx.app).post('/users')).send({
      name: 'User One',
      email: 'one@example.com',
      password: 'password123',
    });

    const res = await auth(
      request(ctx.app).get('/users').query({ page: 1, pageSize: 10 }),
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, pageSize: 10 });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });

  it('filters users by role', async () => {
    const res = await auth(
      request(ctx.app).get('/users').query({ role: 'ADMIN' }),
    );
    expect(res.status).toBe(200);
    expect(res.body.data.every((u: { role: string }) => u.role === 'ADMIN')).toBe(
      true,
    );
  });

  it('updates and deletes a user', async () => {
    const created = await auth(request(ctx.app).post('/users')).send({
      name: 'To Update',
      email: 'update@example.com',
      password: 'password123',
    });
    const id = created.body.id;

    const updated = await auth(request(ctx.app).patch(`/users/${id}`)).send({
      name: 'Updated Name',
    });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Updated Name');

    const deleted = await auth(request(ctx.app).delete(`/users/${id}`));
    expect(deleted.status).toBe(204);

    const fetched = await auth(request(ctx.app).get(`/users/${id}`));
    expect(fetched.status).toBe(404);
  });
});
