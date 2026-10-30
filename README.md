# Gender Neutral Language Recognizer 2.0

A browser-only academic application for **Bohol Island State University**, Automata and Language Theory, **BSCS 3A**. Upload a UTF-8 `.txt`, text-based `.pdf`, or `.docx` document to identify 120 predefined gender-specific words and phrases, count their occurrences, and review suggested gender-neutral alternatives. Original text is never automatically rewritten.

## Features

- Case-insensitive recognition with Unicode-aware whole-word boundaries.
- Multiword phrases separated by spaces or tabs, without crossing line breaks.
- Aggregated counts, contextual suggestions, and an unchanged highlighted preview.
- Validation of extension, empty/whitespace content, invalid UTF-8, and failed reads.
- Search detected terms, filter by category, sort by count or term, clear filters, and export all results as correctly quoted CSV.
- Drag-and-drop or keyboard-accessible file browsing, filename/size/format metadata, and extraction warnings.
- Replacement uploads, including selecting the same file again, without refreshing.
- Responsive light interface, semantic table, keyboard controls, focus indicators, live status, and underlined highlights.
- Entirely local processing: no backend, AI service, analytics, storage, or document transmission.

## Technology and requirements

React 19, strict TypeScript 5.9, Vite 7, modern CSS, JavaScript regular expressions, Vitest 4, React Testing Library, ESLint and Prettier. PDF.js extracts PDF text with a locally bundled worker; Mammoth extracts raw DOCX text. Both format readers are lazy-loaded. Exact dependencies are recorded in `package-lock.json`.

Use **Node.js 24 LTS** (minimum 22.13), npm, and a current browser with Unicode property escapes, lookbehind, `TextDecoder`, and `File.arrayBuffer` support. An internet connection is needed for the initial dependency installation, not for analyzing documents. All assets and fonts are local/system resources.

## Installation and development

From the project directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173/`. Stop the terminal process with Ctrl+C.

## Production build and offline use

```sh
npm run build
npm run preview
```

Open the printed preview URL, normally `http://127.0.0.1:4173/`. `dist/` contains the compiled static application. After dependencies are installed, both build and local serving work without internet. Serve the files over local HTTP; do not double-click `dist/index.html`. The local server only delivers static assets; the application has no backend. No service worker or installed offline/PWA mode is provided.

## Usage and samples

1. Choose a text document using the labeled file input.
2. Review the filename, total occurrences, and distinct-term count.
3. Read each detected term and its suggested alternative.
4. Inspect highlighted matches in the original document preview.
5. Select another file to replace the current analysis.

Supported formats are `.txt`, `.pdf`, and `.docx` (case-insensitive). Legacy `.doc` files are rejected. TXT uses strict UTF-8 decoding, strips a leading BOM, preserves line endings, and rejects binary control characters. PDF extraction follows text-item order with geometric spacing, explicit line breaks and blank lines between pages. DOCX raw extraction preserves paragraph separation. The preview represents extracted plain text, never the original PDF/Word layout.

Limits: **10 MiB per file**, **100 PDF pages**, and **500,000 extracted characters**. PDF pages without text generate warnings; entirely textless/scanned PDFs require OCR, which is not supported. Password-protected, corrupt and unreadable documents produce errors. DOCX HTML is never rendered and embedded content/macros are not executed. Very complex or compressed files may still consume considerable memory during parsing; these are usability limits, not a hardened untrusted-document sandbox.

| Sample                               | Expected output                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `samples/gender-specific-terms.txt`  | 15 occurrences, 13 distinct terms; `chairman` and `he` occur twice; every other detected term occurs once                    |
| `samples/no-matches.txt`             | 0 occurrences; exactly “No predefined gender-specific terms were detected.” Includes `the` and `shelter` to check boundaries |
| `samples/gender-specific-terms.pdf`  | 2 pages; 4 occurrences / 4 terms: chairmen, policewomen, spokeswoman, firemen                                                |
| `samples/gender-specific-terms.docx` | 2 paragraphs; 4 occurrences / 4 terms: chairwomen, salesmen, businesswoman, headmaster                                       |
| `samples/empty.txt`                  | “This document is empty. Please select a document containing text.” The file is zero bytes                                   |

Primary sample terms: ladies and gentlemen, chairman, freshman, policeman, fireman, he, manpower, businesswoman, mailman, stewardess, waitress, man-made, mankind.

## Recognition approach

