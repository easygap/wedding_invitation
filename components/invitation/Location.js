"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "./Invitation.module.css";

const WeddingMap = dynamic(() => import("./WeddingMap"), { ssr: false });

export default function Location() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={ref} className={`${styles.locationSection} reveal-section`}>
            <div className="section-container">
                <div className="section-header">
                    <p className="section-subtitle">LOCATION</p>
                    <h2 className="section-title">오시는 길</h2>
                </div>

                <div className={styles.locationInfo}>
                    <p className={styles.venueName}>그랜드 호텔 웨딩홀 3층 그랜드볼룸</p>
                    <p className={styles.venueAddress}>서울특별시 강남구 테헤란로 123</p>
                    <p className={styles.venueTel}>📞 02-1234-5678</p>
                </div>

                {/* 커스텀 지도 (Leaflet) */}
                <WeddingMap />

                <div className={styles.transportInfo}>
                    <div className={styles.transportItem}><h4>🚇 지하철</h4><p>2호선 강남역 3번 출구에서 도보 5분</p></div>
                    <div className={styles.transportItem}><h4>🚌 버스</h4><p>강남역 정류장 하차 (146, 341, 360)</p></div>
                    <div className={styles.transportItem}><h4>🚗 자가용</h4><p>호텔 지하주차장 이용 가능 (2시간 무료)</p></div>
                </div>
            </div>
        </section>
    );
}
