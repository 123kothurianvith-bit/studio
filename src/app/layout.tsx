
'use client';

import './globals.css';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import SplashScreen from '@/components/splash-screen';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
            {isLoading && <SplashScreen onAnimationComplete={() => setIsLoading(false)} />}
            <div className={cn("transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}>
              <WishlistProvider>
                {children}
              </WishlistProvider>
              <Toaster />
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
