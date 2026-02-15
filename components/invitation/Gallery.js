"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Invitation.module.css";
import { prefix } from "@/utils/prefix";

const IMAGES = [
    { src: prefix("/images/in_jeju1.JPG"), alt: "제주 웨딩 스냅 1" },
    { src: prefix("/images/in_jeju2.png"), alt: "제주 웨딩 스냅 2" },
    { src: prefix("/images/in_jeju3.JPG"), alt: "제주 웨딩 스냅 3" },
    { src: prefix("/images/in_japan1.JPG"), alt: "일본 여행 1" },
    { src: prefix("/images/in_japan2.JPG"), alt: "일본 여행 2" },
    { src: prefix("/images/in_gangnam.JPG"), alt: "강남 데이트 1" },
    { src: prefix("/images/in_gapyeong.JPG"), alt: "가평 데이트 1" },
    { src: prefix("/images/in_jungnang.JPG"), alt: "중랑 데이트 1" },
    { src: prefix("/images/1.JPG"), alt: "1" },
    { src: prefix("/images/2.JPG"), alt: "2" },
    { src: prefix("/images/3.JPG"), alt: "3" },
    { src: prefix("/images/4.JPG"), alt: "4" },
    { src: prefix("/images/5.JPG"), alt: "5" },
    { src: prefix("/images/6.JPG"), alt: "6" },
    { src: prefix("/images/7.JPG"), alt: "7" },
    { src: prefix("/images/8.JPG"), alt: "8" },
    { src: prefix("/images/9.JPG"), alt: "9" },
    { src: prefix("/images/10.JPG"), alt: "10" },
    { src: prefix("/images/11.JPG"), alt: "11" },
    { src: prefix("/images/12.JPG"), alt: "12" },
    { src: prefix("/images/13.JPG"), alt: "13" },
    { src: prefix("/images/wedding_pic.jpg"), alt: "웨딩 사진" },
];

export default function Gallery() {
    const sectionRef = useRef(null);
    const sliderRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const [lightbox, setLightbox] = useState({ open: false, idx: 0 });

    // 드래그 상태 관리 (Ref 사용으로 렌더링 최소화 및 즉시성 확보)
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const isDragging = useRef(false); // 실제 이동 발생 여부

    useEffect(() => {
        const el = sectionRef.current;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // PC 마우스 휠 가로 스크롤 변환
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const onWheel = (e) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            slider.scrollLeft += e.deltaY;
        };

        slider.addEventListener("wheel", onWheel, { passive: false });
        return () => slider.removeEventListener("wheel", onWheel);
    }, []);

    // 스냅 감지 (Active Dot 표시)
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;
        const slides = slider.querySelectorAll(`.${styles.gallerySlide}`);
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) setActiveIdx(Number(e.target.dataset.index));
            });
        }, { root: slider, threshold: 0.6 });
        slides.forEach(s => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    // 마우스 드래그 핸들러
    const onMouseDown = (e) => {
        const slider = sliderRef.current;
        isDown.current = true;
        isDragging.current = false;
        startX.current = e.pageX - slider.offsetLeft;
        scrollLeft.current = slider.scrollLeft;
        slider.style.cursor = "grabbing";
    };

    const onMouseLeave = () => {
        isDown.current = false;
        if (sliderRef.current) sliderRef.current.style.cursor = "grab";
    };

    const onMouseUp = () => {
        isDown.current = false;
        if (sliderRef.current) sliderRef.current.style.cursor = "grab";
    };

    const onMouseMove = (e) => {
        if (!isDown.current) return;
        e.preventDefault();
        const slider = sliderRef.current;
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX.current) * 1.5; // 스크롤 속도

        // 약간이라도 움직이면 드래그로 click 방지
        if (Math.abs(walk) > 5) {
            isDragging.current = true;
        }

        slider.scrollLeft = scrollLeft.current - walk;
    };

    const handleSlideClick = (i) => {
        // 드래그가 아니었을 때만 라이트박스 열기
        if (!isDragging.current) {
            openLightbox(i);
        }
    };

    const scrollToSlide = (i) => {
        const slider = sliderRef.current;
        const slides = slider?.querySelectorAll(`.${styles.gallerySlide}`);
        if (slides?.[i]) slides[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    const openLightbox = (idx) => setLightbox({ open: true, idx });
    const closeLightbox = () => setLightbox({ open: false, idx: 0 });
    const prevLb = () => setLightbox(p => ({ ...p, idx: (p.idx - 1 + IMAGES.length) % IMAGES.length }));
    const nextLb = () => setLightbox(p => ({ ...p, idx: (p.idx + 1) % IMAGES.length }));

    return (
        <>
            <section ref={sectionRef} className={`${styles.gallerySection} reveal-section`}>
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-subtitle">GALLERY</p>
                        <h2 className="section-title">우리의 순간</h2>
                    </div>

                    <div
                        className={styles.gallerySlider}
                        ref={sliderRef}
                        onMouseDown={onMouseDown}
                        onMouseLeave={onMouseLeave}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                        style={{ cursor: "grab" }}
                    >
                        <div className={styles.galleryTrack}>
                            {IMAGES.map((img, i) => (
                                <div
                                    key={i}
                                    className={styles.gallerySlide}
                                    data-index={i}
                                    onClick={() => handleSlideClick(i)}
                                >
                                    <img src={img.src} alt={img.alt} className={styles.galleryImg} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.galleryDots}>
                        {IMAGES.map((_, i) => (
                            <button key={i} className={`${styles.galleryDot} ${i === activeIdx ? styles.dotActive : ""}`}
                                onClick={() => scrollToSlide(i)} aria-label={`사진 ${i + 1}`} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 라이트박스 */}
            {lightbox.open && (
                <div className={styles.lightbox} onClick={closeLightbox}>
                    <button className={styles.lightboxClose}>&times;</button>
                    <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                        <img src={IMAGES[lightbox.idx].src} alt={IMAGES[lightbox.idx].alt} className={styles.lightboxImg} />
                    </div>
                    <button className={styles.lightboxPrev} onClick={e => { e.stopPropagation(); prevLb(); }}>&#10094;</button>
                    <button className={styles.lightboxNext} onClick={e => { e.stopPropagation(); nextLb(); }}>&#10095;</button>
                </div>
            )}
        </>
    );
}
