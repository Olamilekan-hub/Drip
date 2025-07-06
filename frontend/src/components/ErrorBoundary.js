// frontend/src/components/ErrorBoundary.js
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 text-white bg-black">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <div className="mb-4 text-6xl">💥</div>
              <h1 className="mb-2 text-2xl font-bold">Oops! Something went wrong</h1>
              <p className="mb-6 text-zinc-400">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full px-6 py-3 font-semibold text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full px-6 py-3 text-white transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="p-4 mb-4 text-left rounded-lg bg-zinc-900">
                <summary className="mb-2 text-sm font-medium cursor-pointer">
                  Error Details (Development)
                </summary>
                <div className="font-mono text-xs text-red-400 whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}

            <p className="text-xs text-zinc-500">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;