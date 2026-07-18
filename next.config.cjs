/**
 * Next.js 配置文件
 * 配置服务器端行为和部署选项
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置 Serverless Function 请求体大小限制
  serverExternalPackages: ["xlsx"],

  // CORS 配置 - 覆盖所有 API 路由
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
