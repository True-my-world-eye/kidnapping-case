import React from 'react';

interface Props {
  children: React.ReactNode;
  fallbackLabel?: string;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.fallbackLabel ? `: ${this.props.fallbackLabel}` : ''}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#1a1a1a] text-[#F9F9F6] p-6">
          <div className="text-[#8C3636] text-lg font-bold mb-2">
            ⚠ Component Error{this.props.fallbackLabel ? `: ${this.props.fallbackLabel}` : ''}
          </div>
          <div className="text-sm text-[#999] max-w-md text-center font-mono">
            {this.state.error?.message || 'Unknown error'}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
