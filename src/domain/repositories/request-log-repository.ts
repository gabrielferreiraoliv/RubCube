import { Page, PaginatedResult } from './user-repository';

export interface RequestLogData {
  userId: string | null;
  method: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  ip: string | null;
  userAgent: string | null;
}

export interface RequestLog extends RequestLogData {
  id: string;
  createdAt: Date;
}

export interface ListRequestLogsFilters {
  userId?: string;
  endpoint?: string;
  method?: string;
  from?: Date;
  to?: Date;
}

export interface RequestLogRepository {
  create(data: RequestLogData): Promise<void>;
  list(
    filters: ListRequestLogsFilters,
    page: Page,
  ): Promise<PaginatedResult<RequestLog>>;
}
