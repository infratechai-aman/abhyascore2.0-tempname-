import React, { useState } from 'react';
import { User, Shield, Sword, Trophy, Target, Zap, Edit2, Lock, Check } from 'lucide-react';

const AVATARS = [
    { id: 'op', label: 'Operator', color: 'from-blue-500 to-indigo-600' },
    { id: 'fox', label: 'Cyber Fox', color: 'from-orange-500 to-red-600' },
    { id: 'bot', label: 'Mecha Bot', color: 'from-emerald-500 to-teal-600' },
    { id: 'void', label: 'Void Walker', color: 'from-purple-500 to-violet-600' },
];

const ACHIEVEMENTS = [
    { id: 1, title: 'First Blood', desc: 'Complete your first chapter', icon: <Sword size={20} />, unlocked: true },
    { id: 2, title: 'Sharpshooter', desc: 'Get 100% accuracy in a quiz', icon: <Target size={20} />, unlocked: false },
    { id: 3, title: 'Speed Demon', desc: 'Finish a quiz in under 5 mins', icon: <Zap size={20} />, unlocked: false },
    { id: 4, title: 'Veteran', desc: 'Reach Level 10', icon: <Shield size={20} />, unlocked: true },
];

const ProfileSection = ({ stats, assets, onAvatarSelect, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, avatars, badges

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
                            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">CURRENT RANK</p>
                                <p className="text-xl font-black text-white italic">#240 <span className="text-sm text-green-500 font-bold not-italic">▲ 12</span></p>
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
                            <p className="text-2xl font-black text-purple-400">5/24</p>
                        </div>
                    </div>
                )}

                {activeTab === 'avatars' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AVATARS.map((avatar) => (
                            <div
                                key={avatar.id}
                                onClick={() => onAvatarSelect(avatar)}
                                className="aspect-square rounded-2xl bg-[#16161c] border border-white/10 p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                            >
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                                    <User size={24} className="text-white/80" />
                                </div>
                                <span className="text-xs font-bold text-white/60 tracking-wider uppercase group-hover:text-white">{avatar.label}</span>
                                {assets.avatarId === avatar.id && (
                                    <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                                        <Check size={12} className="text-black" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="space-y-3">
                        {ACHIEVEMENTS.map((ach) => (
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

            {/* Admin Access (Hidden/Subtle) */}
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
                <button
                    onClick={() => onClose('admin')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    <Shield size={14} />
                    Admin Panel
                </button>
            </div>
        </div>
    );
};

export default ProfileSection;
