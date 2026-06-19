import { Router } from 'express';
import { TokenService } from '../../../application/ports/token-service';
import { LogsController } from '../controllers/logs-controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authenticate, authorize } from '../middlewares/auth-middleware';
import { validateQuery } from '../middlewares/validate';
import { listLogsQuerySchema } from '../schemas';

export function logsRoutes(
  controller: LogsController,
  tokens: TokenService,
): Router {
  const router = Router();

  router.get(
    '/',
    authenticate(tokens),
    authorize('ADMIN'),
    validateQuery(listLogsQuerySchema),
    asyncHandler(controller.list),
  );

  return router;
}
