import { NextFunction, Request, RequestHandler, Response } from 'express';
import { TokenService } from '../../../application/ports/token-service';
import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../domain/errors/domain-error';
import { Role } from '../../../domain/entities/user';

export function authenticate(tokens: TokenService): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const payload = tokens.verify(header.slice(7).trim());
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  };
}

export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication is required');
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
