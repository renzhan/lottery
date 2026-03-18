import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sliceImage } from './imageSlice';

describe('sliceImage', () => {
  let mockCtx: { drawImage: ReturnType<typeof vi.fn> };
  let toDataURLIndex: number;

  beforeEach(() => {
    toDataURLIndex = 0;
    mockCtx = { drawImage: vi.fn() };

    // Mock canvas getContext and toDataURL
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const canvas = {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(mockCtx),
          toDataURL: vi.fn().mockImplementation(() => {
            return `data:image/png;base64,piece_${toDataURLIndex++}`;
          }),
        } as unknown as HTMLCanvasElement;
        return canvas;
      }
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag);
    });
  });

  function createMockImage(width: number, height: number): HTMLImageElement {
    return { naturalWidth: width, naturalHeight: height } as HTMLImageElement;
  }

  it('should return rows × cols data URLs', () => {
    const image = createMockImage(400, 200);
    const result = sliceImage(image, 2, 4);

    expect(result).toHaveLength(8);
  });

  it('should return data URL strings', () => {
    const image = createMockImage(300, 300);
    const result = sliceImage(image, 3, 3);

    result.forEach((url) => {
      expect(url).toMatch(/^data:image\/png;base64,/);
    });
  });

  it('should call drawImage with correct source coordinates for each piece', () => {
    const image = createMockImage(400, 200);
    sliceImage(image, 2, 4);

    const calls = mockCtx.drawImage.mock.calls;
    expect(calls).toHaveLength(8);

    // Piece width = 400/4 = 100, Piece height = 200/2 = 100
    // Row 0, Col 0
    expect(calls[0]).toEqual([image, 0, 0, 100, 100, 0, 0, 100, 100]);
    // Row 0, Col 1
    expect(calls[1]).toEqual([image, 100, 0, 100, 100, 0, 0, 100, 100]);
    // Row 0, Col 3
    expect(calls[3]).toEqual([image, 300, 0, 100, 100, 0, 0, 100, 100]);
    // Row 1, Col 0
    expect(calls[4]).toEqual([image, 0, 100, 100, 100, 0, 0, 100, 100]);
    // Row 1, Col 3
    expect(calls[7]).toEqual([image, 300, 100, 100, 100, 0, 0, 100, 100]);
  });

  it('should handle 1×1 grid', () => {
    const image = createMockImage(800, 600);
    const result = sliceImage(image, 1, 1);

    expect(result).toHaveLength(1);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      image, 0, 0, 800, 600, 0, 0, 800, 600,
    );
  });

  it('should order pieces left-to-right, top-to-bottom', () => {
    const image = createMockImage(200, 200);
    const result = sliceImage(image, 2, 2);

    expect(result).toHaveLength(4);
    // Verify ordering by checking unique sequential data URLs
    expect(result[0]).toContain('piece_0');
    expect(result[1]).toContain('piece_1');
    expect(result[2]).toContain('piece_2');
    expect(result[3]).toContain('piece_3');
  });
});
