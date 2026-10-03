import { useState } from "react";
import ProfileForm from "./components/ProfileForm.jsx";
import PlanView from "./components/PlanView.jsx";
import SavedPlans from "./components/SavedPlans.jsx";
import Tools from "./components/Tools.jsx";
import Progress from "./components/Progress.jsx";
import { generatePlan } from "./api.js";
import { load, save } from "./storage.js";

const TABS = [
  ["plan", "My plan"],
  ["saved", "Saved plans"],
  ["progress", "Progress"],
  ["tools", "Tools"]
];

export default function App() {
  const [tab, setTab] = useState("plan");
  const [profile, setProfile] = useState(() => load("fb_profile", null));
  const [plan, setPlan] = useState(() => load("fb_plan", null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePlan = (p) => {
    setPlan(p);
    save("fb_plan", p);
  };

  async function onGenerate(values) {
    setLoading(true);
    setError("");
    try {
      const result = await generatePlan(values);
      setProfile(values);
      save("fb_profile", values);
      updatePlan(result);
      setTab("plan");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="top">
        <h1>FitBuddy</h1>
        <nav>
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "tab on" : "tab"} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === "plan" && (
          <div className="split">
            <ProfileForm initial={profile} loading={loading} onSubmit={onGenerate} />
            <section>
              {error && <p className="error" role="alert">{error}</p>}
              {loading && <p className="muted">Building your plan. This takes about 10 seconds.</p>}
              {!loading && plan && <PlanView plan={plan} profile={profile} onChange={updatePlan} />}
              {!loading && !plan && !error && (
                <div className="empty">
                  <h2>No plan yet</h2>
                  <p>Fill in your details and press Generate plan.</p>
                </div>
              )}
            </section>
          </div>
        )}
        {tab === "saved" && (
          <SavedPlans
            onOpen={(row) => {
              setProfile(row.profile);
              updatePlan(row.plan);
              setTab("plan");
            }}
          />
        )}
        {tab === "progress" && <Progress />}
        {tab === "tools" && <Tools profile={profile} plan={plan} />}
      </main>
    </div>
  );
}
