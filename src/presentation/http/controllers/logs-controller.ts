import { Request, Response } from 'express';
import { ListRequestLogs } from '../../../application/use-cases/logs/list-request-logs';

export class LogsController {
  constructor(private readonly listRequestLogs: ListRequestLogs) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.listRequestLogs.execute(res.locals.query);
    res.status(200).json(result);
  };
}
