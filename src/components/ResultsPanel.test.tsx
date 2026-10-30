import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { ResultsPanel } from './ResultsPanel';
import { recognizeText } from '../domain/recognizer';
it('supports search, category, sort and clearing filters through accessible controls', async () => {
  render(
    <ResultsPanel
      summary={recognizeText('He he chairman policeman policewoman')}
      filename="test.txt"
    />,
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Search detected terms'), 'police');
  expect(screen.getByText('Showing 2 of 4 detected terms')).toBeVisible();
  await user.selectOptions(screen.getByLabelText('Category'), 'Leadership');
  expect(
    screen.getByText('No detected terms match these filters.'),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByText('Showing 4 of 4 detected terms')).toBeVisible();
  await user.selectOptions(screen.getByLabelText('Sort results'), 'term');
  expect(
    within(screen.getByRole('table')).getAllByRole('row')[1],
  ).toHaveTextContent('chairman');
  await user.selectOptions(
    screen.getByLabelText('Sort results'),
    'occurrences',
  );
  expect(
    within(screen.getByRole('table')).getAllByRole('row')[1],
  ).toHaveTextContent('he');
});
it('disables exporting an analysis with no matches', () => {
  render(
    <ResultsPanel summary={recognizeText('The team')} filename="test.txt" />,
  );
  expect(
    screen.getByRole('button', { name: 'Export all results as CSV' }),
  ).toBeDisabled();
});
it('exports all results even when the table is filtered', async () => {
  const { vi } = await import('vitest');
  const resultsModule = await import('../domain/results');
  const download = vi
    .spyOn(resultsModule, 'downloadAnalysis')
    .mockImplementation(() => {});
  const summary = recognizeText('He chairman');
  render(<ResultsPanel summary={summary} filename="source.docx" />);
  await userEvent.type(
    screen.getByLabelText('Search detected terms'),
    'chairman',
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Export all results as CSV' }),
  );
  expect(download).toHaveBeenCalledWith(summary.results, 'source.docx');
  download.mockRestore();
});
