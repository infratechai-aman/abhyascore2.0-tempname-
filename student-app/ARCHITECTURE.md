# AbhyaScore 2.0 — Architecture Overview

> A gamified JEE/NEET exam preparation platform built as a React SPA with Firebase backend.

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 7.x |
| Styling | Tailwind CSS | 4.x (via Vite plugin) |
| Icons | Lucide React | 0.574.x |
| Backend / Auth | Firebase Authentication | 12.x |
| Database | Firebase Firestore | 12.x |
| Analytics | Firebase Analytics | 12.x |
| Language | JavaScript (JSX) | ES Modules |

---

## 2. Project Structure

```
abhyascore2.0-tempname-/
├── index.html                    # Vite HTML entry point
├── vite.config.js                # Vite + React + Tailwind config
├── package.json
├── eslint.config.js
├── public/
│   └── (static assets: PNG cards, backgrounds, etc.)
└── src/
    ├── main.jsx                  # React root mount
    ├── App.jsx                   # Root component + state router
    ├── App.css / index.css       # Global/base styles
    ├── firebase.js               # Firebase SDK init & exports
    ├── contexts/
    │   └── AuthContext.jsx       # Auth state provider (React Context)
    ├── utils/
    │   └── gameLogic.js          # Quiz session & scoring logic, Persistence
    ├── data/
    │   ├── questions.js          # Question pool generator (fallback)
    │   └── raw_questions/        # 60+ XML question files per chapter
    └── components/               # All UI components (11 files)
        ├── AuthScreen.jsx
        ├── Header.jsx
        ├── BottomNav.jsx
        ├── Dashboard.jsx
        ├── ClassSelectionModal.jsx
        ├── ChapterMap.jsx
        ├── LevelSelector.jsx
        ├── QuizInterface.jsx
        ├── ResultsScreen.jsx
        ├── ProfileSection.jsx
        └── AdminUpload.jsx
```

---

## 3. Architecture Diagram

```
┌──────────────────────────────────────────────┐
│                  main.jsx                    │
│           (React DOM root mount)             │
└─────────────────────┬────────────────────────┘
                      │
┌─────────────────────▼────────────────────────┐
│              App.jsx  (Root)                 │
│  ┌───────────────────────────────────────┐   │
│  │        AuthProvider (Context)         │   │
│  │  ┌─────────────────────────────────┐  │   │
│  │  │      MainContent Component      │  │   │
│  │  │  view | selectedSub | chapter   │  │   │
│  │  │  quizQuestions | quizAnswers    │  │   │
│  │  │                                 │  │   │
│  │  │  ┌────────┐ ┌─────────┐         │  │   │
│  │  │  │ Header │ │BottomNav│         │  │   │
│  │  │  └────────┘ └─────────┘         │  │   │
│  │  │  ┌─────────────────────────┐    │  │   │
│  │  │  │      Active View        │    │  │   │
│  │  │  │  home/map/quiz/results  │    │  │   │
│  │  │  │  profile/admin/ranks   │    │  │   │
│  │  │  └─────────────────────────┘    │  │   │
│  │  └─────────────────────────────────┘  │   │
│  └───────────────────────────────────────┘   │
└─────────────────────┬────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────┐       ┌────────────────────────┐
│ Firebase Auth │       │   Firestore Database   │
│  - Email/Pass │       │  users/{uid}           │
│  - Google SSO │       │    └ chapterProgress/  │
│  - Guest mode │       │  question_pools/       │
└───────────────┘       │  quiz_results/         │
                        └────────────────────────┘
```

---

## 4. State-Based Routing

The app does **not** use React Router. Navigation is managed entirely via a `view` state string in `MainContent`:

| `view` value | Rendered Component | Description |
|---|---|---|
| `'home'` | `<Dashboard>` | Subject selection grid |
| `'map'` | `<ChapterMap>` | Chapter progression map |
| `'quiz'` (overlay) | `<QuizInterface>` | Full-screen quiz session |
| `'results'` (overlay) | `<ResultsScreen>` | Score + review screen |
| `'profile'` | `<ProfileSection>` | User profile, avatar, stats |
| `'admin'` | `<AdminUpload>` | Admin question uploader |
| `'ranks'`, `'items'`, `'battle'` | Placeholder | "Coming Soon" screens |

**Modals** are controlled via separate boolean flags:
- `showLevelSelector` → `<LevelSelector>` modal (Difficulties: Basic, Intermediate, Expert)
- `showClassSelector` → `<ClassSelectionModal>` modal

---

## 5. Authentication Flow

```
App Load
  └─► AuthContext (onAuthStateChanged listener)
        ├── User exists → fetch Firestore /users/{uid} → set userData
        └── No user    → show <AuthScreen>
                            ├── Email/Password Sign Up (creates Firestore doc)
                            ├── Email/Password Login
                            ├── Google Sign-In (creates/merges Firestore doc)
                            └── Guest Login (mock user, no Firebase call)
```

**Firestore User Document** (`/users/{uid}`):
```json
{
  "name": "string",
  "email": "string",
  "stream": "JEE | NEET",
  "createdAt": "timestamp",
  "stats": {
    "lvl": number,
    "xp": number,
    "nextXp": number,
    "gold": number,
    "gems": number,
    "streak": number,
    "lastActive": "string (Date.toDateString)",
    "totalTests": number,
    "totalQuestions": number,
    "correctAnswers": number
  }
}
```

