"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Section render failed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <div style={{ display: "none" }} aria-hidden="true" />;
    return this.props.children;
  }
}
