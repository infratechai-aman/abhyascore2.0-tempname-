import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function RewardRuleManager() {
    const [rules, setRules] = useState({
        correctAnswerXP: 4,
        wrongAnswerXP: -1,
        dailyGoalXP: 100,
        streakBonusPerDay: 5,
        bossBattleXP: 50,
        chapterCompleteXP: 25
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchRules = async () => {
            setLoading(true);
            try {
                // Simplified path: top-level reward_rules/default
                const docRef = doc(db, 'reward_rules', 'default');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setRules(snap.data());
                }
            } catch (e) {
                console.error('[RewardRuleManager] Fetch Error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await setDoc(doc(db, 'reward_rules', 'default'), {
                ...rules,
                updatedAt: new Date()
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            console.error('[RewardRuleManager] Save Error:', e);
            alert('Save failed: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="skeleton" style={{ height: '300px' }} />;

    return (
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div className="breadcrumb">
                    <span>App Control</span>
                    <span>/</span>
                    <span>Reward Rules</span>
                </div>
                <h1>Economy Rules</h1>
                <p>Configure the XP and Coin distribution logic for the student app.</p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Correct Answer XP</label>
                            <input type="number" className="form-input"
                                value={rules.correctAnswerXP}
                                onChange={e => setRules({ ...rules, correctAnswerXP: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Wrong Answer XP (Penalty)</label>
                            <input type="number" className="form-input"
                                value={rules.wrongAnswerXP}
                                onChange={e => setRules({ ...rules, wrongAnswerXP: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Daily Goal XP</label>
                            <input type="number" className="form-input"
                                value={rules.dailyGoalXP}
                                onChange={e => setRules({ ...rules, dailyGoalXP: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Streak Bonus (Daily)</label>
                            <input type="number" className="form-input"
                                value={rules.streakBonusPerDay}
                                onChange={e => setRules({ ...rules, streakBonusPerDay: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Boss Battle XP</label>
                            <input type="number" className="form-input"
                                value={rules.bossBattleXP}
                                onChange={e => setRules({ ...rules, bossBattleXP: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Chapter Complete XP</label>
                            <input type="number" className="form-input"
                                value={rules.chapterCompleteXP}
                                onChange={e => setRules({ ...rules, chapterCompleteXP: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {success && (
                        <div style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
                            ✓ Rules updated successfully!
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </form>
            </div>
        </div>
    );
}
