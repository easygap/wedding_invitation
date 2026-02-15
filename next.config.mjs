/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  }
};

// 프로덕션 빌드(배포) 시에만 정적 내보내기 활성화
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
}

export default nextConfig;
