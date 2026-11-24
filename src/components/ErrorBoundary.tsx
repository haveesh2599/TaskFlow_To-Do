import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TaskFlow ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      let friendlyMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string };
        if (parsed?.error) {
          friendlyMessage = parsed.error;
        }
      } catch {
        // Not JSON, keep message as-is
      }

      return (
        <div className="min-h-screen bg-[#F6F7F4] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-6">
            <h1 className="text-lg font-semibold text-[#252A26] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#777F78] mb-5 leading-relaxed">
              {friendlyMessage}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-[#252A26] bg-[#F6F7F4] hover:bg-[#E5E9E4] rounded-lg transition-colors cursor-pointer"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
