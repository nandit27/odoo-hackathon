import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    api.get("/api/employees").then((r) => setEmployees(r.data)).catch(() => {});
  }, []);
  return (
    <div className="bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-2">Employees ({employees.length})</h1>
      <ul className="list-disc pl-5">
        {employees.map((e) => (
          <li key={e.id}>{e.firstName} {e.lastName} — {e.email}</li>
        ))}
      </ul>
    </div>
  );
}
