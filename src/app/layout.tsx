import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SecureQR - Car Privacy System',
  description: 'Protect your privacy while keeping your car safe.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased min-h-screen text-foreground bg-background`}>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border mt-10">
          <p>© {new Date().getFullYear()} SecureQR. Built for privacy.</p>
        </footer>
      </body>
    </html>
  );
}
