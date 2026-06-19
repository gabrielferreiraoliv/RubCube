import { NextFunction, Request, RequestHandler, Response } from 'express';
import { RequestLogRepository } from '../../../domain/repositories/request-log-repository';
import { logger } from '../../../infrastructure/logger/logger';

export function requestLogger(
  repository: RequestLogRepository,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(
        (process.hrtime.bigint() - startedAt) / 1_000_000n,
      );

      repository
        .create({
          userId: req.user?.id ?? null,
          method: req.method,
          endpoint: req.originalUrl.split('?')[0],
          statusCode: res.statusCode,
          durationMs,
          ip: req.ip ?? null,
          userAgent: req.get('user-agent') ?? null,
        })
        .catch((err) => logger.error({ err }, 'Failed to persist request log'));
    });

    next();
  };
}
