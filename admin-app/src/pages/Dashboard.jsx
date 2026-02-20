import React from 'react';

const stats = [
    {
        label: 'Total Users',
        value: '2,840',
        change: '+12% this month',
        positive: true,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        color: 'bg-blue-50 text-blue-600',
    },
    {
        label: 'Total Quiz Attempts',
        value: '18,492',
        change: '+8% this month',
        positive: true,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
        color: 'bg-violet-50 text-violet-600',
    },
    {
        label: 'Total XP Distributed',
        value: '4,21,000',
        change: '+23% this month',
        positive: true,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        color: 'bg-amber-50 text-amber-600',
    },
    {
        label: 'Active Users (7 days)',
        value: '1,203',
        change: '-3% vs last week',
        positive: false,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        color: 'bg-emerald-50 text-emerald-600',
    },
];

export default function Dashboard() {
    return (
        <div className="p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Placeholder chart area */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-slate-800">Quiz Activity</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-medium">Analytics coming soon</span>
                </div>
                <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Chart will be integrated in Phase 2</p>
                </div>
            </div>
        </div>
    );
}
