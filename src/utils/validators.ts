/**
 * 校验网格输入值是否为有效的正整数（>= 1）。
 *
 * 合法值：正整数（1, 2, 3, ...）
 * 非法值：null, undefined, NaN, 字符串, 对象, 数组, 布尔值,
 *         0, 负数, 小数/浮点数, Infinity, 非数字类型
 *
 * @param value 待校验的输入值
 * @returns 仅当 value 为正整数时返回 true
 */
export function validateGridInput(value: unknown): boolean {
  if (typeof value !== 'number') {
    return false;
  }

  if (!Number.isFinite(value)) {
    return false;
  }

  if (!Number.isInteger(value)) {
    return false;
  }

  return value >= 1;
}

/**
 * 校验图片文件是否为支持的格式（JPG/PNG）。
 *
 * 通过文件名扩展名进行大小写不敏感的校验。
 * 合法扩展名：.jpg, .jpeg, .png
 * 非法：.gif, .bmp, .svg, .webp, 无扩展名等
 *
 * @param file 待校验的文件对象
 * @returns 仅当文件扩展名为 JPG/JPEG/PNG 时返回 true
 */
export function validateImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return /\.(jpe?g|png)$/.test(name);
}

