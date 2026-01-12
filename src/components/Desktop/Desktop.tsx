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
        default:
            if (iconName.startsWith('http')) {
                return <img src={iconName} alt="App Icon" style={{ width: 24, height: 24, borderRadius: 4 }} />;
            }
            return <Monitor size={24} />;
    }
};

import ContextMenu from './ContextMenu';
import { AddEditModal, DeleteModal } from './AppModals';

export default function Desktop() {
    const { windows, openWindow } = useWindowStore();
    const { apps, updateAppPosition, addApp, deleteApp, updateApp } = useAppStore();
    const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, targetId: string | null } | null>(null);

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<App | null>(null);

    const handleContextMenu = (e: React.MouseEvent, appId: string | null = null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, targetId: appId });

        if (appId) {
            setSelectedApp(apps.find(a => a.id === appId) || null);
        } else {
            setSelectedApp(null);
        }
    };

    const handleAddApp = (data: { name: string; url: string; icon: string }) => {
        addApp({
            id: crypto.randomUUID(),
            name: data.name,
            launchUrl: data.url,
            icon: data.icon,
        });
    };

    const handleEditApp = (data: { name: string; url: string; icon: string }) => {
        if (selectedApp) {
            updateApp(selectedApp.id, {
                name: data.name,
                launchUrl: data.url,
                icon: data.icon,
            });
        }
    };

    const onDragStart = (e: React.DragEvent, appId: string) => {
        setDraggedAppId(appId);
        e.dataTransfer.effectAllowed = 'move';
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
        <div className={styles.desktop} onContextMenu={(e) => handleContextMenu(e)}>
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
                        onContextMenu={(e) => handleContextMenu(e, app.id)}
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

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    targetAppId={contextMenu.targetId}
                    onClose={() => setContextMenu(null)}
                    onAdd={() => setIsAddOpen(true)}
                    onDelete={() => setIsDeleteOpen(true)}
                    onInfo={() => setIsEditOpen(true)}
                />
            )}

            <AddEditModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                mode="ADD"
                onConfirm={handleAddApp}
            />
            <AddEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                mode="EDIT"
                app={selectedApp}
                onConfirm={handleEditApp}
            />
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                appName={selectedApp?.name || ''}
                onConfirm={() => selectedApp && deleteApp(selectedApp.id)}
            />

            {windows.map((window) => (
                <Window key={window.windowId} win={window} />
            ))}
        </div>
    );
}
