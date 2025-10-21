"use client";

import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useWishlist } from '@/contexts/wishlist-context';
import { useUser, useAuth } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export default function Header() {
  const { wishlist } = useWishlist();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  const getInitials = (email?: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  }


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold text-foreground">
          Snapter Games
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
                {wishlist.length}
              </Badge>
            )}
            <span className="sr-only">Open Wishlist</span>
          </Link>
        </Button>
        
        {isUserLoading ? (
          <Avatar className="h-9 w-9">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                   <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                   <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
            <Button variant="outline" asChild>
              <Link href="/login">
                <UserIcon className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
        )}
      </div>
    </header>
  );
}
