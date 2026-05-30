// 순수 뷰: 버튼 상태/핸들러를 props 로만 받는다.
export function PaginationControls({
  page,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  page: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        marginTop: 24,
      }}
    >
      <button onClick={onPrev} disabled={!canPrev}>
        ← 이전
      </button>
      <span>페이지 {page + 1}</span>
      <button onClick={onNext} disabled={!canNext}>
        다음 →
      </button>
    </div>
  );
}
