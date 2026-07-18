/**
 * Express 应用入口
 * 开发模式：启用 Skybridge DevTools
 * 生产模式：提供静态资源
 */

import cors from "cors";
import express from "express";
import http from "node:http";
import { viewsDevServer } from "skybridge/server";
import { mcp } from "./middleware.js";
import server from "./server.js";

const app = express();
app.use(express.json());

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv !== "production") {
  const { devtoolsStaticServer } = await import("@skybridge/devtools");
  app.use(await devtoolsStaticServer());
  const httpServer = http.createServer(app);
  app.use(await viewsDevServer(httpServer));
}

if (nodeEnv === "production") {
  // 生产模式下允许跨域访问静态资源
  app.use("/assets", cors());
  app.use("/assets", express.static("dist/assets"));
}

app.use(cors());

// 挂载 MCP 中间件
app.use(mcp(server));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
