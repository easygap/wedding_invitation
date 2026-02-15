"use client";

import { useRef, useEffect } from "react";
import styles from "./Invitation.module.css";

export default function Hero() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={ref} className={styles.hero}>
            <img src="/images/wedding_pic.jpg" alt="Hero Background" className={styles.bgImg} />
            <div className={styles.heroOverlay} />

            <div className={styles.heroContent}>
                <h2 className={styles.englishTitle}>The Wedding Day</h2>

                <div className={styles.namesWrapper}>
                    <div className={styles.nameBlock}>
                        <span className={styles.korName}>준수</span>
                        <span className={styles.engName}>JunSu</span>
                    </div>
                    <span className={styles.amp}>&</span>
                    <div className={styles.nameBlock}>
                        <span className={styles.korName}>윤겸</span>
                        <span className={styles.engName}>YunGyeom</span>
                    </div>
                </div>

                <p className={styles.dateLocation}>
                    2029. 03. 31 SAT PM 12:30<br />
                    그랜드 호텔 웨딩홀
                </p>

                <div className={styles.heroDivider}>✦</div>

                {/* RSVP 버튼 제거됨 */}

                <div className={styles.scrollIndicator} onClick={() => {
                    document.getElementById("letter-section")?.scrollIntoView({ behavior: "smooth" });
                }}>
                    <span className={styles.scrollText}>SCROLL</span>
                    <span className={styles.scrollLine}></span>
                </div>
            </div>
        </section>
    );
}
