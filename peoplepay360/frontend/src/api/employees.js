import api from "./axios.js";

const day = (value) => value?.slice(0, 10) || "";
const title = (value) => value?.toLowerCase().replace(/^./, (letter) => letter.toUpperCase()) || "Active";
const view = (item) => ({ ...item, employeeId: String(item.id), fullName: item.name, firstName: item.name.split(" ")[0] || "", lastName: item.name.split(" ").slice(1).join(" "), workEmail: item.email, position: item.jobPosition, joiningDate: day(item.dateJoined), status: title(item.status), manager: item.manager?.name || "", workingSchedule: item.schedule?.name || "", counts: {} });
const payload = (item) => ({ name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.fullName, email: item.workEmail, department: item.department, jobPosition: item.position, status: String(item.status || "ACTIVE").toUpperCase().replace("ON LEAVE", "ACTIVE"), dateJoined: item.joiningDate, scheduleId: item.scheduleId || null, managerId: item.managerId || null });
export async function getEmployees() { return (await api.get("/api/employees")).data.map(view); }
export async function getEmployeeById(id) { return view((await api.get(`/api/employees/${id}`)).data); }
export async function createEmployee(data) { return view((await api.post("/api/employees", payload(data))).data); }
export async function updateEmployee(id, data) { return view((await api.put(`/api/employees/${id}`, payload(data))).data); }
