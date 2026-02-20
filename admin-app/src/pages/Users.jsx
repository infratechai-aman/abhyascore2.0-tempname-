import React from 'react';

const users = [
    { email: 'rahul.sharma@gmail.com', xp: 4200, gold: 1800, streak: 12, tests: 34 },
    { email: 'priya.nair@gmail.com', xp: 3100, gold: 950, streak: 7, tests: 21 },
    { email: 'arjun.singh@gmail.com', xp: 5800, gold: 2400, streak: 21, tests: 56 },
    { email: 'neha.patel@hotmail.com', xp: 1200, gold: 300, streak: 2, tests: 8 },
    { email: 'kavya.reddy@gmail.com', xp: 6700, gold: 3100, streak: 30, tests: 72 },
    { email: 'ishan.dubey@gmail.com', xp: 2900, gold: 870, streak: 5, tests: 18 },
];

export default function Users() {
    return (
        <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Users</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage registered students</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-full">
                    {users.length} shown (placeholder)
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Email</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">XP</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Gold</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Streak</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Tests Taken</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0">
                                                {user.email[0]}
                                            </div>
                                            <span className="text-slate-700 font-medium truncate max-w-[200px]">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-violet-600">{user.xp.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-amber-600">{user.gold.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 text-orange-500 font-semibold">
                                            🔥 {user.streak}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                            {user.tests}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Firestore integration coming in Phase 2</p>
                    <span className="text-xs text-slate-400">Showing {users.length} of {users.length} users</span>
                </div>
            </div>
        </div>
    );
}
