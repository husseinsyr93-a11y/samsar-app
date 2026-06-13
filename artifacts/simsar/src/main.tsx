import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML =
    '<div dir="rtl" style="min-height:100vh;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;font-family:Cairo,sans-serif;font-size:1.2rem;">لم يتم العثور على عنصر #root</div>';
  throw new Error("Root element #root not found in index.html");
}

// Remove the native loading placeholder once React takes over
rootEl.removeAttribute("data-loading");

createRoot(rootEl).render(<App />);
