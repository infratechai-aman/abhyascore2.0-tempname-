import React from 'react';
import { auth } from '../firebase/firebase';

export default function Navbar({ onMenuToggle }) {
    const user = auth.currentUser;
    const initial = user?.email?.[0]?.toUpperCase() ?? 'A';

    return (
        <header className="app-header">
            {/* Left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Hamburger (mobile) */}
                <button
                    onClick={onMenuToggle}
                    className="header-icon-btn"
                    aria-label="Toggle menu"
                >
                    <svg style={{ width: '1.125rem', height: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Search hint */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--bg)', border: '1px solid var(--input-border)',
                    borderRadius: 'var(--radius-md)', padding: '0.375rem 0.75rem',
                    fontSize: '0.8125rem', color: 'var(--text-muted)',
                    minWidth: '180px',
                }}>
                    <svg style={{ width: '0.875rem', height: '0.875rem', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                    </svg>
                    <span>Search...</span>
                </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Notification */}
                <button className="header-icon-btn" aria-label="Notifications" style={{ position: 'relative' }}>
                    <svg style={{ width: '1.125rem', height: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span style={{
                        position: 'absolute', top: '7px', right: '7px',
                        width: '6px', height: '6px',
                        background: 'rgb(76,175,80)',
                        borderRadius: '50%',
                        border: '1.5px solid var(--surface)'
                    }} />
                </button>

                {/* Settings */}
                <button className="header-icon-btn" aria-label="Settings">
                    <svg style={{ width: '1.125rem', height: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                {/* Divider */}
                <div style={{ width: '1px', height: '1.5rem', background: 'var(--border)', margin: '0 0.25rem' }} />

                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div className="header-avatar">{initial}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.2 }}>Admin</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email ?? '—'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
