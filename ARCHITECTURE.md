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
    │   └── gameLogic.js          # Quiz session & scoring logic
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
┌─────────────────────────────────────────────────────────────┐
│                        main.jsx                             │
│              (React DOM root mount)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    App.jsx  (Root)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               AuthProvider (Context)                 │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │              MainContent Component              │ │   │
│  │  │  State: view | selectedSub | selectedChapter    │ │   │
│  │  │         quizQuestions | quizAnswers | ...       │ │   │
│  │  │                                                 │ │   │
│  │  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │ │   │
│  │  │  │ Header  │  │BottomNav │  │  Main Views   │  │ │   │
│  │  │  └─────────┘  └──────────┘  │  (view state) │  │ │   │
│  │  │                             └───────┬───────┘  │ │   │
│  │  │                     ┌───────────────┘           │ │   │
│  │  │            ┌────────┴──────────────────────┐    │ │   │
│  │  │            │ home │ map │ profile │ admin │    │ │   │
│  │  │            │ quiz │ results │ ranks │ ...  │    │ │   │
│  │  └────────────┴───────────────────────────────┴────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         ▼                                    ▼
┌─────────────────┐                ┌──────────────────────┐
│  Firebase Auth  │                │  Firestore Database  │
│  (User login,   │                │  Collections:        │
│   signup,       │                │   - users/{uid}      │
│   guest mode)   │                │   - question_pools/  │
└─────────────────┘                │     {sub_chapter_lvl}│
                                   └──────────────────────┘
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
| `'profile'` | `<ProfileSection>` | User profile & avatar |
| `'admin'` | `<AdminUpload>` | Admin question uploader |
| `'ranks'`, `'items'`, `'battle'` | Placeholder | Coming soon screens |

**Modals** are controlled via separate boolean flags:
- `showLevelSelector` → `<LevelSelector>` modal
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
    "lvl": 1, "xp": 0, "nextXp": 100,
    "gold": 0, "gems": 0, "streak": 0
  }
}
```

---

## 6. Quiz Engine

```
handleChapterClick(chapter)
  └─► setShowLevelSelector(true)
        └─► <LevelSelector> → user picks difficulty (easy | medium | hard)
              └─► startQuiz(difficulty)   [App.jsx]
                    └─► startTestSession(subject, chapterId, difficulty)  [gameLogic.js]
                          ├── Try: Firestore /question_pools/{sub}_{chapterId}_{diff}
                          │         → shuffle → slice(0, 25)
                          └── Fallback: generateQuestionPool()  [data/questions.js]
                                → 100 mock questions → shuffle → slice(0, 25)

Quiz completes → handleQuizComplete(answers)
  └─► calculateResults(questions, answers)  [gameLogic.js]
        ├── +4 per correct answer
        ├── -1 per incorrect answer
        ├── Stars: 100%=3★  ≥75%=2★  ≥40%=1★
        └─► Update chapters state (stars + completedModes)
              └─► setView('results')
```

**Firestore Question Pool** (`/question_pools/{poolId}`):
```
poolId format: {subject}_{chapterId}_{difficulty}
Example:       phy_1_easy
```

---

## 7. Components Reference

| Component | Purpose | Key Props |
|---|---|---|
| `AuthScreen` | Login / Sign Up / Guest UI | — |
| `Header` | Top bar: XP, gold, gems, streak | `stats`, `assets`, `onViewProfile` |
| `BottomNav` | Bottom navigation dock | `view`, `setView` |
| `Dashboard` | Subject card grid | `subjects`, `assets`, `setSelectedSub` |
| `ClassSelectionModal` | Choose Class 11 or 12 | `subject`, `onSelectClass` |
| `ChapterMap` | Scrollable chapter node map | `chapters`, `selectedSub`, `onChapterClick` |
| `LevelSelector` | Difficulty picker modal | `subject`, `chapter`, `onStart` |
| `QuizInterface` | Full-screen question view | `questions`, `subject`, `onComplete` |
| `ResultsScreen` | Score card + review | `questions`, `answers`, `onHome`, `onRetry` |
| `ProfileSection` | Avatar, stats, logout | `stats`, `assets`, `onAvatarSelect` |
| `AdminUpload` | Upload questions to Firestore | `onBack` |

---

## 8. Data Layer

### Subjects & Chapter Mapping
Hardcoded in `App.jsx`. Each chapter has:
- `id` (numeric), `name`, `stars` (0–3), `locked` (bool)
- `completedModes` (array of completed difficulty strings)
- `class` (11 or 12), `subject` (phy / chem / math / bio / zoo)

Subjects are filtered at runtime based on `userData.stream` (JEE sees Physics, Chemistry, Maths; NEET sees Physics, Chemistry, Biology, Zoology).

### Raw Question Bank
Located in `src/data/raw_questions/` — **69 XML files**, one per chapter topic. These are source files intended to be uploaded to Firestore via the `AdminUpload` component.

---

## 9. Gamification System

| Element | Description |
|---|---|
| **XP** | Earned per quiz based on difficulty (`easy: 10`, `medium: 25`, `hard: 50`) |
| **Gold** | In-game currency earned per quiz difficulty |
| **Stars** | 1–3 stars per chapter per difficulty mode |
| **Streak** | Daily login streak counter |
| **Level** | Player RPG level, advances with XP |
| **Completed Modes** | Tracks which difficulty modes are done per chapter |

---

## 10. Environment & Build

```bash
# Development server
npm run dev        # Vite dev server (HMR)

# Production build
npm run build      # Vite build → dist/

# Preview build
npm run preview    # Vite preview server

# Linting
npm run lint       # ESLint
```

Firebase config is **hardcoded** in `src/firebase.js` (not via `.env`). For production, consider moving to environment variables.

---

## 11. Known Limitations & Future Work

- [ ] Progress is **not persisted** to Firestore yet — chapter stars & completedModes live only in React state
- [ ] XP/Gold are not debited/credited to the Firestore user document after quiz completion
- [ ] `ranks`, `items`, and `battle` views are "Coming Soon" placeholders
- [ ] Firebase API key is exposed in client-side code (secure via Firebase Security Rules)
- [ ] Raw XML question files need a migration script/admin tool to upload to Firestore question pools
- [ ] Class 12 chapters are not yet defined in `App.jsx`
