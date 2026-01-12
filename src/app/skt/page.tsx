'use client';

import React from 'react';
import styles from './skt.module.css';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SKTAccount {
    id: string;
    name: string;
    enrollDate: string;
    account: string;
    pw: string;
    years: number;
    lastActivationDate: string;
    contractEndDate: string;
    memo: string;
}

export default function SKTPage() {
    const [data, setData] = React.useState<SKTAccount[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

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
                                <th>이름</th>
                                <th>최초가입일</th>
                                <th>계정</th>
                                <th>비밀번호</th>
                                <th>가입년수</th>
                                <th>최근개통일</th>
                                <th>약정종료일</th>
                                <th>비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.enrollDate}</td>
                                    <td>{item.account}</td>
                                    <td>
                                        <span className={styles.password}>{item.pw}</span>
                                    </td>
                                    <td>
                                        <span className={styles.years}>{item.years}년</span>
                                    </td>
                                    <td>{item.lastActivationDate}</td>
                                    <td>{item.contractEndDate}</td>
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
