import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/db/**/*.test.ts"],
    environment: "node",
    // Testes de banco compartilham um database criado no globalSetup.
    fileParallelism: false,
    globalSetup: ["tests/db/global-setup.ts"],
    testTimeout: 20000,
  },
});
