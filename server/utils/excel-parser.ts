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
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  
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
 * 生成 CSV 字符串
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
