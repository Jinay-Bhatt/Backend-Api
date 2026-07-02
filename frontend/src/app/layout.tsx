import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowForge — Visual No-Code API Builder',
  description: 'Build, deploy and monitor backend APIs visually. No code required.',
  keywords: ['API builder', 'no-code', 'backend', 'workflow', 'FlowForge'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
