import React, { useState } from 'react';
import { User, Shield, Sword, Trophy, Target, Zap, Edit2, Lock, Check, Eye, EyeOff, Award, Crown, Flame, Sun, Moon, Calendar, Book, Skull, Swords, TrendingUp, Brain, Star } from 'lucide-react';

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



const ProfileSection = ({ stats, assets, chapters, onAvatarSelect, onClose, devMode, setDevMode }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, avatars, badges

    // Debug Stats
    console.log("Profile Stats:", stats);

    // Calculate derived stats
    const accuracy = Math.round(((stats.correctAnswers || 0) / (stats.totalQuestions || 1)) * 100) || 0;
    const calculatedRank = Math.max(1, 5000 - Math.floor(stats.xp / 10)); // Simple mock rank based on XP
    const achievementsData = stats.achievements || {};
    const lvl = stats.lvl || 1;

    const checkChapterCleared = () => {
        return chapters?.some(ch => ch.completedModes && ch.completedModes.length === 3);
    };

    const checkStandardHero = (std) => {
        if (!chapters) return false;
        const subjects = ['phy', 'chem', 'math', 'bio', 'zoo'];
        return subjects.some(subId => {
            const subChapters = chapters.filter(c => c.subject === subId && c.class === std);
            if (subChapters.length === 0) return false;
            return subChapters.every(c => c.completedModes?.length === 3);
        });
    };

    // Rank System Logic
    const RANK_TITLES = [
        "Rookie Aspirant",      // 1-9
        "Syllabus Starter",     // 10-19
        "Concept Loader",       // 20-29
        "Problem Cracker",      // 30-39
        "Rank Climber",         // 40-49
        "Test Tactician",       // 50-59
        "Precision Solver",     // 60-69
        "Percentile Predator",  // 70-79
        "Elite Contender",      // 80-89
        "AIR Challenger",       // 90-99
        "AIR-1"                 // 100
    ];

    const getRankTitle = (lvl) => {
        if (lvl >= 100) return RANK_TITLES[10];
        return RANK_TITLES[Math.floor(Math.max(0, lvl - 1) / 10)] || "Rookie Aspirant";
    };

    const getRankFrameColor = (lvl) => {
        if (lvl >= 100) return "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 animate-text-shimmer bg-[length:200%_auto]"; // Pure Gold
        if (lvl >= 90) return "text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]"; // Red/Ruby
        if (lvl >= 80) return "text-purple-400 border-purple-500/50"; // Purple
        if (lvl >= 70) return "text-emerald-400 border-emerald-500/50"; // Emerald
        if (lvl >= 50) return "text-blue-400 border-blue-500/50"; // Blue
        return "text-white/60 border-white/10"; // Basic
    };

    const currentRankTitle = getRankTitle(stats.lvl);
    const rankFrame = getRankFrameColor(stats.lvl);

    const achievementsList = [
        // Basics
        { id: 1, title: 'First Step', desc: 'Log in and create your profile', icon: <User size={20} />, unlocked: true },
        { id: 2, title: 'Chapter Cleared', desc: 'Complete all 3 tests in any chapter', icon: <Check size={20} />, unlocked: checkChapterCleared() },
        { id: 3, title: '11th Standard Hero', desc: 'Finish the 11th Std map for any subject', icon: <Trophy size={20} />, unlocked: checkStandardHero(11) },
        { id: 4, title: '12th Standard Hero', desc: 'Finish the 12th Std map for any subject', icon: <Trophy size={20} />, unlocked: checkStandardHero(12) },
        { id: 5, title: 'The Graduate', desc: 'Reach Level 50', icon: <Award size={20} />, unlocked: (stats.lvl >= 50) },
        { id: 6, title: 'Immortal Scholar', desc: 'Reach Level 100', icon: <Crown size={20} />, unlocked: (stats.lvl >= 100) },

        // Skill Based
        { id: 7, title: 'Sniper', desc: 'Complete a 25-question test with 100% accuracy', icon: <Target size={20} />, unlocked: achievementsData.sniper },
        { id: 8, title: 'Sharpshooter', desc: 'Get 15 correct answers in a row', icon: <Target size={20} />, unlocked: (stats.bestStreak >= 15) },
        { id: 9, title: 'Speedster', desc: 'Finish a 25-min test in under 10 mins (>80%)', icon: <Zap size={20} />, unlocked: achievementsData.speedster },
        { id: 10, title: 'Elite Specialist', desc: 'Complete 5 "Hard" levels in a single day', icon: <Sword size={20} />, unlocked: achievementsData.eliteSpecialist },
        { id: 11, title: 'Calculated Risk', desc: 'Correctly answer a question wrong 3 times', icon: <Brain size={20} />, unlocked: achievementsData.calculatedRisk }, // Placeholder logic flag
        { id: 12, title: 'Perfect Session', desc: '>90% in Phy, Chem, Math/Bio on same day', icon: <Star size={20} />, unlocked: achievementsData.perfectSessionUnlocked },

        // Streak Based
        { id: 13, title: 'Fire Starter', desc: 'Maintain a 3-day streak', icon: <Flame size={20} />, unlocked: (stats.streak >= 3) },
        { id: 14, title: 'Relentless', desc: 'Maintain a 30-day streak', icon: <Flame size={20} />, unlocked: (stats.streak >= 30) },

        // Time Based
        { id: 15, title: 'Early Bird', desc: 'Complete a test before 7:00 AM', icon: <Sun size={20} />, unlocked: achievementsData.earlyBird },
        { id: 16, title: 'Night Owl', desc: 'Complete a test after 11:00 PM', icon: <Moon size={20} />, unlocked: achievementsData.nightOwl },
        { id: 17, title: 'Sunday Warrior', desc: 'Solve 100 questions on a Sunday', icon: <Calendar size={20} />, unlocked: achievementsData.sundayWarrior },
        { id: 18, title: 'Librarian', desc: 'Spend 50 hours in "Active Test" mode', icon: <Book size={20} />, unlocked: ((stats.totalTime || 0) / 3600 >= 50) },

        // Boss / Special
        { id: 19, title: 'Boss Slayer', desc: 'Complete your first Boss Battle', icon: <Skull size={20} />, unlocked: (stats.bossBattles?.completed >= 1) },
        { id: 20, title: 'Tactical Genius', desc: 'Score >90% in a Boss Battle', icon: <Brain size={20} />, unlocked: (stats.bossBattles?.bestScore > 90) },
        { id: 21, title: 'Legacy Bearer', desc: 'Maintain a 100-day streak', icon: <Shield size={20} />, unlocked: (stats.streak >= 100) },
        { id: 22, title: 'Raid Legend', desc: 'Complete all 9 scheduled Boss Battles', icon: <Swords size={20} />, unlocked: (stats.bossBattles?.completed >= 9) },
        { id: 23, title: 'Analytical Beast', desc: 'Solve 10 consecutive Boss Qs in under 3 mins', icon: <Zap size={20} />, unlocked: achievementsData.analyticalBeast },
        { id: 24, title: 'Comeback Kid', desc: 'Improve a "Defeated" score to 3 stars', icon: <TrendingUp size={20} />, unlocked: achievementsData.comebackKid },
    ];

    // The All-Rounder (25th Achievement)
    const unlockedCount = achievementsList.filter(a => a.unlocked).length;
    achievementsList.push({
        id: 25,
        title: 'The All-Rounder',
        desc: 'Unlock all other 24 achievements',
        icon: <Trophy size={20} className="text-yellow-400" />,
        unlocked: unlockedCount === 24
    });

    const unlockedCollectibles = achievementsList.filter(a => a.unlocked).length;

    return (
        <div className="pb-24 pt-4 px-4 animate-in slide-in-from-bottom duration-500">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#16161c] border border-white/10 p-6 mb-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => setActiveTab('avatars')}>
                        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 border-2 mb-4 relative overflow-hidden transition-all duration-300 ${stats.lvl >= 100 ? 'border-yellow-400 animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'border-white/10 bg-gradient-to-br from-white/20 to-white/5'}`}>
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
                    <div className={`mb-4 px-4 py-1.5 rounded-full border bg-black/40 font-black text-xs uppercase tracking-widest backdrop-blur-md ${rankFrame}`}>
                        {currentRankTitle}
                    </div>

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
                            <div className={`p-3 rounded-xl ${stats.lvl >= 100 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                <Trophy size={24} />
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">CURRENT TITLE</p>
                                <p className={`text-xl font-black italic ${stats.lvl >= 100 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 animate-pulse' : 'text-white'}`}>
                                    {currentRankTitle}
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">QUIZZES</p>
                            <p className="text-2xl font-black text-white">{stats.totalTests || 0}</p>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">ACCURACY</p>
                            <p className="text-2xl font-black text-emerald-400">{accuracy}%</p>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">BEST STREAK</p>
                            <p className="text-2xl font-black text-orange-400">{stats.bestStreak || stats.streak || 0} 🔥</p>
                        </div>
                        <div className="bg-[#16161c] border border-white/5 p-4 rounded-2xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">COLLECTIBLES</p>
                            <p className="text-2xl font-black text-purple-400">{unlockedCollectibles}/{achievementsList.length}</p>
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
                    <div className="space-y-3">
                        {achievementsList.map((ach) => (
                            <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${ach.unlocked ? 'bg-gradient-to-r from-[#16161c] to-blue-900/10 border-blue-500/20' : 'bg-[#16161c]/50 border-white/5 opacity-50'}`}>
                                <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-white/20'}`}>
                                    {ach.unlocked ? ach.icon : <Lock size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-black text-sm uppercase tracking-wide mb-1 ${ach.unlocked ? 'text-white' : 'text-white/40'}`}>{ach.title}</h4>
                                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{ach.desc}</p>
                                </div>
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
                {devMode && (
                    <button
                        onClick={() => onClose('admin')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <Shield size={14} />
                        Admin Panel
                    </button>
                )}

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
