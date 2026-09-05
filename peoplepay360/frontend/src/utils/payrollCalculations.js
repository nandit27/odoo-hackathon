// Dynamic Salary Calculation Engine for PeoplePay360
// Directly evaluates Employee -> Structure -> Ordered Rules sequence

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const num = Math.round(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCompactINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return formatINR(amount);
}

/**
 * Safely evaluates a rule mathematical formula expression given the current context variables
 * e.g. "BASIC * 0.40" with context { WAGE: 100000, BASIC: 50000 }
 */
function evaluateFormula(expr, context) {
  try {
    // Replace variable tokens with their context value
    let sanitized = expr.toUpperCase();
    Object.keys(context).forEach((key) => {
      const val = context[key] !== undefined ? context[key] : 0;
      const regex = new RegExp(`\\b${key}\\b`, "g");
      sanitized = sanitized.replace(regex, val);
    });

    // Strip any unsafe characters (allow numbers, operators, parens, dots, spaces)
    const cleanExpr = sanitized.replace(/[^0-9+\-*/(). ]/g, "");
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleanExpr || 0})`)();
    return isNaN(result) ? 0 : Math.round(result);
  } catch (err) {
    console.warn("Formula evaluation error:", expr, err);
    return 0;
  }
}

/**
 * Dynamically computes employee salary strictly by running through their Assigned Salary Structure's ordered rules
 *
 * @param {Object} employee - Employee record
 * @param {Array} allRules - All active salary rules
 * @param {Array} allStructures - All salary structures
 */
export function calculateEmployeeSalary(employee, allRules = [], allStructures = []) {
  const wage = Number(employee?.monthlySalary) || 0;

  // 1. Locate assigned structure
  const structure =
    allStructures.find(
      (s) => s.name === employee.salaryStructure || s.id === employee.salaryStructure
    ) || allStructures[0];

  const ruleIds = structure?.ruleIds || [];

  // 2. Fetch rules belonging to this structure and sort by sequence
  const structureRules = ruleIds
    .map((rId) => allRules.find((r) => r.id === rId))
    .filter(Boolean)
    .sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));

  // Evaluation Context for formulas and percentage calculations
  const context = {
    WAGE: wage,
    CTC: wage,
    BASIC: 0,
    HRA: 0,
    MEAL: 0,
    TRANS: 0,
    GROSS: 0,
    PF: 0,
    PT: 0,
    TDS: 0,
    DEDUCTIONS: 0,
    NET: 0,
  };

  const ruleBreakdown = [];
  let totalEarnings = 0;
  let totalDeductions = 0;

  // 3. Sequentially execute each rule in the structure
  structureRules.forEach((rule) => {
    let ruleAmount = 0;

    if (rule.calcType === "fixed") {
      ruleAmount = Number(rule.amount) || 0;
    } else if (rule.calcType === "percentage") {
      const pct = (Number(rule.percentage) || 0) / 100;
      let baseVal = wage; // Default wage
      if (rule.basedOn === "Basic Salary" || rule.basedOn === "BASIC") {
        baseVal = context.BASIC;
      } else if (rule.basedOn === "Gross Salary" || rule.basedOn === "GROSS") {
        baseVal = context.GROSS || totalEarnings;
      } else if (rule.basedOn === "Monthly Salary" || rule.basedOn === "WAGE") {
        baseVal = wage;
      }
      ruleAmount = Math.round(baseVal * pct);
    } else if (rule.calcType === "formula") {
      ruleAmount = evaluateFormula(rule.formula || "0", context);
    }

    // Assign to context code if present
    if (rule.code) {
      context[rule.code.toUpperCase()] = ruleAmount;
    }

    // Categorization logic
    if (rule.category === "Basic") {
      context.BASIC = ruleAmount;
      totalEarnings += ruleAmount;
    } else if (rule.category === "Allowance") {
      totalEarnings += ruleAmount;
      context.GROSS = totalEarnings;
    } else if (rule.category === "Deduction") {
      totalDeductions += ruleAmount;
      context.DEDUCTIONS = totalDeductions;
    } else if (rule.category === "Computation") {
      if (rule.code === "GROSS") {
        ruleAmount = totalEarnings;
        context.GROSS = totalEarnings;
      } else if (rule.code === "NET") {
        ruleAmount = Math.max(0, (context.GROSS || totalEarnings) - (context.DEDUCTIONS || totalDeductions));
        context.NET = ruleAmount;
      }
    }

    ruleBreakdown.push({
      id: rule.id,
      name: rule.name,
      code: rule.code,
      category: rule.category,
      calcType: rule.calcType,
      sequence: rule.sequence,
      amount: ruleAmount,
    });
  });

  const gross = context.GROSS || totalEarnings;
  const net = context.NET !== undefined ? context.NET : Math.max(0, gross - totalDeductions);

  return {
    basic: context.BASIC || Math.round(wage * 0.5),
    hra: context.HRA || 0,
    meal: context.MEAL || 0,
    transport: context.TRANS || 0,
    otherAllowances: Math.max(0, gross - ((context.BASIC || 0) + (context.HRA || 0) + (context.MEAL || 0) + (context.TRANS || 0))),
    gross,
    pf: context.PF || 0,
    pt: context.PT || 0,
    tds: context.TDS || 0,
    otherDeductions: 0,
    totalDeductions,
    net,
    structureName: structure?.name || "Regular Salary",
    ruleBreakdown,
  };
}
