const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 배포 시 저장소 이름(/wedding_invitation)이 기본 경로가 됨
  basePath: isProd ? '/wedding_invitation' : '',
  assetPrefix: isProd ? '/wedding_invitation/' : '',
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
