import { Prisma, PrismaClient } from '@prisma/client';
import {
  ListRequestLogsFilters,
  RequestLog,
  RequestLogData,
  RequestLogRepository,
} from '../../../domain/repositories/request-log-repository';
import { Page, PaginatedResult } from '../../../domain/repositories/user-repository';

export class PrismaRequestLogRepository implements RequestLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: RequestLogData): Promise<void> {
    await this.prisma.requestLog.create({ data });
  }

  async list(
    filters: ListRequestLogsFilters,
    page: Page,
  ): Promise<PaginatedResult<RequestLog>> {
    const where: Prisma.RequestLogWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.method && { method: filters.method.toUpperCase() }),
      ...(filters.endpoint && {
        endpoint: { contains: filters.endpoint, mode: 'insensitive' },
      }),
      ...((filters.from || filters.to) && {
        createdAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
    };

    const [total, rows] = await Promise.all([
      this.prisma.requestLog.count({ where }),
      this.prisma.requestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page.page - 1) * page.pageSize,
        take: page.pageSize,
      }),
    ]);

    return {
      data: rows,
      total,
      page: page.page,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize) || 0,
    };
  }
}
