import { Role, User } from '../entities/user';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: Role;
}

export interface ListUsersFilters {
  name?: string;
  email?: string;
  role?: Role;
}

export interface Page {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(filters: ListUsersFilters, page: Page): Promise<PaginatedResult<User>>;
}
