import { useEffect, useState } from "react";
import { listPlans, deletePlan } from "../api.js";

export default function SavedPlans({ onOpen }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const refresh = () => listPlans().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { refresh(); }, []);

  return (
    <section className="panel">
      <h2>Saved plans</h2>
      {error && <p className="error">{error}</p>}
      {rows.length === 0 && <p className="muted">Nothing saved yet. Open a plan and press Save plan.</p>}
      <ul className="saved">
        {rows.map((r) => (
          <li key={r.id}>
            <div>
              <strong>{r.title}</strong>
              <div className="note">{new Date(r.savedAt).toLocaleString()}</div>
            </div>
            <div>
              <button onClick={() => onOpen(r)}>Open</button>
              <button onClick={async () => { await deletePlan(r.id); refresh(); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
