export const prefix = (path) => {
    const isProd = process.env.NODE_ENV === 'production';
    // GitHub Pages 배포 시 basePath 적용
    const basePath = isProd ? '/wedding_invitation' : '';
    return `${basePath}${path}`;
};
