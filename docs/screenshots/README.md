# Genuine application screenshots

These PNGs were captured from the running local application on October 30, 2026 (Philippine time), using the Codex in-app browser at a narrow responsive viewport. They are actual UI captures, not mockups.

- `file-selection.png`: labeled file selection and initial empty state.
- `recognized-terms.png`: sample filename, 13 distinct terms, 15 occurrences and the beginning of the results table.
- `no-matches.png`: exact no-match message and unchanged preview.

To replace them with wider presentation captures:

1. Run `npm ci` and `npm run dev`; open the printed URL in a current desktop browser at approximately 1280 × 900, zoom 100%.
2. Reload and capture the heading and upload section as `file-selection.png`.
3. Select `samples/gender-specific-terms.txt`; verify 13 distinct terms and 15 occurrences. Scroll to frame the summary and table; capture `recognized-terms.png`. Optionally capture the preview separately.
4. Select `samples/no-matches.txt`; frame the exact message and preview; capture `no-matches.png`.
5. Save to this folder, inspect the images for legibility, and retain the captions in the report. Do not alter results or fabricate UI states.
