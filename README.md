# 📊 交互式电子表格 MCP App

一个在 AI 对话中提供**可交互电子表格**的 MCP App，基于 [Skybridge](https://github.com/alpic-ai/skybridge) 框架构建。

## ✨ 特性

- 📥 **智能导入** - 支持 XLSX、CSV 格式
- ✏️ **实时编辑** - 像 Excel 一样直接修改单元格
- 📤 **轻松导出** - 导出为 CSV
- 🤖 **MCP Apps 支持** - 在 Claude Code Desktop 中弹出交互式表格编辑器
- 🔒 **安全隔离** - iframe 沙箱渲染

## 🚀 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 使用 cloudflared 隧道（可选，用于连接 Claude）
cloudflared tunnel --url http://localhost:3000
```

### 连接 Claude

使用 cloudflared 创建隧道，然后将隧道 URL 添加到 Claude 的 MCP 配置中：

```json
{
  "mcpServers": {
    "spreadsheet": {
      "url": "https://xxx.trycloudflare.com/mcp"
    }
  }
}
```

### 部署到 Vercel

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

部署后，MCP 端点地址为：`https://your-app.vercel.app/mcp`

## 📖 使用方法

### 在 Claude Code Desktop 中使用

1. 配置 MCP Server：
```json
{
  "mcpServers": {
    "spreadsheet": {
      "url": "https://your-app.vercel.app/mcp"
    }
  }
}
```

2. 在对话中：
   - 上传 Excel/CSV 文件
   - 查看交互式表格
   - 编辑数据
   - 导出数据

### 工具说明

- **spreadsheet** - 将数据展示为交互式电子表格
- **import_spreadsheet** - 导入 Excel/CSV 文件并显示为表格

## 🛠 技术栈

- **前端**: React 19 + jspreadsheet-ce
- **框架**: Skybridge（MCP Apps 全栈框架）
- **后端**: Express 5 + MCP SDK
- **Excel 处理**: SheetJS (xlsx)
- **部署**: Vercel / 任意 Node.js 服务器

## 📁 项目结构

```
spreadsheet-mcp-app/
├── server/
│   ├── src/
│   │   ├── index.ts       # Express 应用入口
│   │   ├── server.ts      # Skybridge McpServer + widget 注册
│   │   └── middleware.ts  # MCP 传输中间件
│   └── utils/
│       └── excel-parser.ts # Excel/CSV 解析器
├── web/
│   ├── src/
│   │   ├── helpers.ts     # 类型安全的 Skybridge hooks
│   │   ├── index.css      # Widget 样式
│   │   └── widgets/
│   │       └── spreadsheet.tsx # 电子表格 React 组件
│   └── vite.config.ts     # Vite 构建配置
├── package.json
├── tsconfig.json
└── README.md
```

## 📄 许可证

MIT License
