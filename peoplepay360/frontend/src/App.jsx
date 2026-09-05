import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import { getHomeRoute, getNavigationForRole } from "./auth/permissions.js";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import PrimaryNavigation from "./components/PrimaryNavigation.jsx";
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

export default function App() {
  const location = useLocation();
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
  );
}
