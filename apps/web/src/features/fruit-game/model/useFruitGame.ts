import { useCallback, useEffect, useRef, useState } from "react";
import { spawnFruit, type Fruit, type FruitTier } from "../../../entities/fruit";
import type { HandState } from "../../hand-tracking";
import {
  CATCH_PADDING,
  GAME_DURATION,
  GRAB_ACTIVE_MS,
  GRAB_CATCH_INTERVAL,
  HAND_CATCH_PADDING,
  POP_DURATION,
  SCORE_FAST,
  SCORE_NORMAL,
  SCORE_SUPER,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_START,
  SPAWN_RAMP_PER_SEC,
  START_LIVES,
} from "./constants";

export type GameStatus = "idle" | "playing" | "paused" | "over";

// 터짐 연출용 일회성 버스트(점수 라벨 + 위치). 잡은 직후 잠깐 떠올랐다 사라진다.
export interface Burst {
  id: number;
  x: number;
  y: number;
  gained: number;
  tier: FruitTier;
  bornAt: number;
}

// 등급별 획득 점수.
const TIER_SCORE: Record<FruitTier, number> = {
  normal: SCORE_NORMAL,
  fast: SCORE_FAST,
  super: SCORE_SUPER,
};

export interface FruitGameState {
  status: GameStatus;
  score: number;
  lives: number;
  // 남은 시간(초, 올림). 0 이 되면 게임 종료.
  timeLeft: number;
  fruits: Fruit[];
  bursts: Burst[];
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  // 클릭/탭으로 (x,y) 정규화 좌표에서 과일 잡기 시도.
  catchAt: (x: number, y: number) => void;
  // 지금 grab 이 득점 가능한 상태인지(1초 윈도우 유효). 손 커서 색 표시용.
  // ref 라서 매 프레임 리렌더 없이 읽는다.
  grabScorableRef: React.RefObject<boolean>;
}

