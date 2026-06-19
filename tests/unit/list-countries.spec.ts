import { ListCountries } from '../../src/application/use-cases/countries/list-countries';
import { FakeCountryProvider } from '../helpers/fake-country-provider';

describe('ListCountries', () => {
  const useCase = new ListCountries(new FakeCountryProvider());

  it('filters by region', async () => {
    const result = await useCase.execute({ region: 'Europe' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Portugal');
  });

  it('filters by language regardless of region', async () => {
    const result = await useCase.execute({ language: 'portuguese' });
    expect(result.data.map((c) => c.name).sort()).toEqual([
      'Brazil',
      'Portugal',
    ]);
  });

  it('paginates results', async () => {
    const result = await useCase.execute({ page: 1, pageSize: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('sorts by population descending', async () => {
    const result = await useCase.execute({
      sortBy: 'population',
      order: 'desc',
    });
    expect(result.data[0].name).toBe('Brazil');
  });
});
