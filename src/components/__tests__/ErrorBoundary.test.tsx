import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument();
    expect(screen.getByText('نعتذر، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /إعادة المحاولة/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /الصفحة الرئيسية/i })).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it('should render custom fallback component when provided', () => {
    const CustomFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={retry}>Try Again</button>
      </div>
    );

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });
});