# 📊 交互式表格 MCP App

一个在 AI 对话中提供**可交互电子表格**的 MCP App。让用户直接在对话中查看、编辑、分析和导出表格数据。

## ✨ 特性

- 📥 **智能导入** - 支持 XLSX、CSV 格式
- ✏️ **实时编辑** - 像 Excel 一样直接修改单元格
- 🔍 **排序筛选** - 一键排序，灵活筛选
- 📤 **轻松导出** - 导出为 CSV 或 Excel
- 🤖 **AI 感知** - 用户操作实时反馈给 AI
- 🔒 **安全隔离** - iframe 沙箱，数据不泄露

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd spreadsheet-mcp-app

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 测试
# 访问 http://localhost:3000 查看首页
# 访问 http://localhost:3000/test 查看测试页面
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

## 📖 使用方法

### 在 Trae CN 中使用

1. 配置 MCP Server：
```json
{
  "mcpServers": {
    "spreadsheet": {
      "command": "npx",
      "args": [
        "-y",
        "https://spreadsheet-mcp-app.vercel.app/api/mcp"
      ],
      "env": {},
      "description": "交互式电子表格 MCP App"
    }
  }
}
```

2. 在对话中使用：
   - 上传 Excel/CSV 文件
   - 查看交互式表格
   - 编辑数据
   - 导出数据

### 在 Claude Desktop 中使用

1. 配置 MCP Server：
```json
{
  "mcpServers": {
    "spreadsheet": {
      "command": "npx",
      "args": [
        "-y",
        "https://spreadsheet-mcp-app.vercel.app/api/mcp"
      ]
    }
  }
}
```

2. 在对话中使用：
   - 上传 Excel/CSV 文件
   - 查看交互式表格
   - 编辑数据
   - 导出数据

## 📚 文档

- [使用指南](./USAGE.md) - 详细的使用方法
- [部署指南](./DEPLOYMENT.md) - 部署到生产环境
- [演示指南](./DEMO.md) - 本地和在线演示
- [开发文档](./DEVELOPMENT.md) - 技术架构和开发计划

## 🛠 技术栈

- **前端**: Jspreadsheet CE + vanilla JS
- **后端**: Next.js + MCP SDK
- **Excel 处理**: SheetJS
- **部署**: Vercel

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🆘 支持

如有问题，请：
1. 查看相关文档
2. 提交 Issue
3. 联系开发者
