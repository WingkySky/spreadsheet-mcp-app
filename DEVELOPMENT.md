# 📊 交互式表格 MCP App - 开发文档

> **项目名称**: Spreadsheet MCP App  
> **版本**: v1.0.0  
> **创建日期**: 2026-07-18  
> **状态**: 📝 规划中

---

## 一、项目背景

### 1.1 问题陈述

在使用 AI 进行数据处理时，现有方案存在明显缺陷：

| 场景 | 现有方案 | 痛点 |
|------|---------|------|
| 用户上传 Excel | MCP Server 返回文本摘要 | 用户看不见数据，全靠 AI 转述 |
| 用户想筛选数据 | 需要告诉 AI "筛选 A 列大于 100" | 操作繁琐，AI 经常理解错 |
| 用户想编辑单元格 | AI 修改文件后返回新文件 | 用户无法实时看到修改效果 |
| 大文件分析 | 文本输出几千行数据 | Token 爆炸，AI 上下文被撑爆 |

### 1.2 我们的解决方案

**在 AI 对话中嵌入一个可交互的电子表格界面**，让用户：
- ✅ 直接看到数据（而不是听 AI 描述）
- ✅ 直接点击编辑、筛选、排序
- ✅ AI 实时感知用户操作
- ✅ 大数据量不消耗 token

---

## 二、竞品分析

### 2.1 现有开源项目调研

#### A. PSU3D0/spreadsheet-mcp（Rust 实现）

**定位**: 面向 AI Agent 的表格分析工具

**功能**:
- 读取 XLSX/XLSM 文件
- 结构化读取（按区域读取）
- 公式检查
- Fork 机制（创建副本进行修改）
- Token 高效（分页返回）

**优点**:
- 高性能（Rust 编写）
- Token 优化做得好
- 支持公式重计算

**缺点**:
- ❌ **没有交互式 UI** — 纯文本输出
- ❌ **用户看不见数据** — 只能通过 AI 转述
- ❌ **无法实时编辑** — 需要 fork 机制
- ❌ **学习成本高** — 需要理解 fork/checkpoint/diff 概念
- ❌ **不适合非技术人员** — 面向开发者

**适用场景**: 开发者让 AI 批量处理 Excel 文件

---

#### B. antonpk1/spreadsheet-mcp-app（Skybridge 实现）

**定位**: 流式渲染的电子表格 MCP App

**功能**:
- 流式单元格渲染（逐行显示）
- 稀疏寻址（只发送填充的单元格）
- 自动列宽调整
- 自定义样式

**优点**:
- ✅ **有交互式 UI** — 在对话中渲染表格
- ✅ 流式渲染效果好
- ✅ 基于官方 MCP Apps 标准

**缺点**:
- ❌ **数据导入能力弱** — 没有文件上传功能
- ❌ **缺少筛选/排序** — 基础表格功能不完整
- ❌ **不支持公式计算** — 只能显示静态数据
- ❌ **导出功能缺失** — 无法导出为 CSV/Excel
- ❌ **依赖 Skybridge 框架** — 增加了复杂性
- ❌ **社区小** — 只有 2 个 star，维护不确定

**适用场景**: 展示 AI 生成的数据表格

---

#### C. Simtheory Spreadsheet Editor

**定位**: 云端电子表格编辑器

**功能**:
- 创建/编辑/导出表格
- 多 Sheet 管理
- 单元格操作

**优点**:
- ✅ 功能相对完整
- ✅ 支持导出

**缺点**:
- ❌ **云端托管** — 需要注册账号
- ❌ **闭源** — 无法自定义
- ❌ **付费服务** — 有使用限制
- ❌ **数据隐私** — 数据存储在第三方服务器

**适用场景**: 不想自己部署的用户

---

#### D. Excel MCP Server 系列（negokaz, kousunh 等）

**定位**: 读写 Excel 文件的工具

**功能**:
- 读取/写入 Excel 文件
- 创建/删除 Sheet
- 格式设置

**优点**:
- ✅ 文件操作能力强
- ✅ 生态成熟

**缺点**:
- ❌ **完全没有 UI** — 纯文本输出
- ❌ **用户看不见数据**
- ❌ **不是 MCP App** — 不符合新标准

---

### 2.2 竞品对比总结

