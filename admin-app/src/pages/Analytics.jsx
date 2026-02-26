import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// ─── Mock Data for Development ────────────────────────────────────────────────
const MOCK_XP_TRENDS = [
    { date: 'Feb 1', xp: 400 }, { date: 'Feb 5', xp: 900 }, { date: 'Feb 10', xp: 1200 },
    { date: 'Feb 15', xp: 1800 }, { date: 'Feb 20', xp: 2400 }, { date: 'Feb 25', xp: 3100 },
];

const MOCK_SUBJECT_MASTERY = [
    { subject: 'Physics', score: 65, fullMark: 100 },
    { subject: 'Chemistry', score: 82, fullMark: 100 },
    { subject: 'Maths', score: 45, fullMark: 100 },
    { subject: 'Biology', score: 90, fullMark: 100 },
    { subject: 'Zoology', score: 78, fullMark: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [xpData, setXpData] = useState(MOCK_XP_TRENDS);
    const [subjectData, setSubjectData] = useState(MOCK_SUBJECT_MASTERY);

    useEffect(() => {
        // In a real scenario, we'd aggregate Firestore data here
        // For now, we simulate a load
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="page-header">
                <div className="breadcrumb">
                    <span>Admin</span><span>/</span><span>Analytics</span>
                </div>
                <h1>Performance Analytics</h1>
                <p>Track global student engagement and mastery trends.</p>
            </div>

            {/* Top Grid: XP Trends & Radar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* XP Growth Chart */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Daily XP Growth (Global)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={xpData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="xp" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Mastery Radar */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Global Subject Proficiency</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                                <PolarGrid stroke="var(--card-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <Radar
                                    name="Avg Score"
                                    dataKey="score"
                                    stroke="var(--primary)"
                                    fill="var(--primary)"
                                    fillOpacity={0.4}
                                />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bottom Section: Distribution & Hardest Topics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Subject Distribution Pie */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Active User Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={subjectData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="score"
                                >
                                    {subjectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Bar: Difficulty Success Rate */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Success Rate by Difficulty</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={[
                                { name: 'Easy', rate: 85 },
                                { name: 'Medium', rate: 58 },
                                { name: 'Hard', rate: 32 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} unit="%" />
                                <Tooltip />
                                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#ef4444" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
