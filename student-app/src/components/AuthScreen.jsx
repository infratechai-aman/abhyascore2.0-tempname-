import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, BookOpen, Stethoscope, AlertCircle, Zap, Hexagon, Shield } from 'lucide-react';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [stream, setStream] = useState('JEE'); // 'JEE' or 'NEET'

    const { login, signup, guestLogin, googleLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name) throw new Error("Name is required");
                await signup(email, password, name, stream);
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Assets */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,27,75,0.4),#000000)] pointer-events-none" />
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />

            {/* Main Auth Card */}
            <div className="w-full max-w-md relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse" />

                <div className="relative bg-[#0c0c10]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden">

                    {/* Decorative Tech Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute top-6 right-6 text-white/10 animate-spin-slow">
                        <Hexagon size={40} strokeWidth={1} />
                    </div>
                    <div className="absolute bottom-6 left-6 text-white/10">
                        <Zap size={24} strokeWidth={1} />
                    </div>

                    {/* Header */}
                    <div className="flex flex-col items-center mb-10 relative z-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                            <div className="w-20 h-20 rounded-2xl bg-[#16161c] border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] rotate-3 group-hover:rotate-0 transition-all duration-500">
                                <BookOpen size={36} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#0c0c10] border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono text-white/60">V2.0</div>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter mb-1 relative">
                            ABHYAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CORE</span>
                        </h1>
                        <p className="text-blue-200/40 text-xs font-bold tracking-[0.2em] uppercase">System Access Protocol</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle size={16} />
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {!isLogin && (
                            <div className="group relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="CODENAME (FULL NAME)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#16161c] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:bg-[#1c1c24] transition-all placeholder:text-white/20"
                                />
                            </div>
                        )}

                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                placeholder="ACCESS ID (EMAIL)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#16161c] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:bg-[#1c1c24] transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="group relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                placeholder="PASSCODE"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#16161c] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:bg-[#1c1c24] transition-all placeholder:text-white/20"
                            />
                        </div>

                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 py-2">
                                <div
                                    onClick={() => setStream('JEE')}
                                    className={`relative cursor-pointer rounded-xl p-4 flex flex-col items-center gap-2 border transition-all duration-300 overflow-hidden group/card
                                    ${stream === 'JEE' ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]' : 'bg-[#16161c] border-white/5 hover:border-white/10'}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity ${stream === 'JEE' ? 'opacity-100' : ''}`} />
                                    <BookOpen size={24} className={stream === 'JEE' ? 'text-blue-400' : 'text-white/20 group-hover/card:text-white/40 transition-colors'} />
                                    <span className={`text-[10px] font-black tracking-widest relative z-10 ${stream === 'JEE' ? 'text-white' : 'text-white/40'}`}>JEE (MATH)</span>
                                </div>

                                <div
                                    onClick={() => setStream('NEET')}
                                    className={`relative cursor-pointer rounded-xl p-4 flex flex-col items-center gap-2 border transition-all duration-300 overflow-hidden group/card
                                    ${stream === 'NEET' ? 'bg-emerald-600/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-[#16161c] border-white/5 hover:border-white/10'}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity ${stream === 'NEET' ? 'opacity-100' : ''}`} />
                                    <Stethoscope size={24} className={stream === 'NEET' ? 'text-emerald-400' : 'text-white/20 group-hover/card:text-white/40 transition-colors'} />
                                    <span className={`text-[10px] font-black tracking-widest relative z-10 ${stream === 'NEET' ? 'text-white' : 'text-white/40'}`}>NEET (BIO)</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-[1px] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-shadow duration-300"
                        >
                            <div className="bg-[#0c0c10] rounded-xl relative overflow-hidden transition-all group-hover:bg-transparent">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center justify-center gap-3 py-4">
                                    <span className="font-black text-sm tracking-widest uppercase text-white group-hover:scale-105 transition-transform">
                                        {loading ? 'INITIALIZING...' : (isLogin ? 'INITIATE SEQUENCE' : 'REGISTER CADET')}
                                    </span>
                                    <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>

                        {/* Google Login */}
                        <button
                            type="button"
                            onClick={() => {
                                setLoading(true); // Show loading state
                                googleLogin(stream).catch(err => {
                                    console.error(err);
                                    setError("Google Sign-In Failed");
                                    setLoading(false);
                                });
                            }}
                            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white/80 text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group/google mb-3"
                        >
                            <svg className="w-4 h-4 group-hover/google:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Sign in with Google</span>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => guestLogin('JEE')}
                                className="w-full py-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400/60 text-[10px] uppercase font-bold tracking-widest hover:bg-blue-500/10 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group/bypass"
                            >
                                <Shield size={12} className="group-hover/bypass:text-blue-400 transition-colors" />
                                <span>GUEST (JEE)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => guestLogin('NEET')}
                                className="w-full py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400/60 text-[10px] uppercase font-bold tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 group/bypass"
                            >
                                <Shield size={12} className="group-hover/bypass:text-emerald-400 transition-colors" />
                                <span>GUEST (NEET)</span>
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center relative z-10">
                        <p className="text-white/30 text-xs font-medium">
                            {isLogin ? "NEW RECRUIT?" : "ALREADY REGISTERED?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-400 font-bold ml-2 hover:text-blue-300 transition-colors tracking-wide"
                            >
                                {isLogin ? 'APPLY NOW' : 'ACCESS TERMINAL'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
