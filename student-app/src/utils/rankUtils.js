// ─── Level → Rank Title Mapping ───────────────────────────────────────────────
// Each rank covers a 10-level bracket. L100 is the legendary AIR-1.

const RANKS = [
    { min: 1, max: 9, title: 'Rookie', color: 'text-slate-400' },
    { min: 10, max: 19, title: 'Starter', color: 'text-green-400' },
    { min: 20, max: 29, title: 'Builder', color: 'text-lime-400' },
    { min: 30, max: 39, title: 'Solver', color: 'text-yellow-400' },
    { min: 40, max: 49, title: 'Climber', color: 'text-amber-400' },
    { min: 50, max: 59, title: 'Fighter', color: 'text-orange-400' },
    { min: 60, max: 69, title: 'Strategist', color: 'text-red-400' },
    { min: 70, max: 79, title: 'Dominator', color: 'text-rose-400' },
    { min: 80, max: 89, title: 'Topper', color: 'text-purple-400' },
    { min: 90, max: 99, title: 'AIR Contender', color: 'text-indigo-400' },
    { min: 100, max: 100, title: 'AIR-1', color: 'text-yellow-300' },
];

/**
 * Returns the rank object { title, color } for a given level.
 * @param {number} level
 * @returns {{ title: string, color: string }}
 */
export const getRank = (level) => {
    const lvl = Math.max(1, Math.min(level || 1, 100));
    return RANKS.find(r => lvl >= r.min && lvl <= r.max) || RANKS[0];
};
