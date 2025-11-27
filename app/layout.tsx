import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Whop SaaS Marketplace',
  description: 'Multi-tenant SaaS platform for digital products and memberships',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body className={sora.className}>{children}</body>
    </html>
  );
}
