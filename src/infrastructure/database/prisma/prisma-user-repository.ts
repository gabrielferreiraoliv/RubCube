import { Prisma, PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/user';
import {
  CreateUserData,
  ListUsersFilters,
  Page,
  PaginatedResult,
  UpdateUserData,
  UserRepository,
} from '../../../domain/repositories/user-repository';

function toUser(row: PrismaUser): User {
  return User.fromPersistence({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateUserData): Promise<User> {
    const created = await this.prisma.user.create({ data });
    return toUser(created);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updated = await this.prisma.user.update({ where: { id }, data });
    return toUser(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    return found ? toUser(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    return found ? toUser(found) : null;
  }

  async list(
    filters: ListUsersFilters,
    page: Page,
  ): Promise<PaginatedResult<User>> {
    const where: Prisma.UserWhereInput = {
      ...(filters.name && {
        name: { contains: filters.name, mode: 'insensitive' },
      }),
      ...(filters.email && {
        email: { contains: filters.email, mode: 'insensitive' },
      }),
      ...(filters.role && { role: filters.role }),
    };

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page.page - 1) * page.pageSize,
        take: page.pageSize,
      }),
    ]);

    return {
      data: rows.map(toUser),
      total,
      page: page.page,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize) || 0,
    };
  }
}
