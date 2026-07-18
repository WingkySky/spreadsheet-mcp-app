/**
 * Next.js 入口页面
 * 提供应用的基础布局
 */

export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📊 电子表格 MCP App</h1>
      <p>这是一个在 AI 对话中提供交互式表格的 MCP App。</p>
      <h2>使用方法：</h2>
      <ol>
        <li>在 Claude Desktop 或其他 MCP 客户端中配置此服务器</li>
        <li>上传 Excel 或 CSV 文件</li>
        <li>在对话中直接编辑和分析数据</li>
      </ol>
    </div>
  );
}
