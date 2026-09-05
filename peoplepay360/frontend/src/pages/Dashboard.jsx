import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Dashboard() {
  const [health, setHealth] = useState("…");
  useEffect(() => {
    api.get("/health").then((r) => setHealth(r.data.status)).catch(() => setHealth("unreachable"));
  }, []);
  return (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600">API health: {health}</p>
    </div>
  );
}
