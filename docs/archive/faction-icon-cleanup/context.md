# Context

## 2026-07-12 — investigation start

- Classified as `complex`: the defect crosses source-card pixels, private extraction rules, about eighty published nation-mark variants, renderer selection, and visual verification.
- Repository has one clean worktree: `main` at `516db9e33e1b30f95791cfd3b8249cfc88eb4d11`, aligned with `origin/main`.
- Live process owner: primary agent owns Vite PID `72956` on `http://127.0.0.1:5173/`.
- Existing project lesson states that nation marks need subject-protection masks; color thresholds alone can erase emblem rings, crosses, or star edges.
- Initial contact-sheet evidence also shows that protection can preserve unwanted pixels when the protected geometry overlaps neighboring print, so no tuning is allowed until affected families and source flow are measured.
- Three child lanes are assigned to reference-image audit, extraction/data-flow audit, and test-contract review. They are read-only and may not operate the server or tests.

## 2026-07-12 — root-cause hypothesis

- All 65 published nation marks hash-match their Stage6 sources, ruling out publication drift.
- Alpha-component inventory found seven stable high-confidence contaminants: Britain/Germany/US countermeasure, Japan/Soviet order, and France fighter/bomber.
- Single hypothesis: `extract_nation_mark_subject` clears only edge-connected pixels whose colors resemble the sampled background. High-contrast neighboring print survives as a disconnected edge component, while geometric subject protection correctly preserves the central emblem.
- The narrow contract is therefore not “one component” or “transparent corners”. It rejects only a sizeable alpha component that touches the crop edge but never intersects the central 50% subject core; legitimate crosses and stars may still touch edges.
- The TDD RED adds both a synthetic thin-cross case with a high-contrast corner fragment and a manifest-driven audit of every authorized public nation mark.
- TDD RED confirmed the hypothesis: the synthetic corner fragment remained `32px`, and the manifest-driven audit failed only the seven predicted assets with `16-99px` of disconnected edge pollution.

## 2026-07-12 — hypothesis correction

- Independent source-card review disproved the disconnected-component hypothesis as a complete fix. It misses artwork connected to the emblem and incorrectly classifies the intentional Soviet order rays.
- The rejected helper was removed before implementation continued. The proven contract is family-specific alpha geometry: circle/roundel, Germany cross, Japan flag, US star/ring, and hollow Neutral diamond.
- The original failure guard was also unsafe: when fewer than 14% of pixels survived, it returned the original opaque crop. Neutral infantry therefore published an unprocessed 54x54 title-bar square.
- Revised RED evidence covers mismatched command artwork, a low-contrast hollow Neutral diamond, the light Japan flag field, and the affected published assets. The three synthetic contracts now pass after applying the family silhouette; published assets remain RED until controlled regeneration.

## 2026-07-12 — reference corrections and final implementation

- Final reference review corrected two earlier classifications. Neutral is a **filled** dark diamond, proven by the official crop plus KardsGen PNG/SVG; Soviet order rays are continuous source-card artwork, not part of the star emblem.
- Corrected RED tests first failed on the transparent Neutral center, Soviet corner artwork, and an opaque crop with no sampleable palette. The generator now preserves the filled diamond, clips Soviet order to the star, and fails closed when an unclassified opaque crop has no background palette.
- Subject protection and final silhouette are no longer automatically identical. Only Neutral and the low-contrast Japan order flag require full-shape protection; other families keep narrower existing protection and use the silhouette only as the final alpha boundary.
- Stage5 and Stage6 were rebuilt serially by the primary owner. The authorized public closure now hash-matches Stage6 for all 65 nation marks; 12 verified assets differ from the base revision.
- Transparent contact-sheet review shows clean Germany/Britain/US countermeasures, a complete Japan flag, a filled Neutral diamond, a clean Soviet star, and no France/Anzac edge halo. Minimal Canvas smoke loaded the style pack without console errors and returned HTTP 200 for all repaired selectors exercised by the catalog.
- Focused generator contract result: 20 tests passed. Published-asset assertions now include positive subject survival, full forbidden-region checks, and unique manifest mappings for all 12 repaired files.

## 2026-07-12 — final review and closure

- Final first-principles review removed the last generic `max_pixels` cleanup. Soviet order now keeps its complete reference-derived star support, so legitimate small details are not classified by size.
- US countermeasure is normalized to the reference paper-white RGB inside the authorized star-and-segmented-ring silhouette. Anzac fighter/infantry/tank use tighter reference-derived circle supports; the old tank short line and infantry orphan pixel are gone.
- Three independent read-only reviewers reported `no findings / no blocker` for extraction safety, source-reference fidelity, and test adequacy. The final checkerboard contact sheet covers all 65 published nation marks.
- Final closure check reports 65 public PNGs and zero SHA-256 mismatches against Stage6. `npm run validate` passed 17 Vitest files / 242 tests, 20 private-tool contracts, TypeScript, Vite production build, and the strict dist/private boundary.
- The sole main checkout remains based on `516db9e33e1b30f95791cfd3b8249cfc88eb4d11`; no other worktree or overlapping writer exists. Vite PID `72956` remains owned by the primary agent and is intentionally left running for the user.
