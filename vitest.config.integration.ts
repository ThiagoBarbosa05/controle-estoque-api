import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/tests/integrations/**/*.integration-spec.ts"],
    globals: true,
    setupFiles: ["src/tests/integrations/setup.ts"],
  },
  plugins: [tsconfigPaths()],
});
