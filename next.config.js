/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./"),
    };
    // Exclude Vite entry files from Next.js compilation
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: [
        path.resolve(__dirname, 'src/main.tsx'),
        path.resolve(__dirname, 'src/App.tsx'),
        path.resolve(__dirname, 'src/pages'),
        path.resolve(__dirname, 'src/components'),
      ],
      use: 'ignore-loader'
    });
    return config;
  },
};

export default nextConfig;

