import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigPage } from '../ConfigPage';

describe('ConfigPage', () => {
  it('renders with default row=5 and col=20', () => {
    render(<ConfigPage onConfigComplete={() => {}} />);
    expect(screen.getByLabelText(/垂直行数/)).toHaveValue(5);
    expect(screen.getByLabelText(/水平列数/)).toHaveValue(20);
  });

  it('shows "请先上传抽奖图片" when clicking submit without uploading an image', () => {
    render(<ConfigPage onConfigComplete={() => {}} />);
    fireEvent.click(screen.getByText('进入抽奖'));
    expect(screen.getByRole('alert')).toHaveTextContent('请先上传抽奖图片');
  });

  it('shows "切分数量必须为大于 0 的正整数" when rows is invalid', () => {
    render(<ConfigPage onConfigComplete={() => {}} />);

    // Upload a valid image first
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/选择抽奖图片/);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Set rows to 0 (invalid)
    fireEvent.change(screen.getByLabelText(/垂直行数/), { target: { value: '0' } });

    fireEvent.click(screen.getByText('进入抽奖'));
    expect(screen.getByRole('alert')).toHaveTextContent('切分数量必须为大于 0 的正整数');
  });

  it('shows "切分数量必须为大于 0 的正整数" when cols is negative', () => {
    render(<ConfigPage onConfigComplete={() => {}} />);

    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/选择抽奖图片/);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Set cols to -1 (invalid)
    fireEvent.change(screen.getByLabelText(/水平列数/), { target: { value: '-1' } });

    fireEvent.click(screen.getByText('进入抽奖'));
    expect(screen.getByRole('alert')).toHaveTextContent('切分数量必须为大于 0 的正整数');
  });

  it('calls onConfigComplete with correct config when valid image and grid values are provided', () => {
    const onConfigComplete = vi.fn();
    render(<ConfigPage onConfigComplete={onConfigComplete} />);

    // Upload a valid image
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/选择抽奖图片/);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Keep default rows=5, cols=20 and submit
    fireEvent.click(screen.getByText('进入抽奖'));

    expect(onConfigComplete).toHaveBeenCalledWith({
      imageFile: file,
      rows: 5,
      cols: 20,
    });
  });

  it('clears error message when a valid submission is made after an error', () => {
    render(<ConfigPage onConfigComplete={() => {}} />);

    // Trigger error by submitting without image
    fireEvent.click(screen.getByText('进入抽奖'));
    expect(screen.getByRole('alert')).toHaveTextContent('请先上传抽奖图片');

    // Now upload a valid image and submit again
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/选择抽奖图片/);
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText('进入抽奖'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
