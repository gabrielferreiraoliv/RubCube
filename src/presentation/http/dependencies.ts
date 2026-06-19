import { TokenService } from '../../application/ports/token-service';
import { RegisterUser } from '../../application/use-cases/auth/register-user';
import { AuthenticateUser } from '../../application/use-cases/auth/authenticate-user';
import { CreateUser } from '../../application/use-cases/users/create-user';
import { GetUser } from '../../application/use-cases/users/get-user';
import { ListUsers } from '../../application/use-cases/users/list-users';
import { UpdateUser } from '../../application/use-cases/users/update-user';
import { DeleteUser } from '../../application/use-cases/users/delete-user';
import { ListCountries } from '../../application/use-cases/countries/list-countries';
import { ListRequestLogs } from '../../application/use-cases/logs/list-request-logs';
import { RequestLogRepository } from '../../domain/repositories/request-log-repository';

export interface AppDependencies {
  tokenService: TokenService;
  requestLogRepository: RequestLogRepository;
  useCases: {
    registerUser: RegisterUser;
    authenticateUser: AuthenticateUser;
    createUser: CreateUser;
    getUser: GetUser;
    listUsers: ListUsers;
    updateUser: UpdateUser;
    deleteUser: DeleteUser;
    listCountries: ListCountries;
    listRequestLogs: ListRequestLogs;
  };
}
