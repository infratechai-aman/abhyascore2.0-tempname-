import React, { useState } from 'react';
import { User, Shield, Trophy, Edit2, Lock, Check, Eye, EyeOff } from 'lucide-react';
import { getRank } from '../utils/rankUtils';
import { useAuth } from '../contexts/AuthContext';
import { getGlobalRank } from '../utils/gameLogic';

// ─── Badge Image Imports ──────────────────────────────────────────────────────
import badgeFirstStep from '../assets/badges/FirstStep.png';
import badgeChapterCleared from '../assets/badges/ChapterCleared.png';
import badge11thStandardHero from '../assets/badges/11thStandardHero.png';
import badge12thStandardHero from '../assets/badges/12thStandardHero.png';
import badgeTheGraduate from '../assets/badges/TheGraduate.png';
import badgeImmortalScholar from '../assets/badges/ImmortalScholar.png';
import badgeSniper from '../assets/badges/Sniper.png';
import badgeSharpshooter from '../assets/badges/Sharpshooter.png';
import badgeSpeedster from '../assets/badges/Speedster.png';
import badgeEliteSpecialist from '../assets/badges/EliteSpecialist.png';
import badgeCalculatedRisk from '../assets/badges/CalculatedRisk.png';
import badgePerfectSession from '../assets/badges/PerfectSession.png';
import badgeFireStarter from '../assets/badges/FireStarter.png';
import badgeRelentless from '../assets/badges/Relentless.png';
import badgeEarlyBird from '../assets/badges/EarlyBird.png';
import badgeNightOwl from '../assets/badges/NightOwl.png';
import badgeSundayWarrior from '../assets/badges/SundayWarrior.png';
import badgeLibrarian from '../assets/badges/Librarian.png';
import badgeBossSlayer from '../assets/badges/BossSlayer.png';
import badgeTacticalGenius from '../assets/badges/TacticalGenius.png';
import badgeLegacyBearer from '../assets/badges/LegacyBearer.png';
import badgeRaidLegend from '../assets/badges/RaidLegend.png';
import badgeAnalyticalBeast from '../assets/badges/AnalyticalBeast.png';
import badgeComebackKid from '../assets/badges/ComebackKid.png';
import badgeTheAllRounder from '../assets/badges/TheAllRounder.png';

const AVATARS = [
    { id: 'MCharcter1', label: 'Rogue', src: '/Avatars/MCharcter1.png' },
    { id: 'MCharcter2', label: 'Sentinal', src: '/Avatars/MCharcter2.png' },
    { id: 'MCharcter3', label: 'Mage', src: '/Avatars/MCharcter3.png' },
    { id: 'MCharcter4', label: 'Druid', src: '/Avatars/MCharcter4.png' },
    { id: 'MCharcter5', label: 'Fighter', src: '/Avatars/MCharcter5.png' },
    { id: 'MCharcter6', label: 'Assassin', src: '/Avatars/MCharcter6.png' },
    { id: 'FCharacter1', label: 'Sorceress', src: '/Avatars/FCharacter1.png' },
    { id: 'FCharacter2', label: 'Huntress', src: '/Avatars/FCharacter2.png' },
    { id: 'FCharacter3', label: 'Cleric', src: '/Avatars/FCharacter3.png' },
    { id: 'FCharacter4', label: 'Mystic', src: '/Avatars/FCharacter4.png' },
    { id: 'FCharacter5', label: 'Warlock', src: '/Avatars/FCharacter5.png' },
    { id: 'FCharacter6', label: 'Paladin', src: '/Avatars/FCharacter6.png' },
];