| 特性 | PSU3D0 | antonpk1 | Simtheory | Excel MCP | **我们的方案** |
|------|--------|----------|-----------|-----------|---------------|
| 交互式 UI | ❌ | ✅ | ✅ | ❌ | ✅ |
| 文件导入 | ✅ | ❌ | ✅ | ✅ | ✅ |
| 单元格编辑 | ❌ | ❌ | ✅ | ❌ | ✅ |
| 排序/筛选 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 公式计算 | ✅ | ❌ | ✅ | ❌ | ✅ |
| 导出功能 | ❌ | ❌ | ✅ | ❌ | ✅ |
| 开源 | ✅ | ✅ | ❌ | ✅ | ✅ |
| 自部署 | ✅ | ✅ | ❌ | ✅ | ✅ |
| 社区活跃度 | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 新建 |

---

## 三、为什么还要做？

### 3.1 市场空白

现有项目可以分为两类：

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   有 UI 没功能  ◄──────────────────────────────────►  有功能没 UI │
│                                                         │
│   antonpk1          PSU3D0 / Excel MCP                   │
│   (流式渲染)        (强大的分析能力)                       │
│                                                         │
│   缺导入 ❌           缺 UI ❌                             │
│   缺编辑 ❌           缺 UI ❌                             │
│   缺导出 ❌                                          │
│                                                         │
│   中间是空白！                                          │
│   ━━━━━━━━━━━━━━━━━━━━━━━━                             │
│   我们需要填补这个空白：                                 │
│   ✅ 有 UI + 有功能                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 核心价值主张

**我们的项目 = antonpk1 的 UI + PSU3D0 的功能 + 完整的用户体验**

| 维度 | 我们的差异化 |
|------|-------------|
| **用户体验** | 完整的电子表格体验（导入→编辑→分析→导出） |
| **AI 集成** | 用户操作实时反馈给 AI，上下文不断裂 |
| **开源自主** | 完全开源，可自部署，无数据隐私风险 |
| **技术栈** | 标准化 MCP Apps，不依赖特定框架 |

### 3.3 目标用户

```
主要用户（80%）:
├── 非技术人员：需要 AI 帮忙处理表格，但不懂命令行
├── 分析师：需要在对话中探索数据
└── 办公人员：需要快速编辑和导出表格

次要用户（20%）:
├── 开发者：需要集成表格功能到自己的应用
└── 企业：需要私有化部署的方案
```

---

## 四、功能规格

### 4.1 MVP 功能清单

#### P0 - 核心功能（必须实现）

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 文件导入 | 支持 XLSX、CSV 上传和解析 | 🔴 最高 |
| 表格渲染 | 在对话中显示交互式表格 | 🔴 最高 |
| 单元格编辑 | 用户可以直接修改单元格内容 | 🔴 最高 |
| 数据导出 | 导出为 CSV 格式 | 🟡 高 |

#### P1 - 增强功能（第二期）

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 排序 | 按列升序/降序排列 | 🟡 高 |
| 筛选 | 列级别的条件筛选 | 🟡 高 |
| 统计摘要 | AI 自动分析数据特征 | 🟢 中 |
| 复制粘贴 | Excel 兼容的剪贴板操作 | 🟢 中 |

#### P2 - 高级功能（第三期）

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 公式计算 | 支持基础 Excel 函数 | 🔵 低 |
| 多 Sheet | 添加/删除/重命名 Sheet | 🔵 低 |
| 撤销/重做 | 操作历史记录 | 🔵 低 |
| 条件格式 | 基于条件的单元格高亮 | 🔵 低 |

---

## 五、技术架构

### 5.1 整体架构图

```
┌──────────────────────────────────────────────────────────────┐
│                      AI 客户端（Host）                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Claude / ChatGPT / VS Code / Goose                     │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  iframe 沙盒（MCP App UI）                        │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  Jspreadsheet 表格组件                       │  │  │  │
│  │  │  │  - 单元格编辑                                │  │  │  │
│  │  │  │  - 排序/筛选                                │  │  │  │
│  │  │  │  - 复制粘贴                                 │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                                 │
│                     postMessage (JSON-RPC)                     │
└──────────────────────────────┼────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Vercel Serverless  │
                    │   Function (HTTPS)   │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │ MCP Server     │  │
                    │  │ - 工具定义      │  │
                    │  │ - 文件解析      │  │
                    │  │ - 数据分析      │  │
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │ SheetJS        │  │
                    │  │ - XLSX 解析    │  │
                    │  │ - CSV 导出     │  │
                    │  └────────────────┘  │
                    └──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   临时文件存储        │
                    │   (Vercel Blob /    │
                    │    Local Temp)       │
                    └──────────────────────┘
```

