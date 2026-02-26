import React from 'react';
import { X, Flame, Check, Sparkles, ChevronRight } from 'lucide-react';

const StreakModal = ({ stats, onClose }) => {
    const streak = stats.streak || 0;
    const name = stats.name || 'Hero';
    const activity = stats.activity || [];
    const today = new Date().toISOString().split('T')[0];

    // Generate week days (Mon to Sun)
    const days = [];
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    for (let i = 0; i < 7; i++) {
        const d = new Date(curr.setDate(first + i));
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push({
            date: dateStr,
            label: dayLabel,
            active: activity.includes(dateStr),
            isToday: dateStr === today
        });
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Backdrop with Vignette */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}>
                <div className="absolute inset-0 bg-radial-vignette opacity-50" />
            </div>

            <style>
                {`
                    .bg-radial-vignette {
                        background: radial-gradient(circle, transparent 20%, black 100%);
                    }
                    @keyframes slow-pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                    }
                    .animate-slow-pulse {
                        animation: slow-pulse 2.5s ease-in-out infinite;
                    }
                `}
            </style>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[40px] p-8 shadow-[0_30px_60px_rgba(124,58,237,0.4)] overflow-hidden">
                {/* Top-left Highlight */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                {/* Decorative Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl p-10 animate-pulse" />

                {/* Close Button - Polished */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/90 rounded-full text-indigo-900 shadow-lg border border-white/20 hover:scale-110 transition-transform z-20"
                >
                    <X size={20} strokeWidth={3} />
                </button>

                <div className="flex flex-col items-center text-center gap-4 mt-2">
                    {/* Main Icon Area - Reduced Size & Pulsing */}
                    <div className="relative mb-1">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-inner animate-slow-pulse">
                            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-2xl rotate-12">
                                <Flame size={36} className="text-orange-500 fill-orange-500 -rotate-12" />
                            </div>
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-bounce" size={24} />
                    </div>

                    {/* Streak Count - Tightened Spacing */}
                    <div className="space-y-0.5">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">
                            {streak} Days Streak
                        </h2>
                        <p className="text-white/85 font-semibold text-sm">
                            You're doing really great, on fire, {name.split(' ')[0]}!
                        </p>
                    </div>

                    {/* Weekly Progress Card - Centered & Compact */}
                    <div className="w-full bg-black/25 backdrop-blur-md rounded-[32px] p-6 border border-white/10 mt-1 shadow-inner flex justify-center">
                        <div className="flex gap-2.5 sm:gap-4 items-center">
                            {days.map((day) => (
                                <div key={day.date} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 
                                        ${day.active
                                            ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110'
                                            : day.isToday
                                                ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)] scale-110'
                                                : 'bg-white/5 border border-white/10'}`}
                                    >
                                        {day.active ? (
                                            <Check size={14} className="text-white" strokeWidth={4} />
                                        ) : day.isToday ? (
                                            <Flame size={14} className="text-white fill-white" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        )}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-wider ${day.active || day.isToday ? 'text-white' : 'text-white/30'}`}>
                                        {day.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Continue Button - CTA Polish */}
                    <button
                        onClick={onClose}
                        className="w-full py-6 bg-white rounded-2xl text-indigo-700 font-black uppercase tracking-[0.1em] text-sm shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.3)] active:scale-95 transition-all mt-4"
                    >
                        Keep Grinding
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StreakModal;
