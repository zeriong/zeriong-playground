import { useCallback, useState } from "react";
import {
  insertRecord,
  qualifiesForRank,
  type ScoreRecord,
} from "../../../entities/score-record";
import {
  loadLeaderboard,
  saveLeaderboard,
} from "../../../shared/lib/leaderboardStorage";

// 랭킹 상태 + 영속화를 묶는 비즈니스 훅.
// 정렬/상한(10위) 규칙은 entities, 저장은 shared 가 담당 — 여기선 조합만.
export function useLeaderboard() {
  const [records, setRecords] = useState<ScoreRecord[]>(() => loadLeaderboard());

  // 점수를 랭킹에 제출. 진입하면 그 순위 인덱스(0-based), 아니면 -1 반환.
  const submit = useCallback((score: number): number => {
    if (!qualifiesForRank(records, score)) return -1;
    const at = Date.now();
    const next = insertRecord(records, { score, at });
    saveLeaderboard(next);
    setRecords(next);
    return next.findIndex((r) => r.at === at && r.score === score);
  }, [records]);

  const clear = useCallback(() => {
    setRecords([]);
    saveLeaderboard([]);
  }, []);

  return { records, submit, clear };
}
