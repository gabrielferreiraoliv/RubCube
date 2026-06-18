import { NotFoundError } from '../../../domain/errors/domain-error';
import { UserRepository } from '../../../domain/repositories/user-repository';

export class DeleteUser {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await this.users.delete(id);
  }
}
