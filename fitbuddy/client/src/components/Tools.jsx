import { useEffect, useRef, useState } from "react";
import { load, save, todayKey } from "../storage.js";

/* ---------- BMI & body fat ---------- */
function Bmi({ profile }) {
  const [h, setH] = useState(profile?.height || 170);
  const [w, setW] = useState(profile?.weight || 70);
  const [age, setAge] = useState(profile?.age || 25);
  const [sex, setSex] = useState(profile?.gender === "female" ? "female" : "male");

  const bmi = w / Math.pow(h / 100, 2);
  // Deurenberg estimate: a rough guide only
  const fat = 1.2 * bmi + 0.23 * age - 10.8 * (sex === "male" ? 1 : 0) - 5.4;
  const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obese range";

  return (
    <section className="panel">
      <h2>BMI and body fat</h2>
      <div className="row">
        <label>Height (cm)<input type="number" value={h} onChange={(e) => setH(+e.target.value)} /></label>
        <label>Weight (kg)<input type="number" value={w} onChange={(e) => setW(+e.target.value)} /></label>
      </div>
      <div className="row">
        <label>Age<input type="number" value={age} onChange={(e) => setAge(+e.target.value)} /></label>
        <label>Sex
          <select value={sex} onChange={(e) => setSex(e.target.value)}><option>male</option><option>female</option></select>
        </label>
      </div>
      <div className="macros">
        <div><strong>{bmi.toFixed(1)}</strong><span>{label}</span></div>
        <div><strong>{Math.max(fat, 3).toFixed(1)}%</strong><span>est. body fat</span></div>
      </div>
      <p className="note">Estimates only. BMI does not account for muscle mass.</p>
    </section>
  );
}

/* ---------- Water reminder ---------- */
function Water() {
  const key = "fb_water_" + todayKey();
  const [cups, setCups] = useState(() => load(key, 0));
  const [every, setEvery] = useState(60);
  const [on, setOn] = useState(false);
  const timer = useRef(null);

  const add = (n) => {
    const v = Math.max(0, cups + n);
    setCups(v);
    save(key, v);
  };

  useEffect(() => {
    clearInterval(timer.current);
    if (on) {
      timer.current = setInterval(() => {
        if ("Notification" in window && Notification.permission === "granted") new Notification("Time for a glass of water");
        else alert("Time for a glass of water");
      }, every * 60 * 1000);
    }
    return () => clearInterval(timer.current);
  }, [on, every]);

  async function toggle() {
    if (!on && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    setOn(!on);
  }

  return (
    <section className="panel">
      <h2>Water intake</h2>
      <div className="macros"><div><strong>{cups} / 8</strong><span>glasses today</span></div></div>
      <div className="row">
        <button onClick={() => add(1)} className="primary">Add a glass</button>
        <button onClick={() => add(-1)}>Remove one</button>
      </div>
      <label>Remind me every
        <select value={every} onChange={(e) => setEvery(+e.target.value)}>
          {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
        </select>
      </label>
      <button onClick={toggle}>{on ? "Stop reminders" : "Start reminders"}</button>
      <p className="note">Reminders work while this tab stays open.</p>
    </section>
  );
}

/* ---------- Calorie tracker ---------- */
function Calories({ plan }) {
  const key = "fb_cal_" + todayKey();
  const [items, setItems] = useState(() => load(key, []));
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const total = items.reduce((s, i) => s + i.kcal, 0);
  const target = plan?.diet?.calories;

  const persist = (next) => { setItems(next); save(key, next); };
  const add = (e) => {
    e.preventDefault();
    if (!name || !kcal) return;
    persist([...items, { name, kcal: +kcal }]);
    setName(""); setKcal("");
  };

  return (
    <section className="panel">
      <h2>Calorie log</h2>
      <div className="macros">
        <div><strong>{total}</strong><span>eaten today</span></div>
        {target && <div><strong>{Math.max(target - total, 0)}</strong><span>left of {target}</span></div>}
      </div>
      <form onSubmit={add} className="row">
        <input placeholder="Food" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="kcal" type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        <button className="primary">Add</button>
      </form>
      <ul className="saved">
        {items.map((i, idx) => (
          <li key={idx}>
            <span>{i.name} · {i.kcal} kcal</span>
            <button onClick={() => persist(items.filter((_, n) => n !== idx))}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Tools({ profile, plan }) {
  return (
    <div className="tools">
      <Bmi profile={profile} />
      <Water />
      <Calories plan={plan} />
    </div>
  );
}
