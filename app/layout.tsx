import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Operator — AI Command Center for Google Workspace',
  description: 'A minimal AI command center for your entire Google Workspace.',
  openGraph: {
    title: 'Operator — AI Command Center for Google Workspace',
    description: 'A minimal AI command center for your entire Google Workspace.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Operator — AI Command Center for Google Workspace',
    description: 'A minimal AI command center for your entire Google Workspace.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
