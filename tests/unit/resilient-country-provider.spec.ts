import { ResilientCountryProvider } from '../../src/infrastructure/http/resilient-country-provider';
import { SnapshotCountryProvider } from '../../src/infrastructure/http/snapshot-country-provider';
import { CountryProvider } from '../../src/domain/providers/country-provider';

describe('ResilientCountryProvider', () => {
  const snapshot = new SnapshotCountryProvider();

  it('returns primary data when it succeeds', async () => {
    const primary: CountryProvider = {
      listAll: jest.fn().mockResolvedValue([]),
    };
    const provider = new ResilientCountryProvider(primary, snapshot);

    const result = await provider.listAll();

    expect(result).toEqual([]);
    expect(primary.listAll).toHaveBeenCalledTimes(1);
  });

  it('falls back to the snapshot when the primary fails', async () => {
    const primary: CountryProvider = {
      listAll: jest.fn().mockRejectedValue(new Error('upstream down')),
    };
    const provider = new ResilientCountryProvider(primary, snapshot);

    const result = await provider.listAll();

    expect(result.length).toBeGreaterThan(100);
    expect(result.some((c) => c.cca2 === 'BR')).toBe(true);
  });
});
