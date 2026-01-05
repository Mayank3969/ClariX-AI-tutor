# Clarix AI

An AI-assisted DSA practice dashboard with Firebase authentication, live LeetCode sync, topic overviews, and rich analytics—built with React + Vite + TypeScript.

## Features
- 🔐 Firebase Authentication (Email/Password + Google) with profile/avatar display
- 📊 Performance analytics (accuracy, streak, solved count) from your live LeetCode data
- 🧠 Topic overviews with curated LeetCode problems and direct links
- 🔄 One-click LeetCode sync (GraphQL + fallback) to fetch solved counts, ranking, and per-topic skills
- 🎯 Personalized dashboard, learning path, badges, and admin insights

## Prerequisites
- Node.js 18+
- npm (bundled with Node)

## Setup
1) Install dependencies:
```bash
npm install
```
2) Configure Firebase (already wired, but keep for reference):
   - Ensure **Authentication** is enabled in Firebase Console (Email/Password and Google).
   - The app reads the config from `firebaseConfig.ts` (already populated).
3) Run dev server:
```bash
npm run dev
```
   - Open the shown localhost URL (typically http://localhost:5173 or http://localhost:3001).

## Usage
- **Sign up / Sign in:** Use the auth modal (Email/Password or Google). Profile name/photo shows your Firebase user.
- **LeetCode Sync:** Open the LeetCode Sync section, enter your username, and sync. The dashboard/profile will update with:
  - Total solved, rank, topic breakdown, weakest areas, and radar/heatmap data.
  - Topic cards now link to real LeetCode problems per topic.
- **Topics:** Each of the six topics routes to its own overview with representative LeetCode links.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Tech Stack
- React + TypeScript + Vite
- Firebase Auth
- LeetCode GraphQL API (with a public fallback API)
- Tailwind/utility-first styling patterns

## Troubleshooting
- **Firebase auth/configuration-not-found:** Enable Authentication providers in Firebase Console for this project.
- **LeetCode CORS/blocked:** The code falls back to the public stats API; retry if GraphQL is rate-limited.
- **Vite not found:** Run `npm install` to install local binaries.

## Project Structure (high level)
- `src/index.tsx` — app bootstrap, routing, providers
- `src/contexts/AuthContext.tsx` — auth state and hooks
- `src/components/AuthModal.tsx` — sign in/up UI
- `src/views` — main views (Dashboard, Profile, Topics)
- `src/data.ts` — topic/problem metadata and mocks
- `src/api.ts` — LeetCode sync + API helpers
