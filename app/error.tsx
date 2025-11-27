'use client';

/**
 * Error Boundary
 *
 * Catches errors in the app and displays a friendly error page
 * Client component required for error boundary
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md text-center">
        <h1 className="text-3xl font-bold text-error-600 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">Error ID: {error.digest}</p>
        )}
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
