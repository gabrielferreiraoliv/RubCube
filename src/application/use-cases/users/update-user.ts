import { Role, User } from '../../../domain/entities/user';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import {
  UpdateUserData,
  UserRepository,
} from '../../../domain/repositories/user-repository';
import { PasswordHasher } from '../../ports/password-hasher';

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export class UpdateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const data: UpdateUserData = {};

    if (input.name !== undefined) {
      data.name = input.name.trim();
    }

    if (input.email !== undefined) {
      const email = input.email.toLowerCase().trim();
      if (email !== user.email) {
        const owner = await this.users.findByEmail(email);
        if (owner && owner.id !== id) {
          throw new ConflictError('Email already registered');
        }
        data.email = email;
      }
    }

    if (input.role !== undefined) {
      data.role = input.role;
    }

    if (input.password !== undefined) {
      data.passwordHash = await this.hasher.hash(input.password);
    }

    return this.users.update(id, data);
  }
}
