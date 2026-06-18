export interface Country {
  name: string;
  officialName: string;
  cca2: string;
  cca3: string;
  region: string;
  subregion: string;
  capital: string[];
  population: number;
  area: number;
  languages: string[];
  currencies: string[];
  flag: string;
}

export interface CountryProvider {
  listAll(): Promise<Country[]>;
}
