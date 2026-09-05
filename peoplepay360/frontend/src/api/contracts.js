import api from "./axios.js";

const day = (value) => value?.slice(0, 10) || "";
const title = (value) => value?.toLowerCase().replace(/^./, (letter) => letter.toUpperCase()) || "Active";
const view = (item) => ({ ...item, contractId: String(item.id), baseWage: Number(item.wage), position: item.position, startDate: day(item.startDate), endDate: day(item.endDate), status: title(item.status) });
const payload = (item) => ({ employeeId: Number(item.employeeId), salaryStructureId: Number(item.salaryStructureId || 1), startDate: item.startDate, endDate: item.endDate || null, wage: Number(item.baseWage), status: String(item.status || "ACTIVE").toUpperCase(), department: item.department || "Unassigned", position: item.position });
export async function getContracts() { return (await api.get("/api/contracts")).data.map(view); }
export async function getContractById(id) { return view((await api.get(`/api/contracts/${id}`)).data); }
export async function getContractsByEmployee(employeeId) { return (await api.get("/api/contracts", { params: { employeeId } })).data.map(view); }
export async function createContract(data) { return view((await api.post("/api/contracts", payload(data))).data); }
export async function updateContract(id, data) { return view((await api.put(`/api/contracts/${id}`, payload(data))).data); }
