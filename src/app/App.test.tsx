import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import App from './App';
import { DocumentPreview } from '../components/DocumentPreview';
import { recognizeText } from '../domain/recognizer';
const input = () => screen.getByLabelText('Choose a text document');
it('shows terms, counts and alternatives after a real file upload', async () => {
  render(<App />);
  await userEvent.upload(
    input(),
    new File(['Chairman CHAIRMAN; she.'], 'sample.txt'),
  );
  const table = await screen.findByRole('table');
  const row = within(table).getByRole('row', {
    name: 'chairman 2 chairperson',
  });
  expect(row).toBeVisible();
  expect(within(table).getByRole('row', { name: 'she 1 they' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(
    '3 occurrences across 2 distinct terms',
  );
});
it('displays the exact required no-match message', async () => {
  render(<App />);
  await userEvent.upload(
    input(),
    new File(['The team entered the shelter.'], 'none.txt'),
  );
  expect(
    await screen.findByText(
      'No predefined gender-specific terms were detected.',
    ),
  ).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
it('TEST 10 highlighted segments reconstruct the original text', () => {
  const text = '😀 He,he\tSHE!\r\nLadies  and gentlemen.  ';
  const { container } = render(
    <DocumentPreview text={text} matches={recognizeText(text).matches} />,
  );
  expect(container.querySelector('pre')?.textContent).toBe(text);
  expect(container.querySelectorAll('mark')).toHaveLength(4);
});
it('TEST 11 renders HTML-like content safely as text', () => {
  const text = '<script>alert("he")</script><img src=x onerror=alert(1)>';
  const { container } = render(
    <DocumentPreview text={text} matches={recognizeText(text).matches} />,
  );
  expect(container.querySelector('script, img')).toBeNull();
  expect(container.querySelector('pre')?.textContent).toBe(text);
});
it('TEST 12 replaces results and allows repeated selection of the same file', async () => {
  render(<App />);
  const user = userEvent.setup();
  const file = new File(['He'], 'first.txt');
  await user.upload(input(), file);
  await screen.findByRole('table');
  await user.upload(input(), file);
  await screen.findByRole('table');
  await user.upload(input(), new File(['She'], 'second.txt'));
  await screen.findByRole('row', { name: 'she 1 they' });
  expect(
    screen.queryByRole('row', { name: 'he 1 they' }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('second.txt');
});
it('clears old results on invalid upload and recovers afterward', async () => {
  render(<App />);
  const user = userEvent.setup({ applyAccept: false });
  await user.upload(input(), new File(['He'], 'valid.txt'));
  await screen.findByRole('table');
  await user.upload(input(), new File(['He'], 'bad.pdf'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unsupported file format.',
  );
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText(
      'Original document with recognized terms highlighted',
    ),
  ).not.toBeInTheDocument();
  await user.upload(input(), new File([], 'empty.txt'));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'This document is empty.',
  );
  await user.upload(input(), new File(['He'], 'recovery.txt'));
  expect(await screen.findByRole('table')).toBeVisible();
});
it('a slow previous upload cannot overwrite a newer upload', async () => {
  render(<App />);
  const file = new File(['He'], 'slow.txt');
  let finish: (buffer: ArrayBuffer) => void = () => {
    throw new Error('Read not started');
  };
  vi.spyOn(file, 'arrayBuffer').mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await userEvent.upload(input(), file);
  expect(screen.getByRole('status')).toHaveTextContent('Reading slow.txt');
  await userEvent.upload(input(), new File(['She'], 'latest.txt'));
  await screen.findByRole('table');
  await act(async () => {
    finish(new TextEncoder().encode('He').buffer);
  });
  expect(screen.getByRole('status')).toHaveTextContent('latest.txt');
  expect(screen.getByRole('row', { name: 'she 1 they' })).toBeVisible();
});
