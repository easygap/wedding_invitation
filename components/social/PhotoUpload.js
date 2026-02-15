"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./PhotoUpload.module.css";

export default function PhotoUpload() {
    const ref = useRef(null);
    const fileInputRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [lightbox, setLightbox] = useState({ open: false, idx: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const fetchPhotos = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/photos";
            const res = await fetch(apiUrl);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setPhotos(data);
        } catch (err) {
            console.error("Failed to fetch photos:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 서버에서 사진 목록 불러오기
    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setIsUploading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/photos";
        const isWorker = !!process.env.NEXT_PUBLIC_API_URL;

        // 순차적으로 업로드 (또는 병렬 처리 가능)
        for (const file of files) {
            if (!file.type.startsWith("image/")) continue;

            try {
                let res;
                if (isWorker) {
                    // Cloudflare Worker: Send Binary
                    res = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": file.type,
                            "X-File-Name": file.name // Custom header for filename
                        },
                        body: file,
                    });
                } else {
                    // Local API Route: Send FormData
                    const formData = new FormData();
                    formData.append("file", file);
                    res = await fetch(apiUrl, {
                        method: "POST",
                        body: formData,
                    });
                }

                if (!res.ok) throw new Error("Upload failed");
            } catch (err) {
                console.error("Upload failed:", file.name, err);
                alert(`${file.name} 업로드에 실패했습니다.`);
            }
        }

        // 업로드 완료 후 목록 새로고침
        await fetchPhotos();

        setIsUploading(false);
        e.target.value = "";
    };

    const openLightbox = (idx) => setLightbox({ open: true, idx });
    const closeLightbox = () => setLightbox({ open: false, idx: 0 });

    return (
        <>
            <section ref={ref} className={`${styles.photoSection} reveal-section`}>
                <div className="section-container">
                    <div className="section-header">
                        <p className="section-subtitle">MOMENTS</p>
                        <h2 className="section-title">함께한 순간</h2>
                    </div>
                    <p className={styles.desc}>결혼식에서 찍은 사진을 공유해주세요</p>

                    {/* 업로드 버튼 */}
                    <button
                        className={styles.uploadBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <span className={styles.uploadIcon}>
                            {isUploading ? "⏳" : "+"}
                        </span>
                        <span>{isUploading ? "업로드 중..." : "사진 올리기"}</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />

                    {/* 로딩 상태 */}
                    {isLoading && (
                        <p className={styles.emptyMsg}>사진을 불러오는 중입니다...</p>
                    )}

                    {/* 사진 그리드 */}
                    {!isLoading && photos.length > 0 && (
                        <div className={styles.photoGrid}>
                            {photos.map((photo, i) => (
                                <div key={photo.id} className={styles.photoItem} onClick={() => openLightbox(i)}>
                                    <img src={photo.data} alt={photo.name} className={styles.photoImg} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && photos.length === 0 && (
                        <p className={styles.emptyMsg}>아직 업로드된 사진이 없습니다 📷</p>
                    )}
                </div>
            </section>

            {/* 라이트박스 */}
            {lightbox.open && photos[lightbox.idx] && (
                <div className={styles.lightbox} onClick={closeLightbox}>
                    <button className={styles.lightboxClose}>&times;</button>
                    <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                        <img src={photos[lightbox.idx].data} alt="" className={styles.lightboxImg} />
                    </div>
                    <button className={styles.lightboxPrev} onClick={e => {
                        e.stopPropagation();
                        setLightbox(p => ({ ...p, idx: (p.idx - 1 + photos.length) % photos.length }));
                    }}>&#10094;</button>
                    <button className={styles.lightboxNext} onClick={e => {
                        e.stopPropagation();
                        setLightbox(p => ({ ...p, idx: (p.idx + 1) % photos.length }));
                    }}>&#10095;</button>
                </div>
            )}
        </>
    );
}
