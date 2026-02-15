// GitHub Pages 배포 설정
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'wedding_invitation'; // 저장소 이름

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true
  },
  // 캐시 무효화를 위한 더미 필드 (필요시 삭제 가능)
  poweredByHeader: false,
};

export default nextConfig;
