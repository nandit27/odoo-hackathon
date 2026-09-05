import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  async function load() {
    try {
      const [h, db, u] = await Promise.all([
        fetch("/api/health").then((r) => r.json()),
        fetch("/api/db-health").then((r) => r.json()),
        fetch("/api/users").then((r) => r.json()),
      ]);
      setHealth(h);
      setDbHealth(db);
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) {
      setError("API unreachable. Is server running on :5000?");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addUser(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUsers((prev) => [data, ...prev]);
      setForm({ name: "", email: "" });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="container">
      <h1>React + Express + Postgres</h1>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Status</h2>
        <p>API: {health ? health.status : "…"}</p>
        <p>
          DB: {dbHealth ? `${dbHealth.status}` : "…"}
          {dbHealth?.postgresTime ? ` (${dbHealth.postgresTime})` : ""}
          {dbHealth?.message ? ` — ${dbHealth.message}` : ""}
        </p>
        <button onClick={load}>Refresh</button>
      </section>

      <section className="card">
        <h2>Add User</h2>
        <form onSubmit={addUser}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit">Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Users ({users.length})</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.name} — {u.email}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
