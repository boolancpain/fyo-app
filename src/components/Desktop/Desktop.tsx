'use client';

import styles from './Desktop.module.css';
import { useWindowStore } from '@/store/useWindowStore';
import { AppWindow, Monitor, Github, Search } from 'lucide-react';
import Window from '@/components/Window/Window';

const DEFAULT_APPS = [
    { id: 'google', name: 'Google', launchUrl: 'https://www.google.com/search?igu=1', icon: <Search size={24} /> },
    { id: 'vscode', name: 'VS Code', launchUrl: 'https://vscode.dev', icon: <Monitor size={24} /> },
    { id: 'github', name: 'GitHub', launchUrl: 'https://github.com', icon: <Github size={24} /> },
];

export default function Desktop() {
    const { windows, openWindow } = useWindowStore();

    return (
        <div className={styles.desktop}>
            <div className={styles.desktopIcons}>
                {DEFAULT_APPS.map((app) => (
                    <div
                        key={app.id}
                        className={styles.icon}
                        onDoubleClick={() => openWindow(app)}
                    >
                        <div className={`${styles.iconImg} glass`}>
                            {app.icon}
                        </div>
                        <span className={styles.iconName}>{app.name}</span>
                    </div>
                ))}
            </div>

            {windows.map((window) => (
                <Window key={window.windowId} win={window} />
            ))}
        </div>
    );
}
