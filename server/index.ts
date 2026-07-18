/**
 * MCP Server 入口 - 定义所有工具
 * 负责注册工具和提供 UI 资源
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import fs from "node:fs/promises";
import path from "node:path";
import { parseFile, generateCSV, performAnalysis } from "./utils/excel-parser";

const DIST_DIR = path.join(process.cwd(), "dist");

/**
 * 创建并配置 MCP Server 实例
 * 注册所有工具和资源
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "spreadsheet-mcp-app",
    version: "1.0.0",
  });

  // UI 资源 URI
  const resourceUri = "ui://spreadsheet/editor.html";

  // ==================== 工具 1: 导入表格 ====================
  registerAppTool(
    server,
    "import_spreadsheet",
    {
      title: "导入电子表格",
      description: "导入 Excel 或 CSV 文件，返回表格数据",
      inputSchema: {
        fileName: z.string().describe("文件名"),
        fileContent: z.string().describe("Base64 编码的文件内容"),
        fileType: z.enum(["xlsx", "csv"]).describe("文件类型"),
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ fileName, fileContent, fileType }) => {
      try {
        // 解码 Base64
        const buffer = Buffer.from(fileContent, "base64");

        // 使用真实的 Excel/CSV 解析器
        const tableData = await parseFile(buffer, fileType);

        return {
          content: [{
            type: "text",
            text: `已导入 ${fileName}，共 ${tableData.rows} 行 × ${tableData.cols} 列`,
          }],
          structuredContent: {
            fileName,
            rows: tableData.rows,
            cols: tableData.cols,
            headers: tableData.headers,
            data: tableData.preview,
          },
          _meta: {
            fullData: tableData.allData,
          },
        };
      } catch (error) {
        console.error("导入失败:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`导入失败: ${errorMessage}`);
      }
    }
  );

  // ==================== 工具 2: 导出表格 ====================
  registerAppTool(
    server,
    "export_spreadsheet",
    {
      title: "导出电子表格",
      description: "将表格数据导出为 CSV 文件",
      inputSchema: {
        fileName: z.string().describe("导出文件名"),
        data: z.array(z.array(z.string())).describe("表格数据"),
        headers: z.array(z.string()).describe("表头"),
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ fileName, data, headers }) => {
      try {
        // 使用统一的 CSV 生成函数
        const csvContent = generateCSV(headers, data);
        const encoded = btoa(csvContent);
        
        return {
          content: [{
            type: "text",
            text: `导出完成：${fileName}.csv`,
          }],
          structuredContent: {
            downloadUrl: `data:text/csv;base64,${encoded}`,
            fileName: `${fileName}.csv`,
          },
        };
      } catch (error) {
        console.error("导出失败:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`导出失败: ${errorMessage}`);
      }
    }
  );

  // ==================== 工具 3: 分析表格 ====================
  registerAppTool(
    server,
    "analyze_spreadsheet",
    {
      title: "分析电子表格",
      description: "对表格数据进行统计分析",
      inputSchema: {
        data: z.array(z.array(z.string())).describe("表格数据"),
        headers: z.array(z.string()).describe("表头"),
      },
      _meta: {
        ui: { resourceUri },
      },
    },
    async ({ data, headers }) => {
      try {
        // 使用统一的分析函数
        const result = performAnalysis(data, headers);

        return {
          content: [{
            type: "text",
            text: result.summary,
          }],
          structuredContent: result.stats,
        };
      } catch (error) {
        console.error("分析失败:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`分析失败: ${errorMessage}`);
      }
    }
  );

  // ==================== 注册 UI 资源 ====================
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      try {
        const html = await fs.readFile(path.join(DIST_DIR, "ui", "editor.html"), "utf-8");
        
        return {
          contents: [{
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          }],
        };
      } catch (error) {
        console.error("读取 UI 资源失败:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`读取 UI 资源失败: ${errorMessage}`);
      }
    }
  );

  return server;
}
