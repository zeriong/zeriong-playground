import { httpGet } from "../../../shared/api/httpClient";
import { PAGE_SIZE } from "../../../shared/config";
import type { PokemonDetailDto, PokemonListDto } from "./dto";
import { mapDetail, mapListToSummaries } from "./mappers";
import type { PokemonDetail, PokemonSummary } from "./types";

// 엔드포인트 지식 + DTO->도메인 매핑. UI 는 도메인 모델만 받는다.

export interface PokemonPage {
  items: PokemonSummary[];
  total: number;
}

export async function fetchPokemonPage(page: number): Promise<PokemonPage> {
  const offset = page * PAGE_SIZE;
  const dto = await httpGet<PokemonListDto>(
    `/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
  );
  return { items: mapListToSummaries(dto), total: dto.count };
}

export async function fetchPokemonDetail(
  nameOrId: string | number
): Promise<PokemonDetail> {
  const dto = await httpGet<PokemonDetailDto>(`/pokemon/${nameOrId}`);
  return mapDetail(dto);
}
