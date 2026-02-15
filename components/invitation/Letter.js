"use client";

import { useEffect, useRef } from "react";
import styles from "./Invitation.module.css";

export default function Letter() {
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
        <section ref={ref} className={`${styles.letterSection} reveal-section`} id="letter-section">
            <div className="section-container">
                <div className="section-header">
                    <p className="section-subtitle">INVITATION</p>
                    <h2 className="section-title">모시는 글</h2>
                </div>

                <div className={styles.letterContent}>
                    <p className={styles.letterText}>
                        서로 다른 길을 걸어온 두 사람이<br />
                        이제 같은 길을 함께 걸어가려 합니다.
                    </p>
                    <p className={styles.letterText}>
                        꽃이 피는 봄날,<br />
                        저희 두 사람이 사랑의 서약을 하려 합니다.<br />
                        바쁘시더라도 오셔서 축복해 주시면<br />
                        더없는 기쁨이 되겠습니다.
                    </p>

                    <div className={styles.letterParents}>
                        <p>
                            <span className={styles.parentName}>이수철 · 이성옥</span>의 장남 <strong>준수</strong>
                        </p>
                        <p>
                            <span className={styles.parentName}>송재곤 · 주효리</span>의 장녀 <strong>윤겸</strong>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
