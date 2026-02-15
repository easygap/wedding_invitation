"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import styles from "./Invitation.module.css";

const ACCOUNTS = {
    groom: [
        { label: "신랑 김준수", bank: "국민은행", number: "123-456-789012" },
        { label: "부 이수철", bank: "신한은행", number: "110-234-567890" },
        { label: "모 이성옥", bank: "우리은행", number: "1002-345-678901" },
    ],
    bride: [
        { label: "신부 박윤겸", bank: "카카오뱅크", number: "3333-12-3456789" },
        { label: "부 송재곤", bank: "하나은행", number: "123-45-67890-1" },
        { label: "모 주효리", bank: "농협은행", number: "302-1234-5678-91" },
    ],
};

export default function Account({ showToast }) {
    const ref = useRef(null);
    const [openGroup, setOpenGroup] = useState(null);
    const [qrCodes, setQrCodes] = useState({});

    useEffect(() => {
        const el = ref.current;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); }
        }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // QR코드 생성
    useEffect(() => {
        const generateQR = async () => {
            const allAccounts = [...ACCOUNTS.groom, ...ACCOUNTS.bride];
            const codes = {};
            for (const acc of allAccounts) {
                try {
                    const text = `${acc.bank} ${acc.number} ${acc.label}`;
                    codes[acc.number] = await QRCode.toDataURL(text, {
                        width: 120, margin: 1, color: { dark: "#2C1810", light: "#FFFFFF" }
                    });
                } catch (e) {
                    console.error("QR generation failed:", e);
                }
            }
            setQrCodes(codes);
        };
        generateQR();
    }, []);

    const copyAccount = async (number) => {
        try {
            await navigator.clipboard.writeText(number);
            showToast("계좌번호가 복사되었습니다");
        } catch {
            const ta = document.createElement("textarea");
            ta.value = number;
            ta.style.cssText = "position:fixed;opacity:0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            showToast("계좌번호가 복사되었습니다");
        }
    };

    const toggleGroup = (group) => {
        setOpenGroup(openGroup === group ? null : group);
    };

    const renderGroup = (label, icon, key, accounts) => (
        <div className={styles.accountGroup}>
            <button className={`${styles.accountToggle} ${openGroup === key ? styles.toggleOpen : ""}`}
                onClick={() => toggleGroup(key)}>
                <span>{icon} {label}</span>
                <span className={styles.toggleArrow}>▼</span>
            </button>
            <div className={`${styles.accountList} ${openGroup === key ? styles.accountListOpen : ""}`}>
                {accounts.map((acc, i) => (
                    <div key={i} className={styles.accountItem}>
                        <div className={styles.accountItemTop}>
                            <div>
                                <p className={styles.accountLabel}>{acc.label}</p>
                                <div className={styles.accountNumberWrap}>
                                    <span className={styles.accountBank}>{acc.bank}</span>
                                    <span className={styles.accountNumber}>{acc.number}</span>
                                    <button className={styles.copyBtn} onClick={() => copyAccount(acc.number)}>복사</button>
                                </div>
                            </div>
                            {qrCodes[acc.number] && (
                                <img src={qrCodes[acc.number]} alt="QR코드" className={styles.qrCode} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <section ref={ref} className={`${styles.accountSection} reveal-section`} id="account-section">
            <div className="section-container">
                <div className="section-header">
                    <p className="section-subtitle">ACCOUNT</p>
                    <h2 className="section-title">마음 전하실 곳</h2>
                </div>

                <p className={styles.accountDesc}>
                    참석이 어려우신 분들을 위해<br />
                    계좌번호를 안내해 드립니다.
                </p>
                {renderGroup("신랑측 계좌번호", "🤵", "groom", ACCOUNTS.groom)}
                {renderGroup("신부측 계좌번호", "👰", "bride", ACCOUNTS.bride)}
            </div>
        </section>
    );
}
