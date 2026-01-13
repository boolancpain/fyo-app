'use client';

import React from 'react';
import styles from './skt.module.css';
import { AlertCircle, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SKTAccount {
    id: string;
    icon?: string | null;
    service: string;
    name: string;
    signupDt: string;
    account: string;
    pwd: string;
    years: number;
    activationDt: string;
    expirationDt: string;
    memo: string;
}

type SortKey = keyof SKTAccount;

export default function SKTPage() {
    const [data, setData] = React.useState<SKTAccount[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/skt');
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch data');
                }
                const result = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const sortedData = React.useMemo(() => {
        if (!sortConfig) return data;

        const sorted = [...data].sort((a, b) => {
            const aValue = (a[sortConfig.key] ?? '') as string | number;
            const bValue = (b[sortConfig.key] ?? '') as string | number;

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }, [data, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronsUpDown size={14} className={styles.sortIcon} />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} className={styles.sortIcon} />
            : <ChevronDown size={14} className={styles.sortIcon} />;
    };

    const renderHeader = (label: string, key: SortKey) => (
        <th
            className={`${styles.sortableHeader} ${sortConfig?.key === key ? styles.activeSort : ''}`}
            onClick={() => requestSort(key)}
        >
            <div className={styles.headerContent}>
                {label}
                {getSortIcon(key)}
            </div>
        </th>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SKT 계정 관리</h1>
            </header>

            <div className={styles.cautionArea}>
                <AlertCircle className={styles.cautionIcon} size={24} />
                <div className={styles.cautionText}>
                    고가 요금제 개통 후에 요금제 내릴때는 <strong>42,000</strong>원 이상의 요금제로 변경해야 함!
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : error ? (
                <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>
                    오류 발생: {error}
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {renderHeader('서비스', 'service')}
                                {renderHeader('이름', 'name')}
                                {renderHeader('가입년수', 'years')}
                                {renderHeader('약정종료일', 'expirationDt')}
                                {renderHeader('최근개통일', 'activationDt')}
                                {renderHeader('계정', 'account')}
                                {renderHeader('비밀번호', 'pwd')}
                                {renderHeader('비고', 'memo')}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600, color: '#ffd700' }}>
                                        <span style={{ marginRight: '8px' }}>{item.icon}</span>
                                        {item.service}
                                    </td>
                                    <td>{item.name}</td>
                                    <td>
                                        <span className={styles.years}>{item.years}년</span>
                                    </td>
                                    <td>{item.expirationDt}</td>
                                    <td>{item.activationDt}</td>
                                    <td>{item.account}</td>
                                    <td>{item.pwd}</td>
                                    <td>{item.memo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
