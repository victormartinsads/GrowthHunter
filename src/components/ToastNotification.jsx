import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    warning: <AlertTriangle size={18} color="#f59e0b" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#06b6d4" />
  };

  const borderColors = {
    success: "rgba(16, 185, 129, 0.4)",
    warning: "rgba(245, 158, 11, 0.4)",
    error: "rgba(239, 68, 68, 0.4)",
    info: "rgba(6, 182, 212, 0.4)"
  };

  return (
    <div 
      className="toast-container"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.85rem 1.2rem",
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${borderColors[toast.type] || borderColors.info}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        color: "#f8fafc",
        fontSize: "0.88rem",
        fontWeight: "500",
        animation: "toastSlideIn 0.3s ease-out forwards"
      }}
    >
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
      <button 
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          marginLeft: "0.5rem"
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
