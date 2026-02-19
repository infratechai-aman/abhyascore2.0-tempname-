import React from 'react';
import { X, BookOpen, GraduationCap, ChevronRight, Zap, Hexagon } from 'lucide-react';

const ClassSelectionModal = ({ subject, onClose, onSelectClass }) => {
    if (!subject) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />

            <div className="w-full max-w-md relative group animate-in zoom-in-95 duration-300">
                {/* Glow Behind */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${subject.gradient || 'from-blue-600 to-purple-600'} rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000`} />

                <div className="relative bg-[#0c0c10]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-1">

                    {/* Header Section */}
                    <div className="relative p-8 pb-6 flex flex-col items-center text-center overflow-hidden">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-white/20 hover:text-white hover:bg-white/10 transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        {/* Decorative Background Elements */}
                        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${subject.gradient || 'from-blue-600/20 to-transparent'} opacity-30 blur-xl`} />
                        <Hexagon className="absolute top-4 left-4 text-white/5 animate-spin-slow" size={48} />
                        <Zap className="absolute bottom-4 right-4 text-white/5" size={24} />

                        {/* Subject Icon */}
                        <div className="relative mb-4 group/icon">
                            <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient || 'from-blue-500 to-purple-500'} blur-xl opacity-40 group-hover/icon:opacity-60 transition-opacity`} />
                            <div className="w-20 h-20 bg-[#16161c] border border-white/10 rounded-2xl flex items-center justify-center shadow-xl relative z-10 rotate-3 group-hover/icon:rotate-0 transition-all duration-500">
                                <span className="transform scale-125 md:scale-150">
                                    {/* Clone element to add generic classes if it's a valid element */}
                                    {React.isValidElement(subject.icon) ?
                                        React.cloneElement(subject.icon, {
                                            size: 40,
                                            className: `drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`
                                        }) : subject.icon
                                    }
                                </span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-1 relative z-10 drop-shadow-lg">
                            {subject.title}
                        </h2>
                        <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase relative z-10">SELECT ACADEMIC PROTOCOL</p>
                    </div>

                    {/* Class Options */}
                    <div className="p-4 space-y-3 bg-[#08080a]/50">
                        {/* Class 11 */}
                        <button
                            onClick={() => onSelectClass(11)}
                            className="w-full group/card relative overflow-hidden bg-[#121216] hover:bg-[#16161c] border border-white/5 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-300 flex items-center gap-4 text-left"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover/card:scale-110 transition-transform relative z-10">
                                <BookOpen className="text-blue-400" size={24} />
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-white font-black text-lg tracking-wide group-hover/card:text-blue-400 transition-colors">CLASS XI</h3>
                                <div className="flex items-center gap-2">
                                    <span className="h-0.5 w-4 bg-blue-500/50 rounded-full" />
                                    <p className="text-white/40 text-xs font-bold tracking-wider uppercase">FOUNDATION PHASE</p>
                                </div>
                            </div>

                            <ChevronRight className="text-white/20 group-hover/card:text-blue-400 group-hover/card:translate-x-1 transition-all relative z-10" />
                        </button>

                        {/* Class 12 */}
                        <button
                            onClick={() => onSelectClass(12)}
                            className="w-full group/card relative overflow-hidden bg-[#121216] hover:bg-[#16161c] border border-white/5 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-300 flex items-center gap-4 text-left"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

                            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover/card:scale-110 transition-transform relative z-10">
                                <GraduationCap className="text-purple-400" size={24} />
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-white font-black text-lg tracking-wide group-hover/card:text-purple-400 transition-colors">CLASS XII</h3>
                                <div className="flex items-center gap-2">
                                    <span className="h-0.5 w-4 bg-purple-500/50 rounded-full" />
                                    <p className="text-white/40 text-xs font-bold tracking-wider uppercase">ADVANCED PROTOCOL</p>
                                </div>
                            </div>

                            <ChevronRight className="text-white/20 group-hover/card:text-purple-400 group-hover/card:translate-x-1 transition-all relative z-10" />
                        </button>
                    </div>

                    {/* Footer Warning/Info */}
                    <div className="bg-[#050507] p-3 text-center border-t border-white/5">
                        <p className="text-[10px] text-white/20 font-mono">CAUTION: CONTENT FILTERING ENGAGED</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassSelectionModal;
