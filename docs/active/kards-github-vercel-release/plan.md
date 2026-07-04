# KARDS GitHub and Vercel Release Plan

## Goal

Ship the current KARDS Card Forge as a verified GitHub release and a working Vercel deployment.

## Scope

- Keep the app as a static Vite/React card-face editor.
- Keep official KARDS assets and private calibration outputs out of the public build.
- Polish obvious developer-facing public UI copy without changing behavior.
- Push the verified state to `origin/main`.
- Create a GitHub release from the same commit.
- Deploy the same project to Vercel and verify the deployed app loads.

## Steps

- [x] Confirm main checkout, remote, releases, and Vercel account state.
- [x] Polish public UI copy and release metadata.
- [x] Run targeted tests, full tests, typecheck, and production build.
- [x] Create Vercel project and identify deployment constraints.
- [ ] Commit and push release-ready changes to GitHub.
- [ ] Create a GitHub release with notes and build artifact.
- [ ] Deploy to Vercel and verify the live URL.
- [ ] Record delivery package and closeout risks.

## Verification

- `npm run typecheck`
- `npm test -- --run`
- `npm run build`
- Static production bundle scan for private `.runtime` paths.
- HTTP or deployment probe for the final Vercel URL.
- Remote browser smoke for page load, canvas render, and PNG export.
