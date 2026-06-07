import type { ScoreRecord } from "../../entities/score-record";

// 랭킹 영속화. localStorage 만 알고 도메인 로직(정렬/제한)은 모른다.
const KEY = "fruit-game:leaderboard";

export function loadLeaderboard(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is ScoreRecord =>
        typeof r?.score === "number" && typeof r?.at === "number",
    );
  } catch {
    return [];
  }
}

export function saveLeaderboard(records: ScoreRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // 저장 실패(시크릿 모드 등)는 게임 진행을 막지 않는다.
  }
}
