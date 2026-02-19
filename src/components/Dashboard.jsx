import React from 'react';
import { Skull, Trophy } from 'lucide-react';

const Dashboard = ({ subjects, assets, setSelectedSub, setView, stats }) => {
    return (
        <div className="space-y-2.5 animate-in fade-in duration-500 pb-10">
            <div className="grid grid-cols-2 gap-2 mt-1">
                {subjects.map(s => (
                    <div
                        key={s.id}
                        onClick={() => { setSelectedSub(s); setView('map'); }}
                        className="relative aspect-[16/11] rounded-xl border border-white/10 overflow-hidden active:scale-95 transition-all cursor-pointer shadow-lg group bg-slate-900"
                    >
                        {/* Subject Image or Placeholder */}
                        {assets[s.assetKey] ? (
                            <img src={assets[s.assetKey]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={s.title} />
                        ) : (
                            <div className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${s.gradient}`} />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-left">
                            <h4 className="text-white font-black italic text-[12px] tracking-widest uppercase mb-0.5 drop-shadow-md">{s.title}</h4>
                            <p className="text-[7px] text-white/60 font-medium uppercase tracking-wider leading-none">{s.sub}</p>
                        </div>

                        {/* Subject Icon/Graphic Placeholder (Only show if no image, or as overlay) */}
                        {!assets[s.assetKey] && (
                            <div className="absolute top-2 right-2 opacity-50">
                                {s.icon}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="relative h-20 rounded-2xl border border-white/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-xl group bg-slate-900">
                {assets.boss ? (
                    <img src={assets.boss} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" alt="Boss Battle" />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-900/40 to-slate-900 transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center px-5 justify-between">
                    <div className="text-left z-10">
                        <h4 className="text-lg font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-lg">BOSS BATTLE</h4>
                        <p className="text-[8px] text-red-500 font-bold tracking-widest uppercase mt-1">JEE / NEET MOCK TEST</p>
                    </div>
                    {!assets.boss && <Skull className="text-red-500/20 rotate-12" size={48} />}
                </div>
            </div>

            <div className="relative h-20 rounded-2xl border border-white/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-xl group bg-slate-900">
                {assets.achievements ? (
                    <img src={assets.achievements} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" alt="Achievements" />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-900/40 to-slate-900 transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center px-5 justify-between">
                    <div className="text-left z-10">
                        <h4 className="text-lg font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-lg">ACHIEVEMENTS</h4>
                        <p className="text-[8px] text-amber-500 font-bold tracking-widest uppercase mt-1">15 / 75 BADGES COLLECTED</p>
                    </div>
                    {!assets.achievements && <Trophy className="text-amber-500/20 -rotate-12" size={48} />}
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between backdrop-blur-md">
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-white/40 uppercase italic leading-none">Level {stats.lvl}</span>
                    <span className="text-[10px] font-black text-white italic mt-1 uppercase tracking-widest">Scholar</span>
                </div>
                <div className="flex-1 mx-4 h-2 bg-black/40 rounded-full border border-white/5 p-[1px] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#10b981] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ width: '76%' }} />
                </div>
                <span className="text-[9px] font-bold text-white/50 italic whitespace-nowrap tracking-wider">{stats.xp} / {stats.nextXp} XP</span>
            </div>
        </div>
    );
};

export default Dashboard;
