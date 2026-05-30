// PokeAPI raw 응답 형태(DTO). 이 파일 밖으로 새어나가지 않는다.

export interface PokemonListDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface PokemonDetailDto {
  id: number;
  name: string;
  height: number; // decimeters
  weight: number; // hectograms
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}
