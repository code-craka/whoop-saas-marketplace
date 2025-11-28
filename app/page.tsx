import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { getCurrentSession } from '@/lib/auth';

export default async function Home() {
  const session = await getCurrentSession();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <SiteHeader user={session} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-[120px] opacity-20 animate-pulse [animation-delay:1s]" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00ff9d_1px,transparent_1px),linear-gradient(to_bottom,#00ff9d_1px,transparent_1px)] bg-[length:40px_40px]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full mb-8 stagger-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="text-sm font-mono text-primary-500">
                v2.0 • Production Ready
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 stagger-2">
              DIGITAL
              <br />
              <span className="text-primary-500 [text-shadow:0_0_40px_rgba(0,255,157,0.5)]">
                MARKETPLACE
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto stagger-3">
              The infrastructure for building premium SaaS products.
            </p>
            <p className="text-lg text-primary-500 mb-12 stagger-3">
              Zero friction. <span className="text-accent-500">Maximum revenue.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 stagger-4">
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-primary-500 text-black font-bold text-lg overflow-hidden w-full sm:w-auto text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Building
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-300 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </Link>

              <Link
                href="#demo"
                className="px-8 py-4 border-2 border-primary-500 text-primary-500 font-bold text-lg hover:shadow-[0_0_20px_rgba(0,255,157,0.3),inset_0_0_20px_rgba(0,255,157,0.1)] transition-shadow w-full sm:w-auto text-center"
              >
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto stagger-5">
              <div className="text-center">
                <div className="text-4xl font-black text-primary-500 mb-2">2.7%</div>
                <div className="text-sm text-gray-400 font-mono">Platform Fee</div>
              </div>
              <div className="text-center border-x border-primary-500/20">
                <div className="text-4xl font-black text-primary-500 mb-2">$400M</div>
                <div className="text-sm text-gray-400 font-mono">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary-500 mb-2">99.9%</div>
                <div className="text-sm text-gray-400 font-mono">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 stagger-1">
              Built for <span className="text-primary-500">Scale</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto stagger-2">
              Everything you need to launch, manage, and scale your digital product business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Cards */}
            {[
              {
                icon: '⚡',
                title: 'Stripe Connect',
                description: 'Instant payouts. Multi-tenant payments. Platform fees automated.',
                color: 'primary',
              },
              {
                icon: '🔐',
                title: 'License Keys',
                description: 'Hardware-locked validation. Reset control. Activation limits.',
                color: 'accent',
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                description: 'Revenue tracking. Member insights. Conversion metrics.',
                color: 'primary',
              },
              {
                icon: '🔗',
                title: 'Webhook System',
                description: 'Event-driven architecture. Bull queue workers. Retry logic.',
                color: 'accent',
              },
              {
                icon: '🎨',
                title: 'Whop SDK',
                description: 'Iframe authentication. Token verification. Access control.',
                color: 'primary',
              },
              {
                icon: '🚀',
                title: 'Multi-tenant',
                description: 'Isolated data. Company hierarchies. Role-based access.',
                color: 'accent',
              },
            ].map((feature, i) => {
              const staggerClasses = ['stagger-3', 'stagger-4', 'stagger-5', 'stagger-6', 'stagger-7', 'stagger-8'];
              const staggerClass = staggerClasses[i] || 'stagger-3';

              const isPrimary = feature.color === 'primary';
              const borderClass = isPrimary ? 'border-primary-500/30 hover:border-primary-500' : 'border-accent-500/30 hover:border-accent-500';
              const glowClass = isPrimary ? 'from-primary-500/10' : 'from-accent-500/10';
              const textHoverClass = isPrimary ? 'group-hover:text-primary-500' : 'group-hover:text-accent-500';
              const shimmerClass = isPrimary ? 'via-primary-500' : 'via-accent-500';

              return (
                <div
                  key={i}
                  className={`group relative bg-[#12121a] border ${borderClass} p-8 overflow-hidden transition-all cursor-pointer ${staggerClass}`}
                >
                  {/* Glow effect on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${glowClass} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    <div className="text-5xl mb-4 group-hover:animate-[float_3s_ease-in-out_infinite]">
                      {feature.icon}
                    </div>
                    <h3
                      className={`text-2xl font-bold mb-3 ${textHoverClass} transition-colors`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Animated border */}
                  <div className="absolute bottom-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      className={`h-full bg-gradient-to-r from-transparent ${shimmerClass} to-transparent animate-[shimmer_2s_infinite]`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 stagger-1">
              Simple <span className="text-primary-500">Pricing</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto stagger-2">
              No hidden fees. No surprises. Just straightforward pricing that scales with you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pricing Cards */}
            {[
              {
                name: 'Starter',
                price: '0',
                description: 'Perfect for testing',
                features: [
                  'Unlimited products',
                  '5% platform fee',
                  'Basic analytics',
                  'Email support',
                  'Stripe Connect',
                ],
                cta: 'Get Started',
                highlighted: false,
              },
              {
                name: 'Pro',
                price: '49',
                description: 'For growing businesses',
                features: [
                  'Everything in Starter',
                  '2.7% platform fee',
                  'Advanced analytics',
                  'Priority support',
                  'Custom domain',
                  'Webhook system',
                ],
                cta: 'Start Free Trial',
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large scale',
                features: [
                  'Everything in Pro',
                  'Custom platform fee',
                  'Dedicated support',
                  'SLA guarantee',
                  'White-label',
                  'Custom integrations',
                ],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan, i) => {
              const staggerClasses = ['stagger-3', 'stagger-4', 'stagger-5'];
              const staggerClass = staggerClasses[i] || 'stagger-3';

              return (
                <div
                  key={i}
                  className={`relative p-8 bg-[#12121a] border ${
                    plan.highlighted
                      ? 'border-primary-500 shadow-[0_0_40px_rgba(0,255,157,0.2)] md:scale-105'
                      : 'border-primary-500/30'
                  } ${staggerClass}`}
                >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-black text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary-500">
                      {plan.price === 'Custom' ? '' : '$'}
                      {plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-400 text-sm">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-300">
                      <svg
                        className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.highlighted ? '/register' : '/contact'}
                  className={`block w-full py-3 text-center font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-primary-500 text-black hover:shadow-[0_0_20px_rgba(0,255,157,0.5)]'
                      : 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-black'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 bg-gradient-to-br from-[#12121a] to-[#0a0a0f] border border-primary-500 overflow-hidden stagger-1">
            {/* Animated corners */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-primary-500 animate-pulse" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-primary-500 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-primary-500 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-primary-500 animate-pulse" />

            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Build Your <span className="text-primary-500">Empire?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of creators monetizing their expertise through our platform
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-primary-500 text-black text-lg font-bold hover:shadow-[0_0_30px_rgba(0,255,157,0.6)] transition-shadow"
            >
              Start Building Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-500/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold mb-4 text-primary-500">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-primary-500 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary-500 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-primary-500 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="hover:text-primary-500 transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-primary-500">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-primary-500 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-primary-500 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-primary-500 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary-500 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-primary-500">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/guides" className="hover:text-primary-500 transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-primary-500 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-primary-500 transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-primary-500 transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-primary-500">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary-500 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-primary-500 transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-primary-500 transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-primary-500/20">
            <div className="text-sm text-gray-400 mb-4 md:mb-0 font-mono">
              © 2024 Whop SaaS Marketplace. Built with Next.js 15 + Prisma + Stripe.
            </div>
            <div className="flex items-center gap-6">
              <Link href="https://twitter.com" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="https://github.com" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="https://discord.com" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
