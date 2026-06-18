import { User } from '../../../domain/entities/user';
import { ConflictError } from '../../../domain/errors/domain-error';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { PasswordHasher } from '../../ports/password-hasher';
import { TokenService } from '../../ports/token-service';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const email = input.email.toLowerCase().trim();

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: 'USER',
    });

    const token = this.tokens.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  }
}
