import React from 'react';
import { Flame, Hexagon, Trophy } from 'lucide-react';

const Header = ({ stats, assets, onViewProfile, onStreakClick }) => {
    return (
        <header className="relative z-20 flex flex-col gap-4 mb-2 p-2">
            {/* Top Row: User Info */}
            <div className="flex justify-between items-start w-full">
                <div
                    onClick={onViewProfile}
                    className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-white/5 bg-[#0c0c10]/40 backdrop-blur-md hover:bg-white/5 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-[2px] shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                            {assets.avatar ? (
                                <img src={assets.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-black italic text-white/80">OP</div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-black text-white tracking-wide group-hover:text-blue-400 transition-colors">{stats.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 rounded border border-blue-500/20">LVL {stats.lvl}</span>
                        </div>
                    </div>
                </div>

                {/* Currency Container */}
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-[#0c0c10]/60 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                        <span className="text-xs font-black text-white tracking-wider">{stats.gold}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0c0c10]/60 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                        <Hexagon size={14} className="text-emerald-400 fill-emerald-400/20 rotate-90" strokeWidth={2.5} />
                        <span className="text-xs font-black text-white tracking-wider">{stats.gems}</span>
                    </div>
                </div>
            </div>

            {/* Streak & Rank */}
            <div className="flex items-center gap-2 px-1">
                <div
                    onClick={onStreakClick}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-500/5 transition-colors active:scale-95"
                >
                    <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
                    <span className="text-xs font-black text-orange-400 italic tracking-wider">{stats.streak} DAY STREAK</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
