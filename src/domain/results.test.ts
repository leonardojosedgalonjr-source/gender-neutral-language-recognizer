import { afterEach, expect, it, vi } from 'vitest';
import { analysisCsv, downloadAnalysis, selectResults } from './results';
import { recognizeText } from './recognizer';
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('searches, categorizes and sorts without changing source results', () => {
  const results = recognizeText('He he chairman policeman policewoman').results;
  expect(
    selectResults(results, 'POLICE', 'Public service', 'term').map(
      (row) => row.term,
    ),
  ).toEqual(['policeman', 'policewoman']);
  expect(selectResults(results, '', '', 'occurrences')[0]?.term).toBe('he');
  expect(selectResults(results, '', '', 'term')[0]?.term).toBe('chairman');
  expect(results[0]?.term).toBe('he');
});
it('quotes CSV commas, quotation marks and line breaks correctly', () => {
  expect(
    analysisCsv([{ term: 'chairman', alternative: 'a, "b"\nc', count: 2 }]),
  ).toBe(
    '"Term","Alternative","Category","Occurrences"\r\n"chairman","a, ""b""\nc","Leadership","2"\r\n',
  );
});
it('downloads all rows with a source-derived filename and releases the object URL', () => {
  vi.useFakeTimers();
  const create = vi.fn(() => 'blob:test');
  const revoke = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke });
  let downloaded = '';
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloaded = this.download;
    expect(this.href).toBe('blob:test');
  });
  downloadAnalysis(recognizeText('He').results, 'meeting.notes.PDF');
  expect(downloaded).toBe('meeting.notes-analysis.csv');
  expect(create).toHaveBeenCalledWith(expect.any(Blob));
  expect(document.querySelector('a')).toBeNull();
  vi.runAllTimers();
  expect(revoke).toHaveBeenCalledWith('blob:test');
});
