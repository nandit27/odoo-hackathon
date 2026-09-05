import { cleanEmployeeId, employeeIdsMatch } from "./employeeIdentity.js";

const STORAGE_KEY = "peoplepay360.employees";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const seedEmployees = [
  {
    id: "EMP001",
    employeeId: "EMP001",
    firstName: "Riya",
    lastName: "Patel",
    workEmail: "riya.patel@peoplepay360.com",
    phone: "9876521001",
    department: "IT",
    position: "Software Engineer",
    manager: "Vikram Mehta",
    workingSchedule: "Standard · Mon–Fri",
    employmentType: "Full-time",
    joiningDate: "2023-07-10",
    status: "Active",
    address: "Ahmedabad, Gujarat",
    avatar: "",
    counts: { contracts: 2, attendance: 2, timeOff: 2, allocations: 2 },
  },
  {
    id: "EMP002",
    employeeId: "EMP002",
    firstName: "Aarav",
    lastName: "Shah",
    workEmail: "aarav.shah@peoplepay360.com",
    phone: "9876521002",
    department: "Human Resources",
    position: "HR Executive",
    manager: "Neha Joshi",
    workingSchedule: "Standard · Mon–Fri",
    employmentType: "Full-time",
    joiningDate: "2024-01-15",
    status: "Active",
    address: "Vadodara, Gujarat",
    avatar: "",
    counts: { contracts: 1, attendance: 1, timeOff: 1, allocations: 2 },
  },
  {
    id: "EMP003",
    employeeId: "EMP003",
    firstName: "Meera",
    lastName: "Desai",
    workEmail: "meera.desai@peoplepay360.com",
    phone: "9876521003",
    department: "Finance",
    position: "Finance Analyst",
    manager: "Karan Trivedi",
    workingSchedule: "Standard · Mon–Fri",
    employmentType: "Full-time",
    joiningDate: "2022-11-21",
    status: "On Leave",
    address: "Surat, Gujarat",
    avatar: "",
    counts: { contracts: 1, attendance: 1, timeOff: 1, allocations: 1 },
  },
  {
    id: "EMP004",
    employeeId: "EMP004",
    firstName: "Kabir",
    lastName: "Singh",
    workEmail: "kabir.singh@peoplepay360.com",
    phone: "9876521004",
    department: "Operations",
    position: "Operations Lead",
    manager: "Ananya Rao",
    workingSchedule: "Early · Mon–Fri",
    employmentType: "Full-time",
    joiningDate: "2021-04-05",
    status: "Active",
    address: "Pune, Maharashtra",
    avatar: "",
    counts: { contracts: 1, attendance: 1, timeOff: 1, allocations: 1 },
  },
  {
    id: "EMP005",
    employeeId: "EMP005",
    firstName: "Ishita",
    lastName: "Kapoor",
    workEmail: "ishita.kapoor@peoplepay360.com",
    phone: "9876521005",
    department: "Marketing",
    position: "Content Specialist",
    manager: "Rahul Verma",
    workingSchedule: "Flexible · Mon–Fri",
    employmentType: "Contract",
    joiningDate: "2024-06-03",
    status: "Inactive",
    address: "Mumbai, Maharashtra",
    avatar: "",
    counts: { contracts: 1, attendance: 1, timeOff: 0, allocations: 1 },
  },
];

const copyEmployee = (employee) => ({
  ...employee,
  fullName: `${employee.firstName} ${employee.lastName}`,
  counts: { ...(employee.counts || {}) },
});

function readEmployeeStore() {
  if (typeof localStorage === "undefined")
    return seedEmployees.map(copyEmployee);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
    return seedEmployees.map(copyEmployee);
  }
  try {
    const employees = JSON.parse(stored);
    if (!Array.isArray(employees)) throw new Error("Invalid employee store");
    return employees.map(copyEmployee);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
    return seedEmployees.map(copyEmployee);
  }
}

function writeEmployeeStore(employees) {
  if (typeof localStorage === "undefined")
    throw new Error("Employee storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

// Swap these function bodies for Axios requests when employee endpoints are ready.
export async function getEmployees() {
  await delay();
  return readEmployeeStore();
}
export async function getEmployeeById(id) {
  await delay();
  const employee = readEmployeeStore().find(
    (item) => item.id === id || employeeIdsMatch(item.employeeId, id),
  );
  if (!employee) throw new Error("Employee not found");
  return copyEmployee(employee);
}
export async function createEmployee(data) {
  await delay();
  const employees = readEmployeeStore();
  if (
    employees.some((item) => employeeIdsMatch(item.employeeId, data.employeeId))
  )
    throw new Error("An employee with this ID already exists.");
  const employeeId = cleanEmployeeId(data.employeeId);
  const employee = {
    ...data,
    employeeId,
    id: employeeId,
    avatar: "",
    counts: { contracts: 0, attendance: 0, timeOff: 0, allocations: 0 },
  };
  writeEmployeeStore([employee, ...employees]);
  return copyEmployee(employee);
}
export async function updateEmployee(id, data) {
  await delay();
  const employees = readEmployeeStore();
  const index = employees.findIndex(
    (item) => item.id === id || employeeIdsMatch(item.employeeId, id),
  );
  if (index < 0) throw new Error("Employee not found");
  if (
    employees.some(
      (item, employeeIndex) =>
        employeeIndex !== index &&
        employeeIdsMatch(item.employeeId, data.employeeId),
    )
  )
    throw new Error("An employee with this ID already exists.");
  employees[index] = {
    ...employees[index],
    ...data,
    employeeId: cleanEmployeeId(data.employeeId),
    id: employees[index].id,
  };
  writeEmployeeStore(employees);
  return copyEmployee(employees[index]);
}
