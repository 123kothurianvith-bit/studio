
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, Gamepad, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/publish', icon: Upload, label: 'Publish' },
  { href: '/my-apps', icon: Gamepad, label: 'My Apps' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 mt-auto border-t bg-background/95 backdrop-blur-sm md:hidden">
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
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
