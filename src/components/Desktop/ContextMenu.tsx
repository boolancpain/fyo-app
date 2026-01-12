'use client';

import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';
import { Info, Trash2, Edit2, PlusCircle, Image as ImageIcon } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAdd: () => void;
    onDelete: () => void;
    onInfo: () => void;
    onWallpaperChange?: () => void;
    targetAppId: string | null;
}

export default function ContextMenu({
    x,
    y,
    onClose,
    onAdd,
    onDelete,
    onInfo,
    onWallpaperChange,
    targetAppId
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position if menu goes off screen
    const top = y;
    const left = x;

    const isAppSelected = !!targetAppId;

    return (
        <div
            ref={menuRef}
            className={styles.contextMenu}
            style={{ top: `${top}px`, left: `${left}px` }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {isAppSelected ? (
                <>
                    <button
                        className={styles.menuItem}
                        onClick={() => { onInfo(); onClose(); }}
                    >
                        <Info size={16} /> 앱 정보
                    </button>
                    <button
                        className={styles.menuItem}
                        onClick={() => { onDelete(); onClose(); }}
                    >
                        <Trash2 size={16} /> 앱 삭제
                    </button>
                    <div className={styles.divider} />
                </>
            ) : null}

            {!isAppSelected ? (
                <>
                    <button
                        className={styles.menuItem}
                        onClick={() => { onAdd(); onClose(); }}
                    >
                        <PlusCircle size={16} /> 앱 추가
                    </button>
                    <button
                        className={styles.menuItem}
                        onClick={() => { if (onWallpaperChange) { onWallpaperChange(); onClose(); } }}
                    >
                        <ImageIcon size={16} /> 배경화면 변경
                    </button>
                </>
            ) : null}
        </div>
    );
}
