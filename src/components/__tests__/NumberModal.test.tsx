import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberModal } from '../NumberModal';

describe('NumberModal', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(
      <NumberModal number="A1" visible={false} onClose={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the number when visible is true', () => {
    render(<NumberModal number="C15" visible={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('number-modal-number')).toHaveTextContent('C15');
  });

  it('does not render a close button', () => {
    render(<NumberModal number="A1" visible={true} onClose={vi.fn()} />);
    expect(screen.queryByTestId('number-modal-close')).toBeNull();
  });

  it('does not call onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<NumberModal number="A1" visible={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('number-modal-overlay'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<NumberModal number="A1" visible={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('number-modal-number'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
