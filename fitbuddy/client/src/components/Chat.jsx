import { useState } from "react";
import { refinePlan } from "../api.js";

const QUICK = ["Make it harder", "Make it easier", "Swap exercises I don't like", "Lower the calories"];

export default function Chat({ plan, onChange }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);

  async function send(instruction) {
    if (!instruction.trim() || busy) return;
    setBusy(true);
    setLog((l) => [...l, { who: "you", text: instruction }]);
    setText("");
    try {
      const updated = await refinePlan(plan, instruction);
      onChange(updated);
      setLog((l) => [...l, { who: "bot", text: "Done. Your plan above is updated." }]);
    } catch (e) {
      setLog((l) => [...l, { who: "bot", text: e.message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel chat">
      <h2>Adjust your plan</h2>
      <div className="chips">
        {QUICK.map((q) => <button key={q} onClick={() => send(q)} disabled={busy}>{q}</button>)}
      </div>
      <div className="log">
        {log.map((m, i) => <p key={i} className={m.who}>{m.text}</p>)}
        {busy && <p className="bot muted">Updating…</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder='e.g. "swap squats for lunges on Day 2"' />
        <button className="primary" disabled={busy}>Send</button>
      </form>
    </section>
  );
}
