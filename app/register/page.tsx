import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 p-6 md:p-10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, #00ff9d 1px, transparent 1px),
                           linear-gradient(to bottom, #00ff9d 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 self-center font-medium group">
          <div className="text-2xl font-black text-primary-500 font-mono group-hover:animate-[glow_1s_ease-in-out_infinite]">
            {'<WHOP/>'}
          </div>
        </Link>

        <RegisterForm />

        {/* Back to Home */}
        <Link
          href="/"
          className="text-center text-sm text-gray-400 hover:text-primary-500 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