### 5.2 数据流

```
用户操作流程：

1. 上传文件
   用户 → AI: "帮我分析这个表格"
   AI → MCP Server: import_spreadsheet(fileName, fileContent)
   MCP Server → 返回: 结构化数据 + UI 引用
   Host → 渲染: iframe 中的表格

2. 用户编辑
   用户在 iframe 中修改单元格
   UI → MCP Server: update_cell(row, col, value)
   MCP Server → 更新: 内存中的数据
   MCP Server → AI: 通知变更

3. AI 感知
   AI → 收到用户操作通知
   AI → 用户: "我看到你修改了第 5 行，需要我重新计算吗？"

4. 导出数据
   用户 → 点击"导出"按钮
   UI → MCP Server: export_spreadsheet(format)
   MCP Server → 返回: 下载链接
```

### 5.3 技术选型

#### 前端（UI 组件）

| 库 | 版本 | 用途 | 理由 |
|----|------|------|------|
| Jspreadsheet CE | v9.x | 表格渲染 | MIT 开源、轻量、Excel 兼容 |
| MCP Apps SDK | latest | 与 Host 通信 | 官方标准 |

#### 后端（MCP Server）

| 库 | 版本 | 用途 | 理由 |
|----|------|------|------|
| @modelcontextprotocol/sdk | latest | MCP 协议实现 | 官方 SDK |
| SheetJS (xlsx) | v0.20+ | Excel 解析/生成 | 行业标准、功能完整 |

#### 部署

| 服务 | 用途 | 理由 |
|------|------|------|
| Vercel | 主机部署 | 零配置、自动 HTTPS、预览功能 |
| Next.js | 可选前端 | 方便集成认证和文档 |
| Vercel Blob | 文件存储 | 替代临时文件 |

---

## 六、项目结构

```
spreadsheet-mcp-app/
│
├── app/                          # Next.js 应用（可选）
│   ├── page.tsx                  # 首页/文档
│   ├── layout.tsx                # 布局
│   └── api/
│       └── mcp/
│           └── route.ts          # MCP Server 入口（核心）
│
├── server/                       # MCP Server 核心逻辑
│   ├── index.ts                  # 服务器启动和配置
│   ├── tools.ts                  # 工具定义
│   ├── handlers/
│   │   ├── import-handler.ts     # 文件导入处理
│   │   ├── export-handler.ts     # 文件导出处理
│   │   ├── analyze-handler.ts    # 数据分析处理
│   │   └── update-handler.ts     # 单元格更新处理
│   └── utils/
│       ├── excel-parser.ts       # Excel 解析工具
│       ├── file-storage.ts       # 文件存储抽象
│       └── token-optimizer.ts    # Token 优化
│
├── ui/                           # MCP App 前端（UI 组件）
│   ├── editor.html               # 主页面模板
│   └── src/
│       ├── app.ts                # MCP Apps SDK 连接
│       ├── spreadsheet.ts        # Jspreadsheet 初始化
│       ├── handlers.ts           # 用户事件处理
│       └── exports.ts            # 导出功能
│
├── public/                       # 静态资源
│   └── assets/
│
├── tests/                        # 测试
│   ├── server.test.ts
│   └── ui.test.ts
│
├── docs/                         # 文档
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── package.json
├── tsconfig.json
├── next.config.js
├── vite.config.ts               # UI 打包配置
└── README.md
```

---

## 七、API 设计

### 7.1 MCP 工具定义

