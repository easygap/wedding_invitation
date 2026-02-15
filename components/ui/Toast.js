"use client";

import { useEffect, useState } from "react";
import styles from "./Toast.module.css";

export default function Toast({ message }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 2000);
            return () => clearTimeout(t);
        }
    }, [message]);

    return (
        <div className={`${styles.toast} ${visible ? styles.show : ""}`}>
            {message}
        </div>
    );
}
