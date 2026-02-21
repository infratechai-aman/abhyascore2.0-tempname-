import React, { useState } from 'react';

// ─── Ranks Data ───────────────────────────────────────────────────────────────
const RANKS = [
    { range: 'L1 – L9', title: 'Rookie', color: '#94a3b8', hex: '#94a3b8' },
    { range: 'L10 – L19', title: 'Starter', color: '#4ade80', hex: '#4ade80' },
    { range: 'L20 – L29', title: 'Builder', color: '#a3e635', hex: '#a3e635' },
    { range: 'L30 – L39', title: 'Solver', color: '#facc15', hex: '#facc15' },
    { range: 'L40 – L49', title: 'Climber', color: '#fb923c', hex: '#fb923c' },
    { range: 'L50 – L59', title: 'Fighter', color: '#f97316', hex: '#f97316' },
    { range: 'L60 – L69', title: 'Strategist', color: '#f87171', hex: '#f87171' },
    { range: 'L70 – L79', title: 'Dominator', color: '#fb7185', hex: '#fb7185' },
    { range: 'L80 – L89', title: 'Topper', color: '#c084fc', hex: '#c084fc' },
    { range: 'L90 – L99', title: 'AIR Contender', color: '#818cf8', hex: '#818cf8' },
    { range: 'L100', title: 'AIR-1', color: '#fde047', hex: '#fde047' },
];

// ─── Badges Data ──────────────────────────────────────────────────────────────
const BADGES = [
    { id: 1, title: 'First Step', desc: 'Log in and create your profile', category: 'Onboarding' },
    { id: 2, title: 'Chapter Cleared', desc: 'Complete all 3 tests (Easy, Med, Hard) in any one chapter', category: 'Progress' },
    { id: 3, title: '11th Standard Hero', desc: 'Finish the 11th Std map for any one subject', category: 'Progress' },
    { id: 4, title: '12th Standard Hero', desc: 'Finish the 12th Std map for any one subject', category: 'Progress' },
    { id: 5, title: 'The Graduate', desc: 'Reach Level 50', category: 'Milestone' },
    { id: 6, title: 'Immortal Scholar', desc: 'Reach Level 100', category: 'Milestone' },
    { id: 7, title: 'Sniper', desc: 'Complete a 25-question test with 100% accuracy', category: 'Skill' },
    { id: 8, title: 'Sharpshooter', desc: 'Get 15 correct answers in a row (+4 streak)', category: 'Skill' },
    { id: 9, title: 'Speedster', desc: 'Finish a 25-min test in under 10 mins with >80% score', category: 'Skill' },
    { id: 10, title: 'Elite Specialist', desc: 'Complete 5 "Hard" levels in a single day', category: 'Skill' },
    { id: 11, title: 'Calculated Risk', desc: 'Correctly answer a question you previously got wrong 3 times', category: 'Skill' },
    { id: 12, title: 'Perfect Session', desc: 'Score >90% in Physics, Chemistry, and Maths/Bio on the same day', category: 'Skill' },
    { id: 13, title: 'Fire Starter', desc: 'Maintain a 3-day streak', category: 'Streak' },
    { id: 14, title: 'Relentless', desc: 'Maintain a 30-day streak', category: 'Streak' },
    { id: 15, title: 'Early Bird', desc: 'Complete a test before 7:00 AM', category: 'Habit' },
    { id: 16, title: 'Night Owl', desc: 'Complete a test after 11:00 PM', category: 'Habit' },
    { id: 17, title: 'Sunday Warrior', desc: 'Solve 100 questions on a Sunday', category: 'Habit' },
    { id: 18, title: 'Librarian', desc: 'Spend a total of 50 hours in "Active Test" mode', category: 'Habit' },
    { id: 19, title: 'Boss Slayer', desc: 'Complete your first Boss Battle (Mock Test)', category: 'Boss' },
    { id: 20, title: 'Tactical Genius', desc: 'Score >90% marks in a Boss Battle', category: 'Boss' },
    { id: 21, title: 'Legacy Bearer', desc: 'Maintain a 100-day streak without using a "Streak Freeze"', category: 'Streak' },
    { id: 22, title: 'Raid Legend', desc: 'Complete all 9 scheduled Boss Battles', category: 'Boss' },
    { id: 23, title: 'Analytical Beast', desc: 'Solve 10 consecutive Boss questions in under 3 minutes', category: 'Boss' },
    { id: 24, title: 'Comeback Kid', desc: 'Improve a "Defeated" chapter score to 3 stars', category: 'Progress' },
    { id: 25, title: 'The All-Rounder', desc: 'Unlock all other 24 achievements', category: 'Milestone' },
];

