# FitBuddy – AI Fitness Plan Generator (React + Node + Gemini)

Generates a personalized workout plan and diet chart as structured JSON using Google Gemini (JSON mode).

## Run it

Requires Node.js 18 or newer.

```bash
# 1. install everything
npm run install:all

# 2. add your Gemini key (server only, never in the React code)
cp server/.env.example server/.env
# open server/.env and paste your key after GEMINI_API_KEY=

# 3. start the API (terminal 1)
npm run dev:server

# 4. start the website (terminal 2)
npm run dev:client
```

Open http://localhost:5173

Get a key at https://aistudio.google.com/apikey

## What's included

| Feature | Where |
|---|---|
| Profile form | `client/src/components/ProfileForm.jsx` |
| Gemini JSON generation | `POST /api/generate` in `server/index.js` |
| Workout + diet display | `PlanView.jsx` |
| Chat refinement ("make it harder") | `Chat.jsx`, `POST /api/refine` |
| Save / load plans | `GET/POST/DELETE /api/plans` (stored in `server/data/plans.json`) |
| PDF export | Export PDF button (browser print, choose "Save as PDF") |
| Share | Web Share API, falls back to copy |
| Progress + streaks | `Progress.jsx` (browser storage) |
| Demo videos | Each exercise links to a YouTube form search |
| BMI / body fat, water reminder, calorie log | `Tools.jsx` |
| Safety disclaimer | System prompt + disclaimer box under every plan |

## Not built yet

- **User authentication.** Plans are saved in a local JSON file, shared by anyone using the server. Add Firebase Auth or Supabase Auth and swap the `/api/plans` storage for their database.
- **Deploy.** Frontend to Vercel, backend to Render. Set `GEMINI_API_KEY` in Render's environment settings, and change the `/api` calls in `client/src/api.js` to your Render URL.

## Change the model

Set `GEMINI_MODEL` in `server/.env` (default `gemini-2.5-flash`). Gemini 1.5 models have been retired.
