import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // سایت قدیمی فقط برای مرجع نگه داشته شده و بخشی از کدبیس فعال نیست
    "_legacy/**",
  ]),
]);

export default eslintConfig;
