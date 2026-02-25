import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const token = await user.getIdTokenResult();
            if (token.claims.admin !== true) {
                await auth.signOut();
                setError('Access denied. This account does not have admin privileges.');
                setLoading(false);
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(
                err.code === 'auth/invalid-credential'
                    ? 'Invalid email or password.'
                    : 'Login failed. Please try again.'
            );
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgb(11, 19, 33)', // SpikeAdmin Deep Navy
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-5%',
                width: '30rem', height: '30rem',
                background: 'radial-gradient(circle, rgba(0, 133, 219, 0.08) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', left: '-5%',
                width: '25rem', height: '25rem',
                background: 'radial-gradient(circle, rgba(135, 99, 218, 0.05) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
                <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    {/* Header / Logo Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: '42px', height: '42px',
                            background: 'linear-gradient(135deg, rgb(0, 133, 219) 0%, rgb(0, 90, 185) 100%)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0, 133, 219, 0.3)',
                        }}>
                            <svg style={{ width: '1.375rem', height: '1.375rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ color: 'var(--text-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>AbhyaScore</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>ADMIN PORTAL</p>
                        </div>
                    </div>

                    <h2 style={{ color: 'var(--text-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Please authentication to access the dashboard</p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>EMAIL ADDRESS</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@abhyascore.com"
                                className="form-input"
                                style={{ padding: '0.75rem 1rem' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>PASSWORD</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="form-input"
                                style={{ padding: '0.75rem 1rem' }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(207, 102, 121, 0.1)',
                                border: '1px solid rgba(207, 102, 121, 0.2)',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                display: 'flex', gap: '0.5rem',
                                color: 'rgb(207, 102, 121)', fontSize: '0.8125rem',
                            }}>
                                <svg style={{ width: '1rem', height: '1rem', shrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                padding: '0.875rem',
                                justifyContent: 'center',
                                fontSize: '0.9375rem',
                                fontWeight: 700,
                                marginTop: '0.5rem',
                                boxShadow: '0 8px 24px rgba(0, 133, 219, 0.3)',
                            }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{ width: '1.125rem', height: '1.125rem', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                        &copy; {new Date().getFullYear()} AbhyaScore Systems &bull; All Rights Reserved
                    </p>
                </div>
            </div>

            {/* In-page style for the spinning animation since we aren't using a CSS module here */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
