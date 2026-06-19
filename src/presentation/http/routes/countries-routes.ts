import { Router } from 'express';
import { TokenService } from '../../../application/ports/token-service';
import { CountriesController } from '../controllers/countries-controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authenticate } from '../middlewares/auth-middleware';
import { validateQuery } from '../middlewares/validate';
import { listCountriesQuerySchema } from '../schemas';

export function countriesRoutes(
  controller: CountriesController,
  tokens: TokenService,
): Router {
  const router = Router();

  router.get(
    '/',
    authenticate(tokens),
    validateQuery(listCountriesQuerySchema),
    asyncHandler(controller.list),
  );

  return router;
}
