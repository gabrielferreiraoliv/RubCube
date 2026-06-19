import { env } from './infrastructure/config/env';
import { prisma } from './infrastructure/database/prisma/client';
import { PrismaUserRepository } from './infrastructure/database/prisma/prisma-user-repository';
import { PrismaRequestLogRepository } from './infrastructure/database/prisma/prisma-request-log-repository';
import { RestCountriesProvider } from './infrastructure/http/rest-countries-provider';
import { SnapshotCountryProvider } from './infrastructure/http/snapshot-country-provider';
import { ResilientCountryProvider } from './infrastructure/http/resilient-country-provider';
import { CountryProvider } from './domain/providers/country-provider';
import { TtlCache } from './infrastructure/cache/ttl-cache';
import { BcryptHasher } from './infrastructure/security/bcrypt-hasher';
import { JwtTokenService } from './infrastructure/security/jwt-token-service';
import { Country } from './domain/providers/country-provider';
import { RegisterUser } from './application/use-cases/auth/register-user';
import { AuthenticateUser } from './application/use-cases/auth/authenticate-user';
import { CreateUser } from './application/use-cases/users/create-user';
import { GetUser } from './application/use-cases/users/get-user';
import { ListUsers } from './application/use-cases/users/list-users';
import { UpdateUser } from './application/use-cases/users/update-user';
import { DeleteUser } from './application/use-cases/users/delete-user';
import { ListCountries } from './application/use-cases/countries/list-countries';
import { ListRequestLogs } from './application/use-cases/logs/list-request-logs';
import { AppDependencies } from './presentation/http/dependencies';

function buildCountryProvider(): CountryProvider {
  const snapshot = new SnapshotCountryProvider();

  if (!env.COUNTRIES_API_KEY) {
    return snapshot;
  }

  const live = new RestCountriesProvider(
    { baseURL: env.COUNTRIES_API_URL, apiKey: env.COUNTRIES_API_KEY },
    new TtlCache<Country[]>(env.COUNTRIES_CACHE_TTL_MS),
  );

  return new ResilientCountryProvider(live, snapshot);
}

export function buildDependencies(): AppDependencies {
  const userRepository = new PrismaUserRepository(prisma);
  const requestLogRepository = new PrismaRequestLogRepository(prisma);
  const hasher = new BcryptHasher(env.BCRYPT_SALT_ROUNDS);
  const tokenService = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const countryProvider = buildCountryProvider();

  return {
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
  };
}
