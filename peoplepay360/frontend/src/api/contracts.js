const contractStore = [
  { id: "CON001", contractId: "CON001", employeeId: "EMP001", employeeName: "Riya Patel", position: "Software Engineer", employmentType: "Full-time", startDate: "2023-07-10", endDate: "", workingSchedule: "Standard · Mon–Fri", baseWage: 78000, payFrequency: "Monthly", status: "Active", notes: "Current employment contract." },
  { id: "CON002", contractId: "CON002", employeeId: "EMP001", employeeName: "Riya Patel", position: "Junior Software Engineer", employmentType: "Full-time", startDate: "2022-07-11", endDate: "2023-07-09", workingSchedule: "Standard · Mon–Fri", baseWage: 54000, payFrequency: "Monthly", status: "Expired", notes: "Superseded after role progression." },
  { id: "CON003", contractId: "CON003", employeeId: "EMP002", employeeName: "Aarav Shah", position: "HR Executive", employmentType: "Full-time", startDate: "2024-01-15", endDate: "", workingSchedule: "Standard · Mon–Fri", baseWage: 52000, payFrequency: "Monthly", status: "Active", notes: "" },
  { id: "CON004", contractId: "CON004", employeeId: "EMP003", employeeName: "Meera Desai", position: "Finance Analyst", employmentType: "Full-time", startDate: "2022-11-21", endDate: "", workingSchedule: "Standard · Mon–Fri", baseWage: 68000, payFrequency: "Monthly", status: "Active", notes: "Current employment contract." },
  { id: "CON005", contractId: "CON005", employeeId: "EMP004", employeeName: "Kabir Singh", position: "Operations Lead", employmentType: "Full-time", startDate: "2025-04-05", endDate: "", workingSchedule: "Early · Mon–Fri", baseWage: 89000, payFrequency: "Monthly", status: "Draft", notes: "Renewal awaiting approval." },
  { id: "CON006", contractId: "CON006", employeeId: "EMP005", employeeName: "Ishita Kapoor", position: "Content Specialist", employmentType: "Contract", startDate: "2024-06-03", endDate: "2025-06-02", workingSchedule: "Flexible · Mon–Fri", baseWage: 42000, payFrequency: "Monthly", status: "Cancelled", notes: "Contract closed before renewal." },
];

const copyContract = (contract) => ({ ...contract });

// Replace these function bodies with Axios requests when contract endpoints exist.
export async function getContracts() { return contractStore.map(copyContract); }
export async function getContractById(id) {
  const contract = contractStore.find((item) => item.id === id || item.contractId === id);
  if (!contract) throw new Error("Contract not found");
  return copyContract(contract);
}
export async function getContractsByEmployee(employeeId) { return contractStore.filter((item) => item.employeeId === employeeId).map(copyContract); }
export async function createContract(data) {
  if (contractStore.some((item) => item.contractId.toLowerCase() === data.contractId.toLowerCase())) throw new Error("A contract with this ID already exists.");
  const contract = { ...data, id: data.contractId, baseWage: Number(data.baseWage) };
  contractStore.unshift(contract);
  return copyContract(contract);
}
export async function updateContract(id, data) {
  const index = contractStore.findIndex((item) => item.id === id || item.contractId === id);
  if (index < 0) throw new Error("Contract not found");
  contractStore[index] = { ...contractStore[index], ...data, id: contractStore[index].id, baseWage: Number(data.baseWage) };
  return copyContract(contractStore[index]);
}
