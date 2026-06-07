// MediaPipe Hand 랜드마크에서 "쥐는(grab) 동작"과 손 위치를 추출하는 순수 로직.
// MediaPipe/카메라 API 를 직접 모른다 — 좌표 배열만 받는다.

// 랜드마크 인덱스 (MediaPipe Hands 표준 21개)
const WRIST = 0;
const INDEX_MCP = 5; // 검지 뿌리
const MIDDLE_MCP = 9; // 가운뎃손가락 뿌리
const PINKY_MCP = 17; // 소지 뿌리

// 손바닥 중심을 손목·중지뿌리의 중간으로 근사(커서 기준점).
// 손가락별 [뿌리(MCP), 끝(TIP)] 인덱스 — 검지/중지/약지/소지.
const FINGERS = [
  [5, 8],
  [9, 12],
  [13, 16],
  [17, 20],
] as const;
const TIP_INDICES = [8, 12, 16, 20];

// 주먹 판정: 손가락 끝이 뿌리보다 손목 쪽으로 얼마나 접혔는지로 본다.
// 4개 손가락 평균 접힘이 임계 이상이면 grab.
// 사용자 요청에 따라 느슨하게(살짝 오므리기만 해도 grab) 설정.
export const GRAB_THRESHOLD = 0.35;

export interface Point {
  x: number;
  y: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandState {
  // 손바닥 중심 좌표(정규화). 커서/충돌 기준점.
  x: number;
  y: number;
  // 손가락이 접혀 쥐는 동작 중인지(closeness >= 0.5).
  grabbing: boolean;
  // 쥠 정도 0~1. 펼친 손=0, 50%=캐치 임계, 주먹=1.
  closeness: number;
  // 손가락 끝 좌표(정규화). 끝 도형 렌더링용. [검지, 중지, 약지, 소지]
  tips: Point[];
  // 원근 우선용 "가까움" 지표 — 화면상 손바닥 폭(클수록 카메라에 가까움).
  depth: number;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// 한 손가락의 접힘 정도(0=완전히 폄, 1=완전히 접음).
// 펼치면 끝(tip)이 뿌리(mcp)보다 손목(wrist)에서 멀고,
// 접으면 끝이 뿌리보다 손목에 가까워진다. 두 거리 비로 판정한다.
function foldAmount(wrist: Point, mcp: Point, tip: Point): number {
  const tipToWrist = dist(tip, wrist);
  const mcpToWrist = dist(mcp, wrist);
  if (mcpToWrist < 1e-4) return 0;
  // 폄: tip/mcp ≈ 1.9, 적당히 오므림 ≈ 1.4, 주먹 ≈ 0.9.
  // 살짝만 오므려도(≈1.4 → 0.57) grab 되도록 민감하게 매핑.
  const r = tipToWrist / mcpToWrist;
  return clamp01((1.8 - r) / 0.7);
}

export function evaluateHand(landmarks: Landmark[]): HandState | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[WRIST]!;
  const midMcp = landmarks[MIDDLE_MCP]!;
  // 손바닥 중심: 손목과 중지뿌리의 중간(실제 손바닥 한가운데에 가깝다).
  const palm = { x: (wrist.x + midMcp.x) / 2, y: (wrist.y + midMcp.y) / 2 };

  // 4개 손가락의 접힘 평균 = 쥠 정도.
  const folds = FINGERS.map(([mcp, tip]) =>
    foldAmount(wrist, landmarks[mcp]!, landmarks[tip]!),
  );
  const closeness = folds.reduce((s, f) => s + f, 0) / folds.length;

  // 손바닥 폭(검지뿌리~소지뿌리) — grab 여부와 무관하게 일정해 원근 비교에 적합.
  const depth = dist(landmarks[INDEX_MCP]!, landmarks[PINKY_MCP]!);

  return {
    x: palm.x,
    y: palm.y,
    grabbing: closeness >= GRAB_THRESHOLD,
    closeness,
    tips: TIP_INDICES.map((i) => ({ x: landmarks[i]!.x, y: landmarks[i]!.y })),
    depth,
  };
}

// 원근 우선 법칙: 감지된 여러 손 중 카메라에 가장 가까운(손바닥이 가장 큰)
// 손 하나만 인식한다. 손이 없으면 null.
export function pickNearestHand(hands: Landmark[][]): HandState | null {
  let best: HandState | null = null;
  for (const lm of hands) {
    const h = evaluateHand(lm);
    if (h && (!best || h.depth > best.depth)) best = h;
  }
  return best;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
