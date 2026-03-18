import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GridConfig } from '../GridConfig';

describe('GridConfig', () => {
  it('renders row and col inputs with labels', () => {
    render(<GridConfig rows={5} cols={20} onRowsChange={() => {}} onColsChange={() => {}} />);
    expect(screen.getByLabelText(/垂直行数/)).toBeInTheDocument();
    expect(screen.getByLabelText(/水平列数/)).toBeInTheDocument();
  });

  it('displays provided row and col values', () => {
    render(<GridConfig rows={5} cols={20} onRowsChange={() => {}} onColsChange={() => {}} />);
    expect(screen.getByLabelText(/垂直行数/)).toHaveValue(5);
    expect(screen.getByLabelText(/水平列数/)).toHaveValue(20);
  });

  it('calls onRowsChange when row input changes', () => {
    const onRowsChange = vi.fn();
    render(<GridConfig rows={5} cols={20} onRowsChange={onRowsChange} onColsChange={() => {}} />);
    fireEvent.change(screen.getByLabelText(/垂直行数/), { target: { value: '10' } });
    expect(onRowsChange).toHaveBeenCalledWith(10);
  });

  it('calls onColsChange when col input changes', () => {
    const onColsChange = vi.fn();
    render(<GridConfig rows={5} cols={20} onRowsChange={() => {}} onColsChange={onColsChange} />);
    fireEvent.change(screen.getByLabelText(/水平列数/), { target: { value: '30' } });
    expect(onColsChange).toHaveBeenCalledWith(30);
  });
});
