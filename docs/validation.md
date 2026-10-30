# Version 2 verification record

Date: October 30, 2026 (Philippine time). Environment: macOS, Node.js 24.15.0, npm 11.12.1. Baseline: `e03c269`; remote documentation edits through `20e24cb` were incorporated before release, preserving the recorded member roles.

## Automated behavior

145 tests across 9 files passed with zero failures. All 26 original scenarios remain; count/category/unsupported-format assertions were adapted for the intentionally expanded requirements. The original 20 mappings are frozen in a fixture and verified unchanged. Every one of the 100 additions is tested for recognition, repetition, suggestions and embedded-word rejection.

Real PDF fixtures verify two-page extraction, readable no-match text, blank pages, corruption and password protection. Real DOCX fixtures verify paragraphs, recognition and empty input; corrupt input is rejected. Additional tests verify TXT decoding, binary rejection, legacy DOC, file/text limits, asynchronous races, format switching, safe previews, search/category/sort/reset behavior, drag/drop and CSV quoting/download cleanup.

During implementation, a jsdom fixture URL was corrected to a filesystem path, a removed PDF.js configuration option was removed after checking installed types, and Node URL imports were added to the appendix generator. A narrowly documented lint exception allows the intentional binary-control detection regex. No broad lint suppression was introduced.

## Production browser checks

The actual `dist/` build was served with `npm run preview`:

- TXT sample: 15 occurrences, 13 distinct terms.
- Two-page PDF sample: 4 occurrences, 4 distinct terms; page count 2; correct extracted text and highlighted terms.
- DOCX sample: 4 occurrences, 4 distinct terms; paragraph breaks preserved.
- PDF → DOCX → TXT replacements completed correctly.
- CSV downloaded as `gender-specific-terms-analysis.csv`; its header and four DOCX rows were inspected and correct.
- PDF.js worker emitted at `/assets/pdf.worker.min-Dkey6ZUl.mjs` and returned HTTP 200 with JavaScript content type. PDF extraction succeeded without fake-worker warnings or console errors.
- PDF/DOCX libraries are separate lazy-loaded chunks; no CDN worker is configured.
- Desktop document width equaled viewport width (1280 px); the inspected layout had no document-level horizontal overflow.
- `v2-docx-results.png` is a genuine capture from this build. Old screenshots are explicitly historical.

The sample PDF pages and DOCX were rendered and visually inspected. PDF rendering emitted local Fontconfig cache warnings but produced readable pages. Fixture-generation tools are development utilities, not runtime dependencies.

## Final review

The focused review covered the unchanged regex engine, all vocabulary additions, boundaries/counts/offsets, format dispatch, extraction cleanup and errors, lazy loading, race handling, safe text rendering, CSV scope/quoting, accessible controls, responsive CSS and documentation. Review corrected extensionless-file acceptance and a two-character PDF limit overcount. No unresolved critical/high-severity issue was found. The original regex engine is unchanged.

Known limits: PDF text order/spacing is heuristic; scans require OCR; DOCX/PDF layout, images and embedded content are not reproduced. Complex compressed inputs can consume memory during parsing before the extracted-text limit applies. Recognition and rendering remain on the main thread. Full browser, screen-reader and adversarial document testing has not been performed.

## Release gates

All six local quality gates passed. The commands executed were:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

The existing GitHub Actions workflow is retained. Vercel uses the existing GitHub-connected project, production branch main, Vite preset, repository root, `npm run build`, and `dist`. No backend or extra deployment service is added.
