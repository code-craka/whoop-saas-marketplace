import { requireAuth } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { ProfileForm } from '@/components/profile-form';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { prisma } from '@/lib/prisma';

export default async function ProfilePage() {
  const session = await requireAuth();

  // Get full user details
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar_url: true,
      email_verified: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <SiteHeader user={session} />

      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-8 stagger-1">
          <h1 className="text-4xl font-black text-white mb-2">
            Profile <span className="text-primary-500">Settings</span>
          </h1>
          <p className="text-gray-400 font-mono">
            {'>'} Manage your account information_
          </p>
        </div>

        {/* Email Verification Banner */}
        {!user.email_verified && <EmailVerificationBanner />}

        {/* Profile Info Card */}
        <div className="bg-[#12121a] border border-primary-500/30 p-8 mb-6 stagger-2">
          <div className="flex items-start gap-6">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.email}
                className="w-24 h-24 rounded-full border-2 border-primary-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500/20 border-2 border-primary-500 flex items-center justify-center">
                <span className="text-4xl font-black text-primary-500">
                  {(user.name || user.email)[0].toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {user.name || 'No name set'}
              </h2>
              <p className="text-gray-400 font-mono text-sm mb-4">{user.email}</p>

              <div className="flex items-center gap-4">
                {user.email_verified ? (
                  <span className="px-3 py-1 bg-primary-500/20 border border-primary-500 text-primary-500 text-xs font-bold">
                    ✓ EMAIL VERIFIED
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-warning-500/20 border border-warning-500 text-warning-500 text-xs font-bold">
                    ⚠ EMAIL NOT VERIFIED
                  </span>
                )}
                <span className="text-xs text-gray-500 font-mono">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <ProfileForm user={user} />
      </main>
    </div>
  );
}
