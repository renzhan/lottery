/**
 * 将行索引转为字母标识。
 * - 索引 0-25 → A-Z（单字母）
 * - 索引 26+ → 双字母：26=AA, 27=AB, ..., 51=AZ, 52=BA, ...
 *
 * @param rowIndex 0-based 行索引
 * @returns 对应的字母标识
 */
export function getRowLabel(rowIndex: number): string {
  if (rowIndex < 26) {
    return String.fromCharCode(65 + rowIndex);
  }

  const adjusted = rowIndex - 26;
  const first = String.fromCharCode(65 + Math.floor(adjusted / 26));
  const second = String.fromCharCode(65 + (adjusted % 26));
  return first + second;
}

/**
 * 根据行列数生成抽奖号码列表。
 * 格式为"行字母+列数字"，如 A1, A2, ..., B1, B2, ...
 *
 * @param rows 垂直行数
 * @param cols 水平列数
 * @returns 号码数组，长度为 rows × cols
 */
export function generateNumbers(rows: number, cols: number): string[] {
  const numbers: string[] = [];
  for (let r = 0; r < rows; r++) {
    const label = getRowLabel(r);
    for (let c = 1; c <= cols; c++) {
      numbers.push(`${label}${c}`);
    }
  }
  return numbers;
}

