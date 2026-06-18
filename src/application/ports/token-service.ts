import { Role } from '../../domain/entities/user';

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
