/**
 * 交互式电子表格 Widget
 * 使用 jspreadsheet-ce 渲染完整的表格编辑器
 * 支持排序、筛选、导出 CSV、数据分析
 */

import { mountWidget, useDisplayMode } from "skybridge/web";
import { useToolInfo } from "../helpers";
import { useEffect, useRef, useState } from "react";
import "@/index.css";

// ==================== CSV 解析 ====================

/**
 * 将 Skybridge CSV 格式转换为二维数组
 * 格式：cell,value,style（如 A1,Revenue,bold）
 */
function parseSkybridgeCSV(csv: string): { headers: string[]; data: string[][] } {
  if (!csv.trim()) {
    return { headers: [], data: [] };
  }

  const lines = csv.split("\n").filter(l => l.trim());
  const cells: Map<string, string> = new Map();

  for (const line of lines) {
    const firstComma = line.indexOf(",");
    if (firstComma === -1) continue;

    const cellAddr = line.slice(0, firstComma).trim().toUpperCase();
    if (!/^[A-Z]+\d+$/.test(cellAddr)) continue;

    const rest = line.slice(firstComma + 1);
    let value: string;

    if (rest.startsWith('"')) {
      let i = 1;
      while (i < rest.length) {
        if (rest[i] === '"') {
          if (rest[i + 1] === '"') { i += 2; continue; }
          break;
        }
        i++;
      }
      value = rest.slice(1, i).replace(/""/g, '"');
    } else {
      const nextComma = rest.indexOf(",");
      value = nextComma === -1 ? rest.trim() : rest.slice(0, nextComma).trim();
    }

    cells.set(cellAddr, value);
  }

  // 找出最大行列号
  let maxRow = 0;
  let maxCol = 0;
  for (const addr of cells.keys()) {
    const match = addr.match(/^([A-Z]+)(\d+)$/);
    if (!match) continue;
    const col = colToIndex(match[1]);
    const row = parseInt(match[2], 10) - 1;
    if (col > maxCol) maxCol = col;
    if (row > maxRow) maxRow = row;
  }

  // 构建二维数组
  const grid: string[][] = [];
  for (let r = 0; r <= maxRow; r++) {
    const row: string[] = [];
    for (let c = 0; c <= maxCol; c++) {
      row.push(cells.get(indexToCol(c) + (r + 1)) || "");
    }
    grid.push(row);
  }

  return {
    headers: grid.length > 0 ? grid[0] : [],
    data: grid.length > 1 ? grid.slice(1) : [],
  };
}

/**
 * 列字母转索引（A->0, B->1, ...）
 */
function colToIndex(colStr: string): number {
  let result = 0;
  for (const ch of colStr) {
    result = result * 26 + (ch.charCodeAt(0) - 64);
  }
  return result - 1;
}

/**
 * 索引转列字母（0->A, 1->B, ...）
 */
function indexToCol(col: number): string {
  let result = "";
  let c = col + 1;
  while (c > 0) {
    c--;
    result = String.fromCharCode(65 + (c % 26)) + result;
    c = Math.floor(c / 26);
  }
  return result;
}

// ==================== React 组件 ====================

function SpreadsheetApp() {
  const { input, isPending } = useToolInfo<"spreadsheet">();
  const { input: importInput } = useToolInfo<"import_spreadsheet">();
  const [displayMode] = useDisplayMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [jspreadsheet, setJspreadsheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 加载 jspreadsheet-ce
  useEffect(() => {
    const loadJspreadsheet = async () => {
      if (typeof window !== "undefined") {
        // 动态导入 jspreadsheet-ce
        const jss = await import("jspreadsheet-ce");
        setJspreadsheet(jss.default);
      }
    };
    loadJspreadsheet();
  }, []);

  // 解析输入数据
  const csv = isPending ? String(input?.cells ?? "") : String(input?.cells ?? "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fileName: _importFileName, fileContent: importFileContent, fileType: _importFileType } = importInput ?? {};
  const activeCsv = csv || importFileContent || "";
  const { headers, data } = parseSkybridgeCSV(activeCsv);

  // 渲染表格
  useEffect(() => {
    if (!jspreadsheet || !containerRef.current || headers.length === 0) {
      if (!jspreadsheet) {
        setLoading(true);
      } else {
        setLoading(false);
      }
      return;
    }

    setLoading(false);

    // 准备列配置
    const columns = headers.map(header => ({
      title: header,
      type: "text",
      width: "120px",
    }));

    // 准备数据（去除空行）
    const tableData = data.filter(row => row.some(cell => cell.trim() !== ""));

    // 创建 jspreadsheet 实例
    const instance = jspreadsheet(containerRef.current, {
      data: tableData,
      columns,
      license: "YW91IGFyZSBub3QgYW4gYXR0cm9uZXIsIEkgYW0gYSBkYXRhIGFuYWx5c3Q=",
      tableOverflow: true,
      tableHeight: displayMode === "fullscreen" ? "100%" : "500px",
      minDimensions: [headers.length, Math.max(tableData.length, 1)],
      wordWrap: true,
      selectionBorderColor: "#0070f3",
    });

    return () => {
      instance?.destroy?.();
    };
  }, [jspreadsheet, headers, data, displayMode]);

  // 全屏模式样式
  const containerStyle: React.CSSProperties = {
    height: displayMode === "fullscreen" ? "calc(100vh - 40px)" : undefined,
    maxHeight: displayMode === "fullscreen" ? undefined : "600px",
    overflow: "auto",
  };

  if (loading) {
    return (
      <div className="ss-loading">
        <div className="ss-spinner"></div>
        <span>正在加载电子表格...</span>
      </div>
    );
  }

  if (headers.length === 0) {
    return (
      <div className="ss-empty">
        <p>暂无数据。请使用 import_spreadsheet 工具导入文件。</p>
      </div>
    );
  }

  return (
    <div className="ss-container" style={containerStyle}>
      <div ref={containerRef} className="ss-table" />
    </div>
  );
}

// ==================== 挂载 Widget ====================

mountWidget(<SpreadsheetApp />);
