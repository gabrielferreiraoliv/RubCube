import { Router } from 'express';
import { TokenService } from '../../../application/ports/token-service';
import { UsersController } from '../controllers/users-controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authenticate, authorize } from '../middlewares/auth-middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate';
import {
  createUserSchema,
  idParamSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from '../schemas';

export function usersRoutes(
  controller: UsersController,
  tokens: TokenService,
): Router {
  const router = Router();

  router.use(authenticate(tokens));

  router.post(
    '/',
    authorize('ADMIN'),
    validateBody(createUserSchema),
    asyncHandler(controller.create),
  );

  router.get(
    '/',
    validateQuery(listUsersQuerySchema),
    asyncHandler(controller.list),
  );

  router.get(
    '/:id',
    validateParams(idParamSchema),
    asyncHandler(controller.get),
  );

  router.patch(
    '/:id',
    validateParams(idParamSchema),
    validateBody(updateUserSchema),
    asyncHandler(controller.update),
  );

  router.delete(
    '/:id',
    authorize('ADMIN'),
    validateParams(idParamSchema),
    asyncHandler(controller.remove),
  );

  return router;
}
