'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './AppModals.module.css';
import { App } from '@/store/useAppStore';
import * as LucideIcons from 'lucide-react';
import { Upload, Search, Link as LinkIcon, Loader2, File } from 'lucide-react';

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
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (mode === 'EDIT' && app) {
            setName(app.name || '');
            setUrl(app.launchUrl || '');
            setIcon(app.icon || '');
        } else {
            setName('');
            setUrl('');
            setIcon('');
        }
        setPendingFile(null);
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
    }, [mode, app, isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            const previewUrl = URL.createObjectURL(file);
            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
            setLocalPreviewUrl(previewUrl);
            // Set icon to a dummy value to indicate something is selected
            setIcon('pending_upload');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let finalIcon = icon;

            // If it was a dummy icon and we have a file, upload it
            if (finalIcon === 'pending_upload' && pendingFile) {
                const res = await fetch(`/api/upload?filename=${encodeURIComponent(pendingFile.name)}`, {
                    method: 'POST',
                    body: pendingFile,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Upload failed');
                }
                const data = await res.json();
                finalIcon = data.url;
            }

            // Fallback to null for default icon
            if (!finalIcon || finalIcon === 'pending_upload') {
                finalIcon = null as any; // Cast for now, but finalIcon should be string | null
            }

            onConfirm({
                name,
                url,
                icon: finalIcon,
            });
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2>{mode === 'ADD' ? '새 애플리케이션 추가' : '애플리케이션 정보 수정'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>이름</label>
                        <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="애플리케이션 이름"
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>실행 URL</label>
                        <input
                            required
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>아이콘 설정</label>
                        <div className={styles.iconContent}>
                            <div className={styles.imageTabContent}>
                                <div
                                    className={styles.uploadArea}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    {isUploading ? (
                                        <div className={styles.uploading}>
                                            <Loader2 size={32} className={styles.spin} />
                                            <span>업로드 중...</span>
                                        </div>
                                    ) : pendingFile ? (
                                        <div className={styles.uploadPreview}>
                                            {localPreviewUrl && <img src={localPreviewUrl} alt="local preview" />}
                                            <span>{pendingFile.name} (선택됨)</span>
                                        </div>
                                    ) : (
                                        <div className={styles.uploadPlaceholder}>
                                            <Upload size={32} />
                                            <span>클릭하여 이미지 업로드</span>
                                            <span style={{ fontSize: '12px', opacity: 0.7 }}>또는 아래에 직접 URL 입력</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.urlInputArea}>
                                    <div className={styles.divider}>
                                        <span>또는</span>
                                    </div>
                                    <input
                                        value={icon && (icon.startsWith('http') || icon.startsWith('/api/blob')) ? icon : ''}
                                        onChange={e => {
                                            setIcon(e.target.value);
                                            setPendingFile(null);
                                            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                                            setLocalPreviewUrl(null);
                                        }}
                                        placeholder="이미지 URL을 직접 입력"
                                    />
                                </div>
                            </div>
                        </div>
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
