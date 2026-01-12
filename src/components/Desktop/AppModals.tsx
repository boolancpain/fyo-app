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

export function AddEditModal({ isOpen, onClose, mode, app, onConfirm }: AddEditModalProps) {
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
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
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
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
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
