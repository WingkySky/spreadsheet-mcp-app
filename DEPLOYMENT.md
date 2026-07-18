# 🚀 部署指南

## 本地部署

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 启动生产服务器

```bash
npm start
```

## Vercel 部署

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署到 Vercel

```bash
vercel --prod
```

### 4. 配置环境变量（可选）

在 Vercel 控制台中配置以下环境变量：
- `NODE_ENV`: production

## 配置 MCP 客户端

### Claude Desktop

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "spreadsheet": {
      "command": "npx",
      "args": [
        "-y",
        "https://your-vercel-url.vercel.app/api/mcp"
      ]
    }
  }
}
```

### VS Code

在 VS Code 的 MCP 客户端配置中添加：

```json
{
  "servers": {
    "spreadsheet": {
      "command": "npx",
      "args": ["-y", "https://your-vercel-url.vercel.app/api/mcp"]
    }
  }
}
```

## 故障排除

### 构建失败

如果遇到构建错误，请检查：
1. Node.js 版本 >= 18
2. 依赖是否正确安装
3. TypeScript 编译错误

### 运行时错误

1. 检查服务器日志
2. 验证 API 路由是否正确配置
3. 确认 CORS 设置正确

### 部署问题

1. 确保 Vercel 账户已激活
2. 检查域名配置
3. 验证环境变量设置

## 性能优化

### 1. 启用压缩

Vercel 自动启用 gzip 压缩。

### 2. 缓存策略

配置适当的缓存头以提高性能。

### 3. 监控

使用 Vercel Analytics 监控应用性能。
