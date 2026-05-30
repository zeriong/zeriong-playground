import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

// 모든 JS/TS 앱이 공유하는 기본 ESLint flat config.
export default tseslint.config(
  { ignores: ["dist/**", ".next/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  }
);
