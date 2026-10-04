import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Operator — AI Operator for your Google Account',
  description: 'A minimal AI operator for your real Google Account across Gmail, Calendar, Drive, and Tasks.',
  openGraph: {
    title: 'Operator — AI Operator for your Google Account',
    description: 'A minimal AI operator for your real Google Account across Gmail, Calendar, Drive, and Tasks.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Operator — AI Operator for your Google Account',
    description: 'A minimal AI operator for your real Google Account across Gmail, Calendar, Drive, and Tasks.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
