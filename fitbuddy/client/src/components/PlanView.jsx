import { useState } from "react";
import Chat from "./Chat.jsx";
import { savePlan } from "../api.js";

const yt = (name) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " exercise form")}`;

export default function PlanView({ plan, profile, onChange }) {
  const [msg, setMsg] = useState("");
  const diet = plan.diet || {};

  async function onSave() {
    try {
      await savePlan(`${profile?.goal || "My"} plan`, profile, plan);
      setMsg("Plan saved.");
    } catch (e) {
      setMsg(e.message);
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function onShare() {
    const text = `My FitBuddy plan: ${plan.summary}`;
    try {
      if (navigator.share) await navigator.share({ title: "My FitBuddy plan", text });
      else {
        await navigator.clipboard.writeText(text);
        setMsg("Summary copied to clipboard.");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch {}
  }

  return (
    <div className="plan">
      <div className="toolbar no-print">
        <button onClick={onSave}>Save plan</button>
        <button onClick={() => window.print()}>Export PDF</button>
        <button onClick={onShare}>Share</button>
        {msg && <span className="muted">{msg}</span>}
      </div>

      <p className="summary">{plan.summary}</p>

      <h2>Workout</h2>
      <div className="days">
        {(plan.workout || []).map((d, i) => (
          <article key={i} className={d.isRest ? "day rest" : "day"}>
            <h3>{d.day}: {d.focus}</h3>
            {d.isRest ? (
              <p className="muted">Rest and recover. A light walk is fine.</p>
            ) : (
              <table>
                <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr></thead>
                <tbody>
                  {(d.exercises || []).map((x, j) => (
                    <tr key={j}>
                      <td>
                        <a href={yt(x.name)} target="_blank" rel="noreferrer" title="Watch demo video">{x.name}</a>
                        {x.notes && <div className="note">{x.notes}</div>}
                      </td>
                      <td>{x.sets}</td><td>{x.reps}</td><td>{x.rest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>
        ))}
      </div>

      <h2>Diet chart</h2>
      <div className="macros">
        <div><strong>{diet.calories}</strong><span>kcal</span></div>
        <div><strong>{diet.protein_g} g</strong><span>protein</span></div>
        <div><strong>{diet.carbs_g} g</strong><span>carbs</span></div>
        <div><strong>{diet.fat_g} g</strong><span>fat</span></div>
      </div>
      <table>
        <thead><tr><th>Meal</th><th>What to eat</th><th>kcal</th><th>P / C / F (g)</th></tr></thead>
        <tbody>
          {(diet.meals || []).map((m, i) => (
            <tr key={i}>
              <td>{m.name}<div className="note">{m.time}</div></td>
              <td>{(m.items || []).join(", ")}</td>
              <td>{m.calories}</td>
              <td>{m.protein_g} / {m.carbs_g} / {m.fat_g}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tips</h2>
      <ul>{(plan.tips || []).map((t, i) => <li key={i}>{t}</li>)}</ul>

      <p className="disclaimer">
        {plan.disclaimer || "This is general guidance, not medical advice. Check with a doctor before starting a new exercise or diet plan."}
      </p>

      <div className="no-print"><Chat plan={plan} onChange={onChange} /></div>
    </div>
  );
}
