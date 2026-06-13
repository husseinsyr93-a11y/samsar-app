/**
 * API base URL resolution for Capacitor Android builds.
 *
 * When running inside a Capacitor WebView (file:// or capacitor://),
 * relative URLs don't resolve to the API server. Use this helper
 * everywhere you need the API base URL.
 *
 * Priority:
 *   1. VITE_API_BASE_URL build-time env var (set in GitHub Actions)
 *   2. Capacitor native context → deployed production URL
 *   3. Replit preview → relative "/api" (default web behaviour)
 */
export function getApiBaseUrl(): string {
  // Build-time override (set in CI / GitHub Actions secrets)
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // Running in Capacitor native context
  if (
    typeof window !== "undefined" &&
    (window.location.protocol === "capacitor:" ||
      window.location.protocol === "file:")
  ) {
    // Fallback: replace with your deployed Replit app URL
    return "https://samsar.replit.app/api";
  }

  // Standard web (Replit preview / deployed web)
  return "/api";
}
