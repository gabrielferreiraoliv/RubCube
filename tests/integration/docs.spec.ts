import request from 'supertest';
import { buildTestApp, TestContext } from '../helpers/build-test-app';

describe('API documentation', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = buildTestApp();
  });

  it('exposes a valid OpenAPI document', async () => {
    const res = await request(ctx.app).get('/docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('RubCube API');
    expect(res.body.paths).toHaveProperty('/auth/login');
    expect(res.body.paths).toHaveProperty('/users/{id}');
    expect(res.body.components.securitySchemes).toHaveProperty('bearerAuth');
  });

  it('serves the Swagger UI', async () => {
    const res = await request(ctx.app).get('/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
