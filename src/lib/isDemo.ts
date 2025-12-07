/**
 * Check if demo mode is enabled via environment variable
 * @returns true if NEXT_PUBLIC_DEMO_MODE is set to "true"
 */
export function isDemo(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || 
         (typeof window !== "undefined" && (window as any).__DEMO_MODE__ === true);
}


