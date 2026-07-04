# KARDS GitHub and Vercel Release Task

## Delivery Package Draft

### Changed

- Branded the public app and metadata as `KARDS Card Forge`.
- Reworded public controls so local asset packs and reference comparison read as user features instead of calibration tooling.
- Localized difference metric labels instead of showing raw `MAE`/`RMSE`.
- Added Vercel upload exclusions and ignored local Vercel/env files.
- Preserved the non-official fan-tool disclaimer and local-pack privacy warning.
- Added release/deploy task records for GitHub and Vercel closeout.

### Files

- Core files: `index.html`, `src/App.tsx`, `src/components/ProjectPanel.tsx`, `src/i18n.ts`.
- Test files: `src/i18n.test.ts`.
- Config files: `.gitignore`, `.vercelignore`.
- Docs files: `docs/active/kards-github-vercel-release/plan.md`, `docs/active/kards-github-vercel-release/context.md`, `docs/active/kards-github-vercel-release/task.md`, `docs/active/_worktree_registry.md`.
- Temporary files: none tracked.

### Diff Summary

- Narrow public-copy diff only; no renderer, schema, storage, asset-loading, or export behavior changed.
- Production `dist` regenerated locally for validation but remains untracked.
- Vercel CLI created local `.vercel/` and `.env.local`; both are ignored and intentionally untracked.

### Commit State

- Not committed yet at this checkpoint.

### Base Divergence

- Base commit `0e00503f6c63668c93880d32688239ba279b06e9`; current `origin/main` matched at task start.

### Conflict Risk

- Green: only main checkout exists; changed files do not overlap another live worktree.

### Validation

- `npm test -- --run src/i18n.test.ts`: passed, 1 file and 5 tests.
- `npm run typecheck`: passed.
- `npm test -- --run`: passed, 11 files and 84 tests.
- `npm run build`: passed, including typecheck and Vite production build.
- `rg -n "\.runtime|kards-private-assets|stage5|stage6|devPreview|privatePack" dist`: no production-bundle matches.
- `git diff --check`: passed with LF-to-CRLF warnings only.
- GitHub connector secret scanning attempt: repository lacks GitHub Advanced Security, so no GHAS scan result was available.
- `npx vercel link --yes --project kards-card-forge --scope qiushiyu2003-2073s-projects`: created the Vercel project.
- First `npx vercel deploy --prod --yes --scope qiushiyu2003-2073s-projects`: passed and aliased `https://kards-card-forge.vercel.app`.
- `Invoke-WebRequest -UseBasicParsing https://kards-card-forge.vercel.app`: returned HTTP `200`.

### Remaining Risks

- Final post-`.vercelignore` Vercel deployment still needs to be run after the final commit.
- Remote browser smoke still needs to verify page load, canvas render, and PNG export on the final deployment.
- Repository is private at task start; release visibility follows the repo visibility unless changed outside this task.
- Vercel GitHub auto-link is not active because the Vercel account needs a GitHub Login Connection.

### Recommended Next Step

- Amend the release commit with Vercel ignore/config notes, push to GitHub, create `v0.1.0`, redeploy production with the clean ignore set, and verify the live URL.
