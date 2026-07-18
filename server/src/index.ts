/**
 * Express 应用入口
 * 开发模式：启用 Skybridge DevTools
 * 生产模式：提供静态资源
 */

import cors from "cors";
import express from "express";
import { widgetsDevServer } from "skybridge/server";
import { mcp } from "./middleware.js";
import { createServer } from "./server.js";

const app = express();
app.use(express.json());

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv !== "production") {
  const { devtoolsStaticServer } = await import("@skybridge/devtools");
  app.use(await devtoolsStaticServer());
  app.use(await widgetsDevServer());
}

if (nodeEnv === "production") {
  // 生产模式下允许跨域访问静态资源
  app.use("/assets", cors());
  app.use("/assets", express.static("dist/assets"));
}

app.use(cors());

// 创建 MCP Server 实例并挂载中间件
const server = createServer();
app.use(mcp(server));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
