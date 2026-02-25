import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { auth } from '../firebase/firebase';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
    n == null ? '—'
        : n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
            : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K'
                : n.toLocaleString('en-IN');

const pct = (n, total) => total > 0 ? Math.round((n / total) * 100) : 0;

const timeAgo = (iso) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const SUBJECT_COLORS = {
    Physics: 'rgb(0,133,219)',
    Chemistry: 'rgb(33,150,243)',
    Biology: 'rgb(76,175,80)',
    Maths: 'rgb(251,140,0)',
    Zoology: 'rgb(135,99,218)',
    Unknown: 'rgb(112,135,165)',
};
const SUBJECT_BADGE = {
    Physics: 'badge-primary', Chemistry: 'badge-info',
    Biology: 'badge-success', Maths: 'badge-warning',
    Zoology: 'badge-indigo', Unknown: 'badge-secondary',
};
const DIFF_BADGE = {
    Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger',
};

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data = [] }) {
    if (!data.length) return (
        <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No activity data yet
        </div>
    );

    const counts = data.map(d => d.count);
    const max = Math.max(...counts, 1);
    const W = 560, H = 130;
    const n = data.length;
    const colW = W / n;
    const barW = Math.min(16, Math.max(4, colW * 0.55));

    return (
        <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: '100%' }} preserveAspectRatio="none">
            <defs>
                <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(0,133,219)" />
                    <stop offset="100%" stopColor="rgb(0,90,185)" stopOpacity="0.75" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
                <line key={f} x1="0" y1={H * (1 - f)} x2={W} y2={H * (1 - f)}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {/* Bars */}
            {data.map((d, i) => {
                const barH = Math.max(3, (d.count / max) * H);
                const x = i * colW + (colW - barW) / 2;
                return (
                    <g key={i}>
                        <rect x={x} y={H - barH} width={barW} height={barH} rx="4" fill="url(#barBlue)" />
                    </g>
                );
            })}
            {/* Month labels (every 5th) */}
            {data.map((d, i) => {
                if (i % Math.ceil(n / 7) !== 0) return null;
                const label = d.date
                    ? new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    : `D${i + 1}`;
                return (
                    <text key={i} x={i * colW + colW / 2} y={H + 16}
                        textAnchor="middle" fontSize="9" fill="rgba(149,167,192,0.7)">
                        {label}
                    </text>
                );
            })}
        </svg>
    );
}

