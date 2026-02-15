"use client";

import { useEffect, useState } from "react";
import styles from "./Transition.module.css";

export default function Transition({ onEnd }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        // phase 0: 암전
        setTimeout(() => setPhase(1), 100);   // 페이드 인
        setTimeout(() => setPhase(2), 1200);  // 밝아짐
        setTimeout(() => onEnd(), 2400);      // 완료
    }, [onEnd]);

    return (
        <div className={`${styles.overlay} ${phase >= 1 ? styles.dark : ""} ${phase >= 2 ? styles.bright : ""}`}>
            <div className={styles.centerText}>
                <p className={styles.script}>Welcome to our Wedding</p>
            </div>
        </div>
    );
}
