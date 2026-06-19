import jwt, { SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../../domain/errors/domain-error';
import {
  TokenPayload,
  TokenService,
} from '../../application/ports/token-service';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as SignOptions);
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
