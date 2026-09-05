const typeStore = [
  { id: "TOT001", name: "Casual Leave", code: "CL", description: "Short planned or personal leave.", paid: true, approvalRequired: true, status: "Active" },
  { id: "TOT002", name: "Sick Leave", code: "SL", description: "Leave for illness or medical recovery.", paid: true, approvalRequired: true, status: "Active" },
  { id: "TOT003", name: "Paid Leave", code: "PL", description: "General paid leave category.", paid: true, approvalRequired: true, status: "Active" },
  { id: "TOT004", name: "Unpaid Leave", code: "UL", description: "Approved leave without pay.", paid: false, approvalRequired: true, status: "Active" },
  { id: "TOT005", name: "Compensatory Off", code: "CO", description: "Legacy compensatory leave category.", paid: true, approvalRequired: false, status: "Inactive" },
];
const copyType = (item) => ({ ...item });

// Replace these function bodies with Axios requests when the API is available.
export async function getTimeOffTypes() { return typeStore.map(copyType); }
export async function getTimeOffTypeById(id) { const item = typeStore.find((type) => type.id === id); if (!item) throw new Error("Time off type not found"); return copyType(item); }
export async function createTimeOffType(data) {
  if (typeStore.some((item) => item.code.toLowerCase() === data.code.toLowerCase())) throw new Error("A time off type with this code already exists.");
  const nextNumber = Math.max(0, ...typeStore.map((item) => Number(item.id.replace("TOT", "")) || 0)) + 1;
  const item = { ...data, id: `TOT${String(nextNumber).padStart(3, "0")}` }; typeStore.unshift(item); return copyType(item);
}
export async function updateTimeOffType(id, data) { const index = typeStore.findIndex((item) => item.id === id); if (index < 0) throw new Error("Time off type not found"); typeStore[index] = { ...typeStore[index], ...data, id }; return copyType(typeStore[index]); }
