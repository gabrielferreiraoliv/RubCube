import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  createUserSchema,
  idParamSchema,
  listCountriesQuerySchema,
  listLogsQuerySchema,
  listUsersQuerySchema,
  loginSchema,
  registerSchema,
  updateUserSchema,
} from './schemas';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const userSchema = registry.register(
  'User',
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['ADMIN', 'USER']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const authResponseSchema = registry.register(
  'AuthResponse',
  z.object({ token: z.string(), user: userSchema }),
);

const countrySchema = registry.register(
  'Country',
  z.object({
    name: z.string(),
    officialName: z.string(),
    cca2: z.string(),
    cca3: z.string(),
    region: z.string(),
    subregion: z.string(),
    capital: z.array(z.string()),
    population: z.number(),
    area: z.number(),
    languages: z.array(z.string()),
    currencies: z.array(z.string()),
    flag: z.string(),
  }),
);

const requestLogSchema = registry.register(
  'RequestLog',
  z.object({
    id: z.string().uuid(),
    userId: z.string().uuid().nullable(),
    method: z.string(),
    endpoint: z.string(),
    statusCode: z.number(),
    durationMs: z.number(),
    ip: z.string().nullable(),
    userAgent: z.string().nullable(),
    createdAt: z.string().datetime(),
  }),
);

const errorSchema = registry.register(
  'Error',
  z.object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    }),
  }),
);

const paginated = (item: z.ZodTypeAny) =>
  z.object({
    data: z.array(item),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

const json = (schema: z.ZodTypeAny) => ({
  content: { 'application/json': { schema } },
});

const errorResponse = (description: string) => ({
  description,
  ...json(errorSchema),
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  request: { body: json(registerSchema) },
  responses: {
    201: { description: 'User created', ...json(authResponseSchema) },
    409: errorResponse('Email already registered'),
    422: errorResponse('Invalid payload'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  request: { body: json(loginSchema) },
  responses: {
    200: { description: 'Authenticated', ...json(authResponseSchema) },
    401: errorResponse('Invalid credentials'),
    422: errorResponse('Invalid payload'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  security: [{ [bearerAuth.name]: [] }],
  request: { body: json(createUserSchema) },
  responses: {
    201: { description: 'User created', ...json(userSchema) },
    401: errorResponse('Missing or invalid token'),
    403: errorResponse('Admin role required'),
    409: errorResponse('Email already registered'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users',
  tags: ['Users'],
  security: [{ [bearerAuth.name]: [] }],
  request: { query: listUsersQuerySchema },
  responses: {
    200: { description: 'Paginated users', ...json(paginated(userSchema)) },
    401: errorResponse('Missing or invalid token'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  security: [{ [bearerAuth.name]: [] }],
  request: { params: idParamSchema },
  responses: {
    200: { description: 'User found', ...json(userSchema) },
    404: errorResponse('User not found'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/{id}',
  tags: ['Users'],
  security: [{ [bearerAuth.name]: [] }],
  request: { params: idParamSchema, body: json(updateUserSchema) },
  responses: {
    200: { description: 'User updated', ...json(userSchema) },
    404: errorResponse('User not found'),
    409: errorResponse('Email already registered'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: ['Users'],
  security: [{ [bearerAuth.name]: [] }],
  request: { params: idParamSchema },
  responses: {
    204: { description: 'User deleted' },
    403: errorResponse('Admin role required'),
    404: errorResponse('User not found'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/countries',
  tags: ['Countries'],
  security: [{ [bearerAuth.name]: [] }],
  request: { query: listCountriesQuerySchema },
  responses: {
    200: {
      description: 'Paginated countries',
      ...json(paginated(countrySchema)),
    },
    401: errorResponse('Missing or invalid token'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/logs',
  tags: ['Logs'],
  security: [{ [bearerAuth.name]: [] }],
  request: { query: listLogsQuerySchema },
  responses: {
    200: {
      description: 'Paginated request logs',
      ...json(paginated(requestLogSchema)),
    },
    403: errorResponse('Admin role required'),
  },
});

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'RubCube API',
      version: '1.0.0',
      description:
        'Integração com dados de países, autenticação JWT, gestão de usuários e auditoria de requisições.',
    },
    servers: [{ url: '/' }],
  });
}
