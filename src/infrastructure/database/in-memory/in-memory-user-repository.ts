import { randomUUID } from 'node:crypto';
import { User, UserProps } from '../../../domain/entities/user';
import {
  CreateUserData,
  ListUsersFilters,
  Page,
  PaginatedResult,
  UpdateUserData,
  UserRepository,
} from '../../../domain/repositories/user-repository';

export class InMemoryUserRepository implements UserRepository {
  private items = new Map<string, UserProps>();

  async create(data: CreateUserData): Promise<User> {
    const now = new Date();
    const props: UserProps = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(props.id, props);
    return User.fromPersistence(props);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const props = this.items.get(id)!;
    const updated: UserProps = {
      ...props,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.passwordHash !== undefined && {
        passwordHash: data.passwordHash,
      }),
      ...(data.role !== undefined && { role: data.role }),
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return User.fromPersistence(updated);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  async findById(id: string): Promise<User | null> {
    const props = this.items.get(id);
    return props ? User.fromPersistence(props) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const props = [...this.items.values()].find((u) => u.email === email);
    return props ? User.fromPersistence(props) : null;
  }

  async list(
    filters: ListUsersFilters,
    page: Page,
  ): Promise<PaginatedResult<User>> {
    let rows = [...this.items.values()];

    if (filters.name) {
      const term = filters.name.toLowerCase();
      rows = rows.filter((u) => u.name.toLowerCase().includes(term));
    }
    if (filters.email) {
      const term = filters.email.toLowerCase();
      rows = rows.filter((u) => u.email.toLowerCase().includes(term));
    }
    if (filters.role) {
      rows = rows.filter((u) => u.role === filters.role);
    }

    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = rows.length;
    const start = (page.page - 1) * page.pageSize;
    const data = rows
      .slice(start, start + page.pageSize)
      .map(User.fromPersistence);

    return {
      data,
      total,
      page: page.page,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize) || 0,
    };
  }
}
