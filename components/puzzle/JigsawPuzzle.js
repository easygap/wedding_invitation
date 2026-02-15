"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./JigsawPuzzle.module.css";

const GRID = 3;
const PIECE_COUNT = GRID * GRID;
const SNAP_DISTANCE = 36;
const TAB_RATIO = 0.12;

/* ══════════════════════════════════════
   SVG 지그소 패스 빌더
   ══════════════════════════════════════ */
function buildJigsawPath(edges) {
    const t = TAB_RATIO;
    const points = [];

    points.push("M 0 0");

    // 상변
    if (edges.top === 0) {
        points.push("L 1 0");
    } else {
        const dir = edges.top;
        points.push(`L 0.35 0`);
        points.push(`C 0.35 ${-t * dir}, 0.35 ${-t * dir}, 0.42 ${-t * dir}`);
        points.push(`C 0.45 ${-t * 1.6 * dir}, 0.55 ${-t * 1.6 * dir}, 0.58 ${-t * dir}`);
        points.push(`C 0.65 ${-t * dir}, 0.65 ${-t * dir}, 0.65 0`);
        points.push(`L 1 0`);
    }

    // 우변
    if (edges.right === 0) {
        points.push("L 1 1");
    } else {
        const dir = edges.right;
        points.push(`L 1 0.35`);
        points.push(`C ${1 + t * dir} 0.35, ${1 + t * dir} 0.35, ${1 + t * dir} 0.42`);
        points.push(`C ${1 + t * 1.6 * dir} 0.45, ${1 + t * 1.6 * dir} 0.55, ${1 + t * dir} 0.58`);
        points.push(`C ${1 + t * dir} 0.65, ${1 + t * dir} 0.65, 1 0.65`);
        points.push(`L 1 1`);
    }

    // 하변
    if (edges.bottom === 0) {
        points.push("L 0 1");
    } else {
        const dir = edges.bottom;
        points.push(`L 0.65 1`);
        points.push(`C 0.65 ${1 + t * dir}, 0.65 ${1 + t * dir}, 0.58 ${1 + t * dir}`);
        points.push(`C 0.55 ${1 + t * 1.6 * dir}, 0.45 ${1 + t * 1.6 * dir}, 0.42 ${1 + t * dir}`);
        points.push(`C 0.35 ${1 + t * dir}, 0.35 ${1 + t * dir}, 0.35 1`);
        points.push(`L 0 1`);
    }

    // 좌변
    if (edges.left === 0) {
        points.push("L 0 0");
    } else {
        const dir = edges.left;
        points.push(`L 0 0.65`);
        points.push(`C ${-t * dir} 0.65, ${-t * dir} 0.65, ${-t * dir} 0.58`);
        points.push(`C ${-t * 1.6 * dir} 0.55, ${-t * 1.6 * dir} 0.45, ${-t * dir} 0.42`);
        points.push(`C ${-t * dir} 0.35, ${-t * dir} 0.35, 0 0.35`);
        points.push(`L 0 0`);
    }

    points.push("Z");
    return points.join(" ");
}

function generateEdges() {
    const hEdges = [];
    for (let row = 0; row < GRID; row++) {
        hEdges[row] = [];
        for (let col = 0; col < GRID - 1; col++) {
            hEdges[row][col] = Math.random() > 0.5 ? 1 : -1;
        }
    }
    const vEdges = [];
    for (let row = 0; row < GRID - 1; row++) {
        vEdges[row] = [];
        for (let col = 0; col < GRID; col++) {
            vEdges[row][col] = Math.random() > 0.5 ? 1 : -1;
        }
    }

    const edges = [];
    for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
            edges.push({
                top: row === 0 ? 0 : -vEdges[row - 1][col],
                bottom: row === GRID - 1 ? 0 : vEdges[row][col],
                left: col === 0 ? 0 : -hEdges[row][col - 1],
                right: col === GRID - 1 ? 0 : hEdges[row][col],
            });
        }
    }
    return edges;
}

/* ══════════════════════════════════════
   Confetti 파티클 시스템
   ══════════════════════════════════════ */
