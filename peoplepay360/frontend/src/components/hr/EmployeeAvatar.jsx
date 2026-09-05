export default function EmployeeAvatar({ employee, size = "md" }) {
  const initials = `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`.toUpperCase();
  const sizes = { sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-20 w-20 text-xl" };
  if (employee.avatar) return <img src={employee.avatar} alt="" className={`${sizes[size]} rounded-full object-cover`} />;
  return <span className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700`} aria-hidden="true">{initials || "—"}</span>;
}
