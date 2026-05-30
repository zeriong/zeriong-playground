import { createBrowserRouter } from "react-router-dom";
import { PokedexPage } from "../pages/pokedex";

// app 레이어가 라우팅을 소유. 페이지 추가 시 여기에만 등록한다.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <PokedexPage />,
  },
]);
