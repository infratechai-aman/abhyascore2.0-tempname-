import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, deleteField } from 'firebase/firestore';

export default function EconomyPanel({ user, onUpdate }) {
    const [xp, setXp] = useState(0);
    const [gold, setGold] = useState(0);
    const [streak, setStreak] = useState(0);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Keep state in sync with props, check root level for polluted data if needed
    useEffect(() => {
        if (user) {
            // Priority: nested stats map, then root-level polluted keys
            const stats = user.stats || {};
            setXp(stats.xp ?? user['stats.xp'] ?? 0);
            setGold(stats.gold ?? user['stats.gold'] ?? 0);
            setStreak(stats.streak ?? user['stats.streak'] ?? 0);
        }
    }, [user]);

    const repairSchema = async () => {
        setSaving(true);
        setStatus({ type: 'info', message: 'Repairing...' });
        try {
            const userRef = doc(db, 'users', user.id);
            const snap = await getDoc(userRef);
            if (!snap.exists()) return;
            const data = snap.data();

            // Reconstruct clean object
            const cleanStats = {
                xp: Number(data.stats?.xp ?? data['stats.xp'] ?? 0),
                gold: Number(data.stats?.gold ?? data['stats.gold'] ?? 0),
                streak: Number(data.stats?.streak ?? data['stats.streak'] ?? 0),
                lastModifiedBy: 'admin_repair',
                updatedAt: serverTimestamp()
            };

            // FULL OVERWRITE of root-level polluted keys while preserving actual stats map
            const finalData = { ...data, stats: cleanStats };

            // Delete the "bad" fields
            const pollutedKeys = ['stats.xp', 'stats.gold', 'stats.streak', 'stats.lastModifiedBy', 'stats.updatedAt', 'xp', 'gold', 'streak'];
            pollutedKeys.forEach(k => delete finalData[k]);

            // Overwrite doc to ensure pollution is GONE
            const { id, ...rest } = finalData; // Don't save ID inside doc
            await setDoc(userRef, rest);

            setStatus({ type: 'success', message: 'Schema repaired & synced!' });
            if (onUpdate) onUpdate();
        } catch (e) {
            console.error('[EconomyPanel] Repair Error:', e);
            setStatus({ type: 'error', message: 'Repair failed' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (field, value) => {
        console.log(`[EconomyPanel] Updating ${field} to ${value}`);
        setSaving(true);
        setStatus({ type: 'info', message: 'Saving...' });

        try {
            const userRef = doc(db, 'users', user.id);

            // Use updateDoc with dot notation for the correct nested path
            await updateDoc(userRef, {
                [`stats.${field}`]: Number(value),
                'stats.lastModifiedBy': 'admin',
                'stats.updatedAt': serverTimestamp()
            });

            setStatus({ type: 'success', message: `Updated ${field}!` });
            if (onUpdate) onUpdate();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (e) {
            console.error('[EconomyPanel] Update Error:', e);
            setStatus({ type: 'error', message: 'Update failed' });
            alert('Update failed: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '1.25rem', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '0.75rem', border: '1px solid var(--card-border)', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--primary)' }}>⚙️</span> Economy Manager: {user.email}
                </h4>
                {status.message && (
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        background: status.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                        color: status.type === 'success' ? '#4caf50' : '#f44336'
                    }}>
                        {status.message}
                    </span>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total XP</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" className="form-input" value={xp} onChange={e => setXp(e.target.value)} />
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdate('xp', xp)} disabled={saving}>Set</button>
                    </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gold Coins</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" className="form-input" value={gold} onChange={e => setGold(e.target.value)} />
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdate('gold', gold)} disabled={saving}>Set</button>
                    </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Streak</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" className="form-input" value={streak} onChange={e => setStreak(e.target.value)} />
                        <button className="btn btn-outline btn-sm" onClick={() => handleUpdate('streak', streak)} disabled={saving}>Set</button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', alignItems: 'center' }}>
                <button className="btn btn-sm btn-outline" style={{ borderColor: 'rgba(244,67,54,0.5)', color: '#f44336' }}
                    onClick={() => { if (confirm('Reset streak to 0?')) handleUpdate('streak', 0); }} disabled={saving}>
                    Reset Streak
                </button>
                <button className="btn btn-sm btn-outline"
                    onClick={() => handleUpdate('xp', Number(xp) + 1000)} disabled={saving}>
                    🚀 +1000 XP Boost
                </button>

                <div style={{ flex: 1 }} />

                <button className="btn btn-sm btn-outline" style={{ opacity: 0.7, fontSize: '0.7rem' }}
                    onClick={repairSchema} disabled={saving} title="Fix data structure if updates fail">
                    🛠️ Repair & Sync
                </button>
            </div>
        </div>
    );
}
