"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./WeddingMap.module.css";

// 웨딩홀 좌표
// 웨딩홀 좌표
const VENUE = {
    // 테헤란로 123 (여삼빌딩) 실제 좌표
    lat: 37.499459985293,
    lng: 127.03139774432,
    name: "그랜드 호텔 웨딩홀",
    address: "서울특별시 강남구 테헤란로 123",
    tel: "02-1234-5678",
};

// 네비게이션 링크 생성
function getNavLinks(lat, lng, name) {
    const encodedName = encodeURIComponent(name);
    return {
        naver: `nmap://place?lat=${lat}&lng=${lng}&name=${encodedName}&appname=wedding-invitation`,
        naverWeb: `https://map.naver.com/v5/search/${encodedName}?c=${lng},${lat},16,0,0,0,dh`,
        kakao: `kakaomap://look?p=${lat},${lng}`,
        kakaoWeb: `https://map.kakao.com/link/map/${encodedName},${lat},${lng}`,
        google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    };
}

function isMobile() {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function WeddingMap() {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        const appKey = "5d8e2ddbc4a09969cfb89c1eebac98ae";
        const scriptId = "kakao-map-sdk";

        const onLoadKakaoMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                console.error("Kakao Map SDK not loaded properly.");
                setLoadError(true);
                return;
            }

            window.kakao.maps.load(() => {
                const container = mapContainerRef.current;
                if (!container) return;

                container.innerHTML = "";

                const options = {
                    center: new window.kakao.maps.LatLng(VENUE.lat, VENUE.lng),
                    level: 3,
                };

                const map = new window.kakao.maps.Map(container, options);
                mapInstanceRef.current = map;

                // [New] 웨딩 테마 하트 마커 (SVG 파일 사용)
                // public/marker_heart.svg 파일 참조 (배포 시 경로 보정)
                const isProd = process.env.NODE_ENV === 'production';
                const imageSrc = isProd ? "/wedding_invitation/marker_heart.svg" : "/marker_heart.svg";

                const imageSize = new window.kakao.maps.Size(54, 60);
                const imageOption = { offset: new window.kakao.maps.Point(27, 60) };

                const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
                const markerPosition = new window.kakao.maps.LatLng(VENUE.lat, VENUE.lng);

                const marker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    image: markerImage
                });
                marker.setMap(map);

                // [New] 웨딩 카드 스타일 오버레이
                const content = `
                    <div class="${styles.customOverlay}">
                        <div class="${styles.overlayCard}">
                            <span class="${styles.overlayTitle}">${VENUE.name}</span>
                            <span class="${styles.overlaySubtitle}">3층 그랜드볼룸</span>
                        </div>
                    </div>
                `;

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position: markerPosition,
                    content: content,
                    yAnchor: 1.7, // 마커 위로 확실하게 띄움
                    zIndex: 3
                });
                customOverlay.setMap(map);

                // 줌 컨트롤
                const zoomControl = new window.kakao.maps.ZoomControl();
                map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

                setMapLoaded(true);
            });
        };

        const timeoutId = setTimeout(() => {
            if (!mapLoaded && !loadError) {
                setLoadError(true);
            }
        }, 5000);

        if (window.kakao && window.kakao.maps) {
            onLoadKakaoMap();
            return () => clearTimeout(timeoutId);
        }

        let script = document.getElementById(scriptId);
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.type = "text/javascript";
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,clusterer,drawing&autoload=false`;
            script.onload = onLoadKakaoMap;
            script.onerror = () => setLoadError(true);
            document.head.appendChild(script);
        } else {
            script.addEventListener("load", onLoadKakaoMap);
        }

        return () => {
            clearTimeout(timeoutId);
            if (script) {
                script.removeEventListener("load", onLoadKakaoMap);
            }
        };
    }, []);

    const links = getNavLinks(VENUE.lat, VENUE.lng, VENUE.name);
    const mobile = isMobile();

    const handleNavClick = (e, appLink, webLink) => {
        if (mobile) {
            window.location.href = appLink;
            setTimeout(() => {
                window.open(webLink, "_blank", "noopener");
            }, 1000);
            e.preventDefault();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mapFrame}>
                <div ref={mapContainerRef} className={styles.mapView} />

                {!mapLoaded && !loadError && (
                    <div className={styles.mapPlaceholder}>
                        <div className={styles.spinner}></div>
                        <p>지도를 불러오는 중...</p>
                    </div>
                )}

                {loadError && (
                    <div className={styles.mapPlaceholder}>
                        <p>지도를 불러오는데 실패했습니다.</p>
                        <button onClick={() => window.location.reload()}>새로고침</button>
                    </div>
                )}
            </div>

            <div className={styles.controlPanel}>
                <div className={styles.navGrid}>
                    <a href={mobile ? links.naver : links.naverWeb} className={`${styles.navItem} ${styles.navNaver}`} onClick={(e) => handleNavClick(e, links.naver, links.naverWeb)} target="_blank" rel="noopener noreferrer">
                        네이버 지도
                    </a>
                    <a href={mobile ? links.kakao : links.kakaoWeb} className={`${styles.navItem} ${styles.navKakao}`} onClick={(e) => handleNavClick(e, links.kakao, links.kakaoWeb)} target="_blank" rel="noopener noreferrer">
                        카카오맵
                    </a>
                    <a href={links.google} className={`${styles.navItem} ${styles.navGoogle}`} target="_blank" rel="noopener noreferrer">
                        구글 지도
                    </a>
                </div>
            </div>
        </div>
    );
}
