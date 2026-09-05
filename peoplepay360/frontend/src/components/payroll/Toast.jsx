import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";

export default function Toast() {
  const { toastMessage } = usePayroll();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === "success";
  const isWarning = toastMessage.type === "warning";

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
          isSuccess
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : isWarning
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {isWarning && <AlertCircle className="w-5 h-5 text-amber-600" />}
        {!isSuccess && !isWarning && <Info className="w-5 h-5 text-blue-600" />}
        <span>{toastMessage.message}</span>
      </div>
    </div>
  );
}