function launchConfetti(canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
        "#D4A574", "#E8D5B7", "#C39260", "#F5E6D3",
        "rgba(212,165,116,0.7)", "rgba(245,230,211,0.8)"
    ];
    const particles = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 14 - 4,
            w: Math.random() * 8 + 3,
            h: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 12,
            gravity: 0.15 + Math.random() * 0.1,
            opacity: 1,
        });
    }

    let frame = 0;
    const maxFrames = 150;

    function animate() {
        if (frame >= maxFrames) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.vy += p.gravity;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            p.opacity = Math.max(0, 1 - frame / maxFrames);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        frame++;
        requestAnimationFrame(animate);
    }
    animate();
}

/* ══════════════════════════════════════
   원형 프로그레스 컴포넌트
   ══════════════════════════════════════ */
function CircularProgress({ current, total }) {
    const r = 18;
    const circumference = 2 * Math.PI * r;
    const progress = total > 0 ? current / total : 0;
    const offset = circumference * (1 - progress);

    return (
        <div className={styles.progressWrap}>
            <svg className={styles.progressRing} viewBox="0 0 44 44">
                <circle className={styles.progressTrack} cx="22" cy="22" r={r} />
                <circle
                    className={styles.progressFill}
                    cx="22" cy="22" r={r}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className={styles.progressText}>{current}/{total}</span>
        </div>
    );
}

/* ══════════════════════════════════════
   메인 퍼즐 컴포넌트
   ══════════════════════════════════════ */
