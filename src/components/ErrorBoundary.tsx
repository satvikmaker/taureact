import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportCrash } from "@/lib/crash-reporter";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportCrash({
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
      timestamp: new Date().toISOString(),
    }).catch(() => {}); // Best-effort
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex flex-col items-center justify-center h-full gap-4 p-8"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <pre className="max-w-[600px] p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-auto text-[13px]">
            {this.state.error?.message}
          </pre>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium cursor-pointer transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
