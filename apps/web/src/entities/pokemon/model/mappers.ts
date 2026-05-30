import type { PokemonDetailDto, PokemonListDto } from "./dto";
import type { PokemonDetail, PokemonSummary } from "./types";

// 순수 함수 — 입출력만 있고 부수효과 없음. 단위 테스트하기 쉬운 비즈니스 로직.

// 목록 응답에는 id 가 없다. 상세 url("/pokemon/25/") 끝의 숫자가 id.
export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : NaN;
}

// id 만으로 공식 아트워크 이미지 url 을 구성 (목록에서 상세 fetch 없이 썸네일 표시).
export function officialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function mapListToSummaries(dto: PokemonListDto): PokemonSummary[] {
  return dto.results.map((item) => {
    const id = extractIdFromUrl(item.url);
    return { id, name: item.name, imageUrl: officialArtworkUrl(id) };
  });
}

export function mapDetail(dto: PokemonDetailDto): PokemonDetail {
  const image =
    dto.sprites.other?.["official-artwork"]?.front_default ??
    dto.sprites.front_default ??
    officialArtworkUrl(dto.id);

  return {
    id: dto.id,
    name: dto.name,
    imageUrl: image,
    types: dto.types.map((t) => t.type.name),
    stats: dto.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    height: dto.height / 10, // decimeters -> meters
    weight: dto.weight / 10, // hectograms -> kilograms
  };
}
