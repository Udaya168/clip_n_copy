import { Component, ErrorInfo, ReactNode } from "react";
import { ApplicationErrorFallback } from "./ApplicationErrorFallback";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Clip N Copy Error Boundary]:", error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false });
  };

  public override render() {
    if (this.state.hasError) {
      return <ApplicationErrorFallback onRetry={this.resetError} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
