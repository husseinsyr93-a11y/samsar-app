import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[سمسار] خطأ غير متوقع:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          dir="rtl"
          style={{
            minHeight: "100vh",
            background: "#0f172a",
            color: "#f1f5f9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "'Cairo', sans-serif",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem", maxWidth: 360 }}>
            فشل تحميل التطبيق. يرجى إعادة المحاولة.
          </p>
          <pre
            style={{
              background: "#1e293b",
              color: "#f87171",
              padding: "1rem",
              borderRadius: 8,
              fontSize: "0.75rem",
              maxWidth: "90vw",
              overflowX: "auto",
              textAlign: "left",
              direction: "ltr",
              marginBottom: "1.5rem",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#f59e0b",
              color: "#0f172a",
              border: "none",
              padding: "0.75rem 2rem",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
