// 도메인 모델. 앱 전체가 사용하는 "정제된" 포켓몬 표현.
// PokeAPI 의 raw 응답(DTO)과 분리한다 — 외부 API 가 바뀌어도 도메인은 안 흔들리게.

export interface PokemonSummary {
  id: number;
  name: string;
  imageUrl: string;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonDetail extends PokemonSummary {
  types: string[];
  stats: PokemonStat[];
  /** 미터 */
  height: number;
  /** 킬로그램 */
  weight: number;
}
