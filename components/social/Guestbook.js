"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Guestbook.module.css";

const STORAGE_KEY = "wedding_guestbook";

export default function Guestbook() {
    const ref = useRef(null);
    const [messages, setMessages] = useState([]);
    const [form, setForm] = useState({ name: "", message: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 스크롤 reveal
    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // localStorage에서 불러오기
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setMessages(JSON.parse(stored));
        } catch { }
    }, []);

    // 저장
    const saveMessages = (msgs) => {
        setMessages(msgs);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch { }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.message.trim()) return;

        setIsSubmitting(true);
        const newMsg = {
            id: Date.now(),
            name: form.name.trim(),
            message: form.message.trim(),
            password: form.password,
            createdAt: new Date().toISOString(),
        };

        const updated = [newMsg, ...messages];
        saveMessages(updated);
        setForm({ name: "", message: "", password: "" });
        setTimeout(() => setIsSubmitting(false), 300);
    };

    const handleDelete = (id) => {
        const msg = messages.find(m => m.id === id);
        const pwd = prompt("비밀번호를 입력해주세요");
        if (pwd === msg?.password) {
            saveMessages(messages.filter(m => m.id !== id));
        } else if (pwd !== null) {
            alert("비밀번호가 일치하지 않습니다.");
        }
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
    };

    return (
        <section ref={ref} className={`${styles.guestbookSection} reveal-section`}>
            <div className="section-container">
                <div className="section-header">
                    <p className="section-subtitle">GUESTBOOK</p>
                    <h2 className="section-title">방명록</h2>
                </div>
                <p className={styles.desc}>축하 메시지를 남겨주세요</p>

                {/* 입력 폼 */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <input
                            type="text"
                            placeholder="이름"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className={styles.inputName}
                            maxLength={20}
                            required
                        />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className={styles.inputPassword}
                            maxLength={10}
                        />
                    </div>
                    <textarea
                        placeholder="축하 메시지를 남겨주세요 💕"
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className={styles.textarea}
                        rows={3}
                        maxLength={200}
                        required
                    />
                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? "등록 중..." : "메시지 남기기"}
                    </button>
                </form>

                {/* 메시지 목록 */}
                <div className={styles.messageList}>
                    {messages.length === 0 && (
                        <p className={styles.emptyMsg}>아직 메시지가 없습니다. 첫 번째 축하 메시지를 남겨주세요! 🎉</p>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} className={styles.messageCard}>
                            <div className={styles.messageHeader}>
                                <span className={styles.messageName}>💌 {msg.name}</span>
                                <span className={styles.messageDate}>{formatDate(msg.createdAt)}</span>
                            </div>
                            <p className={styles.messageText}>{msg.message}</p>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(msg.id)}>삭제</button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
