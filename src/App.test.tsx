import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock child components to isolate App routing logic
vi.mock('./components', () => ({
  ConfigPage: ({ onConfigComplete }: { onConfigComplete: (config: unknown) => void }) => (
    <div data-testid="config-page">
      <button
        onClick={() =>
          onConfigComplete({
            imageFile: new File(['img'], 'test.png', { type: 'image/png' }),
            rows: 5,
            cols: 20,
          })
        }
      >
        完成配置
      </button>
    </div>
  ),
  LotteryPage: ({ config }: { config: { rows: number; cols: number } }) => (
    <div data-testid="lottery-page">
      抽奖页面 - {config.rows}x{config.cols}
    </div>
  ),
}));

describe('App', () => {
  it('renders ConfigPage by default', () => {
    render(<App />);
    expect(screen.getByTestId('config-page')).toBeInTheDocument();
    expect(screen.queryByTestId('lottery-page')).not.toBeInTheDocument();
  });

  it('switches to LotteryPage after config is completed', () => {
    render(<App />);
    fireEvent.click(screen.getByText('完成配置'));
    expect(screen.getByTestId('lottery-page')).toBeInTheDocument();
    expect(screen.queryByTestId('config-page')).not.toBeInTheDocument();
  });

  it('passes config to LotteryPage', () => {
    render(<App />);
    fireEvent.click(screen.getByText('完成配置'));
    expect(screen.getByTestId('lottery-page')).toHaveTextContent('5x20');
  });
});
