async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data;
}

export const generatePlan = (profile) =>
  request("/api/generate", { method: "POST", body: JSON.stringify(profile) });

export const refinePlan = (plan, instruction) =>
  request("/api/refine", { method: "POST", body: JSON.stringify({ plan, instruction }) });

export const listPlans = () => request("/api/plans");
export const savePlan = (title, profile, plan) =>
  request("/api/plans", { method: "POST", body: JSON.stringify({ title, profile, plan }) });
export const deletePlan = (id) => request(`/api/plans/${id}`, { method: "DELETE" });
