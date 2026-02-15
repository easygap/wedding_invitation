"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./BgmPlayer.module.css";
import { prefix } from "../../utils/prefix";

export default function BgmPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // 자동 재생 시도 (브라우저 정책상 실패할 수 있음)
        const attemptPlay = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                console.log("Auto-play blocked:", err);
                setIsPlaying(false);
            }
        };

        // 사용자 인터랙션이 있을 때 재생 시도 (옵션)
        const handleInteraction = () => {
            if (audio.paused && !isPlaying) {
                attemptPlay();
            }
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
        };

        // 페이지 로드 시 자동 재생 시도
        attemptPlay();

        // 실패 시 인터랙션 대기
        window.addEventListener("click", handleInteraction);
        window.addEventListener("touchstart", handleInteraction);

        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => console.error(e));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className={styles.container}>
            <audio ref={audioRef} src={prefix("/music/bgm.mp3")} loop />

            <button
                className={`${styles.btn} ${isPlaying ? styles.spinning : ''}`}
                onClick={togglePlay}
                aria-label={isPlaying ? "음악 끄기" : "음악 켜기"}
            >
                {isPlaying ? (
                    // 음표 아이콘 (손그림 느낌)
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                ) : (
                    // 음소거 아이콘 (스피커 X 등)
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                )}
            </button>
        </div>
    );
}
