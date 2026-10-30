import { expect, it, vi } from 'vitest';
import { readTextFile } from './readTextFile';
it('TEST 4 rejects a zero-byte document', async () => {
  await expect(readTextFile(new File([], 'empty.txt'))).rejects.toThrow(
    'This document is empty.',
  );
});
it('TEST 5 rejects unsupported extensions', async () => {
  await expect(readTextFile(new File(['He'], 'document.pdf'))).rejects.toThrow(
    'Unsupported file format.',
  );
});
it('TEST 13 rejects whitespace-only text', async () => {
  await expect(
    readTextFile(new File([' \t\r\n'], 'blank.txt')),
  ).rejects.toThrow('only whitespace');
});
it('TEST 14 accepts uppercase TXT and preserves text', async () => {
  await expect(
    readTextFile(new File(['He\r\n SHE '], 'DOCUMENT.TXT')),
  ).resolves.toBe('He\r\n SHE ');
});
it('TEST 15 rejects malformed UTF-8', async () => {
  await expect(
    readTextFile(new File([new Uint8Array([0xc3, 0x28])], 'bad.txt')),
  ).rejects.toThrow('not valid UTF-8');
});
it('removes a UTF-8 byte-order mark', async () => {
  await expect(
    readTextFile(
      new File([new Uint8Array([0xef, 0xbb, 0xbf, 0x48, 0x65])], 'bom.txt'),
    ),
  ).resolves.toBe('He');
});
it('reports failed reads', async () => {
  const file = new File(['He'], 'unreadable.txt');
  vi.spyOn(file, 'arrayBuffer').mockRejectedValue(new Error('Unavailable'));
  await expect(readTextFile(file)).rejects.toThrow('could not be read');
});
