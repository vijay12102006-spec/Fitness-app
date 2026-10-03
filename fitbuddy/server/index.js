import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PORT = process.env.PORT || 5000;

if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY. Copy server/.env.example to server/.env and add your key.");
  process.exit(1);
}

/* ---------- Gemini call (JSON mode) ---------- */
async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text:
            "You are FitBuddy, a careful certified-trainer-style assistant. Produce safe, realistic fitness and nutrition plans. " +
            "Respect injuries and equipment limits. Never give medical advice or extreme diets. Respond with JSON only."
        }]
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini error ${res.status}`);

  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

const PLAN_SHAPE = `{
  "summary": "string, 2 sentences",
  "workout": [
    {
      "day": "Day 1",
      "focus": "e.g. Upper body push",
      "isRest": false,
      "exercises": [
        { "name": "string", "sets": 3, "reps": "8-12", "rest": "60s", "notes": "short form cue" }
      ]
    }
  ],
  "diet": {
    "calories": 2200,
    "protein_g": 150,
    "carbs_g": 250,
    "fat_g": 70,
    "meals": [
      { "name": "Breakfast", "time": "8:00 AM", "items": ["string"], "calories": 500, "protein_g": 30, "carbs_g": 60, "fat_g": 15 }
    ]
  },
  "tips": ["string"],
  "disclaimer": "string"
}`;

/* ---------- Routes ---------- */
app.get("/api/health", (_req, res) => res.json({ ok: true, model: MODEL }));

app.post("/api/generate", async (req, res) => {
  try {
    const p = req.body || {};
    const prompt = `Create a personalized ${p.daysPerWeek}-day-per-week workout plan (include rest days so the plan covers 7 days) and a one-day diet chart with macros.

User profile:
- Age: ${p.age}
- Gender: ${p.gender}
- Height: ${p.height} cm
- Weight: ${p.weight} kg
- Goal: ${p.goal}
- Experience: ${p.experience}
- Equipment: ${p.equipment}
- Session time: ${p.sessionTime} minutes
- Injuries / limitations: ${p.injuries || "none"}
- Diet preference: ${p.diet || "no preference"}

Rules: keep each session within the time limit, avoid exercises that stress the listed injuries, use only the listed equipment, and make the disclaimer remind the user to consult a doctor.

Return JSON in exactly this shape:
${PLAN_SHAPE}`;
    res.json(await callGemini(prompt));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/refine", async (req, res) => {
  try {
    const { plan, instruction } = req.body || {};
    if (!plan || !instruction) return res.status(400).json({ error: "plan and instruction are required" });
    const prompt = `Here is the user's current plan as JSON:
${JSON.stringify(plan)}

The user asks: "${instruction}"

Apply the change (e.g. make it harder, swap an exercise, lower calories) and return the FULL updated plan in exactly the same JSON shape:
${PLAN_SHAPE}`;
    res.json(await callGemini(prompt));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/* ---------- Simple file-based plan storage (swap for Firebase/Supabase later) ---------- */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "plans.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
const readDb = () => (fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, "utf8")) : []);
const writeDb = (rows) => fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2));

app.get("/api/plans", (_req, res) => res.json(readDb()));

app.post("/api/plans", (req, res) => {
  const rows = readDb();
  const row = { id: Date.now().toString(36), savedAt: new Date().toISOString(), ...req.body };
  rows.unshift(row);
  writeDb(rows);
  res.json(row);
});

app.delete("/api/plans/:id", (req, res) => {
  writeDb(readDb().filter(r => r.id !== req.params.id));
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`FitBuddy API running on http://localhost:${PORT} (model: ${MODEL})`));
