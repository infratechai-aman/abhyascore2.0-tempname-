import React from 'react';
import { Map as MapIcon, Trophy, Sword, Package, User } from 'lucide-react';

const BottomNav = ({ view, setView, setSelectedSub }) => {
    return (
        <nav className="fixed bottom-4 left-4 right-4 h-16 bg-[#0c0c10]/80 backdrop-blur-xl border border-white/5 rounded-[24px] flex items-center justify-around px-4 z-50 shadow-2xl">
            {/* Quests Tab */}
            <div
                onClick={() => { setView('home'); setSelectedSub(null); }}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer group ${view === 'home' || view === 'map' ? 'text-blue-500 scale-105' : 'text-white/20 hover:text-white/40'}`}
            >
                <MapIcon size={20} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">QUESTS</span>
            </div>

            {/* Ranks Tab */}
            <div
                onClick={() => setView('ranks')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer group ${view === 'ranks' ? 'text-yellow-500 scale-105' : 'text-white/20 hover:text-white/40'}`}
            >
                <Trophy size={20} className="group-active:scale-90 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">RANKS</span>
            </div>

            {/* Battle Button */}
            <div className="relative group cursor-pointer" onClick={() => setView('battle')}>
                <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all opacity-0 group-hover:opacity-100" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 -translate-y-6 rounded-2xl shadow-[0_8px_16px_rgba(37,99,235,0.4)] border-2 border-[#0c0c10] flex items-center justify-center active:scale-90 transition-all hover:-translate-y-7">
                    <Sword size={24} className="text-white fill-white/20" />
                </div>
            </div>

            {/* Items Tab */}
            <div
                onClick={() => setView('items')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer group ${view === 'items' ? 'text-purple-500 scale-105' : 'text-white/20 hover:text-white/40'}`}
            >
                <Package size={20} className="group-active:scale-90 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">ITEMS</span>
            </div>

            {/* Hero (Profile) Tab */}
            <div
                onClick={() => setView('profile')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer group ${view === 'profile' ? 'text-emerald-500 scale-105' : 'text-white/20 hover:text-white/40'}`}
            >
                <User size={20} className="group-active:scale-90 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">HERO</span>
            </div>
        </nav>
    );
};

export default BottomNav;