The centralized readonly collection in `src/domain/recognitionRules.ts` supplies both matching terms and alternatives. `createRecognizer` escapes each term, normalizes phrase spacing, sorts alternatives longest first, and compiles one combined expression. `recognizeText` reuses it without retaining scan state between calls.

Representative pattern (the actual implementation includes all 120 alternatives):

```regex
(?<![\p{L}\p{M}\p{N}_])(?:ladies[ \t]+and[ \t]+gentlemen|chairwoman|chairman|man-made|he|she)(?![\p{L}\p{M}\p{N}_])
```

Flags: `giu`. Negative lookbehind and lookahead exclude adjacent Unicode letters, combining marks, numbers, and underscores. Alternation selects a configured term; `[ \t]+` permits horizontal phrase spacing only. Global matching finds successive nonoverlapping matches, `i` ignores case, and `u` enables Unicode handling. Results use canonical terms and order of first occurrence. Match offsets are JavaScript UTF-16 string indices, compatible with `slice` even after emoji. The preview renders text nodes and `<mark>` elements, never HTML injection. See the [report](docs/project-report.md) for the full rule table and theory explanation.

## Quality checks

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

`npm run format` applies formatting. `npm run test` executes tests once. GitHub Actions runs the same gates with locked dependencies on pushes and pull requests. Tests cover all 15 requested scenarios plus repeated calls, exact offsets, escaped custom terms, Unicode folding, BOM handling, read failures, and upload races. Executed results are in the report.

## Project structure

```text
src/
  app/           Application state and integration tests
  components/    Upload, results table, safe document preview
  domain/        Readonly rules, types, pure recognizer and tests
  utils/         TXT/PDF/DOCX extraction, dispatcher and validation tests
  test/fixtures/ Real PDF/DOCX files and frozen original vocabulary
  styles/        Responsive CSS
  main.tsx       React entry point
samples/         Demonstration documents
docs/            Academic report, demonstration guide, screenshots
.github/         Validation workflow
AGENTS.md        Project-specific development guidance
```

## Known limitations

This is a predefined English vocabulary recognizer, not a grammar checker, bias assessment, or semantic model. Pronouns may be appropriate in context; alternatives may require grammatical changes. Selected plural forms are explicit rules; other inflections, synonyms and unlisted terms are not inferred. Phrases do not match across newlines or nonbreaking spaces. Hyphens and punctuation act as boundaries except where explicitly part of a term. JavaScript Unicode case folding also recognizes forms such as long s. Unicode normalization is not performed. Very large documents are read into memory and processed on the main thread; file and text limits bound normal input, but no large-file performance guarantee is made. Refreshing clears the current document. Browser and screen-reader coverage is limited to the checks documented in the report.

## Academic documentation

- [Project report](docs/project-report.md)
- [Demonstration guide](docs/demonstration-guide.md)
- [Screenshot capture instructions](docs/screenshots/README.md)

Project members: Leonardo Jose D. Galon Jr., Jessica Mapute, Jade Melanie Acdal, and Christian Olonan.

Instructor: **ALMA MAE B. AUXTERO**. Prepared for **Bohol Island State University, BSCS 3A, Automata and Language Theory**. Deadline: October 31, 2026, Philippine time. Submission remains the students' responsibility.

AI assistance: OpenAI Codex assisted with implementation, tests, review, documentation and screenshot capture. The report preserves the member roles supplied in the existing GitHub history; none are invented here.

## Vercel deployment

The existing Vercel project is connected to this GitHub repository. Use that project rather than creating a duplicate. Production should track `main`, framework **Vite**, repository root `./`, build command `npm run build`, output directory `dist`, Node.js **24.x**. No environment variables, backend functions, or `vercel.json` are needed. A verified merge to `main` triggers the linked deployment.

If setting up on another account: sign in at [Vercel](https://vercel.com/new), import `leonardojosedgalonjr-source/gender-neutral-language-recognizer`, confirm the settings above, and select Deploy. Verify the actual returned URL with all three sample formats, check the PDF worker request under `/assets/pdf.worker…mjs`, and download CSV. Do not infer deployment success from a local build. See [validation](docs/validation.md) for the executed release checks.

## Vocabulary maintenance

The single source of truth is `src/domain/recognitionRules.ts`, including categories. Exactly 120 canonical entries are required. The frozen original 20 mappings are tested against the baseline, and every added rule has matching/count assertions. [Vocabulary appendix](docs/vocabulary.md) lists all mappings and contextual cautions. After editing the collection, regenerate that appendix with `node scripts/update-vocabulary-doc.mjs` and run the quality gates. The recognizer itself remains unchanged from version 1.
