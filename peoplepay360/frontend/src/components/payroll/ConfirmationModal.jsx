import React from "react";
import { AlertTriangle, Check, X } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger", // 'danger' | 'primary' | 'success'
  details = null,
}) {
  if (!isOpen) return null;

  const btnColors = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                variant === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : variant === "danger"
                  ? "bg-rose-100 text-rose-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {variant === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{message}</p>

        {details && (
          <div className="mt-4 p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 space-y-1">
            {details}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-xs ${btnColors[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
