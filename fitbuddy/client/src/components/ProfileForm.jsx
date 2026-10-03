import { useState } from "react";

const DEFAULTS = {
  age: 25,
  gender: "male",
  height: 170,
  weight: 70,
  goal: "lose fat",
  experience: "beginner",
  equipment: "bodyweight only",
  daysPerWeek: 4,
  sessionTime: 45,
  diet: "vegetarian",
  injuries: ""
};

export default function ProfileForm({ initial, loading, onSubmit }) {
  const [f, setF] = useState({ ...DEFAULTS, ...(initial || {}) });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="panel form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(f);
      }}
    >
      <h2>Your details</h2>

      <div className="row">
        <label>Age<input type="number" min="14" max="90" value={f.age} onChange={set("age")} required /></label>
        <label>Gender
          <select value={f.gender} onChange={set("gender")}>
            <option>male</option><option>female</option><option>other</option>
          </select>
        </label>
      </div>

      <div className="row">
        <label>Height (cm)<input type="number" min="100" max="230" value={f.height} onChange={set("height")} required /></label>
        <label>Weight (kg)<input type="number" min="30" max="250" value={f.weight} onChange={set("weight")} required /></label>
      </div>

      <label>Goal
        <select value={f.goal} onChange={set("goal")}>
          <option>lose fat</option><option>build muscle</option><option>improve stamina</option>
          <option>stay fit and healthy</option>
        </select>
      </label>

      <label>Experience
        <select value={f.experience} onChange={set("experience")}>
          <option>beginner</option><option>intermediate</option><option>advanced</option>
        </select>
      </label>

      <label>Equipment
        <select value={f.equipment} onChange={set("equipment")}>
          <option>bodyweight only</option><option>dumbbells and bands</option><option>full gym</option>
        </select>
      </label>

      <div className="row">
        <label>Days per week
          <select value={f.daysPerWeek} onChange={set("daysPerWeek")}>
            {[2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>Session (min)
          <select value={f.sessionTime} onChange={set("sessionTime")}>
            {[20, 30, 45, 60, 90].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <label>Diet preference
        <select value={f.diet} onChange={set("diet")}>
          <option>no preference</option><option>vegetarian</option><option>vegan</option>
          <option>non-vegetarian</option><option>eggetarian</option>
        </select>
      </label>

      <label>Injuries or limitations
        <input type="text" placeholder="e.g. weak left knee, or leave blank" value={f.injuries} onChange={set("injuries")} />
      </label>

      <button className="primary" disabled>
  {loading ? "Generating…" : "Generate plan"}
</button>
    </form>
  );
}
