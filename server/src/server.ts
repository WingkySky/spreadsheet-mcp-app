/**
 * Skybridge MCP Server
 * 使用 Skybridge 框架注册 spreadsheet widget
 * 支持在 Claude Code Desktop 中弹出交互式表格编辑器
 */

import { McpServer } from "skybridge/server";
import { z } from "zod";
import { parseFile, tableToSkybridgeCSV } from "../utils/excel-parser";

// 创建并配置 Skybridge MCP Server
// 使用链式调用注册 widget，类型信息保留在实例上
const server = new McpServer(
  { name: "spreadsheet-mcp-app", version: "2.0.0" },
  { capabilities: {} },
)
  // 注册 spreadsheet widget（交互式表格展示）
  .registerTool({
    name: "spreadsheet",
    title: "交互式电子表格",
    description: `将表格数据显示为交互式电子表格。使用此工具展示表格、对比数据、预算、报告或任何适合网格布局的结构化数据。

数据格式：CSV，每行一个单元格，格式为 cell,value,style
- cell: Excel 风格地址（A1, B2, C10）
- value: 文本或数字
- style: 可选的内联 CSS（如 font-weight: bold）

示例输入：
A1,Revenue,font-weight: bold
B1,Q1,font-weight: bold
A2,Sales,
B2,$120000,

样式规则：
- 使用 font-weight: bold 标注表头
- 不要使用背景色或彩色文字
- 保持简洁专业`,
    inputSchema: {
      cells: z.string().describe("CSV 格式数据：cell,value,style（每行一个单元格）"),
    },
    view: {
      component: "spreadsheet",
    },
  }, async ({ cells: _cells }) => {
    // widget 执行成功，数据通过 tool-input notification 传递到前端
    return {
      structuredContent: { ok: true },
      content: [{ type: "text" as const, text: "电子表格已显示。" }],
      isError: false,
    };
  })

  // 注册导入工具
  .registerTool({
    name: "import_spreadsheet",
    title: "导入电子表格",
    description: "导入 Excel 或 CSV 文件并显示为交互式表格。接收 Base64 编码的文件内容和文件类型（xlsx 或 csv）。解析后将数据转换为 Skybridge 表格格式并显示。",
    inputSchema: {
      fileName: z.string().describe("文件名"),
      fileContent: z.string().describe("Base64 编码的文件内容"),
      fileType: z.enum(["xlsx", "csv"]).describe("文件类型"),
    },
    view: {
      component: "spreadsheet",
    },
  }, async ({ fileName, fileContent, fileType }) => {
    try {
      const buffer = Buffer.from(fileContent, "base64");
      const tableData = await parseFile(buffer, fileType);

      // 将表格数据转换为 Skybridge CSV 格式
      const cells = tableToSkybridgeCSV(tableData.headers, tableData.allData);

      return {
        content: [{
          type: "text" as const,
          text: `已导入 ${fileName}，共 ${tableData.rows} 行 × ${tableData.cols} 列`,
        }],
        structuredContent: { cells },
        isError: false,
      };
    } catch (error) {
      console.error("导入失败:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`导入失败: ${errorMessage}`);
    }
  });

export default server;
export type AppType = typeof server;
