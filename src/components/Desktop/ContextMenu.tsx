'use client';

import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';
import { Info, Trash2, Edit2, PlusCircle } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAdd: () => void;
    onDelete: () => void;
    onInfo: () => void;
    targetAppId: string | null;
}

export default function ContextMenu({
    x,
    y,
    onClose,
    onAdd,
    onDelete,
    onInfo,
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
            <button
                className={`${styles.menuItem} ${!isAppSelected ? styles.disabled : ''}`}
                onClick={() => { if (isAppSelected) { onInfo(); onClose(); } }}
            >
                <Info size={16} /> 앱 정보
            </button>
            <button
                className={`${styles.menuItem} ${!isAppSelected ? styles.disabled : ''}`}
                onClick={() => { if (isAppSelected) { onDelete(); onClose(); } }}
            >
                <Trash2 size={16} /> 앱 삭제
            </button>

            <div className={styles.divider} />

            <button
                className={`${styles.menuItem} ${isAppSelected ? styles.disabled : ''}`}
                onClick={() => { if (!isAppSelected) { onAdd(); onClose(); } }}
            >
                <PlusCircle size={16} /> 앱 추가
            </button>
        </div>
    );
}
