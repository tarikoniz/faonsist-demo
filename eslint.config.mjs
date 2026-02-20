import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Backup klasörleri — lint kontrolü dışında
    "_api_routes_backup/**",
    // Büyük 3. parti kütüphaneler
    "public/assets/**",
    // Backup dosyaları
    "*.bak",
    "middleware.ts.bak",
    "server.ts.bak",
    "public/index.html.bak",
    // UI kütüphane bileşenleri (shadcn/ui — framework kodu, dokunulmuyor)
    "components/ui/**",
    // React Compiler uyumsuz hook'lar
    "hooks/use-media-query.ts",
  ]),
  // Proje geneli kural override'ları
  {
    rules: {
      // TypeScript any kullanımı — büyük projede geçici olarak warn
      "@typescript-eslint/no-explicit-any": "warn",
      // Kullanılmayan değişkenler — warn yeterli
      "@typescript-eslint/no-unused-vars": "warn",
      // JSX'te kaçırılmamış karakterler — warn
      "react/no-unescaped-entities": "warn",
      // require() import — warn
      "@typescript-eslint/no-require-imports": "warn",
      // React Compiler uyarıları — warn
      "react-hooks/incompatible-library": "warn",
      // Next.js module değişken adı
      "@next/next/no-assign-module-variable": "warn",
    },
  },
]);

export default eslintConfig;
