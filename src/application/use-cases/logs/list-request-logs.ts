import {
  ListRequestLogsFilters,
  RequestLog,
  RequestLogRepository,
} from '../../../domain/repositories/request-log-repository';
import { PaginatedResult } from '../../../domain/repositories/user-repository';
import { normalizePage } from '../../shared/pagination';

export interface ListRequestLogsInput extends ListRequestLogsFilters {
  page?: number;
  pageSize?: number;
}

export class ListRequestLogs {
  constructor(private readonly logs: RequestLogRepository) {}

  async execute(
    input: ListRequestLogsInput,
  ): Promise<PaginatedResult<RequestLog>> {
    const { page, pageSize, ...filters } = input;
    return this.logs.list(filters, normalizePage(page, pageSize));
  }
}
