'use client';

import React, { useState, useEffect } from 'react';
import styles from './AppModals.module.css';
import { App } from '@/store/useAppStore';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AddEditModalProps extends ModalProps {
    mode: 'ADD' | 'EDIT';
    app?: App | null;
    onConfirm: (data: { name: string; url: string; icon: string }) => void;
}


function useEscapeKey(isOpen: boolean, onClose: () => void) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
}

export function AddEditModal({ isOpen, onClose, mode, app, onConfirm }: AddEditModalProps) {
    useEscapeKey(isOpen, onClose);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [icon, setIcon] = useState('');

    useEffect(() => {
        if (mode === 'EDIT' && app) {
            setName(app.name);
            setUrl(app.launchUrl);
            setIcon(app.icon);
        } else {
            setName('');
            setUrl('');
            setIcon('');
        }
    }, [mode, app, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ name, url, icon });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
                <h2>{mode === 'ADD' ? '앱 추가' : '앱 정보'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>이름</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="앱 이름 입력"
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>URL</label>
                        <input
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://..."
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>아이콘 URL (또는 'monitor', 'search', 'github')</label>
                        <input
                            value={icon}
                            onChange={e => setIcon(e.target.value)}
                            placeholder="이미지 URL 또는 키워드"
                            required
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>취소</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnConfirm}`}>
                            {mode === 'ADD' ? '추가' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface DeleteModalProps extends ModalProps {
    appName: string;
    onConfirm: () => void;
}

export function DeleteModal({ isOpen, onClose, appName, onConfirm }: DeleteModalProps) {
    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
                <h2>앱 삭제</h2>
                <p className={styles.description}>'{appName}' 앱을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.</p>
                <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>취소</button>
                    <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => { onConfirm(); onClose(); }}>삭제</button>
                </div>
            </div>
        </div>
    );
}

interface WallpaperModalProps extends ModalProps {
    currentUrl: string;
    onConfirm: (url: string) => void;
}

export function WallpaperModal({ isOpen, onClose, currentUrl, onConfirm }: WallpaperModalProps) {
    useEscapeKey(isOpen, onClose);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUrl(currentUrl || '');
        }
    }, [isOpen, currentUrl]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(url);
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
                <h2>배경화면 변경</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>이미지 URL</label>
                        <input
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://..."
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>취소</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnConfirm}`}>변경</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
