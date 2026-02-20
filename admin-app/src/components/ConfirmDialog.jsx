import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-panel" style={{ maxWidth: '24rem', padding: '1.75rem' }}>
                {/* Icon */}
                <div style={{
                    width: '3rem', height: '3rem', borderRadius: '50%',
                    background: 'rgba(var(--danger-rgb), 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem'
                }}>
                    <svg style={{ width: '1.375rem', height: '1.375rem', color: 'rgb(var(--danger-rgb))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.375rem' }}>{title}</h3>
                <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onCancel} disabled={loading} className="btn btn-outline" style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="btn btn-primary" style={{ flex: 1, background: 'rgb(var(--danger-rgb))', boxShadow: '0 4px 12px rgba(var(--danger-rgb), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {loading ? (
                            <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