```typescript
// 工具 1：导入表格
{
  "name": "import_spreadsheet",
  "title": "导入电子表格",
  "description": "导入 Excel 或 CSV 文件",
  "inputSchema": {
    "type": "object",
    "properties": {
      "fileName": { "type": "string" },
      "fileContent": { "type": "string", "description": "Base64 编码" },
      "fileType": { "type": "string", "enum": ["xlsx", "csv"] }
    },
    "required": ["fileName", "fileContent", "fileType"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "rows": { "type": "number" },
      "cols": { "type": "number" },
      "headers": { "type": "array", "items": { "type": "string" } },
      "preview": { "type": "array" },
      "fileId": { "type": "string" }
    }
  },
  "_meta": {
    "ui": {
      "resourceUri": "ui://spreadsheet/editor"
    }
  }
}

// 工具 2：分析表格
{
  "name": "analyze_spreadsheet",
  "title": "分析电子表格",
  "inputSchema": {
    "type": "object",
    "properties": {
      "fileId": { "type": "string" },
      "operation": { 
        "type": "string", 
        "enum": ["summary", "statistics", "correlation"] 
      }
    },
    "required": ["fileId", "operation"]
  }
}

// 工具 3：导出表格
{
  "name": "export_spreadsheet",
  "title": "导出电子表格",
  "inputSchema": {
    "type": "object",
    "properties": {
      "fileId": { "type": "string" },
      "format": { "type": "string", "enum": ["csv", "xlsx"] }
    },
    "required": ["fileId", "format"]
  }
}

// 工具 4：更新单元格
{
  "name": "update_cell",
  "title": "更新单元格",
  "inputSchema": {
    "type": "object",
    "properties": {
      "fileId": { "type": "string" },
      "row": { "type": "number" },
      "col": { "type": "number" },
      "value": { "type": "string" }
    },
    "required": ["fileId", "row", "col", "value"]
  }
}
```

### 7.2 数据结构

```typescript
// 表格数据接口
interface SpreadsheetData {
  fileId: string;
  fileName: string;
  sheets: Sheet[];
  createdAt: string;
  updatedAt: string;
}

interface Sheet {
  name: string;
  rows: number;
  cols: number;
  headers: string[];
  data: Cell[][];
  formulas?: Formula[];
}

interface Cell {
  row: number;
  col: number;
  value: string | number;
  type: 'text' | 'number' | 'date' | 'formula';
  style?: CellStyle;
}

// AI 看到的精简数据（content）
interface ModelContent {
  summary: string;           // 文本摘要
  rowCount: number;          // 行数
  colCount: number;          // 列数
  columnTypes: Record<string, string>;  // 列类型
}

// UI 看到的完整数据（structuredContent）
interface UiContent {
  headers: string[];
  data: any[][];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// 仅 UI 使用的元数据（_meta）
interface UiMeta {
  nextCursor?: string;
  viewId?: string;
  tempUploadUrl?: string;
}
```

---

## 八、开发计划

### Phase 1: 基础框架（Day 1-2）✅ 已完成

**目标**: 搭建项目骨架，跑通 Hello World

```
✅ 初始化 Next.js 项目
✅ 配置 MCP Server 基础结构
✅ 实现 Hello World 工具
✅ 搭建 UI 框架（空白的 iframe）
✅ 本地测试：AI 调用工具 → UI 显示
✅ Vercel 部署：确保 HTTPS 可达
```

**验收标准**:
- [x] 在 Claude Desktop 中能调用工具
- [x] UI 能在 iframe 中渲染
- [x] Vercel 部署成功

---

### Phase 2: 核心功能（Day 3-5）✅ 已完成

**目标**: 实现文件导入和表格渲染

```
✅ 集成 SheetJS 解析 XLSX/CSV
✅ 实现文件上传工具
✅ 集成 Jspreadsheet CE
✅ 实现数据到表格的映射
✅ 实现单元格编辑
✅ 实现排序功能
```

**验收标准**:
- [x] 能上传 XLSX 文件并正确解析
- [x] 表格在对话中正确显示
- [x] 能编辑单元格并保存
- [x] 能按列排序

---

### Phase 3: AI 集成（Day 6-7）✅ 已完成

**目标**: 实现结构化数据返回和 AI 感知

```
✅ 实现 content / structuredContent / _meta 分离
✅ 实现 Token 优化（分页、预览）
✅ 实现用户操作通知 AI
✅ 实现数据分析工具
✅ 实现导出功能
```

**验收标准**:
- [x] AI 看到的是精简摘要（<500 token）
- [x] UI 能看到完整数据
- [x] 用户操作能通知到 AI
- [x] 能导出为 CSV

---

### Phase 4: 优化与完善（Day 8-10）

**目标**: 提升体验和稳定性

```
□ 实现筛选功能
□ 实现复制粘贴
□ 错误处理和边界情况
□ 性能优化（大数据量虚拟滚动）
□ 单元测试
□ 文档完善
```

**验收标准**:
- [ ] 1000+ 行数据流畅渲染
- [ ] 所有 P0 功能完成
- [ ] 通过基本测试
- [ ] README 完善

---

### Phase 5: 发布（Day 11）

**目标**: 开源发布

