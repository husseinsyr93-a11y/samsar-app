import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "de.samsar.app",
  appName: "سمسار",
  webDir: "dist",
  server: {
    // androidScheme controls the URL scheme for the WebView.
    // "https" → https://localhost  |  "http" (default) → http://localhost
    // Keep "https" to avoid mixed-content issues when calling the production API.
    androidScheme: "https",
  },
  android: {
    buildOptions: {
      releaseType: "APK",
    },
    allowMixedContent: false,
    captureInput: true,
    // Enable Chrome DevTools remote debugging (chrome://inspect) — disable for release
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    AdMob: {
      appIdAdAndroid: "ca-app-pub-3940256099942544~3347511713",
      appIdAdIos: "ca-app-pub-3940256099942544~1458002511",
      isTesting: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0f172a",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