export default function JigsawPuzzle({ onComplete, onSkip }) {
    const containerRef = useRef(null);
    const confettiRef = useRef(null);
    const [pieces, setPieces] = useState([]);
    const [edgesData, setEdgesData] = useState([]);
    const [solved, setSolved] = useState(false);
    const [snappedCount, setSnappedCount] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const [shakeId, setShakeId] = useState(null);
    const [snapAnimId, setSnapAnimId] = useState(null);
    const dragRef = useRef({ active: false, pieceId: null, offsetX: 0, offsetY: 0 });
    const imgRef = useRef(null);

    // 이미지 프리로드
    useEffect(() => {
        const img = new Image();
        img.src = "/images/wedding_pic.jpg";
        img.onload = () => {
            imgRef.current = img;
            setImgLoaded(true);
        };
    }, []);

    // 퍼즐 조각 초기화
    useEffect(() => {
        if (!imgLoaded) return;
        const edges = generateEdges();
        setEdgesData(edges);
        initPieces(edges);
    }, [imgLoaded]);

    const initPieces = (edges) => {
        const containerW = Math.min(window.innerWidth * 0.82, 330);
        const pieceSize = containerW / GRID;
        const newPieces = [];

        for (let i = 0; i < PIECE_COUNT; i++) {
            const row = Math.floor(i / GRID);
            const col = i % GRID;
            const targetX = col * pieceSize;
            const targetY = row * pieceSize;

            // 하단/상단 반원형 배치
            const angle = (i / PIECE_COUNT) * Math.PI + Math.PI;
            const radiusX = window.innerWidth * 0.35;
            const radiusY = window.innerHeight * 0.28;
            const centerX = window.innerWidth / 2 - pieceSize / 2;
            const centerY = window.innerHeight * 0.55;

            const randX = centerX + Math.cos(angle + (Math.random() - 0.5) * 0.4) * radiusX;
            const randY = centerY + Math.sin(angle + (Math.random() - 0.5) * 0.3) * radiusY * 0.6;
            const randRotation = (Math.random() - 0.5) * 20;

            newPieces.push({
                id: i, row, col,
                targetX, targetY,
                x: Math.max(10, Math.min(randX, window.innerWidth - pieceSize - 10)),
                y: Math.max(80, Math.min(randY, window.innerHeight - pieceSize - 80)),
                rotation: randRotation,
                snapped: false,
                pieceSize,
                zIndex: PIECE_COUNT + 10 - i,
            });
        }
        setPieces(newPieces);
    };

    // 드래그 시작
    const handlePointerDown = useCallback((e, pieceId) => {
        e.preventDefault();
        const piece = pieces.find(p => p.id === pieceId);
        if (!piece || piece.snapped) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        dragRef.current = {
            active: true, pieceId,
            offsetX: clientX - piece.x,
            offsetY: clientY - piece.y,
        };

        setDraggingId(pieceId);

        setPieces(prev => prev.map(p =>
            p.id === pieceId ? { ...p, zIndex: 200, rotation: 0 } : p
        ));
    }, [pieces]);

    // 드래그 이동 & 드롭
    useEffect(() => {
        const handleMove = (e) => {
            if (!dragRef.current.active) return;
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const { pieceId, offsetX, offsetY } = dragRef.current;

            setPieces(prev => prev.map(p =>
                p.id === pieceId ? { ...p, x: clientX - offsetX, y: clientY - offsetY } : p
            ));
        };

        const handleUp = () => {
            if (!dragRef.current.active) return;
            const { pieceId } = dragRef.current;
            dragRef.current.active = false;
            setDraggingId(null);

            setPieces(prev => {
                const container = containerRef.current;
                if (!container) return prev;
                const rect = container.getBoundingClientRect();

                return prev.map(p => {
                    if (p.id !== pieceId || p.snapped) return p;

                    const actualTargetX = rect.left + p.targetX;
                    const actualTargetY = rect.top + p.targetY;
                    const dx = Math.abs(p.x - actualTargetX);
                    const dy = Math.abs(p.y - actualTargetY);

                    // 프레임 안에 드롭했는지 확인
                    const inFrame = (
                        p.x > rect.left - 40 && p.x < rect.right + 40 &&
                        p.y > rect.top - 40 && p.y < rect.bottom + 40
                    );

                    if (dx < SNAP_DISTANCE && dy < SNAP_DISTANCE) {
                        // 정답 — 스냅 성공
                        setSnapAnimId(pieceId);
                        setTimeout(() => setSnapAnimId(null), 600);
                        return {
                            ...p,
                            x: actualTargetX, y: actualTargetY,
                            snapped: true, rotation: 0, zIndex: 1,
                        };
                    } else if (inFrame) {
                        // 프레임 안이지만 틀린 위치 — shake
                        setShakeId(pieceId);
                        setTimeout(() => setShakeId(null), 350);
                        return { ...p, zIndex: 10 };
                    }
                    return { ...p, zIndex: 10 };
                });
            });
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        window.addEventListener("touchmove", handleMove, { passive: false });
        window.addEventListener("touchend", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleUp);
        };
    }, []);

    // 완성 체크
    useEffect(() => {
        const count = pieces.filter(p => p.snapped).length;
        setSnappedCount(count);
        if (count === PIECE_COUNT && pieces.length > 0 && !solved) {
            setSolved(true);
            // confetti 발사
            if (confettiRef.current) {
                launchConfetti(confettiRef.current);
            }
            setTimeout(() => onComplete(), 3500);
        }
    }, [pieces, solved, onComplete]);

    const pieceSize = pieces[0]?.pieceSize || 100;
    const gridSize = pieceSize * GRID;
    const tabExtra = pieceSize * TAB_RATIO * 1.8;
    const svgSize = pieceSize + tabExtra * 2;

    return (
        <div className={styles.puzzlePage}>
            {/* 배경: 블러 처리된 원본 */}
            <div className={styles.puzzleBg} style={{
                backgroundImage: "url(/images/wedding_pic.jpg)",
            }}></div>

            {/* 스포트라이트 */}
            <div className={styles.spotlight}></div>

            {/* 헤더 */}
            <div className={styles.header}>
                <p className={styles.subtitle}>Piece Together Our Love</p>
                <p className={styles.hint}>조각을 드래그하여 중앙 프레임에 맞춰주세요</p>
                <CircularProgress current={snappedCount} total={PIECE_COUNT} />
            </div>

            {/* Glass Panel 타겟 프레임 */}
            <div
                className={styles.targetFrame}
                ref={containerRef}
                style={{ width: gridSize, height: gridSize }}
            >
                {/* 가이드 이미지 */}
                <div className={styles.guideImage} style={{
                    backgroundImage: "url(/images/wedding_pic.jpg)",
                    width: gridSize,
                    height: gridSize,
                }}></div>
                {/* 그리드 가이드 슬롯 */}
                {Array.from({ length: PIECE_COUNT }).map((_, i) => {
                    const row = Math.floor(i / GRID);
                    const col = i % GRID;
                    const isSnapped = pieces.find(p => p.id === i)?.snapped;
                    return (
                        <div key={`slot-${i}`}
                            className={`${styles.slot} ${!isSnapped && draggingId !== null ? styles.slotHighlight : ""}`}
                            style={{
                                left: col * pieceSize, top: row * pieceSize,
                                width: pieceSize, height: pieceSize,
                            }}
                        />
                    );
                })}
            </div>

            {/* 퍼즐 조각들 */}
            {pieces.map((piece) => {
                const edges = edgesData[piece.id];
                if (!edges) return null;
                const path = buildJigsawPath(edges);
                const isDragging = draggingId === piece.id;
                const isShaking = shakeId === piece.id;
                const isSnapAnim = snapAnimId === piece.id;

                // 조각 클래스 조합
                let pieceClass = styles.piece;
                if (piece.snapped) pieceClass += ` ${styles.snapped}`;
                if (isDragging) pieceClass += ` ${styles.dragging}`;
                if (isShaking) pieceClass += ` ${styles.shake}`;
                if (isSnapAnim) pieceClass += ` ${styles.snapBounce} ${styles.snapGlow}`;

                return (
                    <div
                        key={piece.id}
                        className={pieceClass}
                        style={{
                            left: piece.x - tabExtra,
                            top: piece.y - tabExtra,
                            width: svgSize,
                            height: svgSize,
                            transform: isDragging ? "scale(1.06)" : `rotate(${piece.rotation}deg)`,
                            zIndex: piece.zIndex,
                        }}
                        onMouseDown={(e) => handlePointerDown(e, piece.id)}
                        onTouchStart={(e) => handlePointerDown(e, piece.id)}
                    >
                        <svg width={svgSize} height={svgSize}
                            viewBox={`${-tabExtra / pieceSize} ${-tabExtra / pieceSize} ${svgSize / pieceSize} ${svgSize / pieceSize}`}>
                            <defs>
                                <clipPath id={`piece-clip-${piece.id}`}>
                                    <path d={path} />
                                </clipPath>
                                {/* 내측 엠보 효과용 필터 */}
                                <filter id={`emboss-${piece.id}`}>
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.008" result="blur" />
                                    <feOffset in="blur" dx="0.003" dy="0.003" result="offsetBlur" />
                                    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                                </filter>
                            </defs>
                            <image
                                href="/images/wedding_pic.jpg"
                                x={-piece.col}
                                y={-piece.row}
                                width={GRID}
                                height={GRID}
                                clipPath={`url(#piece-clip-${piece.id})`}
                                preserveAspectRatio="xMidYMid slice"
                                filter={`url(#emboss-${piece.id})`}
                            />
                            {/* 골드/크림 테두리 */}
                            <path d={path} fill="none"
                                stroke={isSnapAnim ? "rgba(212,165,116,0.6)" : "rgba(212,165,116,0.15)"}
                                strokeWidth="0.012"
                                style={{ transition: "stroke 0.3s ease" }}
                            />
                            {/* 내측 vignette 효과 */}
                            <path d={path} fill="none"
                                stroke="rgba(0,0,0,0.15)"
                                strokeWidth="0.025"
                                style={{ filter: "blur(0.5px)" }}
                            />
                        </svg>
                    </div>
                );
            })}

            {/* Confetti 캔버스 */}
            <canvas ref={confettiRef} className={styles.confettiCanvas} />

            {/* 완성 화면 */}
            {solved && (
                <div className={styles.completeOverlay}>
                    <div className={styles.completePhoto}>
                        <img
                            src="/images/wedding_pic.jpg"
                            alt="웨딩 사진"
                            className={styles.completePhotoImg}
                        />
                    </div>
                    <div className={styles.completeContent}>
                        <h2 className={styles.completeTitle}>We&apos;re Getting Married</h2>
                        <p className={styles.completeSubtitle}>저희의 특별한 시작에 함께해 주세요</p>
                        <button className={styles.enterBtn} onClick={onComplete}>
                            Enter Invitation
                        </button>
                    </div>
                </div>
            )}

            {/* Skip */}
            <button className={styles.skipBtn} onClick={onSkip}>
                <span>Skip</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 4l10 8-10 8V4z" /><line x1="19" y1="5" x2="19" y2="19" />
                </svg>
            </button>
        </div>
    );
}
