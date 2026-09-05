import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { demoUsers } from "../auth/demoUsers.js";
import { getHomeRoute } from "../auth/permissions.js";

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const inputClass = "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!values.email.trim()) next.email = "Work email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid work email.";
    if (!values.password) next.password = "Password is required.";
    setErrors(next);
    if (!Object.keys(next).length) {
      const result = await login(values.email, values.password);
      if (!result.success) setMessage(result.error);
      else navigate(getHomeRoute(result.user.role), { replace: true, state: { from: location.state?.from } });
    }
  }

  if (currentUser) return <Navigate to={getHomeRoute(currentUser.role)} replace />;

  return <div className="grid min-h-screen bg-white lg:grid-cols-2">
    <section className="flex items-center bg-slate-900 px-6 py-12 text-white sm:px-12 lg:px-16 xl:px-24">
      <div className="max-w-lg">
        <p className="text-sm font-semibold tracking-wide text-slate-300">PeoplePay360</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">HR &amp; Payroll Operations Platform</h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Manage people, attendance, leave, and payroll operations from one secure workspace.</p>
      </div>
    </section>
    <section className="flex items-center px-4 py-10 sm:px-8 lg:px-16 xl:px-24">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Secure access</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Sign in to PeoplePay360</h2>
        <p className="mt-2 text-sm text-slate-600">Use your organization credentials to continue.</p>
        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">Work email<input name="email" type="email" autoComplete="email" value={values.email} onChange={change} aria-invalid={Boolean(errors.email)} className={inputClass} />{errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}</label>
          <label className="block text-sm font-medium text-slate-700">Password<div className="relative"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={values.password} onChange={change} aria-invalid={Boolean(errors.password)} className={`${inputClass} pr-16`} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-1 right-1 mt-1 px-3 text-xs font-semibold text-slate-600 hover:text-slate-950">{showPassword ? "Hide" : "Show"}</button></div>{errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password}</span>}</label>
          {message && <div role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>}
          <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Sign in</button>
        </form>
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Demo accounts</p>
          <div className="mt-2 space-y-1">
            {demoUsers.map((user) => <button key={user.email} type="button" onClick={() => { setValues({ email: user.email, password: user.password }); setErrors({}); setMessage(""); }} className="block w-full truncate text-left text-xs text-slate-500 hover:text-slate-900"><span className="font-medium text-slate-700">{user.role.replaceAll("_", " ")}</span> · {user.email}</button>)}
          </div>
        </div>
      </div>
    </section>
  </div>;
}
