import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // workspace: ["src/http/controllers/**", "prisma"],
    dir: "src",
    environment: "node",
    globals: true,
  },
});
