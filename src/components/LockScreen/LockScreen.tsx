'use client';

import { useState } from 'react';
import styles from './LockScreen.module.css';

interface Props {
    onLogin: () => void;
}

export default function LockScreen({ onLogin }: Props) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

    return (
        <div className={styles.container}>
            <div className={styles.overlay} />
            <div className={`${styles.lockCard} glass`}>
                <div className={styles.userAvatar}>
                    <div className={styles.avatarCircle}>
                        <span>FY</span>
                    </div>
                </div>
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="password"
                        placeholder="Enter Passcode"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={error ? styles.inputError : ''}
                        autoFocus
                    />
                    <button type="submit">Sign In</button>
                </form>
                {error && <p className={styles.errorMessage}>Invalid passcode. Please try again.</p>}
            </div>
            <div className={styles.footer}>
                <p>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>{new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
}
