import axios, { AxiosInstance } from 'axios';
import { UpstreamServiceError } from '../../domain/errors/domain-error';
import {
  Country,
  CountryProvider,
} from '../../domain/providers/country-provider';
import { TtlCache } from '../cache/ttl-cache';
import { logger } from '../logger/logger';

interface RestCountry {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  region?: string;
  subregion?: string;
  capital?: string[];
  population?: number;
  area?: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  flag?: string;
}

const FIELDS = [
  'name',
  'cca2',
  'cca3',
  'region',
  'subregion',
  'capital',
  'population',
  'area',
  'languages',
  'currencies',
  'flag',
].join(',');

const CACHE_KEY = 'all-countries';

function toCountry(raw: RestCountry): Country {
  return {
    name: raw.name.common,
    officialName: raw.name.official,
    cca2: raw.cca2,
    cca3: raw.cca3,
    region: raw.region ?? '',
    subregion: raw.subregion ?? '',
    capital: raw.capital ?? [],
    population: raw.population ?? 0,
    area: raw.area ?? 0,
    languages: raw.languages ? Object.values(raw.languages) : [],
    currencies: raw.currencies ? Object.keys(raw.currencies) : [],
    flag: raw.flag ?? '',
  };
}

export interface RestCountriesOptions {
  baseURL: string;
  apiKey?: string;
}

export class RestCountriesProvider implements CountryProvider {
  private readonly client: AxiosInstance;

  constructor(
    options: RestCountriesOptions,
    private readonly cache: TtlCache<Country[]>,
  ) {
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: 10_000,
      headers: options.apiKey
        ? { Authorization: `Bearer ${options.apiKey}` }
        : undefined,
    });
  }

  async listAll(): Promise<Country[]> {
    const cached = this.cache.get(CACHE_KEY);
    if (cached) {
      return cached;
    }

    try {
      const { data } = await this.client.get<unknown>('/all', {
        params: { fields: FIELDS },
      });

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response shape from country data source');
      }

      const countries = (data as RestCountry[]).map(toCountry);
      this.cache.set(CACHE_KEY, countries);
      return countries;
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch countries from upstream');
      throw new UpstreamServiceError('Country data source is unavailable');
    }
  }
}
