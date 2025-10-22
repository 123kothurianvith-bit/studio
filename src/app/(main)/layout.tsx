
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import BottomNavBar from '@/components/bottom-nav-bar';
import GameSearch from '@/components/game-search';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Upload, Gamepad, BarChart2, User as UserIcon, LogOut, Home, Heart } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
  const auth = useAuth();
  const router = useRouter();

  const userRole = user?.profile?.role || 'user';
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  const getInitials = (email?: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                Snapter Games
              </span>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {user ? (
            <>
              <Separator className="my-2" />
              <div className="flex items-center gap-3 px-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={handleSignOut}
                  >
                    <LogOut />
                  </Button>
              </div>
            </>
          ) : (
             <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/login'}>
                      <Link href="/login">
                          <UserIcon />
                          <span>Login / Sign Up</span>
                      </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
             </SidebarMenu>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:block">
                <span className="text-lg font-medium">
                    {navItems.find(item => item.href === pathname)?.label || 'Browse'}
                </span>
              </div>
              <div className="relative ml-auto flex-1 md:grow-0">
                  <GameSearch />
              </div>
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
          <BottomNavBar />
        </div>
      </SidebarInset>
    </SidebarProvider>
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
