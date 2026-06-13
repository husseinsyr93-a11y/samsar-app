/**
 * API base URL resolution for Capacitor Android builds.
 *
 * When running inside a Capacitor WebView the standard relative "/api" path
 * resolves to http://localhost/api — the Capacitor dev server, NOT the real
 * API server.  Use setBaseUrl(getApiBaseUrl()) once at app startup so every
 * generated hook/fetch resolves to the correct server.
 *
 * Priority:
 *   1. VITE_API_BASE_URL build-time env var (set in GitHub Actions secrets)
 *   2. Capacitor native context  → deployed production URL
 *   3. Web (Replit preview / deployed web) → relative "/api"
 */
import { Capacitor } from "@capacitor/core";

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  if (Capacitor.isNativePlatform()) {
    const fallback = import.meta.env.VITE_PROD_API_URL as string | undefined;
    return (fallback ?? "https://samsar-app.replit.app").replace(/\/+$/, "") + "/api";
  }

  return "/api";
}
