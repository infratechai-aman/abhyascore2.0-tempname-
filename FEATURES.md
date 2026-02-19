# AbhyaScore 2.0 — Current Feature List

> Status as of February 2026. Features marked 🚧 are partially implemented or stubbed.

---

## 🔐 Authentication

- **Email / Password Sign Up** — creates a Firestore user document with name, stream, and default stats
- **Email / Password Login** — Firebase Authentication with persistent session
- **Guest Login** — instant access with a mock user; choose JEE or NEET stream without registering
- **Logout** — clears Firebase session and local React state; handles guest (no-Firebase) edge case
- **Auth Guard** — unauthenticated users are shown the Auth Screen; app content is blocked until auth resolves

---

## 🎓 Stream & Subject Selection

- **JEE Stream** — Physics, Chemistry, Maths
- **NEET Stream** — Physics, Chemistry, Biology (Botany), Zoology
- **Dynamic subject filtering** — subject grid auto-filters based on the logged-in user's stream
- **Class selector** — choose Class 11 or Class 12 before entering the chapter map (per subject)

---

## 🗺️ Chapter Map

- **Visual node map** — scrollable list of chapter nodes in a left / center / right zigzag layout
- **Star ratings** — each chapter node displays 0–3 stars based on best quiz performance
- **Completed mode badges** — tracks which difficulty modes (easy / medium / hard) have been passed
- **Locked / Unlocked states** — locked chapters are skippable (visual lock icon, click disabled)
- **Per-subject, per-class filtering** — shows only chapters relevant to the selected subject & class

### Subjects & Chapter Coverage
| Subject | Class 11 Chapters |
|---|---|
| Physics | 9 (Kinematics → Oscillations & Waves) |
| Chemistry | 9 (Basic Concepts → Hydrocarbons) |
| Maths | 14 (Sets → Probability) |
| Biology (Botany) | 10 (The Living World → Plant Growth) |
| Zoology | 9 (Animal Kingdom → Chemical Coordination) |

---

## 🎮 Quiz Engine

- **Difficulty levels** — Easy, Medium, Hard per chapter
- **Question pool** — up to 25 randomized questions per session (shuffled from a pool of 100+)
- **Firestore-first question fetching** — fetches from `/question_pools/{subject}_{chapterId}_{difficulty}` in Firestore
- **Procedural fallback** — auto-generates mock questions if Firestore pool is missing
- **NTA-style scoring** — `+4` for correct, `-1` for incorrect, `0` for unattempted
- **Timer-free** — no per-question time limit (open-ended session)
- **Single-select MCQ** — 4 options (A / B / C / D) per question
- **Exit mid-quiz** — option to exit and return to the chapter map

---

## 📊 Results & Review

- **Score card** — shows total score, max score, correct / incorrect / unattempted counts
- **Percentage** — calculated from correct answers out of total questions
- **Star award** — 3★ for 100%, 2★ for ≥75%, 1★ for ≥40%, 0★ otherwise
- **Answer review** — expandable review of each question with user's answer vs correct answer and explanation
- **Retry** — returns to home to start again
- **Home** — returns to subject dashboard

---

## 👤 Profile

- **User stats display** — Level, XP bar, Gold, Gems, Streak count
- **Avatar selection** 🚧 — UI exists for avatar picker; avatarId tracked in state (images not yet wired)
- **Admin panel shortcut** — navigates to AdminUpload if the user has admin access

---

## ⚙️ Admin Panel

- **Question upload UI** — interface for uploading question pools to Firestore
- **`AdminUpload` component** — form-based uploader for `/question_pools` collection

---

## 🧭 Navigation

- **Bottom navigation dock** — Home, Map, Ranks, Items, Battle tabs
- **Header bar** — displays player stats (XP, Gold, Gems, Streak) and avatar button
- **State-based routing** — no URL changes; views managed via React `view` state string

---

## 🏆 Gamification (UI Layer)

| Element | Status |
|---|---|
| XP system | 🚧 Displayed; not yet saved to Firestore after quiz |
| Gold currency | 🚧 Displayed; not yet saved to Firestore after quiz |
| Gems | 🚧 Displayed; not yet updated |
| Daily Streak | 🚧 Displayed; not yet auto-incremented |
| Player Level | 🚧 Displayed; XP threshold logic present, level-up not triggered |
| Stars per chapter | ✅ Calculated and saved in React state |
| Completed modes | ✅ Tracked per chapter in React state |

---

## 📦 Data & Content

- **69 XML question files** — one per chapter topic in `src/data/raw_questions/`, ready to be uploaded to Firestore
- **Question pool format** — each pool identified by `{subject}_{chapterId}_{difficulty}`
- **Fallback generator** — procedurally generates 100 mock questions per chapter/difficulty pair

---

## 🔜 Planned / Coming Soon

- `ranks` — Leaderboard view (stub)
- `items` — Inventory / shop (stub)
- `battle` — PvP or Boss Battle mode (stub)
- Class 12 chapters (not yet defined)
- Persistent progress (Firestore sync for stars, XP, gold)
