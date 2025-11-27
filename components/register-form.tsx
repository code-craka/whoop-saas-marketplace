'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { registerAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerAction(formData);

      if (result.success) {
        // Redirect to dashboard or home
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('[RegisterForm] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="bg-[#12121a] border-primary-500/30 backdrop-blur-sm stagger-1">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Initialize Account
          </CardTitle>
          <CardDescription className="text-gray-400 font-mono">
            {'>'} Create new user credentials_
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-error-500/10 border border-error-500/30 text-error-500 text-sm rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="border-primary-500/30 text-gray-300 hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Apple
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="border-primary-500/30 text-gray-300 hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-[#12121a] text-gray-400">
                Or continue with email
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="name" className="text-primary-500 font-mono text-sm">
                  FULL_NAME
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-primary-500 font-mono text-sm">
                  EMAIL_ADDRESS
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@whop.com"
                  required
                  disabled={isLoading}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-primary-500 font-mono text-sm">
                  PASSWORD
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
                <FieldDescription className="text-gray-500 text-xs">
                  Minimum 8 characters
                </FieldDescription>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '[CREATING_ACCOUNT...]' : '[CREATE_ACCOUNT]'}
                </Button>
                <FieldDescription className="text-center text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary-500 hover:underline">
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-gray-500 text-xs">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-gray-400 hover:text-primary-500 transition-colors">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-gray-400 hover:text-primary-500 transition-colors">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
