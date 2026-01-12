'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './Taskbar.module.css';
import { useWindowStore } from '@/store/useWindowStore';
import { LayoutGrid, Lock } from 'lucide-react';

interface TaskbarProps {
    onLock: () => void;
}

export default function Taskbar({ onLock }: TaskbarProps) {
    const { windows, focusedWindowId, focusWindow, minimizeWindow, reorderWindows } = useWindowStore();
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showStartMenu, setShowStartMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                showStartMenu &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setShowStartMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStartMenu]);

    const handleItemClick = (windowId: string) => {
        if (focusedWindowId === windowId) {
            minimizeWindow(windowId);
        } else {
            focusWindow(windowId);
        }
    };

    const handleStartClick = () => {
        setShowStartMenu(!showStartMenu);
    };

    const handleLock = () => {
        setShowStartMenu(false);
        onLock();
    };

    const onDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        reorderWindows(draggedIndex, index);
        setDraggedIndex(index);
    };

    const onDragEnd = () => {
        setDraggedIndex(null);
    };

    if (!mounted) return <div className={styles.taskbar} />;

    return (
        <>
            {showStartMenu && (
                <div className={styles.startMenu} ref={menuRef}>
                    <button className={styles.menuItem} onClick={handleLock}>
                        <Lock size={16} />
                        <span>잠금</span>
                    </button>
                </div>
            )}
            <div className={`${styles.taskbar} glass`}>
                <div
                    className={styles.startButton}
                    onClick={handleStartClick}
                    ref={buttonRef}
                >
                    <LayoutGrid size={24} color="white" />
                </div>

                <div className={styles.runningApps}>
                    {windows.map((w, index) => (
                        <div
                            key={w.windowId}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDragEnd={onDragEnd}
                            className={`${styles.taskbarItem} ${w.isFocused ? styles.focused : ''} ${w.state === 'MINIMIZED' ? styles.minimized : ''} ${draggedIndex === index ? styles.dragging : ''}`}
                            onClick={() => handleItemClick(w.windowId)}
                        >
                            <div className={styles.indicator} />
                            <span className={styles.appTitle}>{w.title}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.tray}>
                    <div className={styles.timeInfo}>
                        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{time.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
