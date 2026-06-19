import { Request, Response } from 'express';
import { ListCountries } from '../../../application/use-cases/countries/list-countries';

export class CountriesController {
  constructor(private readonly listCountries: ListCountries) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.listCountries.execute(res.locals.query);
    res.status(200).json(result);
  };
}
