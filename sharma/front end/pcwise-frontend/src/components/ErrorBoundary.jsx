import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = {
    failed: false,
  };
  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="container page-section">
          <h1>Let’s try that again.</h1>
          <p>
            Something unexpected interrupted this page. Reload to return to your
            setup.
          </p>
          <button
            className="button button-primary"
            onClick={() => window.location.reload()}
          >
            Reload PCWise
          </button>
        </main>
      );
    return this.props.children;
  }
}
