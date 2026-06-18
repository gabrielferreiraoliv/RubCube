import {
  Country,
  CountryProvider,
} from '../../../domain/providers/country-provider';
import { PaginatedResult } from '../../../domain/repositories/user-repository';
import { normalizePage, paginate } from '../../shared/pagination';

export type CountrySortField = 'name' | 'population' | 'area';
export type SortOrder = 'asc' | 'desc';

export interface ListCountriesInput {
  name?: string;
  region?: string;
  subregion?: string;
  language?: string;
  currency?: string;
  sortBy?: CountrySortField;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export class ListCountries {
  constructor(private readonly provider: CountryProvider) {}

  async execute(input: ListCountriesInput): Promise<PaginatedResult<Country>> {
    const all = await this.provider.listAll();
    const filtered = this.applyFilters(all, input);
    const sorted = this.applySort(filtered, input);
    return paginate(sorted, normalizePage(input.page, input.pageSize));
  }

  private applyFilters(
    countries: Country[],
    input: ListCountriesInput,
  ): Country[] {
    const name = input.name?.toLowerCase();
    const region = input.region?.toLowerCase();
    const subregion = input.subregion?.toLowerCase();
    const language = input.language?.toLowerCase();
    const currency = input.currency?.toLowerCase();

    return countries.filter((country) => {
      if (name && !country.name.toLowerCase().includes(name)) {
        return false;
      }
      if (region && country.region.toLowerCase() !== region) {
        return false;
      }
      if (subregion && country.subregion.toLowerCase() !== subregion) {
        return false;
      }
      if (
        language &&
        !country.languages.some((l) => l.toLowerCase().includes(language))
      ) {
        return false;
      }
      if (
        currency &&
        !country.currencies.some((c) => c.toLowerCase() === currency)
      ) {
        return false;
      }
      return true;
    });
  }

  private applySort(
    countries: Country[],
    input: ListCountriesInput,
  ): Country[] {
    if (!input.sortBy) {
      return countries;
    }

    const field = input.sortBy;
    const direction = input.order === 'desc' ? -1 : 1;

    return [...countries].sort((a, b) => {
      if (field === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      return (a[field] - b[field]) * direction;
    });
  }
}
