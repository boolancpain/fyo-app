'use client';

import { useState } from 'react';
import styles from './Desktop.module.css';
import { useWindowStore } from '@/store/useWindowStore';
import { useAppStore, App } from '@/store/useAppStore';
import { Monitor, Github, Search } from 'lucide-react';
import Window from '@/components/Window/Window';

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'search': return <Search size={24} />;
        case 'monitor': return <Monitor size={24} />;
        case 'github': return <Github size={24} />;
        default: return <Monitor size={24} />;
    }
};

export default function Desktop() {
    const { windows, openWindow } = useWindowStore();
    const { apps, updateAppPosition } = useAppStore();
    const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

    const onDragStart = (e: React.DragEvent, appId: string) => {
        setDraggedAppId(appId);
        e.dataTransfer.effectAllowed = 'move';
        // Hide the original element slightly while dragging
        setTimeout(() => {
            const target = e.target as HTMLElement;
            target.style.opacity = '0.4';
        }, 0);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedAppId) return;

        const container = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - container.left;
        const y = e.clientY - container.top;

        // Grid cell size: 100px width + 10px gap, 110px height + 10px gap
        const col = Math.max(1, Math.floor(x / 110) + 1);
        const row = Math.max(1, Math.floor(y / 120) + 1);

        updateAppPosition(draggedAppId, { row, col });
        setDraggedAppId(null);
    };

    const onDragEnd = (e: React.DragEvent) => {
        setDraggedAppId(null);
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
    };

    return (
        <div className={styles.desktop}>
            <div
                className={styles.desktopIcons}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {apps.map((app) => (
                    <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, app.id)}
                        onDragEnd={onDragEnd}
                        className={`${styles.icon} ${draggedAppId === app.id ? styles.dragging : ''}`}
                        style={{
                            gridColumn: app.gridPosition.col,
                            gridRow: app.gridPosition.row,
                        }}
                        onDoubleClick={() => openWindow({ id: app.id, name: app.name, launchUrl: app.launchUrl })}
                    >
                        <div className={`${styles.iconImg} glass`}>
                            {getIcon(app.icon)}
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
