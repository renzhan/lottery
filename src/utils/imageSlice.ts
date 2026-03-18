/**
 * 使用 HTML5 Canvas API 将图片按行列切分为等大的拼图块。
 * 拼图块按从左到右、从上到下的顺序排列。
 *
 * @param image 要切分的 HTMLImageElement
 * @param rows 垂直行数
 * @param cols 水平列数
 * @returns Data URL 字符串数组，长度为 rows × cols
 */
export function sliceImage(image: HTMLImageElement, rows: number, cols: number): string[] {
  const pieceWidth = image.naturalWidth / cols;
  const pieceHeight = image.naturalHeight / rows;
  const dataUrls: string[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas');
      canvas.width = pieceWidth;
      canvas.height = pieceHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          image,
          c * pieceWidth,   // source x
          r * pieceHeight,  // source y
          pieceWidth,       // source width
          pieceHeight,      // source height
          0,                // destination x
          0,                // destination y
          pieceWidth,       // destination width
          pieceHeight,      // destination height
        );
      }

      dataUrls.push(canvas.toDataURL());
    }
  }

  return dataUrls;
}
