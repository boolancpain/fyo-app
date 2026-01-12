'use client';

import { useState } from 'react';
import styles from './LockScreen.module.css';

interface Props {
    onLogin: () => void;
}

export default function LockScreen({ onLogin }: Props) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            onLogin();
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 2000);
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
                        placeholder="Enter Passcode (1234)"
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
