import { useState } from "react";
import { load, save, todayKey } from "../storage.js";

function calcStreak(days) {
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1); // today not done yet is OK
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function Progress() {
  const [days, setDays] = useState(() => load("fb_done_days", []));
  const done = days.includes(todayKey());

  const toggle = () => {
    const next = done ? days.filter((d) => d !== todayKey()) : [...days, todayKey()];
    setDays(next);
    save("fb_done_days", next);
  };

  const last28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <section className="panel">
      <h2>Progress</h2>
      <div className="macros">
        <div><strong>{calcStreak(days)}</strong><span>day streak</span></div>
        <div><strong>{days.length}</strong><span>workouts done</span></div>
      </div>
      <button className="primary" onClick={toggle}>{done ? "Undo today" : "Mark today's workout done"}</button>
      <div className="grid28" aria-label="Last 28 days">
        {last28.map((d) => <span key={d} title={d} className={days.includes(d) ? "cell on" : "cell"} />)}
      </div>
    </section>
  );
}
