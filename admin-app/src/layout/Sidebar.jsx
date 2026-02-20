import React from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const sections = [
    {
        title: 'HOME',
        items: [
            {
                to: '/dashboard',
                label: 'Dashboard',
                icon: (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                    </svg>
                ),
            },
        ],
    },
    {
        title: 'APPS',
        items: [
            {
                to: '/users',
                label: 'Users Profile',
                icon: (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ),
            },
            {
                to: '/questions',
                label: 'Questions',
                icon: (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
            },
        ],
    },
];

const RocketIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3.5-3.5" />
        <path d="M21.5 14.5c.3-1.4 0-4-2-6-2.1-2.1-4.7-2.4-6.1-2.1l-.6.6c-1.5.1-4.1.3-6.4 1.8l-.5.3s.1 1.7.5 2.1l.6.6c.1 1.5.3 4.1 1.8 6.4l.3.5s1.7-.1 2.1-.5l.6-.6c.3 1.4.6 4 2.1 6.1 2 2 4.6 2.3 6 2l.6-.6z" />
        <path d="M15 9l-1 1" />
    </svg>
);

export default function Sidebar({ open, onClose }) {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const initial = user?.email?.[0]?.toUpperCase() ?? 'A';

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <aside className={`app-sidebar ${open ? 'open' : ''}`}>
            {/* Logo Section */}
            <div className="sidebar-brand">
                <div style={{ color: 'rgb(0, 133, 219)', display: 'flex' }}>
                    <RocketIcon />
                </div>
                <h1 className="sidebar-brand-name" style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Spike Admin</h1>
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav" style={{ padding: '0.5rem 1rem' }}>
                {sections.map((section) => (
                    <React.Fragment key={section.title}>
                        <div className="sidebar-section-label">{section.title}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="sidebar-icon-box">{item.icon}</div>
                                <span className="sidebar-item-label">{item.label}</span>
                            </NavLink>
                        ))}
                    </React.Fragment>
                ))}
            </nav>

            {/* Profile Section */}
            <div className="sidebar-profile-card">
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    overflow: 'hidden', background: '#334155', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.email?.split('@')[0] ?? 'Admin'}&background=3b82f6&color=fff`}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email?.split('@')[0] ?? 'Mike Nielsen'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: 0 }}>Admin</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'none', border: 'none', color: 'rgb(0, 133, 219)',
                        cursor: 'pointer', padding: '0.25rem', display: 'flex'
                    }}
                    title="Logout"
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                </button>
            </div>
        </aside>
    );
}
