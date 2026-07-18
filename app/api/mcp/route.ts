/**
 * MCP Server API 路由
 * 处理所有 MCP 协议请求
 * 使用 WebStandardStreamableHTTPServerTransport 桥接 Next.js 和 MCP SDK
 * 支持 HTTP 传输，可部署到 Vercel
 */

import { NextRequest, NextResponse } from "next/server";
import {
  WebStandardStreamableHTTPServerTransport,
} from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp";
import { createServer } from "@/server/index";

/**
 * 会话状态存储
 * 在 Vercel Serverless 环境下，每次请求可能在不同容器中运行，
 * 因此使用 stateless 模式（sessionIdGenerator: undefined），
 * 让 MCP 客户端在每个请求中通过 URL 参数携带会话信息。
 */

/**
 * 处理 MCP 协议 POST 请求
 * 创建 transport 并桥接到 MCP Server
 */
export async function POST(request: NextRequest) {
  try {
    // 创建 MCP Server 实例
    const mcpServer = createServer();

    // 使用 stateless 模式创建 transport
    // 不设置 sessionIdGenerator，让每次请求独立处理
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // 连接 MCP Server 和 Transport
    await mcpServer.connect(transport);

    // 将 NextRequest 转换为 Web Standard Request
    const url = new URL(request.url);
    const webRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body as ReadableStream | null,
      duplex: "half", // 必须：发送 body 时需要设置 duplex
    });

    // 处理请求并获取 Response
    const response = await transport.handleRequest(webRequest);

    // 将 Web Standard Response 转换为 NextResponse
    const body = response.body as ReadableStream | null;
    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error("MCP 请求处理失败:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `MCP 请求处理失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 处理 MCP 协议 GET 请求
 * 主要用于 SSE 流式订阅
 */
export async function GET(request: NextRequest) {
  try {
    // 创建 MCP Server 实例
    const mcpServer = createServer();

    // 使用 stateless 模式创建 transport
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // 连接 MCP Server 和 Transport
    await mcpServer.connect(transport);

    // 将 NextRequest 转换为 Web Standard Request
    const url = new URL(request.url);
    const webRequest = new Request(url, {
      method: "GET",
      headers: request.headers,
    });

    // 处理请求并获取 Response
    const response = await transport.handleRequest(webRequest);

    // 将 Web Standard Response 转换为 NextResponse
    const body = response.body as ReadableStream | null;
    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error("MCP 请求处理失败:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `MCP 请求处理失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// 设置最大执行时间（Vercel Serverless 超时）
export const maxDuration = 60;
