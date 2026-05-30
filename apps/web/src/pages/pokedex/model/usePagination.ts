import { useState } from "react";

// 작은 페이지네이션 비즈니스 훅. 페이지 인덱스와 이동만 책임진다.
// 상한(다음 가능 여부)은 total 을 아는 호출자가 판단한다.
export function usePagination() {
  const [page, setPage] = useState(0);
  return {
    page,
    next: () => setPage((p) => p + 1),
    prev: () => setPage((p) => Math.max(0, p - 1)),
    canPrev: page > 0,
  };
}
