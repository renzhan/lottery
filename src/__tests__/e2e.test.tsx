import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock canvas context
const mockCtx = {
  drawImage: vi.fn(),
};

// Mock canvas element
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockCtx),
  toDataURL: vi.fn(() => 'data:image/png;base64,mockdata'),
};

describe('端到端冒烟测试：配置 → 进入抽奖 → 空格键启动跑马灯 → 空格键停止 → 翻转 → 弹窗显示号码', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;
  let originalCreateElement: typeof document.createElement;
  let originalImage: typeof globalThis.Image;

  beforeEach(() => {
    // Save originals
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    originalCreateElement = document.createElement.bind(document);
    originalImage = globalThis.Image;

    // Mock URL.createObjectURL / revokeObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    // Mock Image to immediately trigger onload with dimensions
    class MockImage {
      naturalWidth = 200;
      naturalHeight = 100;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = '';

      get src() {
        return this._src;
      }
      set src(value: string) {
        this._src = value;
        // Trigger onload synchronously for fake timers compatibility
        if (this.onload) this.onload();
      }
    }
    globalThis.Image = MockImage as unknown as typeof globalThis.Image;

    // Mock document.createElement to intercept canvas creation
    document.createElement = vi.fn((tagName: string, options?: ElementCreationOptions) => {
      if (tagName === 'canvas') {
        return { ...mockCanvas, width: 0, height: 0, getContext: mockCanvas.getContext, toDataURL: mockCanvas.toDataURL } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName, options);
    }) as typeof document.createElement;

    // Reset mock call counts
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore originals
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalCreateElement;
    globalThis.Image = originalImage;
  });

  it('完整流程：上传图片 → 配置 → 进入抽奖 → 空格键启停跑马灯 → 翻转 → 弹窗显示号码', async () => {
    render(<App />);

    // Step 1: Verify ConfigPage is rendered
    expect(screen.getByText('进入抽奖')).toBeInTheDocument();

    // Step 2: Upload a mock image file
    const file = new File(['mock-image-content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('选择抽奖图片');
    await userEvent.upload(fileInput, file);

    // Verify file is selected
    expect(screen.getByText(/已选择.*test\.png/)).toBeInTheDocument();

    // Step 3: Set grid to 2×2 for a simpler test
    const rowsInput = screen.getByLabelText(/垂直行数/);
    const colsInput = screen.getByLabelText(/水平列数/);

    await userEvent.clear(rowsInput);
    await userEvent.type(rowsInput, '2');
    await userEvent.clear(colsInput);
    await userEvent.type(colsInput, '2');

    // Step 4: Click "进入抽奖" to navigate to LotteryPage
    const enterButton = screen.getByText('进入抽奖');
    await userEvent.click(enterButton);

    // Step 5: Wait for the lottery page to load (image processing is async)
    await waitFor(() => {
      expect(screen.getByTestId('lottery-page')).toBeInTheDocument();
    });

    // Wait for tiles to finish loading (loading state disappears)
    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    // Step 6: Press space key to start marquee
    // Use fake timers to control requestAnimationFrame-based marquee
    vi.useFakeTimers();

    await act(async () => {
      fireEvent.keyDown(document, { code: 'Space' });
    });

    // Advance timers to let the marquee run a few steps
    // requestAnimationFrame uses timestamps; we advance enough for at least one step
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Step 7: Press space key again to stop marquee (selects a tile)
    await act(async () => {
      fireEvent.keyDown(document, { code: 'Space' });
    });

    // Step 8: Wait for flip animation (600ms) and modal to appear
    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    vi.useRealTimers();

    // Step 9: Verify NumberModal displays a valid lottery number
    await waitFor(() => {
      expect(screen.getByTestId('number-modal-overlay')).toBeInTheDocument();
    }, { timeout: 2000 });

    const numberDisplay = screen.getByTestId('number-modal-number');
    expect(numberDisplay).toBeInTheDocument();

    // The number should match the pattern: letter(s) + digit(s) (e.g., A1, B2)
    const displayedNumber = numberDisplay.textContent ?? '';
    expect(displayedNumber).toMatch(/^[A-Z]+\d+$/);

    // Step 10: Close modal
    vi.useFakeTimers();
    const closeButton = screen.getByTestId('number-modal-close');
    await act(async () => {
      fireEvent.click(closeButton);
    });
    vi.useRealTimers();

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('number-modal-overlay')).not.toBeInTheDocument();
    });

    // Step 11: Verify the tile stays flipped - the lottery-page should still be visible
    // and we should be able to see the page is intact
    expect(screen.getByTestId('lottery-page')).toBeInTheDocument();
  });
});
