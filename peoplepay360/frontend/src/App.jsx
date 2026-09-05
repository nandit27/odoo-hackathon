import { Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Attendance from "./pages/Attendance.jsx";
import TimeOff from "./pages/TimeOff.jsx";
import Payroll from "./pages/Payroll.jsx";

const links = [
  ["Login", "/login"],
  ["Dashboard", "/"],
  ["Employees", "/employees"],
  ["Attendance", "/attendance"],
  ["TimeOff", "/timeoff"],
  ["Payroll", "/payroll"],
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="bg-white shadow px-4 py-3 flex gap-4 flex-wrap">
        <span className="font-bold mr-4">PeoplePay360</span>
        {links.map(([label, to]) => (
          <Link key={to + label} to={to} className="text-blue-600 hover:underline">
            {label}
          </Link>
        ))}
      </nav>
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/timeoff" element={<TimeOff />} />
          <Route path="/payroll" element={<Payroll />} />
        </Routes>
      </main>
    </div>
  );
}
