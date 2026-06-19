import { RegisterUser } from '../../src/application/use-cases/auth/register-user';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user-repository';
import { BcryptHasher } from '../../src/infrastructure/security/bcrypt-hasher';
import { JwtTokenService } from '../../src/infrastructure/security/jwt-token-service';
import { ConflictError } from '../../src/domain/errors/domain-error';

describe('RegisterUser', () => {
  const build = () => {
    const users = new InMemoryUserRepository();
    const useCase = new RegisterUser(
      users,
      new BcryptHasher(4),
      new JwtTokenService('secret', '1h'),
    );
    return { users, useCase };
  };

  it('registers a new user and returns a token', async () => {
    const { useCase } = build();

    const result = await useCase.execute({
      name: 'John Doe',
      email: 'John@Example.com',
      password: 'password123',
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe('john@example.com');
    expect(result.user.role).toBe('USER');
  });

  it('rejects a duplicate email', async () => {
    const { useCase } = build();
    const input = {
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ConflictError);
  });
});