const CATEGORY_COLORS = {
    Onboarding: '#60a5fa',
    Progress: '#34d399',
    Milestone: '#fde047',
    Skill: '#f97316',
    Streak: '#fb923c',
    Habit: '#c084fc',
    Boss: '#f87171',
};

// ─── Boss Battles Data ────────────────────────────────────────────────────────
const BOSS_BATTLES = [
    { id: 1, name: 'Foundation Strike', unlock: 'Chapter 1 of all subjects', pattern: 'JEE: 5E/10M/10H × 3 | NEET: 20E/15M/10H × 4', bias: '0%' },
    { id: 2, name: 'Concept Builder', unlock: 'Chapters 1–3 of all subjects', pattern: 'Same', bias: '+5%' },
    { id: 3, name: 'Core Integration', unlock: 'Chapters 1–5 of all subjects', pattern: 'Same', bias: '+10%' },
    { id: 4, name: 'Mid-Sem Dominion', unlock: '50% syllabus', pattern: 'Same', bias: '+15%' },
    { id: 5, name: 'Advanced Suppression', unlock: '65% syllabus', pattern: 'Same', bias: '+15%' },
    { id: 6, name: 'Precision Execution', unlock: '75% syllabus', pattern: 'Same', bias: '+15%' },
    { id: 7, name: 'Pre-Final Gauntlet', unlock: '100% syllabus', pattern: 'Same', bias: '+20%' },
    { id: 8, name: 'Weakness Annihilation', unlock: 'Boss 7 + 3 attempts + 60% avg', pattern: 'Adaptive (weak topics)', bias: '+15%' },
    { id: 9, name: 'Rank Predictor', unlock: 'Boss 8 + 80% avg', pattern: 'Full mock', bias: '+20%' },
    { id: 10, name: 'FINAL WAR', unlock: '90% mastery + 5 Boss 9s + XP', pattern: 'All India Sim', bias: '+25%' },
];

export default function GameConfig() {
    const [tab, setTab] = useState('ranks');

    return (
        <div style={{ padding: '2rem', maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Game Config
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Read-only reference for ranks and achievement badges defined in the student app.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['ranks', 'badges', 'bosses'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'capitalize',
                            background: tab === t ? 'rgb(var(--primary-rgb))' : 'var(--surface-2)',
                            color: tab === t ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t === 'ranks' ? `⚔ Ranks (${RANKS.length})` : t === 'badges' ? `🏅 Badges (${BADGES.length})` : `💀 Boss Battles (${BOSS_BATTLES.length})`}
                    </button>
                ))}
            </div>

            {/* Ranks Tab */}
            {tab === 'ranks' && (
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Players automatically receive these rank titles based on their current level.
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Level Range', 'Rank Title', 'Color Preview'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {RANKS.map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{r.range}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ fontWeight: 700, color: r.color, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                                            {r.title}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ width: '2.5rem', height: '0.75rem', borderRadius: '999px', background: r.hex }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Badges Tab */}
            {tab === 'badges' && (
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        All 25 achievement badges available in the student app.
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['#', 'Title', 'Description', 'Category'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {BADGES.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.id}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{b.title}</td>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{b.desc}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.65rem',
                                            borderRadius: '999px',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            background: (CATEGORY_COLORS[b.category] ?? '#888') + '22',
                                            color: CATEGORY_COLORS[b.category] ?? '#888',
                                            border: `1px solid ${CATEGORY_COLORS[b.category] ?? '#888'}55`,
                                        }}>
                                            {b.category}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Boss Battles Tab */}
            {tab === 'bosses' && (
                <div className="card" style={{ padding: '1.25rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        All 10 Boss Battles — progressive mock exam tiers. Duration: 3 hours each.
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['#', 'Boss Name', 'Unlock Condition', 'Question Pattern', 'Hard Bias'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {BOSS_BATTLES.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.id}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: b.id === 10 ? '#fbbf24' : 'var(--text-primary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                        {b.id === 10 ? '👑 ' : '💀 '}{b.name}
                                    </td>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{b.unlock}</td>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{b.pattern}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.65rem',
                                            borderRadius: '999px',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            background: '#f8717122',
                                            color: '#f87171',
                                            border: '1px solid #f8717155',
                                        }}>
                                            {b.bias}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
