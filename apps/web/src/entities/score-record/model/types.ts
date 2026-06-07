// 랭킹 기록 도메인 모델. 저장 방식(localStorage 등)은 shared 가 담당.
export interface ScoreRecord {
  score: number;
  // 기록 시각 (epoch ms). 동점 시 정렬 보조 및 표시에 사용.
  at: number;
}
