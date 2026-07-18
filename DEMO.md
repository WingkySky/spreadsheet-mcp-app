# 🎬 演示指南

## 本地演示

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 访问应用

- 首页: http://localhost:3000
- 测试页: http://localhost:3000/test

### 3. 测试 MCP API

```bash
# 测试 MCP 端点
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

## Vercel 演示

### 1. 部署到 Vercel

```bash
vercel --prod
```

### 2. 访问应用

- 首页: https://spreadsheet-mcp-app.vercel.app
- 测试页: https://spreadsheet-mcp-app.vercel.app/test
- API: https://spreadsheet-mcp-app.vercel.app/api/mcp

## 功能演示

### 文件导入

1. 上传 Excel 或 CSV 文件
2. 查看表格数据
3. 编辑单元格内容

### 数据排序

1. 点击"升序"或"降序"按钮
2. 观察数据重新排列

### 数据导出

1. 点击"导出 CSV"按钮
2. 下载处理后的文件

### 数据分析

1. 点击"分析"按钮
2. 查看数据统计信息

## 注意事项

### 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 文件大小限制

- 单文件最大 10MB
- 建议不超过 1000 行数据

### 性能优化

- 使用虚拟滚动处理大数据
- 启用浏览器缓存
- 压缩静态资源
