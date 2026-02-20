import React from 'react';
import { auth } from '../firebase/firebase';

export default function Navbar({ onMenuToggle }) {
    const user = auth.currentUser;

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
            {/* Left: hamburger */}
            <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="hidden lg:block" />

            {/* Right: user info */}
            <div className="flex items-center gap-3">
                {/* Notification bell (placeholder) */}
                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors relative">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                </button>

                {/* Avatar + email */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                        {user?.email?.[0] ?? 'A'}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-semibold text-slate-700 leading-tight">Admin</p>
                        <p className="text-xs text-slate-400 leading-tight truncate max-w-[160px]">{user?.email ?? ''}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
