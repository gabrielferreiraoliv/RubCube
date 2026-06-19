import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import {
  DomainError,
  ValidationError,
} from '../../../domain/errors/domain-error';
import { logger } from '../../../infrastructure/logger/logger';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof DomainError) {
    const details = err instanceof ValidationError ? err.details : undefined;
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(details ? { details } : {}),
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res
    .status(404)
    .json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
};
