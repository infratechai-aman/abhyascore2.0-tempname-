import React from 'react';
import { useUsers } from '../hooks/useUsers';

const fmtDate = (ts) => {
    if (!ts) return 'Never';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Skeleton = () => (
    <div className="animate-pulse space-y-3 p-4">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
        ))}
    </div>
);

export default function Users() {
    const { users, totalLoaded, loading, loadingMore, error, hasMore, loadMore, searchQuery, setSearchQuery } = useUsers();

    return (
        <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Users</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {loading ? 'Loading...' : `${totalLoaded} users loaded`}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <Skeleton />
                ) : users.length === 0 ? (
                    <div className="py-20 text-center">
                        <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-slate-500 text-sm font-medium">
                            {searchQuery ? `No users matching "${searchQuery}"` : 'No users found'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Email', 'XP', 'Gold', 'Streak', 'Tests Taken', 'Last Active'].map((h) => (
                                        <th key={h} className={`text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4 ${h === 'Email' ? 'text-left' : 'text-right'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0">
                                                    {user.email?.[0] ?? '?'}
                                                </div>
                                                <span className="text-slate-700 font-medium truncate max-w-[200px]">{user.email ?? '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-violet-600 tabular-nums">
                                            {(user.stats?.xp ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-amber-600 tabular-nums">
                                            {(user.stats?.gold ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-orange-500 font-semibold">🔥 {user.stats?.streak ?? 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums">
                                                {user.stats?.totalTests ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                            {fmtDate(user.stats?.lastActive)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs text-slate-400">
                        Showing {users.length} of {totalLoaded} loaded
                        {searchQuery && ` (filtered)`}
                    </p>
                    {hasMore && !searchQuery && (
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {loadingMore ? (
                                <><div className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /> Loading...</>
                            ) : 'Load more'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
