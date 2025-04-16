
import { useToast as useToastContext, toast } from "@/context/ToastContext";

// Re-export with the same names to maintain compatibility
export const useToast = useToastContext;
export { toast };
