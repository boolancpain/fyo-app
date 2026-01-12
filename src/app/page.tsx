'use client';

import { useState, useEffect } from 'react';
import LockScreen from '@/components/LockScreen/LockScreen';
import Desktop from '@/components/Desktop/Desktop';
import Taskbar from '@/components/Taskbar/Taskbar';
import { useConfigStore } from '@/store/useConfigStore';

type AppState = 'LOCK' | 'DESKTOP';

export default function Home() {
    const [appState, setAppState] = useState<AppState>('LOCK');
    const { fetchConfigs } = useConfigStore();

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const handleLogin = () => {
        setAppState('DESKTOP');
    };

    return (
        <main style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
            <Desktop />
            <Taskbar onLock={() => setAppState('LOCK')} />
            <LockScreen
                isVisible={appState === 'LOCK'}
                onLogin={handleLogin}
            />
        </main>
    );
}
