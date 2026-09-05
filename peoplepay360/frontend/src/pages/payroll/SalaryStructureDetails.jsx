import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  Sliders,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";

export default function SalaryStructureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    structures,
    rules,
    addSalaryStructure,
    updateSalaryStructure,
    showToast,
  } = usePayroll();

  const isNew = id === "new";
  const existingStructure = structures.find((s) => s.id === id);

  const [name, setName] = useState(existingStructure?.name || "");
  const [type, setType] = useState(existingStructure?.type || "Regular Full-Time");
  const [description, setDescription] = useState(
    existingStructure?.description || ""
  );
  const [status, setStatus] = useState(existingStructure?.status || "Active");
  const [selectedRuleIds, setSelectedRuleIds] = useState(
    existingStructure?.ruleIds || rules.map((r) => r.id)
  );

  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [ruleToAdd, setRuleToAdd] = useState("");

  const moveRuleUp = (index) => {
    if (index === 0) return;
    const updated = [...selectedRuleIds];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSelectedRuleIds(updated);
  };

  const moveRuleDown = (index) => {
    if (index === selectedRuleIds.length - 1) return;
    const updated = [...selectedRuleIds];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSelectedRuleIds(updated);
  };

  const removeRule = (ruleId) => {
    setSelectedRuleIds((prev) => prev.filter((rId) => rId !== ruleId));
  };

  const handleAddRule = () => {
    if (ruleToAdd && !selectedRuleIds.includes(ruleToAdd)) {
      setSelectedRuleIds((prev) => [...prev, ruleToAdd]);
      setRuleToAdd("");
      setIsAddRuleModalOpen(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please provide a name for this salary structure.", "warning");
      return;
    }

    if (isNew) {
      addSalaryStructure({
        name,
        type,
        description,
        status,
        ruleIds: selectedRuleIds,
      });
      navigate("/payroll/structures");
    } else {
      updateSalaryStructure(existingStructure.id, {
        name,
        type,
        description,
        status,
        ruleIds: selectedRuleIds,
      });
      navigate("/payroll/structures");
    }
  };

  const unassignedRules = rules.filter((r) => !selectedRuleIds.includes(r.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PayrollHeader
        title={isNew ? "Create Salary Structure" : `Salary Structure / ${name}`}
        subtitle="Configure the step-by-step sequence of salary rules that calculate employee earnings and deductions."
        breadcrumbs={[
          { label: "Payroll", to: "/payroll/dashboard" },
          { label: "Salary Structures", to: "/payroll/structures" },
          { label: isNew ? "New Structure" : name },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Structure Info */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Structure Details</h2>
            <p className="text-xs text-gray-500">Define the profile and applicability of this compensation package.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Structure Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Regular Full-Time Salary"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option>Regular Full-Time</option>
                <option>Management & Leadership</option>
                <option>Contractual / Retainer</option>
                <option>Internship / Stipend</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain who this salary structure applies to..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Salary Rules Sequence Section */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Step-by-Step Salary Calculation Sequence</h2>
              <p className="text-xs text-gray-500">
                Rules execute in order from top to bottom. Use the up/down arrows to adjust calculation order.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddRuleModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Component</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {selectedRuleIds.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-xs text-gray-500">
                  No salary rules attached to this structure yet. Click "+ Add Component" to add rules.
                </p>
              </div>
            ) : (
              selectedRuleIds.map((rId, index) => {
                const rule = rules.find((r) => r.id === rId);
                if (!rule) return null;

                const categoryLabels = {
                  Basic: { name: "Base Pay", bg: "bg-blue-50 text-blue-700 border-blue-200" },
                  Allowance: { name: "Allowance", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  Deduction: { name: "Deduction", bg: "bg-rose-50 text-rose-700 border-rose-200" },
                  Computation: { name: "Calculation", bg: "bg-purple-50 text-purple-700 border-purple-200" },
                };

                const cat = categoryLabels[rule.category] || { name: rule.category, bg: "bg-gray-100 text-gray-700" };

                return (
                  <div
                    key={rId}
                    className="flex items-center justify-between p-3.5 bg-gray-50/90 hover:bg-gray-100/90 border border-gray-200 rounded-xl transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <span>{rule.name}</span>
                          <span className="font-mono text-[10px] text-gray-500 font-normal">
                            ({rule.code})
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">{rule.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cat.bg}`}
                      >
                        {cat.name}
                      </span>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveRuleUp(index)}
                          title="Move earlier in calculation"
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedRuleIds.length - 1}
                          onClick={() => moveRuleDown(index)}
                          title="Move later in calculation"
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRule(rId)}
                          title="Remove from this structure"
                          className="p-1.5 rounded-md bg-white border border-gray-300 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/payroll/structures"
            className="text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Structure</span>
          </button>
        </div>
      </form>

      {/* Add Rule Dialog Modal */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Add Salary Component</h3>
            <p className="text-xs text-gray-500 mb-4">
              Select an existing rule to include in this salary calculation sequence.
            </p>

            <select
              value={ruleToAdd}
              onChange={(e) => setRuleToAdd(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden mb-4 font-medium"
            >
              <option value="">-- Choose a Rule --</option>
              {unassignedRules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code} - {r.category})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddRuleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!ruleToAdd}
                onClick={handleAddRule}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
