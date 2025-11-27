'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function EmailVerificationBanner() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send email');
      }
    } catch (error) {
      setMessage('An error occurred');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-warning-500/10 border border-warning-500/30 p-4 rounded mb-6 stagger-1">
      <div className="flex items-start gap-4">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-bold text-warning-500 mb-1">Email Not Verified</h3>
          <p className="text-sm text-gray-400 mb-3">
            Please verify your email address to access all features.
          </p>
          {message && (
            <p className={`text-sm mb-3 ${message.includes('sent') ? 'text-primary-500' : 'text-error-500'}`}>
              {message}
            </p>
          )}
          <Button
            onClick={handleResend}
            disabled={isSending}
            className="bg-warning-500 text-black font-bold hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-shadow disabled:opacity-50"
            size="sm"
          >
            {isSending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </div>
      </div>
    </div>
  );
}
