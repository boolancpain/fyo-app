'use client';

import { useState } from 'react';
import LockScreen from '@/components/LockScreen/LockScreen';
import Desktop from '@/components/Desktop/Desktop';
import Taskbar from '@/components/Taskbar/Taskbar';

type AppState = 'LOCK' | 'DESKTOP';

export default function Home() {
    const [appState, setAppState] = useState<AppState>('LOCK');

    const handleLogin = () => {
        setAppState('DESKTOP');
    };

    if (appState === 'LOCK') {
        return <LockScreen onLogin={handleLogin} />;
    }

    return (
        <main style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Desktop />
            <Taskbar />
        </main>
    );
}
