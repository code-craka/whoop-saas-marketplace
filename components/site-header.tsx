'use client';

import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import { useState } from 'react';

interface SiteHeaderProps {
  user?: {
    id: string;
    email: string;
    name?: string;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-primary-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-2xl font-black text-primary-500 font-mono group-hover:animate-[glow_1s_ease-in-out_infinite]">
                {'<WHOP/>'}
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#docs"
              className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
            >
              Docs
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Logout from account"
                  {...(isLoggingOut && { 'aria-busy': 'true' as const })}
                  className="px-4 py-2 text-sm border border-primary-500/30 text-primary-500 hover:bg-primary-500/10 transition-colors disabled:opacity-50 aria-busy:opacity-75"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-primary-500 text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow"
                >
                  Start Building
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            {...(isMobileMenuOpen && { 'aria-expanded': 'true' as const })}
            className="md:hidden text-gray-400 hover:text-primary-500 transition-colors aria-expanded:text-primary-500"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
            <Link
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl text-gray-400 hover:text-primary-500 transition-colors font-mono"
            >
              [FEATURES]
            </Link>
            <Link
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl text-gray-400 hover:text-primary-500 transition-colors font-mono"
            >
              [PRICING]
            </Link>
            <Link
              href="#docs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl text-gray-400 hover:text-primary-500 transition-colors font-mono"
            >
              [DOCS]
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl text-gray-400 hover:text-primary-500 transition-colors font-mono"
                >
                  [DASHBOARD]
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl text-gray-400 hover:text-primary-500 transition-colors font-mono"
                >
                  [PROFILE]
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Logout from account"
                  {...(isLoggingOut && { 'aria-busy': 'true' as const })}
                  className="mt-4 px-8 py-3 border border-primary-500/30 text-primary-500 hover:bg-primary-500/10 transition-colors disabled:opacity-50 text-lg font-mono aria-busy:opacity-75"
                >
                  {isLoggingOut ? 'LOGGING_OUT...' : '[LOGOUT]'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl text-gray-400 hover:text-primary-500 transition-colors font-mono"
                >
                  [SIGN_IN]
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-8 py-3 bg-primary-500 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow font-mono"
                >
                  [START_BUILDING]
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
