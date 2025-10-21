"use client";

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useWishlist } from '@/contexts/wishlist-context';


export default function Header() {
  const { wishlist } = useWishlist();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold">
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Snapter Games
            </span>
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
      </div>
    </header>
  );
}
