import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';

const fmt = (n) =>
    n == null ? '—' : n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n.toLocaleString('en-IN');

const CARDS = (stats) => [
    {
        label: 'Total Users',
        value: fmt(stats?.totalUsers),
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        color: 'bg-blue-50 text-blue-600',
    },
    {
        label: 'Total Quiz Attempts',
        value: fmt(stats?.totalQuizAttempts),
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
        color: 'bg-violet-50 text-violet-600',
    },
    {
        label: 'Total XP Distributed',
        value: fmt(stats?.totalXP),
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        color: 'bg-amber-50 text-amber-600',
    },
    {
        label: 'Active Users (7 days)',
        value: fmt(stats?.activeUsers7d),
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        color: 'bg-emerald-50 text-emerald-600',
    },
];

export default function Dashboard() {
    const { stats, loading, error, refresh } = useDashboardStats();

    return (
        <div className="p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Live platform overview</p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    {error} —{' '}
                    <button onClick={refresh} className="underline font-semibold">retry</button>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {CARDS(stats).map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                                {card.icon}
                            </div>
                            {loading && (
                                <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                            )}
                        </div>
                        <p className="text-2xl font-bold text-slate-800 tabular-nums">{card.value}</p>
                        <p className="text-slate-500 text-sm mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Chart placeholder */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-slate-800">Quiz Activity</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-medium">
                        Analytics — Phase 3
                    </span>
                </div>
                <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Chart integration coming in Phase 3</p>
                </div>
            </div>
        </div>
    );
}