const ACHIEVEMENTS = [
    { id: 1, title: 'First Step', desc: 'Sign in with Google to create your profile', img: badgeFirstStep, unlocked: false },
    { id: 2, title: 'Chapter Cleared', desc: 'Complete all 3 tests (Easy, Med, Hard) in any one chapter', img: badgeChapterCleared, unlocked: false },
    { id: 3, title: '11th Standard Hero', desc: 'Finish the 11th Std map for any one subject', img: badge11thStandardHero, unlocked: false },
    { id: 4, title: '12th Standard Hero', desc: 'Finish the 12th Std map for any one subject', img: badge12thStandardHero, unlocked: false },
    { id: 5, title: 'The Graduate', desc: 'Reach Level 50', img: badgeTheGraduate, unlocked: false },
    { id: 6, title: 'Immortal Scholar', desc: 'Reach Level 100', img: badgeImmortalScholar, unlocked: false },
    { id: 7, title: 'Sniper', desc: 'Complete a 25-question test with 100% accuracy', img: badgeSniper, unlocked: false },
    { id: 8, title: 'Sharpshooter', desc: 'Get 15 correct answers in a row (+4 streak)', img: badgeSharpshooter, unlocked: false },
    { id: 9, title: 'Speedster', desc: 'Finish a 25-minute test in under 10 minutes with >80% score', img: badgeSpeedster, unlocked: false },
    { id: 10, title: 'Elite Specialist', desc: 'Complete 5 "Hard" levels in a single day', img: badgeEliteSpecialist, unlocked: false },
    { id: 11, title: 'Calculated Risk', desc: 'Correctly answer a question you previously got wrong 3 times', img: badgeCalculatedRisk, unlocked: false },
    { id: 12, title: 'Perfect Session', desc: 'Score >90% in Physics, Chemistry, and Maths/Bio on the same day', img: badgePerfectSession, unlocked: false },
    { id: 13, title: 'Fire Starter', desc: 'Maintain a 3-day streak', img: badgeFireStarter, unlocked: false },
    { id: 14, title: 'Relentless', desc: 'Maintain a 30-day streak', img: badgeRelentless, unlocked: false },
    { id: 15, title: 'Early Bird', desc: 'Complete a test before 7:00 AM', img: badgeEarlyBird, unlocked: false },
    { id: 16, title: 'Night Owl', desc: 'Complete a test after 11:00 PM', img: badgeNightOwl, unlocked: false },
    { id: 17, title: 'Sunday Warrior', desc: 'Solve 100 questions on a Sunday', img: badgeSundayWarrior, unlocked: false },
    { id: 18, title: 'Librarian', desc: 'Spend a total of 50 hours in "Active Test" mode', img: badgeLibrarian, unlocked: false },
    { id: 19, title: 'Boss Slayer', desc: 'Complete your first Boss Battle (Mock Test)', img: badgeBossSlayer, unlocked: false },
    { id: 20, title: 'Tactical Genius', desc: 'Score >90% marks in a Boss Battle', img: badgeTacticalGenius, unlocked: false },
    { id: 21, title: 'Legacy Bearer', desc: 'Maintain a 100-day streak without using a "Streak Freeze"', img: badgeLegacyBearer, unlocked: false },
    { id: 22, title: 'Raid Legend', desc: 'Complete all 9 scheduled Boss Battles', img: badgeRaidLegend, unlocked: false },
    { id: 23, title: 'Analytical Beast', desc: 'Solve 10 consecutive Boss questions in under 3 minutes', img: badgeAnalyticalBeast, unlocked: false },
    { id: 24, title: 'Comeback Kid', desc: 'Improve a "Defeated" chapter score to 3 stars', img: badgeComebackKid, unlocked: false },
    { id: 25, title: 'The All-Rounder', desc: 'Unlock all other 24 achievements', img: badgeTheAllRounder, unlocked: false },
];

