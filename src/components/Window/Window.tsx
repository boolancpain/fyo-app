'use client';

import { useRef, useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Window as WindowType } from '@/types/window';
import styles from './Window.module.css';
import { X, Minus, Maximize2, Copy } from 'lucide-react';

interface Props {
    win: WindowType;
}

export default function Window({ win }: Props) {
    const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, updatePosition } = useWindowStore();
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        focusWindow(win.windowId);
        if ((e.target as HTMLElement).closest(`.${styles.titleBar}`)) {
            if (win.state === 'MAXIMIZED') return; // Cannot drag maximized window
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - win.position.x,
                y: e.clientY - win.position.y,
            };
            e.preventDefault();
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                updatePosition(win.windowId, {
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, win.windowId, updatePosition]);

    const isMaximized = win.state === 'MAXIMIZED';
    const isMinimized = win.state === 'MINIMIZED';

    return (
        <div
            className={`${styles.window} ${isMinimized ? styles.minimized : ''} ${isMaximized ? styles.maximized : ''} glass`}
            style={{
                left: isMaximized ? 0 : win.position.x,
                top: isMaximized ? 0 : win.position.y,
                width: isMaximized ? '100vw' : win.size.width,
                height: isMaximized ? 'calc(100vh - 48px)' : win.size.height,
                zIndex: win.zIndex,
                borderRadius: isMaximized ? 0 : '12px',
            }}
            onMouseDown={() => focusWindow(win.windowId)}
        >
            <div className={styles.titleBar} onMouseDown={handleMouseDown} onDoubleClick={() => toggleMaximize(win.windowId)}>
                <div className={styles.titleText}>
                    <span className={styles.title}>{win.title}</span>
                    <span className={styles.url}>{win.launchUrl}</span>
                </div>
                <div className={styles.controls}>
                    <button className={`${styles.controlBtn} ${styles.minimize}`} onClick={(e) => { e.stopPropagation(); minimizeWindow(win.windowId); }}>
                        <Minus size={14} />
                    </button>
                    <button className={`${styles.controlBtn} ${styles.maximize}`} onClick={(e) => { e.stopPropagation(); toggleMaximize(win.windowId); }} title={isMaximized ? "Restore" : "Maximize"}>
                        {isMaximized ? <Copy size={12} /> : <Maximize2 size={14} />}
                    </button>
                    <button className={`${styles.controlBtn} ${styles.close}`} onClick={(e) => { e.stopPropagation(); closeWindow(win.windowId); }}>
                        <X size={14} />
                    </button>
                </div>
            </div>
            <div className={styles.content}>
                {isDragging && <div className={styles.overlay} />}
                <iframe
                    src={win.launchUrl}
                    className={styles.iframeWrapper}
                    title={win.title}
                />
            </div>
        </div>
    );
}
