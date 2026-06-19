import { Application } from 'express';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user-repository';
import { InMemoryRequestLogRepository } from '../../src/infrastructure/database/in-memory/in-memory-request-log-repository';
import { BcryptHasher } from '../../src/infrastructure/security/bcrypt-hasher';
import { JwtTokenService } from '../../src/infrastructure/security/jwt-token-service';
import { RegisterUser } from '../../src/application/use-cases/auth/register-user';
import { AuthenticateUser } from '../../src/application/use-cases/auth/authenticate-user';
import { CreateUser } from '../../src/application/use-cases/users/create-user';
import { GetUser } from '../../src/application/use-cases/users/get-user';
import { ListUsers } from '../../src/application/use-cases/users/list-users';
import { UpdateUser } from '../../src/application/use-cases/users/update-user';
import { DeleteUser } from '../../src/application/use-cases/users/delete-user';
import { ListCountries } from '../../src/application/use-cases/countries/list-countries';
import { ListRequestLogs } from '../../src/application/use-cases/logs/list-request-logs';
import { createApp } from '../../src/presentation/http/app';
import { FakeCountryProvider } from './fake-country-provider';

export interface TestContext {
  app: Application;
  userRepository: InMemoryUserRepository;
  requestLogRepository: InMemoryRequestLogRepository;
  tokenService: JwtTokenService;
}

export function buildTestApp(): TestContext {
  const userRepository = new InMemoryUserRepository();
  const requestLogRepository = new InMemoryRequestLogRepository();
  const hasher = new BcryptHasher(4);
  const tokenService = new JwtTokenService('test-secret', '1h');
  const countryProvider = new FakeCountryProvider();

  const app = createApp({
    tokenService,
    requestLogRepository,
    useCases: {
      registerUser: new RegisterUser(userRepository, hasher, tokenService),
      authenticateUser: new AuthenticateUser(
        userRepository,
        hasher,
        tokenService,
      ),
      createUser: new CreateUser(userRepository, hasher),
      getUser: new GetUser(userRepository),
      listUsers: new ListUsers(userRepository),
      updateUser: new UpdateUser(userRepository, hasher),
      deleteUser: new DeleteUser(userRepository),
      listCountries: new ListCountries(countryProvider),
      listRequestLogs: new ListRequestLogs(requestLogRepository),
    },
  });

  return { app, userRepository, requestLogRepository, tokenService };
}

export async function createAdminToken(
  ctx: TestContext,
): Promise<{ token: string; id: string }> {
  const hasher = new BcryptHasher(4);
  const user = await ctx.userRepository.create({
    name: 'Admin',
    email: 'admin@test.com',
    passwordHash: await hasher.hash('password123'),
    role: 'ADMIN',
  });
  const token = ctx.tokenService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return { token, id: user.id };
}
