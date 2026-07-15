import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const env = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};
const isGitHubPages = env.process?.env?.KARDS_GITHUB_PAGES === "true";
const gitHubRepositoryName = env.process?.env?.GITHUB_REPOSITORY?.split("/")[1];

if (isGitHubPages && !gitHubRepositoryName) {
  throw new Error("GITHUB_REPOSITORY must identify the Pages repository.");
}

export default defineConfig({
  base: isGitHubPages ? `/${gitHubRepositoryName}/` : "/",
  plugins: [react()],
});
