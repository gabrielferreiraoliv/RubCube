import { User } from '../../../domain/entities/user';
import {
  ListUsersFilters,
  PaginatedResult,
  UserRepository,
} from '../../../domain/repositories/user-repository';
import { normalizePage } from '../../shared/pagination';

export interface ListUsersInput extends ListUsersFilters {
  page?: number;
  pageSize?: number;
}

export class ListUsers {
  constructor(private readonly users: UserRepository) {}

  async execute(input: ListUsersInput): Promise<PaginatedResult<User>> {
    const { page, pageSize, ...filters } = input;
    return this.users.list(filters, normalizePage(page, pageSize));
  }
}
