
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateTotal(items: Record<string, number>) {
  return Object.values(items).reduce((sum, value) => sum + value, 0);
}
