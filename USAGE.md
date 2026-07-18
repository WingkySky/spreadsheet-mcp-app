# 📊 交互式表格 MCP App - 使用指南

## 快速开始

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 2. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

## 使用方法

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

## 功能特性

### 核心功能
- 📥 **文件导入** - 支持 XLSX、CSV 格式
- ✏️ **单元格编辑** - 直接修改数据
- 🔍 **排序功能** - 按列升序/降序排列
- 📤 **数据导出** - 导出为 CSV 格式
- 📊 **数据分析** - 自动统计列类型和数据特征

### 用户体验
- 🖥️ **交互式界面** - 在对话中直接操作表格
- 🔄 **实时更新** - 用户操作即时反馈
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔒 **安全隔离** - iframe 沙箱保护

## 技术架构

### 前端
- **Jspreadsheet CE** - 轻量级表格组件
- **vanilla JavaScript** - 无框架依赖
- **MCP Apps SDK** - 官方通信协议

### 后端
- **Next.js** - React 框架
- **MCP SDK** - 协议实现
- **SheetJS** - Excel 文件处理

### 部署
- **Vercel** - 云平台
- **Serverless Functions** - 无服务器架构
- **Edge Runtime** - 边缘计算支持

## 开发计划

### Phase 4: 优化与完善
- [ ] 实现筛选功能
- [ ] 实现复制粘贴
- [ ] 错误处理和边界情况
- [ ] 性能优化（大数据量虚拟滚动）
- [ ] 单元测试
- [ ] 文档完善

### Phase 5: 发布
- [ ] 代码审查
- [ ] 清理调试代码
- [ ] 编写 CHANGELOG
- [ ] 创建 GitHub 仓库
- [ ] 发布到 npm（可选）
- [ ] 通知 MCP 社区

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

1. Fork 项目
2. 克隆仓库
3. 安装依赖
4. 创建分支
5. 提交更改
6. 发起 Pull Request

## 许可证

MIT License
