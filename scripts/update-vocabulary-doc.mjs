import { URL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
const source = readFileSync(
  new URL('../src/domain/recognitionRules.ts', import.meta.url),
  'utf8',
);
const rows = [
  ...source.matchAll(
    /term:\s*'([^']+)',\s*alternative:\s*'([^']+)',\s*category:\s*'([^']+)'/g,
  ),
];
if (rows.length !== 120)
  throw new Error(
    `Expected 120 formatted rules; found ${rows.length}. Run npm run format first.`,
  );
writeFileSync(
  new URL('../docs/vocabulary.md', import.meta.url),
  '# Vocabulary appendix\n\nExactly 120 canonical entries. The first 20 retain the version 1 mappings. Categories and mappings are generated from `src/domain/recognitionRules.ts`.\n\nEach entry was reviewed as an established gender-marked term or phrase, with a role-preserving or contextually useful neutral suggestion. Singular and plural entries are deliberate separate lexical forms, not case or spacing variants. No neutral word was added to reach the count. These are review prompts, not claims that every use is inappropriate: actor and comedian can be neutral occupational labels, waiter is sometimes used broadly, public-office titles vary by jurisdiction, and explicitly gendered references may be relevant. Pronoun substitutions need grammatical review. Historical titles and quotations should not be automatically changed.\n\n| # | Term | Suggested alternative | Category |\n| --- | --- | --- | --- |\n' +
    rows
      .map((row, i) => `| ${i + 1} | ${row[1]} | ${row[2]} | ${row[3]} |`)
      .join('\n') +
    '\n',
);