const ProfileSection = ({ stats, assets, onAvatarSelect, onClose, devMode, setDevMode }) => {
    const { currentUser, upgradeFromGuest } = useAuth();
    const [activeTab, setActiveTab] = useState('overview'); // overview, avatars, badges
    const [upgrading, setUpgrading] = useState(false);
    const [rankData, setRankData] = useState({ rank: '...', totalUsers: '...', percentile: '...' });

    // Fetch Global Rank
    useEffect(() => {
        if (currentUser && currentUser.uid !== 'guest123' && stats.xp !== undefined) {
            getGlobalRank(stats.xp).then(setRankData);
        }
    }, [currentUser, stats.xp]);

    // Compute unlocked achievements dynamically
    const isRealUser = currentUser && currentUser.uid !== 'guest123';
    const isGuest = currentUser?.uid === 'guest123';
    const achievements = ACHIEVEMENTS.map(ach => {
        if (ach.id === 1) return { ...ach, unlocked: isRealUser };
        return ach;
    });

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            await upgradeFromGuest();
        } catch (err) {
            console.error('Upgrade failed:', err);
        } finally {
            setUpgrading(false);
        }
    };

    return (
        <div className="pb-24 pt-4 px-4 animate-in slide-in-from-bottom duration-500">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#16161c] border border-white/10 p-6 mb-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => setActiveTab('avatars')}>
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/5 border border-white/10 mb-4 relative overflow-hidden">
                            {assets.avatar ? (
                                <img src={assets.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className={`w-full h-full rounded-full bg-gradient-to-br ${AVATARS[0].color} flex items-center justify-center`}>
                                    <User size={40} className="text-white/80" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-4 right-0 p-2 bg-blue-600 rounded-full border-2 border-[#16161c] text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Edit2 size={14} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight mb-1">{stats.name}</h2>

                    {/* Rank Badge */}
                    {(() => {
                        const rank = getRank(stats.lvl);
                        return (
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border uppercase ${rank.color} bg-white/5 border-white/10`}>
                                    ⚔ {rank.title}
                                </span>
                            </div>
                        );
                    })()}

                    <div className="flex items-center gap-2 mb-6">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black tracking-widest border border-blue-500/20">
                            LVL {stats.lvl}
                        </span>
                        <span className="text-white/20 text-xs font-bold">•</span>
                        <span className="text-white/40 text-xs font-bold tracking-wide">
                            {stats.xp} / {stats.nextXp} XP
                        </span>
                    </div>

                    {/* XP Progress */}
                    <div className="w-full max-w-xs h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${(stats.xp / stats.nextXp) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Guest → Google Sign In Banner */}
            {isGuest && (
                <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full mb-6 p-4 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-900/30 to-emerald-900/20 flex items-center gap-4 active:scale-[0.98] transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-sm font-black text-white uppercase tracking-wide">
                            {upgrading ? 'Signing in...' : 'Sign in with Google'}
                        </p>
                        <p className="text-[10px] text-green-400/80 font-medium uppercase tracking-wider mt-0.5">
                            Save your progress & unlock achievements
                        </p>
                    </div>
                    <div className="text-green-400 text-xl">→</div>
                </button>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {['overview', 'avatars', 'badges'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                            ${activeTab === tab
                                ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                                : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 bg-[#16161c] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">GLOBAL RANK</p>
                                <p className="text-xl font-black text-white italic">#{rankData.rank} <span className="text-sm text-green-500 font-bold not-italic">Top {100 - rankData.percentile}%</span></p>
                            </div>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">QUIZZES</p>
                            <p className="text-2xl font-black text-white">42</p>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">ACCURACY</p>
                            <p className="text-2xl font-black text-emerald-400">78%</p>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">BEST STREAK</p>
                            <p className="text-2xl font-black text-orange-400">12 🔥</p>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">COLLECTIBLES</p>
                            <p className="text-2xl font-black text-purple-400">1/25</p>
                        </div>
                        {/* Dev Mode Toggle */}
                        <div className="col-span-2 bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {devMode ? <Eye className="text-green-400" size={20} /> : <EyeOff className="text-white/40" size={20} />}
                                    <div>
                                        <p className="text-sm font-bold text-white">Dev Mode</p>
                                        <p className="text-[10px] text-white/40 font-medium">Enable developer features</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDevMode(!devMode)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${devMode ? 'bg-green-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${devMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'avatars' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AVATARS.map((avatar) => (
                            <div
                                key={avatar.id}
                                onClick={() => onAvatarSelect(avatar)}
                                className={`aspect-square rounded-2xl bg-[#16161c] border p-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative overflow-hidden
                                    ${assets.avatarId === avatar.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
                                `}
                            >
                                <div className="w-full h-full rounded-xl overflow-hidden relative">
                                    <img
                                        src={avatar.src}
                                        alt={avatar.label}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                </div>

                                <span className="absolute bottom-3 text-[10px] font-black tracking-widest uppercase text-white drop-shadow-md z-10">
                                    {avatar.label}
                                </span>

                                {assets.avatarId === avatar.id && (
                                    <div className="absolute top-2 right-2 p-1 bg-blue-500 rounded-full shadow-lg z-20">
                                        <Check size={10} className="text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {achievements.map((ach) => (
                            <div key={ach.id} className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all ${ach.unlocked
                                ? 'bg-gradient-to-b from-[#16161c] to-blue-900/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                : 'bg-[#16161c]/50 border-white/5'}`}
                            >
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 relative ${!ach.unlocked ? 'grayscale opacity-40' : ''}`}>
                                    <img src={ach.img} alt={ach.title} className="w-full h-full object-contain" />
                                    {!ach.unlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <Lock size={16} className="text-white/60" />
                                        </div>
                                    )}
                                </div>
                                <h4 className={`text-[10px] sm:text-xs font-black text-center uppercase tracking-wide leading-tight ${ach.unlocked ? 'text-white' : 'text-white/30'}`}>
                                    {ach.title}
                                </h4>
                                <p className="text-[8px] text-white/30 text-center mt-1 leading-tight line-clamp-2 hidden sm:block">{ach.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Developer Options Toggle */}
            <div className="mt-4 px-1">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {devMode ? <Eye className="text-green-400" size={16} /> : <EyeOff className="text-white/40" size={16} />}
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Dev Mode: Answers</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDevMode(!devMode)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${devMode ? 'bg-green-500' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${devMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Admin Access (Hidden/Subtle) */}
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-4">
                <button
                    onClick={() => onClose('admin')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    <Shield size={14} />
                    Admin Panel
                </button>
                <button
                    onClick={() => onClose('logout')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    <Lock size={14} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileSection;
