/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [ "antd", "@ant-design", "rc-util", "rc-pagination", "rc-picker", "rc-notification", "rc-tooltip", "rc-tree", "rc-table", "rc-input" ],
  // output: 'export', // Temporarily disabled for API proxy in development
  images: {
    unoptimized: true
  },
  // 注释掉rewrites，因为现在前端直接连接后端（需要后端启用CORS）
  // async rewrites() {
  //   return [
  //     // 将所有 /api/cerna/ 开头的请求代理到后端，保持路径结构不变
  //     {
  //       source: '/api/cerna/:path*',
  //       destination: 'http://localhost:8000/api/cerna/:path*',
  //     },
  //   ]
  // },

  // 启用trailingSlash，确保URL保持尾随斜杠，避免Next.js的重定向
  trailingSlash: true
};

export default nextConfig;
