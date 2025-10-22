
'use client';

import React from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import BottomNavBar from '@/components/bottom-nav-bar';
import GameSearch from '@/components/game-search';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <FirebaseClientProvider>
      <div className="flex min-h-screen flex-col">
          <GameSearch />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          <BottomNavBar />
      </div>
    </FirebaseClientProvider>
  );
}
