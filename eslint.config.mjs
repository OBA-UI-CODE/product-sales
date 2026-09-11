import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
  Next's own rule sets (core web vitals + TypeScript). The project listed
  eslint and eslint-config-next but had no config file, so `npm run lint`
  exited before checking anything; this is the file Next 16 expects.
*/
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "supabase/**"]),
]);
