import { Page } from '../../domain/repositories/user-repository';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function normalizePage(page?: number, pageSize?: number): Page {
  const safePage = page && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const requestedSize =
    pageSize && pageSize > 0 ? Math.floor(pageSize) : DEFAULT_PAGE_SIZE;
  return {
    page: safePage,
    pageSize: Math.min(requestedSize, MAX_PAGE_SIZE),
  };
}

export function paginate<T>(items: T[], page: Page) {
  const total = items.length;
  const start = (page.page - 1) * page.pageSize;
  const data = items.slice(start, start + page.pageSize);
  return {
    data,
    total,
    page: page.page,
    pageSize: page.pageSize,
    totalPages: Math.ceil(total / page.pageSize) || 0,
  };
}
