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
│  │  │            └──────────────┬────────────────┘    │ │   │
│  │  └───────────────────────────┼────────────────────┴────┘ │
│  └──────────────────────────────┼───────────────────────────┘
│                                 │
└─────────────────────────────────┼───────────────────────────┘
                                  │
          ┌───────────────────────┴────────────────────────┐
          ▼                                                ▼
┌─────────────────┐                              ┌──────────────────────┐
│  Firebase Auth  │                              │  Firestore Database  │
│  (User login,   │                              │  Collections:        │
│   signup,       │                              │   - users/{uid}      │
│   guest mode,   │                              │   - quiz_results/    │
│   Google Auth)  │                              │   - question_pools/  │
└─────────────────┘                              └──────────────────────┘
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
    "lvl": number, "xp": number, "nextXp": number,
    "gold": number, "gems": number, "streak": number,
    "lastActive": "string (Date)"
  }
}
```

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
        ├── SAVE RESULT: saveQuizResult() → /quiz_results
        ├── UPDATE STATS: updateUserStats() → /users/{uid} (XP, Gold, Streak)
        └─► Update chapters state (stars + completedModes)
              ├── SAVE PROGRESS: saveChapterProgress() → /users/{uid}/chapterProgress/{id}
              └─► setView('results')
```

---

## 7. Developer Features

- **Developer Mode**: Toggle in Profile Section.
  - Highlights correct answers in green during quiz.
  - Useful for verifying question bank accuracy.

---

## 8. Data Layer

### Subjects & Chapter Mapping
Hardcoded in `App.jsx`. Each chapter has:
- `id`, `name`, `pos` (left/center/right)
- `stars` (0–3), `completedModes` (array of 'easy'/'medium'/'hard')
- `locked` (bool) - unlocking requires 5 stars in previous chapter.

### Raw Question Bank
Located in `src/data/raw_questions/` — **69 XML files**. Intended to be uploaded to Firestore.

---

## 9. Gamification System

| Element | Description |
|---|---|
| **XP** | Earned per quiz (`10 + correct` to `50 + correct`) |
| **Gold** | Currency (`5 * correct`) |
| **Stars** | 1–3 stars per mode. Max 9 stars per chapter. |
| **Streak** | Logic handles daily logins vs skipped days. |
| **Level** | RPG level (Simple `Level * 100` XP curve). |

---

## 10. Environment & Build

```bash
npm run dev        # Development
npm run build      # Production
npm run preview    # Preview
```

Firebase config is in `src/firebase.js`.

---

## 11. Known Limitations & Roadmap

- [ ] `ranks`, `items`, and `battle` views are placeholders.
- [ ] Raw XML questions need batch upload script (currently relying on AdminUpload manually or local fallbacks if DB empty).
- [ ] Class 12 chapters pending definition in `App.jsx`.