`updateUserStats()` is exposed via `AuthContext` and called from `App.jsx` after every quiz.

---

## 6. Quiz Engine & Persistence

```
handleChapterClick(chapter)
  └─► setShowLevelSelector(true)
        └─► <LevelSelector> → user picks difficulty (easy | medium | hard)
              └─► startQuiz(difficulty)   [App.jsx]
                    └─► startTestSession(subject, chapterId, difficulty)  [gameLogic.js]
                          ├── Try: Firestore /question_pools/{sub}_{chapterId}_{diff}
                          │         → shuffle → slice(0, 25)
                          └── Fallback: generateQuestionPool()
                                → 100 mock questions → shuffle → slice(0, 25)

Quiz completes → handleQuizComplete(answers)
  └─► calculateResults(questions, answers)  [gameLogic.js]
        ├── +4 per correct, -1 per incorrect
        ├── Stars: 100%=3★, ≥75%=2★, ≥40%=1★
        ├── XP earned = (stars × 10) + correct
        ├── Gold earned = correct × 5
        ├── Streak: increments if lastActive = yesterday, resets if gap > 1 day
        ├── Level-up if newXp >= lvl × 100
        │
        ├── saveQuizResult()      → Firestore: /quiz_results/{auto-id}       ✅
        ├── updateUserStats()     → Firestore: /users/{uid} (XP/Gold/Streak)  ✅
        ├── saveChapterProgress() → Firestore: /users/{uid}/chapterProgress/{chapterId} ✅
        └─► setView('results')
```

### Firestore Collections Summary

| Collection | Path | Written by |
|---|---|---|
| User profile & stats | `/users/{uid}` | `AuthContext.signup`, `updateUserStats` |
| Chapter progress | `/users/{uid}/chapterProgress/{chapterId}` | `saveChapterProgress` |
| Quiz history | `/quiz_results/{auto-id}` | `saveQuizResult` |
| Question pools | `/question_pools/{sub}_{chapterId}_{diff}` | `AdminUpload` component |

---

## 7. Components Reference

| Component | Purpose | Key Props |
|---|---|---|
| `AuthScreen` | Login / Sign Up / Guest / Google SSO | — |
| `Header` | Top bar: XP, gold, gems, streak | `stats`, `assets`, `onViewProfile` |
| `BottomNav` | Bottom navigation dock | `view`, `setView` |
| `Dashboard` | Subject card grid | `subjects`, `assets`, `setSelectedSub` |
| `ClassSelectionModal` | Choose Class 11 or 12 | `subject`, `onSelectClass` |
| `ChapterMap` | Scrollable chapter node map | `chapters`, `selectedSub`, `onChapterClick` |
| `LevelSelector` | Difficulty picker modal | `subject`, `chapter`, `onStart` |
| `QuizInterface` | Full-screen question view | `questions`, `subject`, `onComplete` |
| `ResultsScreen` | Score card + review | `questions`, `answers`, `onHome`, `onRetry` |
| `ProfileSection` | Avatar, stats, logout, dev mode toggle | `stats`, `assets`, `onAvatarSelect` |
| `AdminUpload` | Upload question pools to Firestore | `onBack` |

---

## 8. Developer Features

- **Developer Mode**: Toggle in Profile Section.
  - Highlights correct answers in green during quiz.
  - Useful for verifying question bank accuracy.

---

## 9. Data Layer

### Subjects & Chapter Mapping
Hardcoded in `App.jsx`. Each chapter has:
- `id`, `name`, `pos` (left/center/right)
- `stars` (0–9 total across all difficulties), `starMap` (`{ easy, medium, hard }` each 0–3)
- `completedModes` (array of `'easy'`/`'medium'`/`'hard'` strings)
- `locked` (bool)

Filtered at runtime by `userData.stream` and selected class (11 or 12).

### Raw Question Bank
Located in `src/data/raw_questions/` — **69 XML files**, one per chapter. Uploaded to Firestore via `AdminUpload`. Falls back to procedural mock questions if pool is missing.

---

## 10. Gamification System

| Element | Formula | Persisted? |
|---|---|---|
| **XP** | `(stars × 10) + correct_answers` | ✅ Firestore |
| **Gold** | `correct_answers × 5` | ✅ Firestore |
| **Stars** | 1–3 per difficulty mode, max 9 per chapter | ✅ Firestore |
| **Streak** | +1 if active yesterday, reset if gap > 1 day | ✅ Firestore |
| **Level** | Level up when `xp >= lvl × 100` | ✅ Firestore |
| **Completed Modes** | Array of passed difficulty strings per chapter | ✅ Firestore |

---

## 11. Environment & Build

```bash
npm run dev        # Development
npm run build      # Production
npm run preview    # Preview
```

Firebase config is in `src/firebase.js`.

---

## 12. Known Limitations & Roadmap

- [ ] `ranks`, `items`, and `battle` views are placeholders
- [ ] Raw XML questions need a batch upload script (currently manual via `AdminUpload` or fallback to procedural)
- [ ] Class 12 chapters not yet defined in `App.jsx`
- [ ] Avatar images not yet wired to avatarId selection
- [ ] Level-up UI feedback (modal/animation) not yet implemented
- [ ] Gems currency has no earn/spend mechanic yet
- [ ] No offline support — requires active internet for Firestore reads/writes
