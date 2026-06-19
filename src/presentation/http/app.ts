import './types';
import express, { Application } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { AppDependencies } from './dependencies';
import { buildOpenApiDocument } from './openapi';
import { AuthController } from './controllers/auth-controller';
import { UsersController } from './controllers/users-controller';
import { CountriesController } from './controllers/countries-controller';
import { LogsController } from './controllers/logs-controller';
import { authRoutes } from './routes/auth-routes';
import { usersRoutes } from './routes/users-routes';
import { countriesRoutes } from './routes/countries-routes';
import { logsRoutes } from './routes/logs-routes';
import { requestLogger } from './middlewares/request-logger';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';

export function createApp(deps: AppDependencies): Application {
  const { useCases, tokenService } = deps;

  const app = express();
  app.set('trust proxy', true);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:'],
        },
      },
    }),
  );
  app.use(express.json());
  app.use(requestLogger(deps.requestLogRepository));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const openApiDocument = buildOpenApiDocument();
  app.get('/docs.json', (_req, res) => res.json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  const authController = new AuthController(
    useCases.registerUser,
    useCases.authenticateUser,
  );
  const usersController = new UsersController(
    useCases.createUser,
    useCases.getUser,
    useCases.listUsers,
    useCases.updateUser,
    useCases.deleteUser,
  );
  const countriesController = new CountriesController(useCases.listCountries);
  const logsController = new LogsController(useCases.listRequestLogs);

  app.use('/auth', authRoutes(authController));
  app.use('/users', usersRoutes(usersController, tokenService));
  app.use('/countries', countriesRoutes(countriesController, tokenService));
  app.use('/logs', logsRoutes(logsController, tokenService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
