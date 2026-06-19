import {
  Country,
  CountryProvider,
} from '../../src/domain/providers/country-provider';

export const sampleCountries: Country[] = [
  {
    name: 'Brazil',
    officialName: 'Federative Republic of Brazil',
    cca2: 'BR',
    cca3: 'BRA',
    region: 'Americas',
    subregion: 'South America',
    capital: ['Brasília'],
    population: 212559000,
    area: 8515767,
    languages: ['Portuguese'],
    currencies: ['BRL'],
    flag: '🇧🇷',
  },
  {
    name: 'Portugal',
    officialName: 'Portuguese Republic',
    cca2: 'PT',
    cca3: 'PRT',
    region: 'Europe',
    subregion: 'Southern Europe',
    capital: ['Lisbon'],
    population: 10305564,
    area: 92090,
    languages: ['Portuguese'],
    currencies: ['EUR'],
    flag: '🇵🇹',
  },
  {
    name: 'Japan',
    officialName: 'Japan',
    cca2: 'JP',
    cca3: 'JPN',
    region: 'Asia',
    subregion: 'Eastern Asia',
    capital: ['Tokyo'],
    population: 125836021,
    area: 377930,
    languages: ['Japanese'],
    currencies: ['JPY'],
    flag: '🇯🇵',
  },
];

export class FakeCountryProvider implements CountryProvider {
  constructor(private readonly countries: Country[] = sampleCountries) {}

  async listAll(): Promise<Country[]> {
    return this.countries;
  }
}
