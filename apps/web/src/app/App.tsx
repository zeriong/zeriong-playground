import { RouterProvider } from "react-router-dom";
import { router } from "./router";

// app 진입 컴포넌트. 프로바이더/라우터만 결선한다 (도메인 로직 없음).
export function App() {
  return <RouterProvider router={router} />;
}
