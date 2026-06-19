import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../application/ports/password-hasher';

export class BcryptHasher implements PasswordHasher {
  constructor(private readonly saltRounds: number) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
