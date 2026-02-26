import React from 'react';
import { ChevronLeft, ChevronRight, Zap, Beaker, Calculator, Dna, Brain, Gamepad2, Search, Filter, Trophy, Star, Clock, Play, Timer, Target } from 'lucide-react';

const MiniGamesMenu = ({ setView, assets }) => {
    const games = [
        {
            id: 'battle',
            title: 'Calculation Clash',
            description: 'Fast-paced mental math battle against AbhyasBotX.',
            icon: <Zap size={24} className="text-orange-500" />,
            color: 'from-orange-600/20 to-orange-900/40',
            borderColor: 'border-orange-500/30',
            textColor: 'text-orange-400',
            image: assets.boss || null, // Reuse boss image for battle feel
            badge: 'LIVE'
        },
        {
            id: 'ion_glide',
            title: 'Ion Glide',
            description: 'Futuristic air hockey. First to 5 points wins the energy field.',
            icon: <Gamepad2 size={24} className="text-blue-500" />,
            color: 'from-blue-600/20 to-blue-900/40',
            borderColor: 'border-blue-500/30',
            textColor: 'text-blue-400',
            badge: 'LIVE'
        },
        {
            id: 'riddle_cipher',
            title: 'Riddle Cipher',
            description: '100 Levels of neural-decoding riddles. Can you solve them all?',
            icon: <Brain size={24} className="text-purple-500" />,
            color: 'from-purple-600/20 to-purple-900/40',
            borderColor: 'border-purple-500/30',
            textColor: 'text-purple-400',
            badge: 'LIVE'
        },
        {
            id: 'math_maze',
            title: 'Math Maze',
            description: '100 Stages of arithmetic logic and numerical patterns. Solve the sequence!',
            icon: <Calculator size={24} className="text-emerald-500" />,
            color: 'from-emerald-600/20 to-emerald-900/40',
            borderColor: 'border-emerald-500/30',
            textColor: 'text-emerald-400',
            badge: 'LIVE'
        },
        {
            id: 'periodic_panic',
            title: 'Periodic Panic',
            description: 'Identify elements and their properties in a flash.',
            icon: <Timer size={24} className="text-emerald-500" />,
            color: 'from-emerald-600/20 to-emerald-900/40',
            borderColor: 'border-emerald-500/30',
            textColor: 'text-emerald-400',
            badge: 'COMING SOON'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 p-4">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-2">
                    <Gamepad2 size={16} className="text-purple-500" />
                    <span className="text-[10px] font-black italic text-purple-400 uppercase tracking-[0.2em]">Gaming Hall</span>
                </div>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">Mini-Games</h2>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Sharpen your reflexes, master your subjects</p>
            </div>

            <div className="grid gap-4">
                {games.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => game.badge === 'LIVE' && setView(game.id)}
                        className={`
                            relative overflow-hidden rounded-2xl border ${game.borderColor} bg-slate-900/50 backdrop-blur-md
                            transition-all duration-300 group
                            ${game.badge === 'LIVE' ? 'cursor-pointer active:scale-[0.98] h-32' : 'opacity-60 grayscale h-24'}
                        `}
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-30`} />

                        {/* Game Image Background (if live) */}
                        {game.image && game.badge === 'LIVE' && (
                            <img src={game.image} className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110" alt="" />
                        )}

                        <div className="absolute inset-0 p-5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl bg-black/40 border ${game.borderColor} flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_currentColor] ${game.textColor} transition-all`}>
                                    {game.icon}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">{game.title}</h4>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${game.badge === 'LIVE' ? 'bg-orange-500 text-white border-white/20' : 'bg-white/5 text-white/40 border-white/5'}`}>
                                            {game.badge}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-medium text-white/50 uppercase tracking-wider max-w-[200px] leading-relaxed">
                                        {game.description}
                                    </p>
                                </div>
                            </div>

                            {game.badge === 'LIVE' && (
                                <ChevronRight className={`${game.textColor} group-hover:translate-x-1 transition-transform`} size={24} />
                            )}
                        </div>

                        {/* Scanning Line Effect for Live Games */}
                        {game.badge === 'LIVE' && (
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow top-1/2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Stats Footer Placeholder */}
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-xl">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">More Challenges Coming Soon</span>
            </div>
        </div>
    );
};

export default MiniGamesMenu;
