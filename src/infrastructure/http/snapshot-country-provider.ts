import {
  Country,
  CountryProvider,
} from '../../domain/providers/country-provider';
import { countrySnapshot } from './data/country-snapshot';

export class SnapshotCountryProvider implements CountryProvider {
  async listAll(): Promise<Country[]> {
    return countrySnapshot;
  }
}
