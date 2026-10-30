import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FileUpload } from './FileUpload';
it('accepts a dropped document through the same selection callback', () => {
  const select = vi.fn();
  render(<FileUpload onSelect={select} />);
  const file = new File(['He'], 'dropped.txt');
  fireEvent.drop(
    screen.getByRole('region', { name: 'Drop a document to begin' }),
    { dataTransfer: { files: [file] } },
  );
  expect(select).toHaveBeenCalledWith(file);
});
