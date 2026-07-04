import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const env = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};
const isGitHubPages = env.process?.env?.KARDS_GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPages ? "/KARDS/" : "/",
  plugins: [react()],
});
