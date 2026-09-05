import { cleanEmployeeId, employeeIdsMatch } from "./employeeIdentity.js";

const STORAGE_KEY = "peoplepay360.contracts";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const seedContracts = [
  {
    id: "CON001",
    contractId: "CON001",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    position: "Software Engineer",
    employmentType: "Full-time",
    startDate: "2023-07-10",
    endDate: "",
    workingSchedule: "Standard · Mon–Fri",
    baseWage: 78000,
    payFrequency: "Monthly",
    status: "Active",
    notes: "Current employment contract.",
  },
  {
    id: "CON002",
    contractId: "CON002",
    employeeId: "EMP001",
    employeeName: "Riya Patel",
    position: "Junior Software Engineer",
    employmentType: "Full-time",
    startDate: "2022-07-11",
    endDate: "2023-07-09",
    workingSchedule: "Standard · Mon–Fri",
    baseWage: 54000,
    payFrequency: "Monthly",
    status: "Expired",
    notes: "Superseded after role progression.",
  },
  {
    id: "CON003",
    contractId: "CON003",
    employeeId: "EMP002",
    employeeName: "Aarav Shah",
    position: "HR Executive",
    employmentType: "Full-time",
    startDate: "2024-01-15",
    endDate: "",
    workingSchedule: "Standard · Mon–Fri",
    baseWage: 52000,
    payFrequency: "Monthly",
    status: "Active",
    notes: "",
  },
  {
    id: "CON004",
    contractId: "CON004",
    employeeId: "EMP003",
    employeeName: "Meera Desai",
    position: "Finance Analyst",
    employmentType: "Full-time",
    startDate: "2022-11-21",
    endDate: "",
    workingSchedule: "Standard · Mon–Fri",
    baseWage: 68000,
    payFrequency: "Monthly",
    status: "Active",
    notes: "Current employment contract.",
  },
  {
    id: "CON005",
    contractId: "CON005",
    employeeId: "EMP004",
    employeeName: "Kabir Singh",
    position: "Operations Lead",
    employmentType: "Full-time",
    startDate: "2025-04-05",
    endDate: "",
    workingSchedule: "Early · Mon–Fri",
    baseWage: 89000,
    payFrequency: "Monthly",
    status: "Draft",
    notes: "Renewal awaiting approval.",
  },
  {
    id: "CON006",
    contractId: "CON006",
    employeeId: "EMP005",
    employeeName: "Ishita Kapoor",
    position: "Content Specialist",
    employmentType: "Contract",
    startDate: "2024-06-03",
    endDate: "2025-06-02",
    workingSchedule: "Flexible · Mon–Fri",
    baseWage: 42000,
    payFrequency: "Monthly",
    status: "Cancelled",
    notes: "Contract closed before renewal.",
  },
];

const copyContract = (contract) => ({ ...contract });

function readContracts() {
  if (typeof localStorage === "undefined")
    return seedContracts.map(copyContract);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedContracts));
    return seedContracts.map(copyContract);
  }
  try {
    const contracts = JSON.parse(stored);
    if (!Array.isArray(contracts)) throw new Error("Invalid contract store");
    return contracts.map(copyContract);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedContracts));
    return seedContracts.map(copyContract);
  }
}

function writeContracts(contracts) {
  if (typeof localStorage === "undefined")
    throw new Error("Contract storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

// Replace these function bodies with Axios requests when contract endpoints exist.
export async function getContracts() {
  await delay();
  return readContracts();
}
export async function getContractById(id) {
  await delay();
  const contract = readContracts().find(
    (item) => item.id === id || item.contractId === id,
  );
  if (!contract) throw new Error("Contract not found");
  return copyContract(contract);
}
export async function getContractsByEmployee(employeeId) {
  await delay();
  return readContracts()
    .filter((item) => employeeIdsMatch(item.employeeId, employeeId))
    .map(copyContract);
}
export async function createContract(data) {
  await delay();
  const contracts = readContracts();
  if (
    contracts.some(
      (item) => item.contractId.toLowerCase() === data.contractId.toLowerCase(),
    )
  )
    throw new Error("A contract with this ID already exists.");
  const contract = {
    ...data,
    id: data.contractId,
    employeeId: cleanEmployeeId(data.employeeId),
    baseWage: Number(data.baseWage),
  };
  writeContracts([contract, ...contracts]);
  return copyContract(contract);
}
export async function updateContract(id, data) {
  await delay();
  const contracts = readContracts();
  const index = contracts.findIndex(
    (item) => item.id === id || item.contractId === id,
  );
  if (index < 0) throw new Error("Contract not found");
  if (
    contracts.some(
      (item, contractIndex) =>
        contractIndex !== index &&
        item.contractId.toLowerCase() === data.contractId.toLowerCase(),
    )
  )
    throw new Error("A contract with this ID already exists.");
  contracts[index] = {
    ...contracts[index],
    ...data,
    id: contracts[index].id,
    employeeId: cleanEmployeeId(data.employeeId ?? contracts[index].employeeId),
    baseWage: Number(data.baseWage),
  };
  writeContracts(contracts);
  return copyContract(contracts[index]);
}
