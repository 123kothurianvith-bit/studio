
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Upload, Gamepad, BarChart2, User as UserIcon, LogOut, Home, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
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

const allNavItems = [
  { href: '/', icon: Home, label: 'Browse', roles: ['user', 'developer'] },
  { href: '/wishlist', icon: Heart, label: 'Wishlist', roles: ['user', 'developer'] },
  { href: '/publish', icon: Upload, label: 'Publish', roles: ['developer'] },
  { href: '/my-apps', icon: Gamepad, label: 'My Apps', roles: ['developer'] },
  { href: '/analytics', icon: BarChart2, label: 'Analytics', roles: ['developer'] },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
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
  }

  return (
    <nav className="sticky bottom-0 z-10 mt-auto border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === item.href && 'text-primary'
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="whitespace-nowrap text-xs">{item.label}</span>
          </Link>
        ))}

        {isUserLoading ? (
           <div className="flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground">
             <Avatar className="h-6 w-6">
               <AvatarFallback>?</AvatarFallback>
             </Avatar>
            <span className="text-xs whitespace-nowrap">Account</span>
           </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn('flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground', pathname === '/account' && 'text-primary' )}>
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    <span className="whitespace-nowrap text-xs">Account</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
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
            <Link
              href="/login"
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === '/login' && 'text-primary'
              )}
            >
              <UserIcon className="h-6 w-6" />
              <span className="text-xs">Login</span>
            </Link>
        )}

      </div>
    </nav>
  );
}
