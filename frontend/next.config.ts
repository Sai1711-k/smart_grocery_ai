import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5000/api/auth/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:5000/api/admin/:path*',
      },
      {
        source: '/api/cart/:path*',
        destination: 'http://localhost:5000/api/cart/:path*',
      },
      {
        source: '/api/ai/:path*',
        destination: 'http://localhost:5000/api/ai/:path*',
      },
      {
        source: '/api/orders/checkout',
        destination: 'http://localhost:5000/api/orders/checkout',
      },
      {
        source: '/api/orders/history',
        destination: 'http://localhost:5000/api/orders/history',
      },
    ];
  },
};

export default nextConfig;
