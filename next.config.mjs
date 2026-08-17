/**
 * ตั้งค่าให้ export เป็นไฟล์ static ล้วน — ไม่มีหลังบ้าน
 * เอาโฟลเดอร์ out/ ไปวางบน GitHub Pages, Netlify หรือ host ไหนก็ได้
 *
 * ถ้า deploy ลง GitHub Pages แบบ project site (เช่น user.github.io/calculus-practice)
 * ให้ตั้ง NEXT_PUBLIC_BASE_PATH=/calculus-practice ก่อน build
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
