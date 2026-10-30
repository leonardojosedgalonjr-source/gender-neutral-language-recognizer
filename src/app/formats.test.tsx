import { readFile } from 'node:fs/promises';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import App from './App';
it('switches from real DOCX to TXT and resets filters and preview', async () => {
  render(<App />);
  const user = userEvent.setup();
  const input = screen.getByLabelText('Choose a text document');
  const bytes = await readFile('src/test/fixtures/sample.docx');
  await user.upload(input, new File([bytes], 'sample.docx'));
  await screen.findByRole('row', {
    name: 'chairwomen 1 chairpersons Leadership',
  });
  expect(screen.getByRole('status')).toHaveTextContent('4 occurrences');
  const preview = screen.getByLabelText(
    'Original document with recognized terms highlighted',
  );
  expect(preview.textContent).toBe(
    'The chairwomen welcomed the salesmen.\n\nA businesswoman thanked the headmaster.\n\n',
  );
  await user.type(screen.getByLabelText('Search detected terms'), 'sales');
  await user.upload(input, new File(['He'], 'next.txt'));
  await screen.findByRole('row', { name: 'he 1 they Pronouns' });
  expect(screen.getByLabelText('Search detected terms')).toHaveValue('');
  expect(
    screen.getByLabelText('Original document with recognized terms highlighted')
      .textContent,
  ).toBe('He');
});
