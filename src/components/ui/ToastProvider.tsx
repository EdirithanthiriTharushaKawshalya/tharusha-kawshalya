"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Trash2 } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    try {
      setIsConfirming(true);
      await confirmDialog.onConfirm();
    } finally {
      setIsConfirming(false);
      setConfirmDialog(null);
    }
  };

  const handleCancelAction = () => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* FLOATING TOAST POPUP NOTIFICATIONS (Top-Right Popup) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                t.type === "success"
                  ? "bg-white/95 border-emerald-200/80 text-gray-900 shadow-emerald-500/10"
                  : t.type === "error"
                  ? "bg-white/95 border-red-200/80 text-gray-900 shadow-red-500/10"
                  : "bg-white/95 border-gray-200/80 text-gray-900 shadow-black/10"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {t.type === "success" && <CheckCircle2 size={20} className="text-emerald-500" />}
                {t.type === "error" && <AlertCircle size={20} className="text-red-500" />}
                {t.type === "info" && <Info size={20} className="text-blue-500" />}
              </div>

              <div className="flex-grow text-sm font-medium leading-snug">
                {t.message}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-black transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* POPUP CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
            onClick={handleCancelAction}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl flex-shrink-0 ${
                    confirmDialog.isDestructive
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  {confirmDialog.isDestructive ? <Trash2 size={24} /> : <Info size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black leading-snug">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelAction}
                  disabled={isConfirming}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {confirmDialog.cancelText || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isConfirming}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                    confirmDialog.isDestructive
                      ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                      : "bg-black hover:bg-gray-800 shadow-black/20"
                  }`}
                >
                  {isConfirming
                    ? "Processing..."
                    : confirmDialog.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
