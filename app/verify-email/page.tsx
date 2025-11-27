import { verifyEmailToken } from '@/lib/email';
import Link from 'next/link';

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-error-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-md text-center">
          <div className="bg-[#12121a] border-2 border-error-500/50 p-8 backdrop-blur-xl">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-4 font-mono">[INVALID_LINK]</h1>
            <p className="text-gray-400 mb-6">
              This verification link is invalid or has expired.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-primary-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow font-mono"
            >
              [GO_TO_LOGIN]
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isValid = await verifyEmailToken(token);

  if (isValid) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-md text-center">
          <div className="bg-[#12121a] border-2 border-primary-500/50 p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,157,0.2)]">
            <div className="text-6xl mb-4 animate-glow">✓</div>
            <h1 className="text-2xl font-bold text-white mb-4 font-mono">
              [EMAIL_<span className="text-primary-500">VERIFIED</span>]
            </h1>
            <p className="text-gray-400 mb-6">
              Your email has been successfully verified. You can now access all features.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-primary-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow font-mono"
            >
              [GO_TO_DASHBOARD]
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-warning-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative max-w-md text-center">
        <div className="bg-[#12121a] border-2 border-warning-500/50 p-8 backdrop-blur-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4 font-mono">[VERIFICATION_FAILED]</h1>
          <p className="text-gray-400 mb-6">
            This verification link has expired or has already been used.
          </p>
          <Link
            href="/profile"
            className="inline-block px-6 py-3 bg-primary-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow font-mono"
          >
            [REQUEST_NEW_LINK]
          </Link>
        </div>
      </div>
    </div>
  );
}
