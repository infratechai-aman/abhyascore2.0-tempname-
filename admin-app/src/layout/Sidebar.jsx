import React from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const navItems = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        color: 'rgb(var(--primary-rgb))',       /* blue */
        activeBg: 'rgba(var(--primary-rgb), 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
            </svg>
        ),
    },
    {
        to: '/users',
        label: 'Users',
        color: 'rgb(207, 102, 121)',             /* rose/pink */
        activeBg: 'rgba(207, 102, 121, 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        to: '/questions',
        label: 'Questions',
        color: 'rgb(251, 140, 0)',               /* orange */
        activeBg: 'rgba(251, 140, 0, 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 12v4m0 0h.01M12 8h.01" opacity="0.6" />
            </svg>
        ),
    },
    {
        to: '/analytics',
        label: 'Analytics',
        color: 'rgb(139, 92, 246)',             /* purple/violet */
        activeBg: 'rgba(139, 92, 246, 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        to: '/leaderboard',
        label: 'Leaderboard',
        color: 'rgb(245, 158, 11)',              /* amber */
        activeBg: 'rgba(245, 158, 11, 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
];

const appControlItems = [
    {
        to: '/app-control/home-cards',
        label: 'Home Cards',
        color: 'rgb(var(--success-rgb))',        /* green */
        activeBg: 'rgba(var(--success-rgb), 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        to: '/app-control/rewards',
        label: 'Reward Rules',
        color: 'rgb(var(--warning-rgb))',        /* yellow/orange */
        activeBg: 'rgba(var(--warning-rgb), 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        to: '/game-config',
        label: 'Game Config',
        color: 'rgb(192, 132, 252)',             /* purple */
        activeBg: 'rgba(192, 132, 252, 0.15)',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
];

export default function Sidebar({ open, onClose }) {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const initial = user?.email?.[0]?.toUpperCase() ?? 'A';

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <>
            {open && <div className="sidebar-overlay" onClick={onClose} />}

            <aside className={`app-sidebar ${open ? 'open' : ''}`}>

                {/* ── Brand ──────────────────────────────────────────── */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <svg style={{ width: '1.125rem', height: '1.125rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div>
                        <p className="sidebar-brand-name">AbhyaScore</p>
                        <p className="sidebar-brand-sub">Admin Console</p>
                    </div>
                </div>

                {/* ── Navigation ─────────────────────────────────────── */}
                <nav className="sidebar-nav">
                    <p className="sidebar-section-label">Home</p>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className="sidebar-item-wrapper"
                        >
                            {({ isActive }) => (
                                <span
                                    className="sidebar-item"
                                    style={isActive ? {
                                        background: item.activeBg,
                                        color: item.color,
                                    } : {}}
                                >
                                    {/* Icon box */}
                                    <span
                                        className="sidebar-icon-box"
                                        style={isActive ? {
                                            borderColor: item.color,
                                            color: item.color,
                                            background: item.activeBg,
                                        } : {}}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="sidebar-item-label">{item.label}</span>
                                </span>
                            )}
                        </NavLink>
                    ))}

                    <p className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Configuration</p>

                    {appControlItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className="sidebar-item-wrapper"
                        >
                            {({ isActive }) => (
                                <span
                                    className="sidebar-item"
                                    style={isActive ? {
                                        background: item.activeBg,
                                        color: item.color,
                                    } : {}}
                                >
                                    {/* Icon box */}
                                    <span
                                        className="sidebar-icon-box"
                                        style={isActive ? {
                                            borderColor: item.color,
                                            color: item.color,
                                            background: item.activeBg,
                                        } : {}}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="sidebar-item-label">{item.label}</span>
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* ── Bottom Profile Card ─────────────────────────────── */}
                <div className="sidebar-profile-card">
                    <div className="sidebar-profile-avatar">{initial}</div>
                    <div className="sidebar-profile-info">
                        <p className="sidebar-profile-name">Admin</p>
                        <p className="sidebar-profile-role">{user?.email?.split('@')[0] ?? 'admin'}</p>
                    </div>
                    <button
                        className="sidebar-profile-logout"
                        onClick={handleLogout}
                        title="Logout"
                        aria-label="Logout"
                    >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

            </aside>
        </>
    );
}
