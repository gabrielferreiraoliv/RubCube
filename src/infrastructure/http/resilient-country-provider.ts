import {
  Country,
  CountryProvider,
} from '../../domain/providers/country-provider';
import { logger } from '../logger/logger';

export class ResilientCountryProvider implements CountryProvider {
  constructor(
    private readonly primary: CountryProvider,
    private readonly fallback: CountryProvider,
  ) {}

  async listAll(): Promise<Country[]> {
    try {
      return await this.primary.listAll();
    } catch (err) {
      logger.warn(
        { err },
        'Primary country provider failed, serving local snapshot',
      );
      return this.fallback.listAll();
    }
  }
}
