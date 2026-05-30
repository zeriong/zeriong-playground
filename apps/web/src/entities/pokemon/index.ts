// entity 의 public API. 외부 레이어는 이 배럴만 import 한다 (내부 경로 직접 접근 금지).
export type {
  PokemonSummary,
  PokemonDetail,
  PokemonStat,
} from "./model/types";
export { usePokemonList } from "./model/usePokemonList";
export { fetchPokemonDetail } from "./model/pokemonApi";
export { PokemonCard } from "./ui/PokemonCard";
