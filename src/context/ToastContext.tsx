
import React, { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = String(toastCount++);
    const newToast = { ...toast, id };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);
    
    if (toast.duration !== Infinity) {
      const duration = toast.duration || 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => 
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  const toast = useCallback(
    (props: Omit<Toast, "id">) => {
      context.addToast(props);
    },
    [context]
  );

  return {
    toast,
    toasts: context.toasts,
    dismiss: context.removeToast,
  };
}

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start justify-between gap-4 rounded-md border p-4 shadow-md transition-all",
            "bg-white text-gray-900 border-gray-200 animate-in slide-in-from-bottom-5",
            toast.variant === "destructive" && "bg-red-600 text-white border-red-600"
          )}
        >
          <div className="grid gap-1">
            {toast.title && <div className="font-semibold">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
