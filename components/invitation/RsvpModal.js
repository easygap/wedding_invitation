"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./RsvpModal.module.css";

export default function RsvpModal({ onClose }) {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        side: "신랑",
        attendance: "참석",
        meal: "식사예정",
        name: "",
        companions: "",
        message: "",
        privacy: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 모달 열릴 때 백그라운드 스크롤 방지
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("성함을 입력해주세요.");
            return;
        }
        if (!formData.privacy) {
            alert("개인정보 수집 및 활용에 동의해주세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            // FormSubmit.co를 사용한 이메일 전송
            const res = await fetch("https://formsubmit.co/ajax/dlwnstndlwld@naver.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    _subject: `[청첩장 RSVP] ${formData.name}님 참석 여부`,
                    구분: formData.side,
                    성함: formData.name,
                    참석여부: formData.attendance,
                    식사여부: formData.meal,
                    동행인원: formData.companions || "없음",
                    메시지: formData.message || "없음",
                }),
            });

            if (res.ok) {
                alert("참석 여부가 전달되었습니다. 감사합니다!");
                onClose();
            } else {
                throw new Error("전송 실패");
            }
        } catch (error) {
            console.error("RSVP Error:", error);
            alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>참석 여부 전달</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <form className={styles.rsvpForm} onSubmit={handleSubmit}>

                    {/* 구분 (신랑/신부) */}
                    <div className={styles.formGroup}>
                        <label>어느 측 하객이신가요? <span className={styles.req}>*</span></label>
                        <div className={styles.btnGroup}>
                            <label className={formData.side === "신랑" ? styles.active : ""}>
                                <input type="radio" name="side" value="신랑" checked={formData.side === "신랑"} onChange={handleChange} />
                                신랑
                            </label>
                            <label className={formData.side === "신부" ? styles.active : ""}>
                                <input type="radio" name="side" value="신부" checked={formData.side === "신부"} onChange={handleChange} />
                                신부
                            </label>
                        </div>
                    </div>

                    {/* 참석 여부 */}
                    <div className={styles.formGroup}>
                        <label>참석여부 <span className={styles.req}>*</span></label>
                        <div className={styles.btnGroup}>
                            <label className={formData.attendance === "참석" ? styles.active : ""}>
                                <input type="radio" name="attendance" value="참석" checked={formData.attendance === "참석"} onChange={handleChange} />
                                참석
                            </label>
                            <label className={formData.attendance === "불참석" ? styles.active : ""}>
                                <input type="radio" name="attendance" value="불참석" checked={formData.attendance === "불참석"} onChange={handleChange} />
                                불참석
                            </label>
                        </div>
                    </div>

                    {/* 식사 여부 */}
                    <div className={styles.formGroup}>
                        <label>식사여부 <span className={styles.req}>*</span></label>
                        <div className={styles.btnGroup3}>
                            <label className={formData.meal === "식사예정" ? styles.active : ""}>
                                <input type="radio" name="meal" value="식사예정" checked={formData.meal === "식사예정"} onChange={handleChange} />
                                ○
                            </label>
                            <label className={formData.meal === "식사안함" ? styles.active : ""}>
                                <input type="radio" name="meal" value="식사안함" checked={formData.meal === "식사안함"} onChange={handleChange} />
                                ×
                            </label>
                            <label className={formData.meal === "미정" ? styles.active : ""}>
                                <input type="radio" name="meal" value="미정" checked={formData.meal === "미정"} onChange={handleChange} />
                                미정
                            </label>
                        </div>
                    </div>

                    {/* 성함 */}
                    <div className={styles.formGroup}>
                        <label>성함 <span className={styles.req}>*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="성함을 입력해주세요"
                            className={styles.inputText}
                        />
                    </div>

                    {/* 동행인 수 */}
                    <div className={styles.formGroup}>
                        <label>동행인 수(본인 제외)</label>
                        <input
                            type="text"
                            name="companions"
                            value={formData.companions}
                            onChange={handleChange}
                            placeholder="숫자만 입력해주세요 (없으면 공란)"
                            className={styles.inputText}
                        />
                    </div>

                    {/* 전달사항 */}
                    <div className={styles.formGroup}>
                        <label>전달사항</label>
                        <textarea
                            name="message"
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="전달하실 말씀이 있다면 적어주세요."
                            className={styles.textarea}
                        />
                    </div>

                    {/* 개인정보 동의 */}
                    <div className={styles.privacyCheck}>
                        <label>
                            <input
                                type="checkbox"
                                name="privacy"
                                checked={formData.privacy}
                                onChange={handleChange}
                            />
                            개인정보 수집 및 활용 동의
                        </label>
                        <span className={styles.privacyLink}>[자세히보기]</span>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? "전송 중..." : "전달"}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
