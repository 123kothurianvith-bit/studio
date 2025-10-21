import React from 'react';
import ClientSidebar from '@/components/client-sidebar';
import Header from '@/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { games } from '@/lib/data';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const platforms = [...new Set(games.map((g) => g.platform))];
  const genres = [...new Set(games.map((g) => g.genre))];
  const maxPrice = Math.ceil(Math.max(...games.map((g) => g.price)));

  return (
    <SidebarProvider>
      <Sidebar>
        <ClientSidebar platforms={platforms} genres={genres} maxPrice={maxPrice} />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
