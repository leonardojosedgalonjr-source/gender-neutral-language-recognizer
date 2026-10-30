# Project guidance

No implementation is considered complete until the relevant behavior has been verified and the applicable quality gates pass.

- Purpose: browser-only academic recognizer of predefined gender-specific language.
- Stack: React functional components, strict TypeScript, Vite, CSS, npm, Vitest, React Testing Library, ESLint and Prettier.
- Keep readonly rules and pure regex recognition in `src/domain`; native UTF-8 file handling in `src/utils`; presentation in React components.
- Preserve original text and UTF-16 offsets. Require Unicode-aware boundaries, escaped alternatives, case-insensitive counts, nonoverlapping matches and horizontal phrase spacing.
- Suggestions require human review. Never replace text automatically or inject HTML.
- Use descriptive domain names, focused functions and explicit types. Avoid duplicated rules, unnecessary dependencies and abstractions.
- Verify matching, error states, safe highlighting and replacement uploads with behavioral tests.
- Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `git diff --check`.
- Keep README, report, demonstration guide and sample expectations accurate. Record only executed test results; never invent screenshots or contributions.
- No backend, database, authentication, AI API, analytics, external document transmission, UI framework or routing framework.
