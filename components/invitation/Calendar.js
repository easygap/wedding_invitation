"use client";

import { useEffect, useRef } from "react";
import styles from "./Invitation.module.css";

export default function Calendar() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // D-Day 계산 (2029-03-31)
    const weddingDate = new Date("2029-03-31T00:00:00+09:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));

    let ddayText;
    if (diff > 0) ddayText = <p>준수 <span className={styles.heartIcon}>♥</span> 윤겸의 결혼식이 <strong>{diff}</strong>일 남았습니다</p>;
    else if (diff === 0) ddayText = <p>준수 <span className={styles.heartIcon}>♥</span> 윤겸의 결혼식 <strong>당일</strong>입니다!</p>;
    else ddayText = <p>준수 <span className={styles.heartIcon}>♥</span> 윤겸이 결혼한 지 <strong>{Math.abs(diff)}</strong>일 되었습니다</p>;

    // 2029년 3월: 1일(목) ~ 31일(토)
    const days = [
        [null, null, null, null, 1, 2, 3],
        [4, 5, 6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15, 16, 17],
        [18, 19, 20, 21, 22, 23, 24],
        [25, 26, 27, 28, 29, 30, 31],
    ];

    return (
        <section ref={ref} className={`${styles.calendarSection} reveal-section`}>
            <div className="section-container">
                <div className="section-header">
                    <p className="section-subtitle">CALENDAR</p>
                    <h2 className="section-title">2029년 3월</h2>
                </div>

                <div className={styles.calendarGrid}>
                    <div className={styles.calHeader}>
                        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                            <span key={d} className={i === 0 ? styles.calSun : i === 6 ? styles.calSat : ""}>{d}</span>
                        ))}
                    </div>
                    <div className={styles.calBody}>
                        {days.flat().map((d, i) => {
                            const isSun = i % 7 === 0;
                            const isSat = i % 7 === 6;
                            const isHighlight = d === 31;
                            return (
                                <span key={i} className={[
                                    isSun ? styles.calSun : "",
                                    isSat ? styles.calSat : "",
                                    isHighlight ? styles.calHighlight : "",
                                ].join(" ")}>
                                    {d || ""}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.calendarDday}>{ddayText}</div>
            </div>
        </section>
    );
}
