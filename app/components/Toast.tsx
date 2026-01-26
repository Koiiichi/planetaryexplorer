"use client";

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";

// Toast types
type ToastType = "success" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

// Individual toast component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto dismiss after 3 seconds
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return <CheckCircle size={18} className="text-green-400 flex-shrink-0" />;
            case "warning":
                return <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />;
            default:
                return <Info size={18} className="text-blue-400 flex-shrink-0" />;
        }
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case "success":
                return "border-green-400/30";
            case "warning":
                return "border-yellow-400/30";
            default:
                return "border-blue-400/30";
        }
    };

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        bg-white/10 backdrop-blur-xl border ${getBorderColor()}
        shadow-lg shadow-black/20
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
        >
            {getIcon()}
            <span className="text-white/90 text-sm font-medium">{toast.message}</span>
            <button
                onClick={() => {
                    setIsLeaving(true);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
                className="text-white/40 hover:text-white/80 transition-colors ml-2 flex-shrink-0"
            >
                <X size={16} />
            </button>
        </div>
    );
}

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
