import { User } from '../../../domain/entities/user';
import { NotFoundError } from '../../../domain/errors/domain-error';
import { UserRepository } from '../../../domain/repositories/user-repository';

export class GetUser {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
