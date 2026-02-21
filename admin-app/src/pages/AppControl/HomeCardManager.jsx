import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';

export default function HomeCardManager() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const fetchCards = async () => {
        setLoading(true);
        try {
            // Simplified path: top-level home_cards collection
            const q = query(collection(db, 'home_cards'), orderBy('order', 'asc'));
            const snap = await getDocs(q);
            setCards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error('[HomeCardManager] Fetch Error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleToggleVisibility = async (card) => {
        const ref = doc(db, 'home_cards', card.id);
        await setDoc(ref, { visible: !card.visible }, { merge: true });
        fetchCards();
    };

    const handleMove = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === cards.length - 1) return;

        const newCards = [...cards];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];

        const batch = writeBatch(db);
        newCards.forEach((c, i) => {
            const ref = doc(db, 'home_cards', c.id);
            batch.update(ref, { order: i + 1 });
        });
        await batch.commit();
        fetchCards();
    };

    const handleSaveCard = async (e) => {
        e.preventDefault();
        setSaving(true);
        const id = editingCard.id || editingCard.title.toLowerCase().replace(/\s+/g, '-');
        const ref = doc(db, 'home_cards', id);

        const data = {
            ...editingCard,
            order: editingCard.order || cards.length + 1,
            updatedAt: new Date()
        };
        delete data.id;

        await setDoc(ref, data, { merge: true });
        setEditingCard(null);
        setSaving(false);
        fetchCards();
    };

    const handleSeed = async () => {
        if (!confirm('Seed default home cards? This will add standard subjects to the NEW simplified paths.')) return;
        setSaving(true);
        try {
            const defaultCards = [
                { id: 'phy', type: "subject", title: "PHYSICS", subtitle: "11th & 12th Chapters", assetKey: 'phy', visible: true, order: 1, subjectCode: "phy", gradient: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)" },
                { id: 'chem', type: "subject", title: "CHEMISTRY", subtitle: "11th & 12th Chapters", assetKey: 'chem', visible: true, order: 2, subjectCode: "chem", gradient: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" },
                { id: 'math', type: "subject", title: "MATHS", subtitle: "11th & 12th Chapters", assetKey: 'math', visible: true, order: 3, subjectCode: "math", gradient: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)" },
                { id: 'bio', type: "subject", title: "BIOLOGY", subtitle: "Botany Chapters", assetKey: 'bio', visible: true, order: 4, subjectCode: "bio", gradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)" },
                { id: 'zoo', type: "subject", title: "ZOOLOGY", subtitle: "Zoology Chapters", assetKey: 'bio', visible: true, order: 5, subjectCode: "zoo", gradient: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)" },
                { id: 'boss', type: "boss", title: "BOSS BATTLE", subtitle: "JEE / NEET MOCK TEST", visible: true, order: 6, gradient: "linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)" },
                { id: 'achievements', type: "achievement", title: "ACHIEVEMENTS", subtitle: "BADGES COLLECTED", visible: true, order: 7, gradient: "linear-gradient(135deg, #6366f1 0%, #312e81 100%)" }
            ];

            const batch = writeBatch(db);
            defaultCards.forEach(c => {
                const { id, ...data } = c;
                const ref = doc(db, 'home_cards', id);
                batch.set(ref, { ...data, createdAt: new Date() }, { merge: true });
            });
            await batch.commit();

            await setDoc(doc(db, 'reward_rules', 'default'), {
                correctAnswerXP: 4,
                wrongAnswerXP: -1,
                dailyGoalXP: 100,
                streakBonusPerDay: 5,
                bossBattleXP: 50,
                chapterCompleteXP: 25,
                updatedAt: new Date()
            }, { merge: true });

            alert('Seeding successful! New paths populated.');
            fetchCards();
        } catch (e) {
            console.error(e);
            alert('Seeding failed: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div>
                        <div className="breadcrumb">
                            <span>App Control</span>
                            <span>/</span>
                            <span>Home Cards</span>
                        </div>
                        <h1>Home Card Manager</h1>
                        <p>Configure the visual layout and content of the student dashboard.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={handleSeed} disabled={saving}>
                            🔄 Reset to Defaults
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setEditingCard({ title: '', subtitle: '', type: 'subject', visible: true, order: cards.length + 1 })}>
                            + New Card
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: '400px' }} />
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem'
                }}>
                    {cards.map((card, idx) => (
                        <div key={card.id} className="card" style={{
                            position: 'relative',
                            overflow: 'hidden',
                            border: editingCard?.id === card.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                            opacity: card.visible ? 1 : 0.6
                        }}>
                            {/* Card Visual Mimic */}
                            <div style={{
                                height: '140px',
                                background: card.gradient || (card.type === 'subject' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #334155, #1e293b)'),
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: '1rem'
                            }}>
                                {card.imageUrl && (
                                    <img src={card.imageUrl} style={{
                                        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6
                                    }} alt="" />
                                )}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'
                                }} />

                                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.35rem' }}>
                                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{card.type}</span>
                                    {card.locked && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Locked</span>}
                                </div>
                                <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 900, textTransform: 'uppercase', position: 'relative' }}>{card.title}</h4>
                                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.65rem', position: 'relative' }}>{card.subtitle}</p>
                            </div>

                            {/* Controls */}
                            <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => handleMove(idx, 'up')} className="btn btn-icon btn-sm" title="Move Left">←</button>
                                    <button onClick={() => handleMove(idx, 'down')} className="btn btn-icon btn-sm" title="Move Right">→</button>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setEditingCard(card)} className="btn btn-outline btn-sm">Edit</button>
                                    <button onClick={() => handleToggleVisibility(card)} className="btn btn-icon btn-sm">
                                        {card.visible ? '👁️' : '🕶️'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Sidebar/Modal Overlay */}
            {editingCard && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', justifyContent: 'flex-end'
                }} onClick={() => setEditingCard(null)}>
                    <div style={{
                        width: '400px', height: '100%', background: 'var(--surface)', padding: '2rem',
                        boxShadow: '-4px 0 15px rgba(0,0,0,0.2)', overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0 }}>{editingCard.id ? 'Edit Card' : 'New Card'}</h2>
                        <form onSubmit={handleSaveCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="form-input" value={editingCard.title} onChange={e => setEditingCard({ ...editingCard, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subtitle</label>
                                <input className="form-input" value={editingCard.subtitle} onChange={e => setEditingCard({ ...editingCard, subtitle: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select className="form-input" value={editingCard.type} onChange={e => setEditingCard({ ...editingCard, type: e.target.value })}>
                                    <option value="subject">Subject</option>
                                    <option value="boss">Boss Battle</option>
                                    <option value="achievement">Achievement</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            {editingCard.type === 'subject' && (
                                <div className="form-group">
                                    <label className="form-label">Subject Code (e.g., phy, chem)</label>
                                    <input className="form-input" value={editingCard.subjectCode || ''} onChange={e => setEditingCard({ ...editingCard, subjectCode: e.target.value })} />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Asset Key (Hardcoded fallback)</label>
                                <input className="form-input" value={editingCard.assetKey || ''} onChange={e => setEditingCard({ ...editingCard, assetKey: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Image URL (Direct link)</label>
                                <input className="form-input" value={editingCard.imageUrl || ''} onChange={e => setEditingCard({ ...editingCard, imageUrl: e.target.value })} placeholder="https://example.com/image.png" />
                                <small style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Paste a direct link (e.g. from Imgbb or PostImages)</small>
                            </div>

                            {editingCard.imageUrl && (
                                <div className="form-group">
                                    <label className="form-label">Preview</label>
                                    <img src={editingCard.imageUrl} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} alt="Preview" />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Gradient CSS (fallback)</label>
                                <input className="form-input" value={editingCard.gradient || ''} placeholder="linear-gradient(...)" onChange={e => setEditingCard({ ...editingCard, gradient: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={editingCard.visible} onChange={e => setEditingCard({ ...editingCard, visible: e.target.checked })} />
                                    Visible
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={editingCard.locked} onChange={e => setEditingCard({ ...editingCard, locked: e.target.checked })} />
                                    Locked
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                                <button type="button" className="btn btn-outline" onClick={() => setEditingCard(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
