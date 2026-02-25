import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import EconomyPanel from '../components/EconomyPanel';

const fmtDate = (ts) => {
    if (!ts) return 'Never';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Users() {
    const { users, totalLoaded, loading, loadingMore, error, hasMore, loadMore, searchQuery, setSearchQuery, refresh } = useUsers();
    const [expandedUserId, setExpandedUserId] = useState(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Header ────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div className="breadcrumb">
                        <span>Admin</span>
                        <span>/</span>
                        <span>Users</span>
                    </div>
                    <h1>Users</h1>
                    <p>{loading ? 'Loading users…' : `${totalLoaded} users loaded`}</p>
                </div>
            </div>

            {/* ── Search ────────────────────────────────────────────────── */}
            <div style={{ position: 'relative', maxWidth: '22rem' }}>
                <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                />
            </div>

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && (
                <div style={{
                    background: 'rgba(230,83,60,0.08)', border: '1px solid rgba(230,83,60,0.25)',
                    borderRadius: '0.625rem', padding: '0.75rem 1rem',
                    fontSize: '0.8125rem', color: 'rgb(var(--danger-rgb))'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* ── Table Card ────────────────────────────────────────────── */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '3rem', borderRadius: '0.5rem' }} />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p style={{ fontWeight: 500, color: 'var(--text-default)' }}>
                            {searchQuery ? `No users matching "${searchQuery}"` : 'No users found'}
                        </p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th style={{ textAlign: 'right' }}>XP</th>
                                    <th style={{ textAlign: 'right' }}>Gold</th>
                                    <th style={{ textAlign: 'right' }}>Streak</th>
                                    <th style={{ textAlign: 'right' }}>Tests</th>
                                    <th style={{ textAlign: 'right' }}>Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <React.Fragment key={user.id}>
                                        <tr
                                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                                            style={{ cursor: 'pointer', background: expandedUserId === user.id ? 'var(--primary-005)' : 'transparent' }}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                    <div style={{
                                                        width: '2rem', height: '2rem', flexShrink: 0,
                                                        background: 'var(--primary-01)', color: 'var(--primary)',
                                                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {user.email?.[0] ?? '?'}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '14rem' }}>
                                                            {user.email ?? '—'}
                                                        </span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UID: {user.id.slice(0, 8)}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                                    {(user.stats?.xp ?? 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: 600, color: 'rgb(var(--warning-rgb))' }}>
                                                    {(user.stats?.gold ?? 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span style={{ color: 'rgb(var(--orange-rgb))', fontWeight: 600 }}>
                                                    🔥 {user.stats?.streak ?? 0}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className="badge badge-primary">{user.stats?.totalTests ?? 0}</span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="btn btn-icon btn-sm" style={{ color: expandedUserId === user.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                    {expandedUserId === user.id ? '▲' : '⚙️'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedUserId === user.id && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '0 1rem 1rem 1rem', borderTop: 'none' }}>
                                                    <EconomyPanel
                                                        user={user}
                                                        onUpdate={() => {
                                                            refresh();
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--card-border)',
                    background: 'rgba(var(--primary-rgb), 0.02)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap'
                }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Showing {users.length} of {totalLoaded} loaded
                        {searchQuery && ' (filtered)'}
                    </p>
                    {hasMore && !searchQuery && (
                        <button onClick={loadMore} disabled={loadingMore} className="btn btn-outline btn-sm">
                            {loadingMore ? 'Loading…' : 'Load more'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
