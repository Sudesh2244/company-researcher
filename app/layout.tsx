import type { Metadata } from 'next';
// TypeScript may complain about missing type declarations for global CSS imports.
// Silence the error for this side-effect import which is valid in Next.js app router.
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'Company Researcher',
  description: 'AI-powered company intelligence tool',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#030712' }}>
        {children}
      </body>
    </html>
  );
}
