/**
 * Excel 解析器单元测试
 * 测试 parseFile、generateCSV、performAnalysis 函数
 */

import { parseFile, generateCSV, performAnalysis } from "./excel-parser";

// ==================== parseCSV 测试 ====================

describe("parseCSV", () => {
  test("解析简单 CSV 数据", async () => {
    const csv = "姓名,年龄,城市\n张三,25,北京\n李四,30,上海";
    const buffer = Buffer.from(csv, "utf-8");
    const result = await parseFile(buffer, "csv");

    expect(result.headers).toEqual(["姓名", "年龄", "城市"]);
    expect(result.rows).toBe(2);
    expect(result.cols).toBe(3);
    expect(result.preview).toEqual([
      ["张三", "25", "北京"],
      ["李四", "30", "上海"],
    ]);
  });

  test("解析带引号的 CSV 字段", async () => {
    const csv = '姓名,备注\n"张三","北京,朝阳区"\n"李四","含 ""引号"""';
    const buffer = Buffer.from(csv, "utf-8");
    const result = await parseFile(buffer, "csv");

    expect(result.headers).toEqual(["姓名", "备注"]);
    expect(result.allData[0][1]).toBe("北京,朝阳区");
    expect(result.allData[1][1]).toBe('含 "引号"');
  });

  test("解析空 CSV 抛出错误", async () => {
    const buffer = Buffer.from("", "utf-8");
    await expect(parseFile(buffer, "csv")).rejects.toThrow("CSV 文件为空");
  });

  test("解析带 Windows 换行符的 CSV", async () => {
    const csv = "姓名,年龄\r\n张三,25\r\n李四,30";
    const buffer = Buffer.from(csv, "utf-8");
    const result = await parseFile(buffer, "csv");

    expect(result.rows).toBe(2);
    expect(result.headers).toEqual(["姓名", "年龄"]);
  });
});

// ==================== parseXLSX 测试 ====================

describe("parseXLSX", () => {
  test("解析空 Excel 文件不抛出错误，返回空数据", async () => {
    // 创建一个最小的无效 buffer，模拟空文件
    // SheetJS 对无效 buffer 会返回空结果而非抛出错误
    const buffer = Buffer.alloc(0);
    const result = await parseFile(buffer, "xlsx");
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(0);
  });
});

// ==================== generateCSV 测试 ====================

describe("generateCSV", () => {
  test("生成基本 CSV", () => {
    const headers = ["姓名", "年龄"];
    const data = [["张三", "25"], ["李四", "30"]];
    const result = generateCSV(headers, data);

    expect(result).toContain("姓名,年龄");
    expect(result).toContain("张三,25");
    expect(result).toContain("李四,30");
  });

  test("生成含特殊字符的 CSV", () => {
    const headers = ["姓名", "地址"];
    const data = [["张三", "北京,朝阳区"], ['李四', '含 "引号"']];
    const result = generateCSV(headers, data);

    // 验证逗号被正确转义
    expect(result).toContain('"北京,朝阳区"');
    // 验证引号被正确转义（RFC 4180：引号内用双引号表示）
    expect(result).toContain('"含 ""引号"""');
  });
});

// ==================== performAnalysis 测试 ====================

describe("performAnalysis", () => {
  test("分析数值列", () => {
    const data = [
      ["张三", "25"],
      ["李四", "30"],
      ["王五", "28"],
    ];
    const headers = ["姓名", "年龄"];
    const result = performAnalysis(data, headers);

    expect(result.summary).toContain("3 行 × 2 列");
    expect(result.stats["年龄"].type).toBe("number");
    expect(result.stats["年龄"].count).toBe(3);
    expect(result.stats["年龄"].min).toBe(25);
    expect(result.stats["年龄"].max).toBe(30);
    expect(result.stats["年龄"].avg).toBeCloseTo(27.67, 2);
  });

  test("分析文本列", () => {
    const data = [
      ["张三", "北京"],
      ["李四", "上海"],
      ["王五", "广州"],
    ];
    const headers = ["姓名", "城市"];
    const result = performAnalysis(data, headers);

    expect(result.stats["城市"].type).toBe("text");
    expect(result.stats["城市"].count).toBe(3);
    expect(result.stats["城市"].min).toBeUndefined();
    expect(result.stats["城市"].max).toBeUndefined();
    expect(result.stats["城市"].avg).toBeUndefined();
  });

  test("分析含空值的列", () => {
    const data = [
      ["张三", "25"],
      ["李四", ""],
      ["王五", "28"],
    ];
    const headers = ["姓名", "年龄"];
    const result = performAnalysis(data, headers);

    expect(result.stats["年龄"].nullCount).toBe(1);
    expect(result.stats["年龄"].count).toBe(2);
  });

  test("分析混合列（大部分为数值）", () => {
    const data = [
      ["1"],
      ["2"],
      ["3"],
      ["abc"],
    ];
    const headers = ["混合"];
    const result = performAnalysis(data, headers);

    // 3/4 = 75% < 80%，应判定为文本
    expect(result.stats["混合"].type).toBe("text");
  });

  test("分析空数据", () => {
    const result = performAnalysis([], []);
    expect(result.summary).toBe("数据分析完成：0 行 × 0 列");
    expect(result.stats).toEqual({});
  });
});
