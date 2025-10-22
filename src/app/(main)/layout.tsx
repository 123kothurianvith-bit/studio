
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import BottomNavBar from '@/components/bottom-nav-bar';
import GameSearch from '@/components/game-search';
import { Home, Heart, Upload, Gamepad, BarChart2 } from 'lucide-react';
import { useUser } from '@/firebase';

const allNavItems = [
  { href: '/', icon: Home, label: 'Browse', roles: ['user', 'developer'] },
  { href: '/wishlist', icon: Heart, label: 'Wishlist', roles: ['user', 'developer'] },
  { href: '/publish', icon: Upload, label: 'Publish', roles: ['developer'] },
  { href: '/my-apps', icon: Gamepad, label: 'My Apps', roles: ['developer'] },
  { href: '/analytics', icon: BarChart2, label: 'Analytics', roles: ['developer'] },
];

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const userRole = user?.profile?.role || 'user';
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-bold text-transparent">
              Snapter Games
            </span>
          </Link>
          <div className="relative ml-auto flex-1 md:grow-0">
              <GameSearch />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <BottomNavBar />
      </div>
  );
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </FirebaseClientProvider>
  );
}
