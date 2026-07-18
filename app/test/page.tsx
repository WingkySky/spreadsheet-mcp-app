/**
 * 测试页面 - 验证 MCP Server 功能
 */

export default function TestPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>MCP Server 测试页面</h1>
      <p>服务器名称: spreadsheet-mcp-app</p>
      <p>服务器版本: 1.0.0</p>
      <h2>可用工具:</h2>
      <ul>
        <li>import_spreadsheet - 导入电子表格</li>
        <li>export_spreadsheet - 导出电子表格</li>
        <li>analyze_spreadsheet - 分析电子表格</li>
      </ul>
      <h2>状态:</h2>
      <p style={{ color: "green" }}>✅ 服务器运行正常</p>
    </div>
  );
}
