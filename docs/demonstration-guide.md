# Demonstration guide

Prepare Node.js 24, run `npm ci`, then `npm run dev`. Open the printed URL. Keep the three files in `samples/` accessible. For an offline demonstration, install dependencies beforehand, run `npm run build`, disconnect from the internet, then run `npm run preview`. Do not use `file://`.

1. **Introduce the purpose.** “This application recognizes predefined gender-specific language and suggests neutral alternatives for human review.” Identify BISU, BSCS 3A, the four members, and instructor ALMA MAE B. AUXTERO.
2. **Explain the technology.** React presents the interface; strict TypeScript defines domain types; Vite builds static assets. Documents remain in the browser.
3. **Explain regular expressions.** Show `src/domain/recognizer.ts`. Escaped alternatives form one combined expression with `giu` flags. Character classes and lookarounds enforce boundaries; no finite state automaton implementation is used.
4. **Upload the supplied sample.** Choose `samples/gender-specific-terms.txt`.
5. **Show recognized terms.** Expect 13 distinct terms, including chairman, policeman, and the phrase ladies and gentlemen.
6. **Explain counts.** There are 15 total occurrences: chairman and he each occur twice; the other 11 terms occur once.
7. **Explain alternatives.** Chairman suggests chairperson; policeman suggests police officer. Suggestions are not automatic grammatical replacements.
8. **Show highlighted text.** Scroll to the preview. Original capitalization, punctuation and whitespace remain; underlined highlights identify matches using stored offsets.
9. **Demonstrate capitalization.** Point to Chairman/chairman and He/HE in the preview and their single aggregated table rows.
10. **Explain boundaries.** “The negative lookarounds reject matches adjacent to letters, marks, numbers or underscores, so he is not recognized inside the or shelter.”
11. **Show no matches.** Upload `samples/no-matches.txt`. Read the exact no-match message and show that previous results disappear.
12. **Show empty-file handling.** Upload `samples/empty.txt`; the empty-document error appears and old results are removed.
13. **Show unsupported-format handling.** Select `README.md` using the file picker's All Files option (if available). The application rejects it. If the picker prevents this selection, explain the validation and show the passing TEST 5 automated result rather than claiming a live demonstration.
14. **Conclude with limitations.** The 120 predefined rules do not understand context or infer unlisted forms; suggestions need human judgment. Show `npm run test` and the report's verified results.

## Questions to prepare for

- **Why regular expressions?** A fixed finite vocabulary with boundary and spacing constraints is straightforward to describe with a combined pattern. Lookarounds impose context checks without consuming neighboring punctuation.
- **Why not `\b`?** JavaScript's usual word-boundary definition is insufficient for all Unicode letters. Explicit Unicode classes also avoid partial matches near combining marks.
- **How do highlights stay accurate?** Every match retains its original text and exclusive start/end UTF-16 offsets; `slice` partitions the same decoded string.
- **How is content safe?** React escapes document text. No content is executed, injected as HTML, saved remotely or automatically changed.
- **What happens with a second upload?** State enters loading immediately, clearing old results. A monotonically increasing request ID prevents late reads from replacing a newer document.

Before submitting, review the member roles already recorded in the report and follow the instructor's submission process. Do not describe the draft as submitted.

## Version 2 demonstration additions

- Upload `samples/gender-specific-terms.pdf`: expect PDF format, 2 pages, four occurrences and four distinct terms. Show the extraction-layout notice and the page separator in plain text.
- Upload `samples/gender-specific-terms.docx`: expect DOCX format and four occurrences across four terms. Show the preserved paragraph break.
- Search for `chair`, choose Leadership, switch to Term A–Z, and clear filters. Filters change only the table; the summary and highlighted document remain complete.
- Export all results as CSV. Open the downloaded `gender-specific-terms-analysis.csv`; confirm term, alternative, category and count. Exports include all detected terms even if filters are active.
- Explain the limits: 10 MiB, 100 PDF pages, 500,000 extracted characters; no OCR or password-protected PDFs, no legacy DOC, and no original-layout reproduction.
- Explain that the original 20 mappings are unchanged. The additional vocabulary consists of explicit occupational/leadership/public-service terms, school roles, common gendered phrases and their relevant plural forms.
