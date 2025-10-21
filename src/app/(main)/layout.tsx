import React from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import BottomNavBar from '@/components/bottom-nav-bar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <FirebaseClientProvider>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </FirebaseClientProvider>
  );
}
