/**
 * MCP App 前端应用
 * 负责与 MCP Host 通信和表格渲染
 */

// ==================== 全局状态 ====================

let spreadsheetInstance = null;
let currentData = null;
let currentHeaders = null;

// ==================== 初始化 ====================

// 等待 DOM 加载完成
document.addEventListener("DOMContentLoaded", () => {
  // 检查 jspreadsheet 是否已加载
  if (typeof jspreadsheet === "undefined") {
    const container = document.getElementById("spreadsheet");
    if (container) {
      container.innerHTML = '<div class="error">jspreadsheet 加载失败，请刷新页面重试</div>';
    }
    return;
  }

  // 绑定事件
  bindEvents();
});

// ==================== 事件处理 ====================

/**
 * 绑定所有按钮事件
 */
function bindEvents() {
  // 升序排序
  document.getElementById("btn-sort-asc")?.addEventListener("click", async () => {
    if (!currentData || currentData.length === 0) {
      alert("没有数据可排序");
      return;
    }
    
    try {
      const sorted = [...currentData].sort((a, b) => {
        for (let i = 0; i < currentHeaders.length; i++) {
          if (a[i] < b[i]) return -1;
          if (a[i] > b[i]) return 1;
        }
        return 0;
      });
      
      updateTable(sorted);
      await notifyAI("已按升序排列");
    } catch (error) {
      alert("排序失败，请重试");
    }
  });
  
  // 降序排序
  document.getElementById("btn-sort-desc")?.addEventListener("click", async () => {
    if (!currentData || currentData.length === 0) {
      alert("没有数据可排序");
      return;
    }
    
    try {
      const sorted = [...currentData].sort((a, b) => {
        for (let i = 0; i < currentHeaders.length; i++) {
          if (a[i] > b[i]) return -1;
          if (a[i] < b[i]) return 1;
        }
        return 0;
      });
      
      updateTable(sorted);
      await notifyAI("已按降序排列");
    } catch (error) {
      alert("排序失败，请重试");
    }
  });
  
  // 导出 CSV
  document.getElementById("btn-export")?.addEventListener("click", async () => {
    if (!currentData || !currentHeaders) {
      alert("没有数据可导出");
      return;
    }
    
    try {
      const csv = generateCSV(currentHeaders, currentData);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "spreadsheet.csv";
      a.click();
      
      URL.revokeObjectURL(url);
      await notifyAI("已导出 CSV 文件");
    } catch (error) {
      alert("导出失败，请重试");
    }
  });
  
  // 数据分析
  document.getElementById("btn-analyze")?.addEventListener("click", async () => {
    if (!currentData || !currentHeaders) {
      alert("没有数据可分析");
      return;
    }
    
    try {
      // 调用 AI 进行分析
      const result = await app.callServerTool({
        name: "analyze_spreadsheet",
        arguments: {
          data: currentData,
          headers: currentHeaders,
        },
      });
      
      if (result?.content) {
        const summary = result.content.find(c => c.type === "text");
        if (summary) {
          alert(summary.text);
        }
      }
    } catch (error) {
      alert("分析失败，请重试");
    }
  });
}

// ==================== 表格操作 ====================

/**
 * 更新表格数据
 */
function updateTable(data) {
  if (spreadsheetInstance) {
    // 更新现有表格
    spreadsheetInstance.updateTable(data);
  } else {
    // 创建新表格
    spreadsheetInstance = jspreadsheet(document.getElementById("spreadsheet"), {
      data: data,
      columns: currentHeaders.map(header => ({
        title: header,
        type: "text",
      })),
      license: "YW91IGFyZSBub3QgYW4gYXR0cm9uZXIsIEkgYW0gYSBkYXRhIGFuYWx5c3Q=",
      tableOverflow: true,
      tableHeight: "500px",
      minDimensions: [currentHeaders.length, data.length],
    });
  }
}

/**
 * 通知 AI 用户操作
 */
async function notifyAI(message) {
  try {
    await app.updateModelContext({
      content: [{
        type: "text",
        text: message,
      }],
    });
  } catch (error) {
    // 通知 AI 失败，静默处理（非关键操作）
  }
}

/**
 * 生成 CSV 字符串
 */
function generateCSV(headers, data) {
  const rows = [headers.join(",")];
  
  for (const row of data) {
    const cells = row.map(cell => {
      const value = String(cell || "");
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(cells.join(","));
  }
  
  return rows.join("\n");
}

// ==================== 接收工具结果 ====================

/**
 * 监听工具返回的数据
 */
app.ontoolresult = (result) => {
  const structuredContent = result.structuredContent;

  if (structuredContent && structuredContent.headers && structuredContent.data) {
    currentHeaders = structuredContent.headers;
    currentData = structuredContent.data;

    // 更新 UI
    updateTable(currentData);
  }
};
