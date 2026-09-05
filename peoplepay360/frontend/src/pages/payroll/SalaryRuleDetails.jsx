import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Sliders,
  Code2,
  Percent,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import PayrollHeader from "../../components/payroll/PayrollHeader";

export default function SalaryRuleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rules, structures, addSalaryRule, updateSalaryRule, deleteSalaryRule } =
    usePayroll();

  const isNew = id === "new";
  const existingRule = rules.find((r) => r.id === id);

  // Form State
  const [name, setName] = useState(existingRule?.name || "");
  const [code, setCode] = useState(existingRule?.code || "");
  const [category, setCategory] = useState(existingRule?.category || "Allowance");
  const [structure, setStructure] = useState("Regular Salary");
  const [sequence, setSequence] = useState(existingRule?.sequence || 50);
  const [calcType, setCalcType] = useState(existingRule?.calcType || "fixed");
  const [amount, setAmount] = useState(existingRule?.amount || 2000);
  const [percentage, setPercentage] = useState(existingRule?.percentage || 10);
  const [basedOn, setBasedOn] = useState(existingRule?.basedOn || "Basic Salary");
  const [formula, setFormula] = useState(existingRule?.formula || "BASIC * 0.10");
  const [description, setDescription] = useState(existingRule?.description || "");
  const [status, setStatus] = useState(existingRule?.status || "Active");

  const [errors, setErrors] = useState({});

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Please enter a rule name.";
    if (!code.trim()) newErrors.code = "Please enter a short code (e.g. HRA).";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name,
      code: code.toUpperCase().trim(),
      category,
      calcType,
      amount: Number(amount) || 0,
      percentage: Number(percentage) || 0,
      basedOn,
      formula,
      sequence: Number(sequence) || 50,
      description,
      status,
    };

    if (isNew) {
      addSalaryRule(payload);
    } else {
      updateSalaryRule(existingRule.id, payload);
    }

    navigate("/payroll/rules");
  };

  const handleDelete = () => {
    if (existingRule) {
      deleteSalaryRule(existingRule.id);
      navigate("/payroll/rules");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PayrollHeader
        title={isNew ? "Create Salary Rule" : `Salary Rule / ${name || existingRule?.name}`}
        subtitle="Define an earning, allowance, deduction, or calculation rule for employee salaries."
        breadcrumbs={[
          { label: "Payroll", to: "/payroll/dashboard" },
          { label: "Salary Rules", to: "/payroll/rules" },
          { label: isNew ? "New Rule" : code || name },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Rule Info */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Rule Identification</h2>
            <p className="text-xs text-gray-500">Provide a clear name and classification for this salary component.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Component Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Travel Allowance"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              {errors.name && (
                <p className="text-rose-600 text-xs mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Short Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. TA, HRA, PF"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono uppercase"
              />
              {errors.code && (
                <p className="text-rose-600 text-xs mt-1 font-medium">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Component Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Basic">💰 Base Salary</option>
                <option value="Allowance">🏠 Allowance (Earnings)</option>
                <option value="Deduction">➖ Deduction (Taxes/PF)</option>
                <option value="Computation">🧮 Calculation (Gross/Net)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the company policy or statutory requirement for this rule..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Calculation Method Selection */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">How should this amount be calculated?</h2>
            <p className="text-xs text-gray-500">Choose a straightforward calculation method for this salary rule.</p>
          </div>

          {/* 3 Selectable Method Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "fixed",
                title: "Fixed Amount",
                desc: "A flat sum every month (e.g., ₹2,000)",
                icon: DollarSign,
              },
              {
                id: "percentage",
                title: "Percentage (%)",
                desc: "Percentage of Base or Gross pay (e.g., 40%)",
                icon: Percent,
              },
              {
                id: "formula",
                title: "Custom Formula",
                desc: "Advanced math expression (e.g. BASIC * 0.4)",
                icon: Code2,
                badge: "Advanced",
              },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = calcType === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setCalcType(method.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 shadow-xs"
                      : "border-gray-200 bg-gray-50/40 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-500"}`}
                      />
                      <span className="text-xs font-bold text-gray-900">{method.title}</span>
                    </div>
                    {method.badge && (
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">{method.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Option 1: Fixed Amount */}
          {calcType === "fixed" && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Fixed Monthly Amount (₹)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full text-xs sm:text-sm pl-8 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-gray-900"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                This exact amount will be added or deducted every pay cycle.
              </p>
            </div>
          )}

          {/* Option 2: Percentage */}
          {calcType === "percentage" && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Percentage Value (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="40"
                    className="w-full text-xs sm:text-sm pr-8 pl-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-gray-900"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Calculated as a Percentage Of:
                </label>
                <select
                  value={basedOn}
                  onChange={(e) => setBasedOn(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                >
                  <option value="Basic Salary">Basic Base Salary (BASIC)</option>
                  <option value="Gross Salary">Total Gross Earnings (GROSS)</option>
                  <option value="Monthly Salary">Total Monthly CTC Wage (WAGE)</option>
                </select>
              </div>
            </div>
          )}

          {/* Option 3: Custom Formula */}
          {calcType === "formula" && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800">
                  Custom Math Formula Expression
                </label>
                <span className="text-[11px] text-gray-500 font-mono">
                  Available tokens: BASIC, HRA, MEAL, GROSS, PF, PT, TDS
                </span>
              </div>
              <textarea
                rows={3}
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. BASIC * 0.40 or GROSS - (PF + PT + TDS)"
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-amber-700 font-medium">
                Advanced Option: Use this only when standard percentages or fixed amounts do not fit company policy.
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Rule</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/payroll/rules"
              className="text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Salary Rule</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
