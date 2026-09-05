const STORAGE_KEY = "peoplepay360.timeOffTypes";
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const seedTypes = [
  {
    id: "TOT001",
    name: "Casual Leave",
    code: "CL",
    description: "Short planned or personal leave.",
    paid: true,
    approvalRequired: true,
    status: "Active",
  },
  {
    id: "TOT002",
    name: "Sick Leave",
    code: "SL",
    description: "Leave for illness or medical recovery.",
    paid: true,
    approvalRequired: true,
    status: "Active",
  },
  {
    id: "TOT003",
    name: "Paid Leave",
    code: "PL",
    description: "General paid leave category.",
    paid: true,
    approvalRequired: true,
    status: "Active",
  },
  {
    id: "TOT004",
    name: "Unpaid Leave",
    code: "UL",
    description: "Approved leave without pay.",
    paid: false,
    approvalRequired: true,
    status: "Active",
  },
  {
    id: "TOT005",
    name: "Compensatory Off",
    code: "CO",
    description: "Legacy compensatory leave category.",
    paid: true,
    approvalRequired: false,
    status: "Inactive",
  },
];
const copyType = (item) => ({ ...item });

function readTypes() {
  if (typeof localStorage === "undefined") return seedTypes.map(copyType);
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTypes));
    return seedTypes.map(copyType);
  }
  try {
    const types = JSON.parse(stored);
    if (!Array.isArray(types)) throw new Error("Invalid time off type store");
    return types.map(copyType);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTypes));
    return seedTypes.map(copyType);
  }
}

function writeTypes(types) {
  if (typeof localStorage === "undefined")
    throw new Error("Time off type storage is unavailable");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

const normalizeBooleans = (data) => ({
  ...data,
  paid: data.paid === true || data.paid === "true",
  approvalRequired:
    data.approvalRequired === true || data.approvalRequired === "true",
});

// Replace these function bodies with Axios requests when the API is available.
export async function getTimeOffTypes() {
  await delay();
  return readTypes();
}
export async function getTimeOffTypeById(id) {
  await delay();
  const item = readTypes().find((type) => type.id === id);
  if (!item) throw new Error("Time off type not found");
  return copyType(item);
}
export async function createTimeOffType(data) {
  await delay();
  const types = readTypes();
  if (types.some((item) => item.code.toLowerCase() === data.code.toLowerCase()))
    throw new Error("A time off type with this code already exists.");
  const nextNumber =
    Math.max(
      0,
      ...types.map((item) => Number(item.id.replace("TOT", "")) || 0),
    ) + 1;
  const item = {
    ...normalizeBooleans(data),
    id: `TOT${String(nextNumber).padStart(3, "0")}`,
  };
  writeTypes([item, ...types]);
  return copyType(item);
}
export async function updateTimeOffType(id, data) {
  await delay();
  const types = readTypes();
  const index = types.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Time off type not found");
  if (
    types.some(
      (item, typeIndex) =>
        typeIndex !== index &&
        item.code.toLowerCase() === data.code.toLowerCase(),
    )
  )
    throw new Error("A time off type with this code already exists.");
  types[index] = {
    ...types[index],
    ...normalizeBooleans(data),
    id: types[index].id,
  };
  writeTypes(types);
  return copyType(types[index]);
}
