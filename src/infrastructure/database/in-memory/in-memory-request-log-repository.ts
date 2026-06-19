import { randomUUID } from 'node:crypto';
import {
  ListRequestLogsFilters,
  RequestLog,
  RequestLogData,
  RequestLogRepository,
} from '../../../domain/repositories/request-log-repository';
import {
  Page,
  PaginatedResult,
} from '../../../domain/repositories/user-repository';

export class InMemoryRequestLogRepository implements RequestLogRepository {
  private items: RequestLog[] = [];

  async create(data: RequestLogData): Promise<void> {
    this.items.push({ ...data, id: randomUUID(), createdAt: new Date() });
  }

  async list(
    filters: ListRequestLogsFilters,
    page: Page,
  ): Promise<PaginatedResult<RequestLog>> {
    let rows = [...this.items];

    if (filters.userId) {
      rows = rows.filter((r) => r.userId === filters.userId);
    }
    if (filters.method) {
      rows = rows.filter(
        (r) => r.method === filters.method!.toUpperCase(),
      );
    }
    if (filters.endpoint) {
      const term = filters.endpoint.toLowerCase();
      rows = rows.filter((r) => r.endpoint.toLowerCase().includes(term));
    }
    if (filters.from) {
      rows = rows.filter((r) => r.createdAt >= filters.from!);
    }
    if (filters.to) {
      rows = rows.filter((r) => r.createdAt <= filters.to!);
    }

    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = rows.length;
    const start = (page.page - 1) * page.pageSize;
    const data = rows.slice(start, start + page.pageSize);

    return {
      data,
      total,
      page: page.page,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize) || 0,
    };
  }
}
