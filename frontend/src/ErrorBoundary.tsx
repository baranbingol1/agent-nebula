import React from "react";

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: "#ff6b6b", fontFamily: "monospace" }}>
          <h1>Something went wrong</h1>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, fontSize: 12, color: "#999" }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
