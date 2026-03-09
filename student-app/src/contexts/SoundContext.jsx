import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('soundEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    const playSound = useCallback((type) => {
        if (!soundEnabled) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hover':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'success':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, now); // E5
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'win':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6
                osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.4); // E6
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'correct':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now); // A5
                osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1); // D6
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'wrong':
            case 'error':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'pop':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            default:
                break;
        }
    }, [soundEnabled]);

    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => !prev);
    }, []);

    return (
        <SoundContext.Provider value={{ playSound, soundEnabled, toggleSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSoundContext = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSoundContext must be used within a SoundProvider');
    }
    return context;
};
