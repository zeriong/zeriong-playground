import type { Fruit, FruitTier } from "./types";

// 일반 과일 이모지 풀.
const FRUIT_EMOJIS = ["🍎", "🍊", "🍌", "🍇", "🍓", "🍉", "🍑", "🍐", "🥝", "🍒"];
// 특수(2배) 별, 초특수(3배) 빨간 별.
const FAST_EMOJI = "⭐";
const SUPER_EMOJI = "🌟"; // 빨간 글로우로 렌더해 빠른 별과 구분(아래 색상은 캔버스에서 처리)

let nextId = 1;

// 등급 추첨: super(3배) < fast(2배) < normal. super 가 가장 희귀.
function pickTier(): FruitTier {
  const r = Math.random();
  if (r < 0.06) return "super"; // 6%
  if (r < 0.24) return "fast"; // 18%
  return "normal";
}

// 새 과일 하나 생성. 화면 상단(y<0) 임의 x 위치에서 시작한다.
// fast 는 일반보다 빠르고 2배, super 는 fast 보다 1.5배 더 빠르고 3배 점수.
export function spawnFruit(): Fruit {
  const tier = pickTier();
  // 일반: 0.18~0.30 /s, fast: 0.45~0.62 /s, super: fast 의 1.5배(0.68~0.93 /s)
  const fastSpeed = 0.45 + Math.random() * 0.17;
  const speed =
    tier === "normal"
      ? 0.18 + Math.random() * 0.12
      : tier === "fast"
        ? fastSpeed
        : fastSpeed * 1.5;

  const emoji =
    tier === "normal"
      ? FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)]!
      : tier === "fast"
        ? FAST_EMOJI
        : SUPER_EMOJI;

  return {
    id: nextId++,
    emoji,
    x: 0.08 + Math.random() * 0.84,
    y: -0.08,
    speed,
    tier,
    popped: false,
    radius: tier === "normal" ? 0.06 : 0.05,
  };
}
