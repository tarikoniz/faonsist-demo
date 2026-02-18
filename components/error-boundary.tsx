'use client';

// ============================================
// FaOnSisT - Error Boundary Component
// React hata sınırı — beklenmedik hatalar için
// ============================================

import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Hata logla (production'da error tracking servisine gönderilebilir)
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="mx-auto max-w-md rounded-lg border border-red-500/20 bg-red-950/10 p-8 text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-red-400">
              Bir Hata Olustu
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Beklenmedik bir hata meydana geldi. Sayfayi yenilemeyi deneyin.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 rounded border border-red-500/20 bg-red-950/20 p-3 text-left">
                <summary className="cursor-pointer text-xs text-red-400">
                  Hata Detaylari (Development)
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-300">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="rounded bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
              >
                Tekrar Dene
              </button>
              <button
                onClick={this.handleReload}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                Sayfayi Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
