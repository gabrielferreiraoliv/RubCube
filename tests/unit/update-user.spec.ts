import { UpdateUser } from '../../src/application/use-cases/users/update-user';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user-repository';
import { BcryptHasher } from '../../src/infrastructure/security/bcrypt-hasher';
import {
  ConflictError,
  NotFoundError,
} from '../../src/domain/errors/domain-error';

describe('UpdateUser', () => {
  const build = () => {
    const users = new InMemoryUserRepository();
    const useCase = new UpdateUser(users, new BcryptHasher(4));
    return { users, useCase };
  };

  it('throws when the user does not exist', async () => {
    const { useCase } = build();
    await expect(
      useCase.execute('missing', { name: 'New' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects an email already taken by another user', async () => {
    const { users, useCase } = build();
    await users.create({
      name: 'A',
      email: 'a@test.com',
      passwordHash: 'x',
      role: 'USER',
    });
    const target = await users.create({
      name: 'B',
      email: 'b@test.com',
      passwordHash: 'x',
      role: 'USER',
    });

    await expect(
      useCase.execute(target.id, { email: 'a@test.com' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('updates the name', async () => {
    const { users, useCase } = build();
    const user = await users.create({
      name: 'Old',
      email: 'c@test.com',
      passwordHash: 'x',
      role: 'USER',
    });

    const updated = await useCase.execute(user.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });
});
