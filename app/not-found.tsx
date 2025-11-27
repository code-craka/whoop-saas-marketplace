/**
 * 404 Not Found Page
 *
 * Displayed when a page is not found
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md text-center">
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
