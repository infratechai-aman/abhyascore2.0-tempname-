import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Trophy, Medal, Crown, Star, Target } from 'lucide-react';

export default function Leaderboard() {
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            try {
                const q = query(
                    collection(db, 'users'),
                    orderBy('stats.xp', 'desc'),
                    limit(20)
                );
                const snap = await getDocs(q);
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setPlayers(list);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopPlayers();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown size={20} style={{ color: '#f59e0b' }} />;
        if (index === 1) return <Medal size={20} style={{ color: '#94a3b8' }} />;
        if (index === 2) return <Medal size={20} style={{ color: '#b45309' }} />;
        return <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{index + 1}</span>;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div className="breadcrumb">
                    <span>Admin</span><span>/</span><span>Leaderboard</span>
                </div>
                <h1>Global Leaderboard</h1>
                <p>Top performers across all subjects and tiers.</p>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Rank</th>
                                <th>Student</th>
                                <th>Stream</th>
                                <th>Level</th>
                                <th>Total XP</th>
                                <th>Battles</th>
                                <th>Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((p, idx) => {
                                const stats = p.stats || {};
                                const accuracy = stats.totalQuestions > 0
                                    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
                                    : 0;

                                return (
                                    <tr key={p.id}>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {getRankIcon(idx)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 800, fontSize: '0.8rem'
                                                }}>
                                                    {p.name?.[0]?.toUpperCase() || 'S'}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600 }}>{p.name || 'Anonymous Student'}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${p.stream === 'JEE' ? 'primary' : 'secondary'}`}>
                                                {p.stream || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Star size={14} fill="currentColor" color="#f59e0b" />
                                                <span style={{ fontWeight: 700 }}>Lvl {stats.lvl || 1}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{stats.xp || 0}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Target size={14} color="var(--text-muted)" />
                                                <span>{stats.totalTests || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: '4px', background: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${accuracy}%`, height: '100%', background: accuracy > 70 ? '#22c55e' : '#f59e0b' }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{accuracy}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {players.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No players found in the system yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