// 과일잡기 게임 엔진. rAF 루프로 물리/충돌을 돌리고, 손 상태는 handRef 로 폴링한다.
// running=false(권한 없음 등)면 손 추적 없이 클릭 전용으로 동작한다.
export function useFruitGame(handRef: React.RefObject<HandState | null>): FruitGameState {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);

  // 루프 내부에서 쓰는 가변 상태(리렌더 유발하지 않음).
  const fruitsRef = useRef<Fruit[]>([]);
  const burstsRef = useRef<Burst[]>([]);
  const statusRef = useRef<GameStatus>("idle");
  const scoreRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const rafRef = useRef(0);
  const lastTs = useRef(0);
  const sinceSpawn = useRef(0);
  const elapsed = useRef(0);
  // 남은 시간(초, 실수). HUD 표시는 올림한 정수만 갱신해 리렌더를 줄인다.
  const remaining = useRef(GAME_DURATION);
  const burstId = useRef(1);
  // grab 처리: "펴짐→쥠" 전이 시 1초 동안만 득점 가능(GRAB_ACTIVE_MS).
  // 1초가 지나면 쥐고 있어도 득점 불가 — 다시 득점하려면 폈다가 다시 쥐어야 한다.
  const wasGrabbing = useRef(false); // 직전 프레임 grab 상태(전이 감지)
  const grabActiveUntil = useRef(0); // 현재 grab 의 득점 유효 만료 시각(ms)
  const lastGrabCatch = useRef(0); // 윈도우 내 잡기 스로틀용 마지막 시각(ms)
  const grabScorableRef = useRef(false); // 현재 득점 가능 상태인지(커서 색 표시용)

  const syncStatus = (s: GameStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  const tryCatch = useCallback((x: number, y: number, padding: number) => {
    const list = fruitsRef.current;
    // 가장 가까운(아직 안 터진) 과일 하나만 잡는다.
    let hitIndex = -1;
    let hitDist = Infinity;
    for (let i = 0; i < list.length; i++) {
      const f = list[i]!;
      if (f.popped) continue;
      const d = Math.hypot(f.x - x, f.y - y);
      if (d <= f.radius + padding && d < hitDist) {
        hitDist = d;
        hitIndex = i;
      }
    }
    if (hitIndex < 0) return;

    const f = list[hitIndex]!;
    f.popped = true;
    f.poppedAt = performance.now();
    const gained = TIER_SCORE[f.tier];
    scoreRef.current += gained;
    setScore(scoreRef.current);
    burstsRef.current.push({
      id: burstId.current++,
      x: f.x,
      y: f.y,
      gained,
      tier: f.tier,
      bornAt: performance.now(),
    });
  }, []);

  const catchAt = useCallback(
    (x: number, y: number) => {
      if (statusRef.current !== "playing") return;
      // 클릭은 손보다 정밀하므로 약간 더 넓은 여유.
      tryCatch(x, y, CATCH_PADDING + 0.02);
    },
    [tryCatch],
  );

  const start = useCallback(() => {
    fruitsRef.current = [];
    burstsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = START_LIVES;
    sinceSpawn.current = 0;
    elapsed.current = 0;
    remaining.current = GAME_DURATION;
    wasGrabbing.current = false;
    grabActiveUntil.current = 0;
    lastGrabCatch.current = 0;
    grabScorableRef.current = false;
    setFruits([]);
    setBursts([]);
    setScore(0);
    setLives(START_LIVES);
    setTimeLeft(GAME_DURATION);
    syncStatus("playing");
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current === "playing") syncStatus("paused");
  }, []);
  const resume = useCallback(() => {
    if (statusRef.current === "paused") {
      lastTs.current = 0; // 재개 시 큰 dt 방지
      syncStatus("playing");
    }
  }, []);
  const reset = useCallback(() => {
    fruitsRef.current = [];
    burstsRef.current = [];
    setFruits([]);
    setBursts([]);
    syncStatus("idle");
  }, []);

  // 메인 루프
  useEffect(() => {
    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (statusRef.current !== "playing") {
        lastTs.current = ts;
        grabScorableRef.current = false; // 일시정지/종료 중엔 득점 불가
        return;
      }
      const dt = lastTs.current ? Math.min((ts - lastTs.current) / 1000, 0.05) : 0;
      lastTs.current = ts;
      elapsed.current += dt;

      // 0) 제한 시간 카운트다운 — 0 이 되면 게임 종료.
      remaining.current = Math.max(0, remaining.current - dt);
      const secs = Math.ceil(remaining.current);
      setTimeLeft((prev) => (prev !== secs ? secs : prev));
      if (remaining.current <= 0) {
        syncStatus("over");
        return;
      }

      // 1) 스폰
      const interval = Math.max(
        SPAWN_INTERVAL_MIN,
        SPAWN_INTERVAL_START - elapsed.current * SPAWN_RAMP_PER_SEC,
      );
      sinceSpawn.current += dt * 1000;
      if (sinceSpawn.current >= interval) {
        sinceSpawn.current = 0;
        fruitsRef.current.push(spawnFruit());
      }

      // 2) 낙하 + 놓친 과일(생명 감소)
      const now = performance.now();
      let missed = 0;
      const next: Fruit[] = [];
      for (const f of fruitsRef.current) {
        if (f.popped) {
          // 터짐 연출 끝나면 제거
          if (now - (f.poppedAt ?? now) < POP_DURATION) next.push(f);
          continue;
        }
        f.y += f.speed * dt;
        if (f.y > 1.08) {
          missed++;
          continue;
        }
        next.push(f);
      }
      fruitsRef.current = next;

      if (missed > 0) {
        livesRef.current -= missed;
        setLives(Math.max(0, livesRef.current));
        if (livesRef.current <= 0) {
          syncStatus("over");
        }
      }

      // 3) 손 grab 충돌 — "펴짐→쥠" 전이 시점부터 1초간만 득점 가능.
      //    쥔 채 1초 넘게 유지하면 득점 중단(쥔 채 이동 방치 방지).
      //    윈도우 안에서는 스로틀 간격으로 잡아 근처 과일을 쓸어담을 수 있다.
      const hand = handRef.current;
      const grabbing = !!hand?.grabbing;
      if (grabbing && !wasGrabbing.current) {
        // 펴짐→쥠 전이: 1초 득점 윈도우 시작.
        grabActiveUntil.current = now + GRAB_ACTIVE_MS;
        lastGrabCatch.current = 0;
      }
      // 득점 가능 = grab 중 + 윈도우 유효. 커서 색이 이 상태에만 노란색.
      const scorable = grabbing && now < grabActiveUntil.current;
      grabScorableRef.current = scorable;
      if (scorable && now - lastGrabCatch.current >= GRAB_CATCH_INTERVAL) {
        lastGrabCatch.current = now;
        tryCatch(hand!.x, hand!.y, HAND_CATCH_PADDING);
      }
      wasGrabbing.current = grabbing;

      // 4) 만료된 버스트 제거
      burstsRef.current = burstsRef.current.filter(
        (b) => now - b.bornAt < POP_DURATION + 240,
      );

      // 5) 렌더 동기화 (참조 새로 만들어 React 갱신)
      setFruits([...fruitsRef.current]);
      setBursts([...burstsRef.current]);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [handRef, tryCatch]);

  return {
    status,
    score,
    lives,
    timeLeft,
    fruits,
    bursts,
    start,
    pause,
    resume,
    reset,
    catchAt,
    grabScorableRef,
  };
}
