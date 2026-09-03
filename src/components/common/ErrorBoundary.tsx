import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { KaamWalaLogo } from './KaamWalaLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KaamWala Runtime Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F2F1] flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white p-6 rounded-2xl border border-[#E7E9E6] shadow-md max-w-sm w-full flex flex-col items-center">
            <div className="mb-4">
              <KaamWalaLogo />
            </div>

            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-base font-bold text-[#111817] mb-1">
              Something went wrong
            </h2>
            <p className="text-xs text-[#66706D] mb-4">
              {this.state.error?.message || 'An unexpected error occurred while rendering.'}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-[#075B43] hover:bg-[#064635] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload KaamWala</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
