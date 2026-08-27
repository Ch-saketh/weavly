import React from "react";
import NotFoundPage from "@/modules/system/pages/NotFoundPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <NotFoundPage isErrorFallback={true} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
