import React from 'react';
import ClientSidebar from '@/components/client-sidebar';
import Header from '@/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { games } from '@/lib/data';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import BottomNavBar from '@/components/bottom-nav-bar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const platforms = [...new Set(games.map((g) => g.platform))];
  const genres = [...new Set(games.map((g) => g.genre))];
  const maxPrice = Math.ceil(Math.max(...games.map((g) => g.price)));

  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <Sidebar>
          <ClientSidebar platforms={platforms} genres={genres} maxPrice={maxPrice} />
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            <BottomNavBar />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
