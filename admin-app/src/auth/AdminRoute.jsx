import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminRoute({ children }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'admin' | 'denied' | 'unauthenticated'

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setStatus('unauthenticated');
                return;
            }
            try {
                const token = await user.getIdTokenResult();
                if (token.claims.admin === true) {
                    setStatus('admin');
                } else {
                    setStatus('denied');
                }
            } catch {
                setStatus('denied');
            }
        });
        return unsub;
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') return <Navigate to="/login" replace />;

    if (status === 'denied') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-10 text-center max-w-md w-full mx-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-500 text-sm mb-6">Your account does not have admin privileges.</p>
                    <button
                        onClick={() => auth.signOut()}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
