import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ChapterMap from './components/ChapterMap';
import BottomNav from './components/BottomNav';
import LevelSelector from './components/LevelSelector';
import QuizInterface from './components/QuizInterface';
import ResultsScreen from './components/ResultsScreen';
import ProfileSection from './components/ProfileSection';
import AuthScreen from './components/AuthScreen';
import ClassSelectionModal from './components/ClassSelectionModal';
import AdminUpload from './components/AdminUpload';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { startTestSession, calculateResults, saveQuizResult, getUserProgress, saveChapterProgress } from './utils/gameLogic';
import { runMigration } from './utils/migrateXmlToFirestore';
import { Zap, Beaker, Calculator, Dna, Brain } from 'lucide-react';

const MainContent = () => {
  const { currentUser, userData, logout, updateUserStats } = useAuth();

  const [view, setView] = useState('home');
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null); // 11 or 12
  const [devMode, setDevMode] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('idle'); // 'idle' | 'running' | 'done'

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Mock data for stats (replace with userData.stats later)
  const stats = userData?.stats || {
    name: userData?.name || "Student",
    lvl: 1,
    xp: 0,
    nextXp: 100,
    gold: 0,
    gems: 0,
    streak: 0
  };

  const allSubjects = [
    {
      id: 'phy',
      title: 'PHYSICS',
      sub: '11th & 12th Chapters',
      assetKey: 'phy',
      gradient: 'bg-gradient-to-br from-blue-600/20 via-purple-900/40 to-black',
      icon: <Zap size={80} className="text-blue-500/20" />,
      streams: ['JEE', 'NEET']
    },
    {
      id: 'chem',
      title: 'CHEMISTRY',
      sub: '11th & 12th Chapters',
      assetKey: 'chem',
      gradient: 'bg-gradient-to-br from-green-600/20 via-emerald-900/40 to-black',
      icon: <Beaker size={80} className="text-green-500/20" />,
      streams: ['JEE', 'NEET']
    },
    {
      id: 'math',
      title: 'MATHS',
      sub: '11th & 12th Chapters',
      assetKey: 'math',
      gradient: 'bg-gradient-to-br from-amber-600/20 via-orange-900/40 to-black',
      icon: <Calculator size={80} className="text-amber-500/20" />,
      streams: ['JEE']
    },
    {
      id: 'bio',
      title: 'BIOLOGY',
      sub: 'Botany Chapters',
      assetKey: 'bio',
      gradient: 'bg-gradient-to-br from-rose-600/20 via-pink-900/40 to-black',
      icon: <Dna size={80} className="text-rose-500/20" />,
      streams: ['NEET']
    },
    {
      id: 'zoo',
      title: 'ZOOLOGY',
      sub: 'Zoology Chapters',
      assetKey: 'bio', // Reusing bio asset for now
      gradient: 'bg-gradient-to-br from-teal-600/20 via-cyan-900/40 to-black',
      icon: <Brain size={80} className="text-teal-500/20" />,
      streams: ['NEET']
    }
  ];

  // Filter subjects based on user stream
  const subjects = allSubjects.filter(sub =>
    userData?.stream ? sub.streams.includes(userData.stream) : true
  );

  const [currentDifficulty, setCurrentDifficulty] = useState(null);

  const [chapters, setChapters] = useState([
    // PHYSICS CLASS 11
    { id: 1, name: 'KINEMATICS', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 2, name: 'LAWS OF MOTION', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 3, name: 'WORK, ENERGY & POWER', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 4, name: 'GRAVITATION', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 5, name: 'SYSTEM OF PARTICLES', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 6, name: 'PROPERTIES OF BULK MATTER', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 7, name: 'THERMODYNAMICS', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 8, name: 'KINETIC THEORY', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'phy' },
    { id: 9, name: 'OSCILLATIONS & WAVES', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'phy' },

    // CHEMISTRY CLASS 11
    { id: 101, name: 'SOME BASIC CONCEPTS', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 102, name: 'STRUCTURE OF ATOM', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 103, name: 'CLASSIFICATION OF ELEMENTS', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 104, name: 'CHEMICAL BONDING', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 105, name: 'THERMODYNAMICS', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 106, name: 'EQUILIBRIUM', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 107, name: 'REDOX REACTIONS', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 108, name: 'ORGANIC CHEMISTRY: BASIC', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'chem' },
    { id: 109, name: 'HYDROCARBONS', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'chem' },

    // MATHS CLASS 11
    { id: 201, name: 'SETS', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 202, name: 'RELATIONS & FUNCTIONS', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 203, name: 'TRIGONOMETRIC FUNCTIONS', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 204, name: 'LINEAR INEQUALITIES', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 205, name: 'COMPLEX NUMBERS', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 206, name: 'PERMUTATIONS & COMBINATIONS', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 207, name: 'BINOMIAL THEOREM', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 208, name: 'SEQUENCES & SERIES', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 209, name: 'STRAIGHT LINES', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 210, name: 'CONIC SECTIONS', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 211, name: 'INTRO TO 3D GEOMETRY', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 212, name: 'LIMITS & DERIVATIVES', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 213, name: 'STATISTICS', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'math' },
    { id: 214, name: 'PROBABILITY', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'math' },

    // ZOOLOGY CLASS 11
    { id: 301, name: 'ANIMAL KINGDOM', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 302, name: 'STRUCTURAL ORG. IN ANIMALS', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 303, name: 'BIOMOLECULES', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 304, name: 'BREATHING & EXCHANGE', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 305, name: 'BODY FLUIDS & CIRCULATION', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 306, name: 'EXCRETORY PRODUCTS', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 307, name: 'LOCOMOTION & MOVEMENT', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 308, name: 'NEURAL CONTROL', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'zoo' },
    { id: 309, name: 'CHEMICAL COORDINATION', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'zoo' },

    // BOTANY CLASS 11
    { id: 310, name: 'THE LIVING WORLD', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 311, name: 'BIOLOGICAL CLASSIFICATION', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 312, name: 'PLANT KINGDOM', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 313, name: 'MORPHOLOGY OF FLOWERING', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 314, name: 'ANATOMY OF FLOWERING', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 315, name: 'CELL: THE UNIT OF LIFE', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 316, name: 'CELL CYCLE & DIVISION', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 317, name: 'PHOTOSYNTHESIS', stars: 0, pos: 'center', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 318, name: 'RESPIRATION IN PLANTS', stars: 0, pos: 'right', locked: false, completedModes: [], class: 11, subject: 'bio' },
    { id: 319, name: 'PLANT GROWTH', stars: 0, pos: 'left', locked: false, completedModes: [], class: 11, subject: 'bio' },
  ]);

  const [avatarId, setAvatarId] = useState('MCharcter1');

  const assets = {
    avatar: `/Avatars/${avatarId}.png`, // Dynamic path based on ID
    avatarId: avatarId, // For selection state
    bg: '/GameBG.png',
    phy: '/PhysicsCard.png',
    chem: '/ChemistryCard.png',
    math: '/MathsCard.png',
    bio: '/BiologyCard.png',
    boss: '/BossBattle.png',
    achievements: '/Achivements.png',
    nodeLocked: '/LockedLevel.png',
    nodeUnlocked: '/UnlockedLevel.png',
    nodeCompleted: '/LevelCompleted.png'
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Load User Chapter Progress
  useEffect(() => {
    if (currentUser) {
      getUserProgress(currentUser.uid).then(progressMap => {
        if (Object.keys(progressMap).length > 0) {
          setChapters(prev => prev.map(ch => {
            const prog = progressMap[ch.id];
            if (prog) {
              return { ...ch, ...prog };
            }
            return ch;
          }));
        }
      });
    }
  }, [currentUser]);

  // Enforce Locking Logic (Sequence Enforcement)
  useEffect(() => {
    let changed = false;
    const newChapters = [...chapters];

    // Group by Subject & Class to handle sequences independently
    const groups = {};
    newChapters.forEach(ch => {
      const key = `${ch.subject}-${ch.class}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ch);
    });

    Object.values(groups).forEach(group => {
      // Sort by ID to ensure sequence (1, 2, 3...)
      group.sort((a, b) => a.id - b.id);

      group.forEach((ch, index) => {
        let shouldBeLocked = false;

        if (index === 0) {
          // First chapter always unlocked
          shouldBeLocked = false;
        } else {
          // Check previous chapter's stars
          const prevChapter = group[index - 1];
          if (prevChapter.stars < 5) {
            shouldBeLocked = true;
          } else {
            shouldBeLocked = false;
          }
        }

        // Update if different
        if (ch.locked !== shouldBeLocked) {
          // Find index in main array
          const mainIndex = newChapters.findIndex(c => c.id === ch.id);
          if (mainIndex !== -1) {
            newChapters[mainIndex] = { ...newChapters[mainIndex], locked: shouldBeLocked };
            changed = true;
          }
        }
      });
    });

    if (changed) {
      setChapters(newChapters);
    }
  }, [chapters]);

  const handleSubjectClick = (subject) => {
    setSelectedSub(subject);
    setShowClassSelector(true);
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setShowClassSelector(false);
    setView('map');
  };

  const handleChapterClick = (chapter) => {
    if (chapter.locked) return;
    setSelectedChapter(chapter);
    setShowLevelSelector(true);
  };

  const startQuiz = async (difficulty) => {
    setCurrentDifficulty(difficulty); // Track current mode
    // Fetch questions (now async)
    const questions = await startTestSession(selectedSub.id, selectedChapter.id, difficulty);
    setQuizQuestions(questions);
    setQuizAnswers({});
    setShowLevelSelector(false);
    setView('quiz');
  };

  const handleQuizComplete = (answers) => {
    setQuizAnswers(answers);

    // Calculate results to determine stars
    const results = calculateResults(quizQuestions, answers);

    // --- Persistence Logic ---
    if (currentUser) {
      // 1. Save Result to History
      saveQuizResult(currentUser.uid, {
        subject: selectedSub.id,
        chapterId: selectedChapter.id,
        chapterName: selectedChapter.name,
        difficulty: currentDifficulty,
        ...results
      });

      // 2. Calculate Rewards
      // XP: 10 per star + 1 per correct answer
      const xpEarned = (results.stars * 10) + results.correct;
      // Gold: 5 per correct answer
      const goldEarned = results.correct * 5;

      // 3. Update User Stats
      const today = new Date().toDateString();
      const lastActive = userData?.stats?.lastActive || null;
      let newStreak = userData?.stats?.streak || 0;

      // Streak Logic
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
          newStreak += 1; // Contentinous streak
        } else {
          newStreak = 1; // Reset or Start new (if gap > 1 day or first time)
          // Note: If it's the very first time (lastActive null), it becomes 1.
        }
      }

      const newXp = (userData?.stats?.xp || 0) + xpEarned;
      const currentLvl = userData?.stats?.lvl || 1;
      const nextXpThreshold = currentLvl * 100; // Simple level curve

      let newLvl = currentLvl;
      let newNextXp = nextXpThreshold;

      // Level Up Logic
      if (newXp >= nextXpThreshold) {
        newLvl += 1;
        newNextXp = newLvl * 100;
        // Could add level up modal trigger here
      }

      updateUserStats({
        xp: newXp,
        lvl: newLvl,
        nextXp: newNextXp,
        gold: (userData?.stats?.gold || 0) + goldEarned,
        totalTests: (userData?.stats?.totalTests || 0) + 1,
        totalQuestions: (userData?.stats?.totalQuestions || 0) + results.totalQuestions,
        correctAnswers: (userData?.stats?.correctAnswers || 0) + results.correct,
        streak: newStreak,
        lastActive: today
      });
    }
    // -------------------------

    // Update stars and completed modes for the chapter
    setChapters(prev => prev.map(ch => {
      if (ch.id === selectedChapter.id) {
        // Initialize starMap if missing (for migration)
        const currentStarMap = ch.starMap || { easy: 0, medium: 0, hard: 0 };

        // Update stars for current difficulty (only if higher)
        const newStarMap = {
          ...currentStarMap,
          [currentDifficulty]: Math.max(currentStarMap[currentDifficulty] || 0, results.stars)
        };

        // Calculate total stars (Sum of all difficulties) -> Max 9
        const totalStars = Object.values(newStarMap).reduce((a, b) => a + b, 0);

        // Add current difficulty to completedModes if passed (stars > 0)
        const newCompletedModes = results.stars > 0 && !ch.completedModes.includes(currentDifficulty)
          ? [...ch.completedModes, currentDifficulty]
          : ch.completedModes;

        // --- Persistence: Save Progress ---
        if (currentUser) {
          saveChapterProgress(currentUser.uid, ch.id, {
            stars: totalStars,
            starMap: newStarMap,
            completedModes: newCompletedModes
          });
        }
        // ----------------------------------

        return {
          ...ch,
          stars: totalStars, // Now represents TOTAL sum (0-9)
          starMap: newStarMap,
          completedModes: newCompletedModes
        };
      }
      return ch;
    }));

    setView('results');
  };

  // Reset function for retry
  const handleRetry = () => {
    setView('home');
    // Ideally should retain chapter context, but simple reset for now
    setQuizAnswers({});
    setQuizQuestions([]);
  };

  const handleAvatarSelect = (avatar) => {
    setAvatarId(avatar.id);
  };

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_blue]" />
      <h2 className="text-white font-black italic tracking-widest uppercase text-[10px] animate-pulse">Forging Assets...</h2>
    </div>
  );

  // Filter chapters by selected class AND subject
  const filteredChapters = chapters.filter(ch =>
    (!selectedClass || ch.class === selectedClass) &&
    (!selectedSub || ch.subject === selectedSub.id)
  );



  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 pb-28 overflow-hidden select-none font-sans relative">
      <div className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: assets.bg ? `url(${assets.bg})` : `radial-gradient(circle at 50% 50%, #1e1b4b 0%, #000000 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />

      {/* Quiz Overlay */}
      {view === 'quiz' && (
        <QuizInterface
          questions={quizQuestions}
          subject={selectedSub}
          onComplete={handleQuizComplete}
          onExit={() => setView('map')}
          devMode={devMode}
        />
      )}

      {/* Results Overlay */}
      {view === 'results' && (
        <ResultsScreen
          questions={quizQuestions}
          answers={quizAnswers}
          onHome={() => setView('home')}
          onRetry={handleRetry}
        />
      )}

      {/* Main UI */}
      {view !== 'quiz' && view !== 'results' && (
        <Header
          stats={stats}
          assets={assets}
          onViewProfile={() => setView('profile')}
        />
      )}

      <main className={`relative z-10 overflow-y-auto no-scrollbar ${view === 'quiz' || view === 'results' ? 'hidden' : 'h-[calc(100vh-140px)]'}`}>
        {view === 'home' ? (
          <Dashboard
            subjects={subjects}
            assets={assets}
            setSelectedSub={handleSubjectClick}
            setView={setView}
            stats={stats}
          />
        ) : view === 'map' ? (
          <ChapterMap
            selectedSub={selectedSub}
            chapters={filteredChapters}
            setView={setView}
            assets={assets}
            onChapterClick={handleChapterClick}
          />
        ) : view === 'profile' ? (
          <ProfileSection
            stats={stats}
            assets={assets}
            onAvatarSelect={handleAvatarSelect}
            devMode={devMode}
            setDevMode={setDevMode}
            onClose={(action) => {
              if (action === 'logout') {
                logout();
              } else {
                setView(action === 'admin' ? 'admin' : 'home');
              }
            }}
          />
        ) : view === 'admin' ? (
          <AdminUpload onBack={() => setView('home')} />
        ) : view === 'ranks' || view === 'items' || view === 'battle' ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Zap size={32} />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-wider">Coming Soon</h2>
            <p className="text-xs font-medium uppercase tracking-widest mt-2 opacity-50">Under Construction</p>
            <button onClick={logout} className="mt-8 text-xs text-red-400 hover:text-red-300 underline">Logout (Debug)</button>
          </div>
        ) : null}
      </main>

      {view !== 'quiz' && view !== 'results' && (
        <BottomNav view={view} setView={setView} setSelectedSub={setSelectedSub} />
      )}

      {/* Level Selector Modal */}
      {showLevelSelector && (
        <LevelSelector
          subject={selectedSub}
          chapter={selectedChapter}
          onClose={() => setShowLevelSelector(false)}
          onStart={startQuiz}
        />
      )}

      {/* Class Selector Modal */}
      {showClassSelector && (
        <ClassSelectionModal
          subject={selectedSub}
          onClose={() => setShowClassSelector(false)}
          onSelectClass={handleClassSelect}
        />
      )}
      {/* ── DEV ONLY: XML Migration Trigger — REMOVE after running ── */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-24 right-4 z-[200] flex flex-col items-end gap-2">
          {migrationStatus === 'done' && (
            <p className="text-xs bg-green-900/80 text-green-300 px-3 py-1.5 rounded-lg border border-green-700/50 font-mono">
              ✅ Migration complete — check console for details
            </p>
          )}
          <button
            onClick={async () => {
              if (migrationStatus === 'running') return;
              setMigrationStatus('running');
              try {
                await runMigration();
                setMigrationStatus('done');
              } catch (e) {
                console.error('[Migration] Critical error:', e);
                setMigrationStatus('idle');
              }
            }}
            disabled={migrationStatus === 'running'}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black text-xs font-bold px-3 py-2 rounded-full shadow-lg transition-colors"
          >
            {migrationStatus === 'running' ? (
              <><div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Running...</>
            ) : (
              '🔄 Run XML Migration'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
