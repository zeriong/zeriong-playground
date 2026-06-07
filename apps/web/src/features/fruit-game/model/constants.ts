// 게임 밸런스 상수. 화면 좌표는 모두 0~1 정규화 기준.

export const START_LIVES = 3;

// 게임 제한 시간(초). 0 이 되면 게임 종료.
export const GAME_DURATION = 60;

// 점수: 일반(1배) / 빠른 별(2배) / 더 빠른 빨간 별(3배)
export const SCORE_NORMAL = 10;
export const SCORE_FAST = 20;
export const SCORE_SUPER = 30;

// 과일 생성 간격(ms). 시간이 지날수록 minInterval 까지 짧아진다.
export const SPAWN_INTERVAL_START = 1100;
export const SPAWN_INTERVAL_MIN = 480;
// 1초마다 줄어드는 양(ms)
export const SPAWN_RAMP_PER_SEC = 12;

// 클릭/탭이 과일을 잡았다고 판정하는 추가 여유 반경(과일 radius 에 더함).
export const CATCH_PADDING = 0.03;
// 손(grab) 판정은 추적이 떨리고 부정확하므로 훨씬 넉넉한 반경을 쓴다.
export const HAND_CATCH_PADDING = 0.1;
// 펴짐→쥠 전이 시 득점 가능한 grab 윈도우 길이(ms).
// 이 시간이 지나면 쥐고 있어도 득점 불가 — 폈다가 다시 쥐어야 재득점.
export const GRAB_ACTIVE_MS = 500;
// 득점 윈도우 안에서 잡기 스로틀 간격(ms) — 근처 과일을 쓸어담는 빈도.
export const GRAB_CATCH_INTERVAL = 100;

// 잡힌 과일의 터짐 연출 지속(ms).
export const POP_DURATION = 260;
