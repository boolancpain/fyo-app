'use client';

import { useState, useEffect } from 'react';
import styles from './LockScreen.module.css';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface Props {
    onLogin: () => void;
    isVisible: boolean;
}

export default function LockScreen({ onLogin, isVisible }: Props) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!isVisible) {
            setPassword('');
            setError(false);
        }
    }, [isVisible]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();

            if (data.success) {
                onLogin();
            } else {
                setError(true);
                setPassword('');
                setTimeout(() => setError(false), 2000);
            }
        } catch (err) {
            console.error('Login failed', err);
            setError(true);
        }
    };

    if (!mounted) return null;

    return (
        <div className={`${styles.container} ${!isVisible ? styles.hidden : ''}`}>
            <div className={styles.content}>
                <div className={styles.clockContainer}>
                    <h1 className={styles.timeText}>
                        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h1>
                    <p className={styles.dateText}>
                        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
                        <input
                            type="password"
                            placeholder="Enter Passcode"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className={`${styles.submitBtn} ${password ? styles.visible : ''}`}>
                            <ChevronRight size={20} color="white" />
                        </button>
                        {error && <p className={styles.errorMessage}>Invalid passcode</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
