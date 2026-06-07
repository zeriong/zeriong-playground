// 과일 도메인 모델. 출처/렌더링 방식을 모르는 순수 데이터 타입.

// 과일 등급: 일반(1배) / 빠른 별(2배) / 더 빠른 빨간 별(3배).
export type FruitTier = "normal" | "fast" | "super";

// 화면 좌표는 0~1 정규화 (캔버스 크기에 독립적). x: 가로, y: 세로(위 0, 아래 1).
export interface Fruit {
  id: number;
  emoji: string;
  // 정규화 좌표
  x: number;
  y: number;
  // 초당 낙하 속도(정규화 단위/초)
  speed: number;
  // 등급. fast=2배 별(빠름), super=3배 빨간 별(더 빠름).
  tier: FruitTier;
  // 잡힘 → 터지는 연출 중인지. 잡힌 직후 잠깐 true 였다가 제거된다.
  popped: boolean;
  // 잡힌 시각(epoch ms). 터짐 연출 종료 타이밍 계산용.
  poppedAt?: number;
  // 반지름(정규화). 충돌 판정 및 렌더 크기 기준.
  radius: number;
}
