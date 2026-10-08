import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GamePace - Steam Backlog & Pacing Engine',
  description: 'Automated Steam playtime sync, HowLongToBeat estimation, and dynamic pacing completion schedule dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" data-theme="dark-purple">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
