<<<<<<< Updated upstream
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import { getHomeRoute, getNavigationForRole } from "./auth/permissions.js";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import PrimaryNavigation from "./components/PrimaryNavigation.jsx";
=======
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
>>>>>>> Stashed changes
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import EmployeeDetails from "./pages/EmployeeDetails.jsx";
import EmployeeFormPage from "./pages/EmployeeFormPage.jsx";
import Contracts from "./pages/Contracts.jsx";
import ContractDetails from "./pages/ContractDetails.jsx";
import ContractFormPage from "./pages/ContractFormPage.jsx";
import WorkingSchedules from "./pages/WorkingSchedules.jsx";
import WorkingScheduleDetails from "./pages/WorkingScheduleDetails.jsx";
import WorkingScheduleFormPage from "./pages/WorkingScheduleFormPage.jsx";
import Attendance from "./pages/Attendance.jsx";
import AttendanceDetails from "./pages/AttendanceDetails.jsx";
import AttendanceFormPage from "./pages/AttendanceFormPage.jsx";
import TimeOff from "./pages/TimeOff.jsx";
import TimeOffDetails from "./pages/TimeOffDetails.jsx";
import TimeOffFormPage from "./pages/TimeOffFormPage.jsx";
import TimeOffTypes from "./pages/TimeOffTypes.jsx";
import TimeOffTypeFormPage from "./pages/TimeOffTypeFormPage.jsx";
import Allocations from "./pages/Allocations.jsx";
import AllocationDetails from "./pages/AllocationDetails.jsx";
import AllocationFormPage from "./pages/AllocationFormPage.jsx";
import MeHome from "./pages/MeHome.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import MyAttendance from "./pages/MyAttendance.jsx";
import MyTimeOff from "./pages/MyTimeOff.jsx";
import MyTimeOffForm from "./pages/MyTimeOffForm.jsx";
import Payroll from "./pages/Payroll.jsx";
import { PayrollProvider } from "./context/PayrollContext";

export default function App() {
  const location = useLocation();
<<<<<<< Updated upstream
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const isLogin = location.pathname === "/login";
  const navigationLinks = getNavigationForRole(currentUser?.role);
  const protect = (element, access) => <ProtectedRoute access={access}>{element}</ProtectedRoute>;
  const signOut = () => { logout(); navigate("/login", { replace: true }); };
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {!isLogin && currentUser && <header className="border-b border-slate-200 bg-white">
        <nav className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary navigation">
          <Link to={getHomeRoute(currentUser.role)} className="border-r border-slate-200 pr-6 text-base font-bold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300">PeoplePay360</Link>
          <PrimaryNavigation items={navigationLinks} />
          <button type="button" onClick={signOut} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950">Logout</button>
        </nav>
      </header>}
      <main className={isLogin ? "min-h-screen" : "w-full px-4 py-6 sm:px-6 lg:px-8"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={protect(<Dashboard />, "hr")} />
          <Route path="/employees" element={protect(<Employees />, "hr")} />
          <Route path="/employees/new" element={protect(<EmployeeFormPage />, "hr")} />
          <Route path="/employees/:id" element={protect(<EmployeeDetails />, "hr")} />
          <Route path="/employees/:id/edit" element={protect(<EmployeeFormPage />, "hr")} />
          <Route path="/employees/:employeeId/contracts" element={protect(<Contracts />, "hr")} />
          <Route path="/contracts" element={protect(<Contracts />, "hr")} />
          <Route path="/contracts/new" element={protect(<ContractFormPage />, "hr")} />
          <Route path="/contracts/:id" element={protect(<ContractDetails />, "hr")} />
          <Route path="/contracts/:id/edit" element={protect(<ContractFormPage />, "hr")} />
          <Route path="/working-schedules" element={protect(<WorkingSchedules />, "hr")} />
          <Route path="/working-schedules/new" element={protect(<WorkingScheduleFormPage />, "hr")} />
          <Route path="/working-schedules/:id" element={protect(<WorkingScheduleDetails />, "hr")} />
          <Route path="/working-schedules/:id/edit" element={protect(<WorkingScheduleFormPage />, "hr")} />
          <Route path="/attendance" element={protect(<Attendance />, "hr")} />
          <Route path="/attendance/new" element={protect(<AttendanceFormPage />, "hr")} />
          <Route path="/attendance/:id" element={protect(<AttendanceDetails />, "hr")} />
          <Route path="/attendance/:id/edit" element={protect(<AttendanceFormPage />, "hr")} />
          <Route path="/employees/:employeeId/attendance" element={protect(<Attendance />, "hr")} />
          <Route path="/timeoff" element={protect(<TimeOff />, "hr")} />
          <Route path="/timeoff/new" element={protect(<TimeOffFormPage />, "hr")} />
          <Route path="/timeoff/:id" element={protect(<TimeOffDetails />, "hr")} />
          <Route path="/timeoff/:id/edit" element={protect(<TimeOffFormPage />, "hr")} />
          <Route path="/employees/:employeeId/timeoff" element={protect(<TimeOff />, "hr")} />
          <Route path="/time-off-types" element={protect(<TimeOffTypes />, "hr")} />
          <Route path="/time-off-types/new" element={protect(<TimeOffTypeFormPage />, "hr")} />
          <Route path="/time-off-types/:id/edit" element={protect(<TimeOffTypeFormPage />, "hr")} />
          <Route path="/allocations" element={protect(<Allocations />, "hr")} />
          <Route path="/allocations/new" element={protect(<AllocationFormPage />, "hr")} />
          <Route path="/allocations/:id" element={protect(<AllocationDetails />, "hr")} />
          <Route path="/allocations/:id/edit" element={protect(<AllocationFormPage />, "hr")} />
          <Route path="/employees/:employeeId/allocations" element={protect(<Allocations />, "hr")} />
          <Route path="/me" element={protect(<MeHome />, "employee")} />
          <Route path="/me/profile" element={protect(<MyProfile />, "employee")} />
          <Route path="/me/attendance" element={protect(<MyAttendance />, "employee")} />
          <Route path="/me/timeoff" element={protect(<MyTimeOff />, "employee")} />
          <Route path="/me/timeoff/new" element={protect(<MyTimeOffForm />, "employee")} />
          <Route path="/payroll" element={protect(<Payroll />, "payroll")} />
        </Routes>
      </main>
    </div>
=======
  const isPayrollRoute = location.pathname.startsWith("/payroll");

  return (
    <PayrollProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
        {/* Main HRMS Navigation Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                  PP
                </div>
                <span>PeoplePay360</span>
              </Link>

              <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {links.map(([label, to]) => {
                  const isActive =
                    to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(to);
                  return (
                    <NavLink
                      key={to + label}
                      to={to}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Odoo Hackathon Demo
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className={`flex-1 ${isPayrollRoute ? "w-full p-4" : "max-w-4xl w-full mx-auto p-4"}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/timeoff" element={<TimeOff />} />
            <Route path="/payroll/*" element={<Payroll />} />
          </Routes>
        </main>
      </div>
    </PayrollProvider>
>>>>>>> Stashed changes
  );
}
