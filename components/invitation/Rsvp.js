"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Invitation.module.css";
import RsvpModal from "./RsvpModal";

export default function Rsvp() {
    const [showRsvp, setShowRsvp] = useState(false);
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
        <section ref={ref} className={`${styles.rsvpSection} reveal-section`}>
            <div className="section-container">
                <div className="section-header">
                    <p className="section-subtitle">RSVP</p>
                    <h2 className="section-title">참석 여부 전달</h2>
                </div>

                <div className={styles.rsvpContent}>
                    <p className={styles.rsvpText}>
                        예식과 식사가 함께 진행되는 자리인 만큼,<br />
                        소중한 분들께 불편함이 없도록<br />
                        참석 여부를 미리 확인하고자 합니다.<br />
                        <br />
                        부담 가지지 마시고, 참석 여부 전해주시면<br />
                        감사한 마음으로 준비하겠습니다.
                    </p>

                    <button className={styles.btnSecondary} onClick={() => setShowRsvp(true)}>
                        참석 여부 전달
                    </button>
                </div>
            </div>

            {/* RSVP 모달 */}
            {showRsvp && <RsvpModal onClose={() => setShowRsvp(false)} />}
        </section>
    );
}
