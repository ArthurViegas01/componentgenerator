import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes, de-duplicating conflicting utilities.
 *
 * @example
 *   cn("px-2 py-1", condition && "bg-red-500", "px-4")
 *   // => "py-1 bg-red-500 px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
