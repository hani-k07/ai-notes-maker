import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error, errorInfo) {
    return { hasError: true, error, errorInfo };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-white p-8 text-center">
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <div className="text-left bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-auto max-h-64 mb-6">
              <pre>{this.state.error?.toString()}</pre>
              {this.state.errorInfo && (
                <pre className="mt-4 text-slate-400">{this.state.errorInfo.componentStack}</pre>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
