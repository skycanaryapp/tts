import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, send error to monitoring service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    this.handleRetry();
    window.location.href = '/';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-tajawal" dir="rtl">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-2 arabic-text">
                حدث خطأ غير متوقع
              </h1>
              
              <p className="text-gray-600 mb-6 arabic-text">
                نعتذر، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg text-left text-xs">
                  <pre className="text-red-800 whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة المحاولة</span>
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  <span>الصفحة الرئيسية</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional error handling
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: string) => {
    console.error('Application Error:', error);
    
    if (import.meta.env.PROD) {
      // Send to monitoring service in production
      // Example: Sentry.captureException(error, { extra: { errorInfo } });
    }
  }, []);

  return handleError;
};