```
□ 代码审查
□ 清理调试代码
□ 编写 CHANGELOG
□ 创建 GitHub 仓库
□ 发布到 npm（可选）
□ 通知 MCP 社区
```

---

## 九、关键技术决策记录

### Decision 1: 为什么选 Jspreadsheet CE 而不是 Handsontable？

**决策**: 选择 Jspreadsheet CE

**理由**:
1. **许可**: MIT 开源，无商业顾虑；Handsontable CE 是 GPL
2. **大小**: ~50KB vs ~200KB，iframe 加载更快
3. **简单**: API 更简洁，集成成本低
4. **够用**: MVP 功能完全覆盖

**替代方案评估**:
- AG Grid: 太重，学习曲线陡，企业版收费
- Handsontable: GPL 许可有风险，体积大
- x-spreadsheet: 功能太少，不支持筛选

---

### Decision 2: 为什么不用 Skybridge 框架？

**决策**: 直接使用官方 MCP Apps SDK

**理由**:
1. **官方标准**: 更稳定，社区更大
2. **简单**: 少一层抽象，调试更容易
3. **灵活**: 不绑定特定前端框架

**Skybridge 的优缺点**:
- ✅ 优点: 跨平台兼容性好
- ❌ 缺点: 社区小（antonpk1 项目仅 2 stars），文档少，增加复杂性

---

### Decision 3: Vercel 部署的函数超时问题

**决策**: 使用 Fluid Compute + 合理拆分

**理由**:
1. **Vercel 限制**: Hobby 300s，Pro 900s
2. **应对策略**:
   - 文件上传限制 10MB
   - 大文件分块处理
   - 长时间操作使用异步 + 轮询

**代码示例**:
```typescript
// app/api/mcp/route.ts
export const maxDuration = 60; // 60 秒（Fluid Compute）
// 如果需要更长，升级到 Pro 计划（900 秒）
```

---

## 十、风险评估

### 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Vercel 函数超时 | 中 | 高 | 分块处理、异步任务 |
| 大文件内存溢出 | 中 | 中 | 限制文件大小、流式解析 |
| iframe 兼容性问题 | 低 | 中 | 多客户端测试 |
| Jspreadsheet 性能 | 低 | 低 | 虚拟滚动、分页加载 |

### 业务风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 市场需求不足 | 中 | 高 | MVP 快速验证 |
| 竞品跟进 | 低 | 中 | 快速迭代，建立社区 |
| 技术栈变化 | 低 | 低 | 抽象层设计 |

---

## 十一、成功指标

### 技术指标

```
- 首屏加载时间: < 2 秒
- 表格渲染: < 500 行流畅，> 1000 行可接受
- 文件上传: < 10 MB
- 工具响应: < 3 秒
- Token 效率: 1000 行数据 < 500 token
```

### 业务指标

```
- GitHub Stars: > 100（发布 1 个月）
- 活跃用户: > 50（发布 1 个月）
-  issue 响应时间: < 24 小时
```

---

## 十二、后续路线图

### v1.1（1 个月后）
- [ ] 公式计算基础支持
- [ ] 多 Sheet 管理
- [ ] 撤销/重做

### v1.2（2 个月后）
- [ ] 数据可视化（内置图表）
- [ ] 条件格式
- [ ] 协作编辑（WebSocket）

### v2.0（3 个月后）
- [ ] 插件系统
- [ ] 模板市场
- [ ] 移动端适配

---

## 附录

### A. 参考资料

- [MCP Apps 官方文档](https://modelcontextprotocol.io/extensions/apps)
- [ext-apps GitHub](https://github.com/modelcontextprotocol/ext-apps)
- [Jspreadsheet CE 文档](https://jspreadsheet.com/docs)
- [SheetJS 文档](https://docs.sheetjs.com/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

### B. 术语表

| 术语 | 全称 | 说明 |
|------|------|------|
| MCP | Model Context Protocol | AI 工具连接协议 |
| MCP App | MCP Application | MCP 的 UI 扩展 |
| Host | 宿主 | AI 客户端（Claude、ChatGPT 等） |
| structuredContent | 结构化内容 | 给 UI 渲染的数据 |
| _meta | 元数据 | 仅 UI 使用的辅助数据 |
| iframe | Inline Frame | 嵌入的隔离网页容器 |

---

**文档维护**: 随开发进度持续更新  
**最后更新**: 2026-07-18
