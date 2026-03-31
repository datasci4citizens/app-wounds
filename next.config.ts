import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Capacitor needs it for generating the app
  images: {
    unoptimized: true, // Capacitor doesn't support it 
  },
};

export default nextConfig;
