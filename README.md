# 💍 모바일 청첩장 v2

우리만의 특별한 순간을 위한 커스텀 모바일 청첩장 프로젝트입니다. Next.js로 제작되었으며, GitHub Pages를 통해 배포됩니다.

## ✨ 주요 기능

*   **🧩 퍼즐 오프닝**: 드래그 앤 드롭으로 퍼즐을 맞추면 청첩장이 열리는 인터랙티브 오프닝
*   **🖼️ 갤러리**: 터치 및 드래그 제스처를 지원하는 부드러운 사진 갤러리
*   **🗺️ 오시는 길**: Kakao Map API를 연동한 웨딩홀 위치 안내 (네이버/카카오/구글 지도 앱 연동)
*   **📷 사진 공유**: 하객들이 직접 찍은 사진을 업로드하고 공유하는 기능 (Dropbox 연동)
*   **📝 방명록**: 축하 메시지를 남길 수 있는 방명록
*   **💸 마음 전하실 곳**: 계좌번호 복사 및 카카오페이 송금 QR 코드 지원
*   **📅 디데이 캘린더**: 예식일까지 남은 날짜 자동 계산

## 🛠️ 기술 스택

*   **Framework**: Next.js (App Router)
*   **Styling**: CSS Modules, Vanilla CSS
*   **Map**: Kakao Maps API
*   **Storage**: Dropbox API (Cloudflare Workers 프록시 사용)
*   **Deployment**: GitHub Pages (Frontend), Cloudflare Workers (Backend)

## 🚀 배포 방법

이 프로젝트는 **GitHub Pages**에 정적 사이트로 배포됩니다.

### 1. 소스 코드 배포
```bash
git add .
git commit -m "배포 업데이트"
git push origin main
```
GitHub Actions가 자동으로 빌드하여 배포합니다.

### 2. 사진 업로드 기능 설정 (보안)
GitHub Pages는 정적 호스팅이므로, 백엔드 로직이 필요한 사진 업로드 기능은 **Cloudflare Workers**를 통해 작동합니다.

1.  `workers/dropbox-proxy.js` 코드를 Cloudflare Workers에 배포합니다.
2.  클라우드플레어 대시보드에서 `DROPBOX_ACCESS_TOKEN` 환경 변수를 비공개로 설정합니다.
3.  GitHub 저장소 Settings > Secrets에 Worker 주소를 `WORKER_URL`로 등록합니다.

## 📂 프로젝트 구조

```
├── app/                  # Next.js App Router (페이지 및 레이아웃)
├── components/           # UI 컴포넌트
│   ├── invitation/       # 청첩장 주요 섹션 (갤러리, 지도, 캘린더 등)
│   ├── puzzle/           # 오프닝 퍼즐 게임
│   └── social/           # 방명록 및 사진 업로드
├── public/               # 정적 파일 (이미지, 폰트)
└── workers/              # Cloudflare Worker 스크립트 (API 프록시)
```

## 📝 라이선스

이 프로젝트는 개인적인 용도로 제작되었습니다.
