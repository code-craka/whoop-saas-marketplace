'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldGroup, FieldDescription } from '@/components/ui/field';
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile';

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateProfileAction(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await changePasswordAction(formData);

      if (result.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        (e.target as HTMLFormElement).reset();
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Password change failed' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Profile */}
      <Card className="bg-[#12121a] border-primary-500/30 stagger-3">
        <CardHeader>
          <CardTitle className="text-xl text-white font-mono">
            UPDATE_PROFILE
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div
              className={`mb-4 p-3 border rounded ${
                message.type === 'success'
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-500'
                  : 'bg-error-500/10 border-error-500/30 text-error-500'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-primary-500 font-mono text-sm">
                  FULL_NAME
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user.name || ''}
                  placeholder="John Doe"
                  disabled={isUpdating}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="username" className="text-primary-500 font-mono text-sm">
                  USERNAME
                </FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={user.username || ''}
                  placeholder="johndoe"
                  disabled={isUpdating}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
                <FieldDescription className="text-gray-500 text-xs">
                  Your unique username
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="text-primary-500 font-mono text-sm">
                  EMAIL_ADDRESS
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-[#0a0a0f] border-primary-500/30 text-gray-500 font-mono opacity-50 cursor-not-allowed"
                />
                <FieldDescription className="text-gray-500 text-xs">
                  Email cannot be changed
                </FieldDescription>
              </Field>

              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-primary-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow disabled:opacity-50"
              >
                {isUpdating ? '[UPDATING...]' : '[UPDATE_PROFILE]'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-[#12121a] border-primary-500/30 stagger-4">
        <CardHeader>
          <CardTitle className="text-xl text-white font-mono">
            CHANGE_PASSWORD
          </CardTitle>
        </CardHeader>
        <CardContent>
          {passwordMessage && (
            <div
              className={`mb-4 p-3 border rounded ${
                passwordMessage.type === 'success'
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-500'
                  : 'bg-error-500/10 border-error-500/30 text-error-500'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword" className="text-primary-500 font-mono text-sm">
                  CURRENT_PASSWORD
                </FieldLabel>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  disabled={isChangingPassword}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword" className="text-primary-500 font-mono text-sm">
                  NEW_PASSWORD
                </FieldLabel>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  disabled={isChangingPassword}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
                <FieldDescription className="text-gray-500 text-xs">
                  Minimum 8 characters
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-primary-500 font-mono text-sm">
                  CONFIRM_PASSWORD
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  disabled={isChangingPassword}
                  className="bg-[#0a0a0f] border-primary-500/30 text-white placeholder:text-gray-500 focus:border-primary-500 font-mono disabled:opacity-50"
                />
              </Field>

              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-accent-500 text-white font-bold hover:shadow-[0_0_20px_rgba(255,0,110,0.5)] transition-shadow disabled:opacity-50"
              >
                {isChangingPassword ? '[CHANGING...]' : '[CHANGE_PASSWORD]'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
