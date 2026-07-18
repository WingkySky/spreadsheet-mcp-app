/**
 * MCP 传输中间件
 * 使用 StreamableHTTPServerTransport 处理 MCP 协议请求
 */

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { NextFunction, Request, Response } from "express";
import type { McpServer } from "skybridge/server";

/**
 * MCP 中间件工厂函数
 * 创建 Express 中间件处理 /mcp 端点的请求
 */
export const mcp =
  (server: McpServer) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== "/mcp") {
      return next();
    }

    if (req.method === "POST") {
      try {
        // 使用 stateless 模式，适配 Vercel Serverless
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });

        // 请求关闭时清理 transport
        res.on("close", () => {
          transport.close();
        });

        try {
          await server.connect(transport);
        } catch {
          // 如果已连接，重新连接
          await server.close();
          await server.connect(transport);
        }

        // 处理请求
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("MCP 请求处理失败:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "内部服务器错误",
            },
            id: null,
          });
        }
      }
    } else if (req.method === "GET" || req.method === "DELETE") {
      res.writeHead(405).end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "方法不允许",
          },
          id: null,
        }),
      );
    } else {
      next();
    }
  };
