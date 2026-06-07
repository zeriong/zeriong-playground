import type { ScoreRecord } from "./types";

// 랭킹은 상위 10위까지만 유지한다.
export const MAX_RANK = 10;

// 새 기록을 합쳐 점수 내림차순(동점이면 최근 기록 우선) 상위 10개만 남긴다.
// 순수 함수 — 입력 배열을 변형하지 않는다.
export function insertRecord(records: ScoreRecord[], record: ScoreRecord): ScoreRecord[] {
  return [...records, record]
    .sort((a, b) => b.score - a.score || b.at - a.at)
    .slice(0, MAX_RANK);
}

// 주어진 점수가 랭킹에 진입하는지(신기록 여부).
export function qualifiesForRank(records: ScoreRecord[], score: number): boolean {
  if (score <= 0) return false;
  if (records.length < MAX_RANK) return true;
  const last = records[records.length - 1];
  return last ? score > last.score : true;
}
