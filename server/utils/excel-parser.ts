/**
 * Excel 文件解析工具
 * 使用 SheetJS 解析 XLSX 和 CSV 文件
 */

import * as XLSX from "xlsx";

/**
 * 解析文件缓冲区
 * @param buffer - 文件二进制数据
 * @param fileType - 文件类型 (xlsx 或 csv)
 * @returns 解析后的表格数据
 */
export async function parseFile(buffer: Buffer, fileType: string): Promise<TableData> {
  try {
    if (fileType === "csv") {
      return parseCSV(buffer);
    } else {
      return parseXLSX(buffer);
    }
  } catch (error) {
    console.error("文件解析失败:", error);
    throw new Error(`文件解析失败: ${error}`);
  }
}

/**
 * 解析 CSV 文件
 */
function parseCSV(buffer: Buffer): TableData {
  const text = buffer.toString("utf-8");
  const rows = parseCSVString(text);

  if (rows.length === 0) {
    throw new Error("CSV 文件为空");
  }

  const headers = rows[0];
  const allData = rows.slice(1);

  return {
    headers,
    preview: allData.slice(0, 50),
    allData,
    rows: allData.length,
    cols: headers.length,
  };
}

/**
 * 解析 CSV 字符串
 */
function parseCSVString(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") {
          i++;
        }
      } else {
        currentCell += char;
      }
    }
  }

  // 处理最后一个单元格和行
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

/**
 * 解析 XLSX 文件
 */
function parseXLSX(buffer: Buffer): TableData {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 转换为二维数组
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  if (rows.length === 0) {
    throw new Error("Excel 文件为空");
  }

  const headers = rows[0].map((h, i) => String(h || `列${i + 1}`));
  const allData = rows.slice(1).map(row =>
    headers.map((_, i) => String(row[i] || ""))
  );

  return {
    headers,
    preview: allData.slice(0, 50),
    allData,
    rows: allData.length,
    cols: headers.length,
  };
}

/**
 * 将表格数据转换为 Skybridge widget 所需的 CSV 格式
 * 格式：cell,value,style（每行一个单元格）
 * @param headers - 表头数组
 * @param data - 数据二维数组
 * @returns CSV 字符串
 */
export function tableToSkybridgeCSV(headers: string[], data: string[][]): string {
  const lines: string[] = [];

  // 第一行：表头
  for (let col = 0; col < headers.length; col++) {
    const cell = colToLetter(col) + "1";
    const value = escapeCSVField(headers[col]);
    lines.push(`${cell},${value},font-weight: bold`);
  }

  // 数据行
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < headers.length; col++) {
      const cell = colToLetter(col) + (row + 2);
      const value = escapeCSVField(data[row][col]);
      lines.push(`${cell},${value},`);
    }
  }

  return lines.join("\n");
}

/**
 * 将列索引转为字母（0 -> A, 1 -> B, ...）
 */
function colToLetter(col: number): string {
  let result = "";
  let c = col + 1;
  while (c > 0) {
    c--;
    result = String.fromCharCode(65 + (c % 26)) + result;
    c = Math.floor(c / 26);
  }
  return result;
}

/**
 * 转义 CSV 字段（含逗号或引号的值用双引号包裹）
 */
function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 生成 CSV 字符串（向后兼容）
 */
export function generateCSV(headers: string[], data: string[][]): string {
  const rows = [headers.join(",")];

  for (const row of data) {
    const cells = row.map(cell => {
      const value = String(cell || "");
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(cells.join(","));
  }

  return rows.join("\n");
}

/**
 * 执行数据分析
 */
export function performAnalysis(data: string[][], headers: string[]): AnalysisResult {
  const stats: Record<string, ColumnStats> = {};

  for (let col = 0; col < headers.length; col++) {
    const header = headers[col];
    const values = data.map(row => row[col]).filter(v => v !== "");

    const numericValues = values
      .map(Number)
      .filter(v => !isNaN(v));

    const isNumeric = numericValues.length > values.length * 0.8;

    stats[header] = {
      type: isNumeric ? "number" : "text",
      count: values.length,
      nullCount: data.length - values.length,
      min: isNumeric ? Math.min(...numericValues) : undefined,
      max: isNumeric ? Math.max(...numericValues) : undefined,
      avg: isNumeric && numericValues.length > 0
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        : undefined,
    };
  }

  const summary = `数据分析完成：${data.length} 行 × ${headers.length} 列`;

  return { summary, stats };
}

// ==================== 类型定义 ====================

export interface TableData {
  headers: string[];
  preview: string[][];
  allData: string[][];
  rows: number;
  cols: number;
}

export interface ColumnStats {
  type: "text" | "number";
  count: number;
  nullCount: number;
  min?: number;
  max?: number;
  avg?: number;
}

export interface AnalysisResult {
  summary: string;
  stats: Record<string, ColumnStats>;
}
