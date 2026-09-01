import { Component } from "react";

// React error boundaries must be class components — there is no hook equivalent.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="error" role="alert">
          <h2>Something went wrong.</h2>
          <p>Reload the page to try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
