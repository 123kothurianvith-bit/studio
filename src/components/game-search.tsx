"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Heart, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function GameSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const handleFilterChange = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value || value === 'all') {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange('q', term);
  }, 300);

  const getInitials = (email?: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-bold text-transparent">
          Snapter Games
        </span>
      </Link>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                      <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/')}>
                Home
              </DropdownMenuItem>
              {user.profile?.role === 'developer' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/my-apps')}>
                    My Apps
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/publish')}>
                    Publish Game
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => router.push('/analytics')}>
                    Analytics
                  </DropdownMenuItem>
                </>
              )}
               <DropdownMenuItem onClick={() => router.push('/wishlist')}>
                Wishlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      ) : (
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/login">
            <User />
             <span className="sr-only">Login</span>
          </Link>
        </Button>
      )}
    </header>
  );
}