// ─── SVG Area/Line Chart ──────────────────────────────────────────────────────
function AreaChart({ data = [], color = 'rgb(0,133,219)', height = 110 }) {
    if (data.length < 2) return (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No trend data
        </div>
    );
    const counts = data.map(d => d.count);
    const max = Math.max(...counts, 1);
    const W = 400, H = height;
    const pts = counts.map((c, i) => {
        const x = (i / (counts.length - 1)) * W;
        const y = H - (c / max) * (H - 8);
        return [x, y];
    });
    const linePts = pts.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPts = `0,${H} ${linePts} ${W},${H}`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${height}px` }} preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon fill="url(#areaGrad)" points={areaPts} />
            <polyline fill="none" stroke={color} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" points={linePts} />
        </svg>
    );
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ data = [], colors = [] }) {
    if (!data.length) return null;
    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = 70, cy = 70, r = 52, sw = 16;
    const circ = 2 * Math.PI * r;
    let cumulative = 0;

    return (
        <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
            {data.map((d, i) => {
                const frac = d.value / total;
                const dash = frac * circ;
                const rot = (cumulative / total) * 360 - 90;
                cumulative += d.value;
                return (
                    <circle key={i} cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={colors[i % colors.length] || 'rgb(0,133,219)'}
                        strokeWidth={sw}
                        strokeDasharray={`${dash} ${circ - dash}`}
                        transform={`rotate(${rot} ${cx} ${cy})`}
                        strokeLinecap="butt"
                    />
                );
            })}
            {/* Inner ring bg */}
            <circle cx={cx} cy={cy} r={r - sw / 2 - 2} fill="var(--surface)" />
            <text x={cx} y={cy - 7} textAnchor="middle" fill="rgb(234,239,244)"
                fontSize="16" fontWeight="800">{fmt(total)}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(149,167,192,0.8)"
                fontSize="9" fontWeight="600">TOTAL</text>
        </svg>
    );
}

// ─── Welcome Banner ───────────────────────────────────────────────────────────
function WelcomeBanner({ userName, refresh, loading }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgb(0,64,130) 0%, rgb(0,101,185) 50%, rgb(0,133,219) 100%)',
            borderRadius: 16,
            padding: '1.75rem 2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,133,219,0.35)',
            minHeight: '11rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }}>
            {/* Decorative circles */}
            <div style={{
                position: 'absolute', right: '-2rem', top: '-2rem',
                width: '12rem', height: '12rem',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', right: '2rem', bottom: '-3rem',
                width: '8rem', height: '8rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                Welcome Back
            </p>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
                {userName ?? 'Admin'}!
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem' }}>
                Check all the statistics on AbhyaScore
            </p>
            <button
                onClick={refresh}
                disabled={loading}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.5rem 1.25rem',
                    background: '#fff',
                    color: 'rgb(0,101,185)',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.8125rem', fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    width: 'fit-content',
                    transition: 'all 0.18s ease',
                    opacity: loading ? 0.7 : 1,
                }}
            >
                <svg style={{ width: '0.875rem', height: '0.875rem', animation: loading ? 'spin 0.7s linear infinite' : 'none' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
            </button>
        </div>
    );
}

// ─── Mini Stat Card (solid colored, SpikeAdmin style) ─────────────────────────
function MiniStatCard({ icon, value, change, label, bg = 'rgb(0,133,219)', loading }) {
    const isPos = change >= 0;
    return (
        <div style={{
            background: bg,
            borderRadius: 14,
            padding: '1.125rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            boxShadow: `0 6px 24px ${bg.replace('rgb', 'rgba').replace(')', ', 0.4)')}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
            cursor: 'default',
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Decorative blob */}
            <div style={{
                position: 'absolute', right: '-0.75rem', top: '-0.75rem',
                width: '4.5rem', height: '4.5rem',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '50%',
            }} />

            {/* Icon */}
            <div style={{
                width: '2.125rem', height: '2.125rem',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.375rem',
            }}>
                {icon}
            </div>

            {/* Value + badge */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', flexWrap: 'wrap' }}>
                {loading
                    ? <div style={{ height: '1.5rem', width: '4rem', background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                    : <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontStyle: 'italic' }}>{value}</span>
                }
                {change != null && (
                    <span style={{
                        fontSize: '0.6875rem', fontWeight: 700,
                        background: isPos ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                        color: '#fff',
                        padding: '0.125rem 0.375rem', borderRadius: 99,
                    }}>
                        {isPos ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{label}</p>
        </div>
    );
}

// ─── Chart Card Shell ─────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, action }) {
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h2 className="card-title">{title}</h2>
                    {subtitle && <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}

// ─── Earnings Row Item ────────────────────────────────────────────────────────
function EarningsRow({ icon, label, value, badge }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
                width: '2.125rem', height: '2.125rem', borderRadius: '50%',
                background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: 'var(--text-muted)',
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-heading)' }}>{value}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{label}</p>
            </div>
            {badge && <span className={`badge ${badge.cls}`}>{badge.text}</span>}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ h = '2rem', w = '100%' }) => (
    <div className="skeleton" style={{ height: h, width: w, borderRadius: 6 }} />
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const { stats: s, loading, error, refresh } = useDashboardStats();

    const user = auth.currentUser?.email?.split('@')[0] ?? 'Admin';

    // Subject data for donut
    const subjectData = s ? Object.entries(s.questionsBySubject)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value })) : [];
    const subjectColors = subjectData.map(d => SUBJECT_COLORS[d.name] || 'rgb(112,135,165)');

    // Activity bar chart (last 30 days)
    const activityData = s?.dailyActivity ?? [];

    // Subject attempts for bar rows
    const subjectAttempts = s ? Object.entries(s.subjectAttempts).sort((a, b) => b[1] - a[1]) : [];
    const maxSA = subjectAttempts[0]?.[1] ?? 1;

    // Difficulty attempts
    const diffAttempts = s ? Object.entries(s.diffAttempts) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Error Banner ────────────────────────────────────── */}
            {error && (
                <div style={{
                    background: 'rgba(207,102,121,0.1)', border: '1px solid rgba(207,102,121,0.3)',
                    borderRadius: 10, padding: '0.75rem 1rem',
                    fontSize: '0.8125rem', color: 'rgb(207,102,121)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <span>⚠️ {error}</span>
                    <button onClick={refresh} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Retry</button>
                </div>
            )}

            {/* ══ ROW 1: Welcome Banner + Mini Stat Cards ══════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.25rem', alignItems: 'stretch' }}>

                {/* Welcome Banner */}
                <WelcomeBanner userName={user} refresh={refresh} loading={loading} />

                {/* 3 Mini Stat Cards - stacked in a 3-col grid within the right column */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
                    <MiniStatCard
                        loading={loading}
                        label="Total Users"
                        value={fmt(s?.totalUsers)}
                        change={null}
                        bg="rgb(0,120,210)"
                        icon={<svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>}
                    />
                    <MiniStatCard
                        loading={loading}
                        label="Attempts"
                        value={fmt(s?.totalQuizAttempts)}
                        change={null}
                        bg="rgb(0,110,195)"
                        icon={<svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>}
                    />
                    <MiniStatCard
                        loading={loading}
                        label="Total XP"
                        value={fmt(s?.totalXP)}
                        change={null}
                        bg="rgb(0,98,178)"
                        icon={<svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>}
                    />
                </div>
            </div>

            {/* ══ ROW 2: Activity Chart (left) + Subject Donut (right) ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.25rem' }}>

                {/* Activity bar chart card */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Quiz Activity</h2>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Daily attempts over the past 30 days</p>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem', alignItems: 'start' }}>
                        {/* Chart */}
                        <div>
                            {loading
                                ? <Sk h="9.5rem" />
                                : <BarChart data={activityData} />
                            }
                        </div>
                        {/* Stats column */}
                        <div style={{ minWidth: '10rem' }}>
                            <EarningsRow
                                icon={<svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                label="Total Attempts"
                                value={fmt(s?.totalQuizAttempts)}
                            />
                            <EarningsRow
                                icon={<svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                label="Pass Rate"
                                value={s ? `${s.passRate}%` : '—'}
                                badge={s ? { text: `${s.passRate}%`, cls: s.passRate >= 70 ? 'badge-success' : 'badge-warning' } : null}
                            />
                            <EarningsRow
                                icon={<svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                                label="Avg Stars / Quiz"
                                value={s ? `${s.avgStarsPerQuiz} ★` : '—'}
                            />
                            {/* View button */}
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                                View Full Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subject Distribution donut card */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Question Bank</h2>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Distribution by subject</p>
                        </div>
                    </div>
                    <div className="card-body">
                        {loading ? <Sk h="9rem" /> : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                <DonutChart data={subjectData} colors={subjectColors} />
                                <div style={{ flex: 1, minWidth: '7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {subjectData.slice(0, 5).map((d, i) => (
                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: subjectColors[i], flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)' }}>{fmt(d.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Area sparkline */}
                        {!loading && activityData.length > 1 && (
                            <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Activity Trend
                                </p>
                                <AreaChart data={activityData} color="rgb(0,133,219)" height={70} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ ROW 3: 4 KPI cards ══════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                {[
                    {
                        label: 'Avg Score', value: s ? `${s.avgScoreOverall}%` : '—', color: 'rgb(0,133,219)',
                        icon: <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                    },
                    {
                        label: 'Active (7d)', value: fmt(s?.activeUsers7d), color: 'rgb(76,175,80)',
                        sub: s ? `${pct(s.activeUsers7d, s.totalUsers)}% engagement` : null,
                        icon: <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
                    },
                    {
                        label: 'Questions', value: fmt(s?.totalQuestions), color: 'rgb(251,140,0)',
                        icon: <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    },
                    {
                        label: 'Avg Stars', value: s ? `${s.avgStarsPerQuiz}★` : '—', color: 'rgb(135,99,218)',
                        icon: <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
                    },
                ].map(({ label, value, color, icon, sub }) => (
                    <div key={label} className="kpi-card">
                        <div className="kpi-card-text">
                            <p className="kpi-label">{label}</p>
                            {loading ? <Sk h="2rem" w="5rem" /> : <p className="kpi-value">{value}</p>}
                            {sub && <p className="kpi-sub">{sub}</p>}
                        </div>
                        <div className="kpi-icon-wrap" style={{ background: `${color}22`, color }}>
                            {icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ ROW 4: Subject Attempts + Difficulty Cards ══════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Subject Attempts */}
                <ChartCard title="Most Played Subjects" subtitle="By quiz attempt count">
                    {loading ? <Sk h="8rem" /> : subjectAttempts.length === 0
                        ? <div className="empty-state"><p>No data yet</p></div>
                        : subjectAttempts.map(([subj, count]) => {
                            const w = maxSA > 0 ? Math.round((count / maxSA) * 100) : 0;
                            return (
                                <div key={subj} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                                    <span className={`badge ${SUBJECT_BADGE[subj] ?? 'badge-secondary'}`} style={{ minWidth: '5.5rem', justifyContent: 'center' }}>{subj}</span>
                                    <div className="progress-bar-track" style={{ flex: 1 }}>
                                        <div className="progress-bar-fill" style={{ width: `${w}%`, background: SUBJECT_COLORS[subj] ?? 'rgb(112,135,165)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', minWidth: '2rem', textAlign: 'right' }}>{count}</span>
                                </div>
                            );
                        })
                    }
                </ChartCard>

                {/* Difficulty breakdown */}
                <ChartCard title="Score & Difficulty" subtitle="Pass rate and difficulty breakdown">
                    {loading ? <Sk h="8rem" /> : (
                        <>
                            {/* Pass rate progress */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pass Rate</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-heading)' }}>{s?.passRate ?? 0}%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div className="progress-bar-fill" style={{ width: `${s?.passRate ?? 0}%`, background: 'rgb(76,175,80)' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg Score</span>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-heading)' }}>{s?.avgScoreOverall ?? 0}%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div className="progress-bar-fill" style={{ width: `${s?.avgScoreOverall ?? 0}%`, background: 'rgb(0,133,219)' }} />
                                </div>
                            </div>
                            {/* Difficulty attempts */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Attempts by Difficulty</p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {diffAttempts.map(([diff, cnt]) => (
                                        <div key={diff} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                            <span className={`badge ${DIFF_BADGE[diff] ?? 'badge-secondary'}`}>{diff}</span>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-heading)' }}>{cnt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </ChartCard>
            </div>

            {/* ══ ROW 5: Recent Activity Table ═════════════════════════ */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Activity</h2>
                    <span className="badge badge-primary">{s?.recentResults?.length ?? 0} records</span>
                </div>
                {loading ? (
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[...Array(4)].map((_, i) => <Sk key={i} h="3rem" />)}
                    </div>
                ) : !s?.recentResults?.length ? (
                    <div className="empty-state"><p>No recent activity</p></div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Chapter</th>
                                    <th>Subject</th>
                                    <th>Difficulty</th>
                                    <th style={{ textAlign: 'right' }}>Score</th>
                                    <th style={{ textAlign: 'right' }}>XP</th>
                                    <th style={{ textAlign: 'right' }}>When</th>
                                </tr>
                            </thead>
                            <tbody>
                                {s.recentResults.map((a) => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 600, maxWidth: '9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.userId?.slice(0, 8) ?? '—'}
                                        </td>
                                        <td style={{ maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                            {a.chapterId ?? '—'}
                                        </td>
                                        <td><span className={`badge ${SUBJECT_BADGE[a.subject] ?? 'badge-secondary'}`}>{a.subject ?? '—'}</span></td>
                                        <td><span className={`badge ${DIFF_BADGE[a.difficulty] ?? 'badge-secondary'}`}>{a.difficulty ?? '—'}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={`badge ${a.score >= 70 ? 'badge-success' : a.score >= 50 ? 'badge-warning' : 'badge-danger'}`}>{a.score}%</span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'rgb(251,140,0)' }}>+{a.xpEarned ?? 0}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo(a.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
