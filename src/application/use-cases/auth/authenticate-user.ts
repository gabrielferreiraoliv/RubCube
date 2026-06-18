import { UnauthorizedError } from '../../../domain/errors/domain-error';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { PasswordHasher } from '../../ports/password-hasher';
import { TokenService } from '../../ports/token-service';
import { AuthResult } from './register-user';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export class AuthenticateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthResult> {
    const email = input.email.toLowerCase().trim();
    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const matches = await this.hasher.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.tokens.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  }
}
