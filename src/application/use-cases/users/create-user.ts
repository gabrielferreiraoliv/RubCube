import { Role, User } from '../../../domain/entities/user';
import { ConflictError } from '../../../domain/errors/domain-error';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { PasswordHasher } from '../../ports/password-hasher';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export class CreateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = input.email.toLowerCase().trim();

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await this.hasher.hash(input.password);
    return this.users.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role ?? 'USER',
    });
  }
}
