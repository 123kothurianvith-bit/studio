
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const gradients = [
    'from-pink-500 to-purple-600',
    'from-emerald-400 to-cyan-600',
    'from-amber-400 to-orange-600',
    'from-rose-400 to-fuchsia-600',
    'from-indigo-500 to-sky-600',
    'from-red-500 to-yellow-500',
    'from-green-400 to-blue-500',
];

export default function GameSearch({ gameNames = [] }: { gameNames: string[]}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [animatedText, setAnimatedText] = useState("");
  const [currentGradient, setCurrentGradient] = useState(gradients[0]);
  const [isTextVisible, setIsTextVisible] = useState(true);

  useEffect(() => {
    if (gameNames.length === 0) {
        setAnimatedText("");
        return;
    }

    setAnimatedText(gameNames[0]);
    setCurrentGradient(gradients[0]);
    let currentIndex = 0;

    const intervalId = setInterval(() => {
        setIsTextVisible(false); // Start fade out
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % gameNames.length;
            setAnimatedText(gameNames[currentIndex]);
            setCurrentGradient(gradients[currentIndex % gradients.length]);
            setIsTextVisible(true); // Start fade in
        }, 500); // Wait for fade out to complete
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(intervalId);
  }, [gameNames]);


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
  
  const hasSearchQuery = !!searchParams.get('q');
  const showAnimation = !hasSearchQuery && animatedText;

  return (
    <div className="relative w-full md:grow">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="search"
        placeholder={showAnimation ? '' : 'Search for games...'}
        className="w-full rounded-lg bg-muted pl-8"
        defaultValue={searchParams.get('q') || ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
       {showAnimation && (
         <div 
          className={cn(
            "absolute left-8 right-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-opacity duration-500 whitespace-nowrap overflow-hidden text-ellipsis",
            isTextVisible ? "opacity-100" : "opacity-0"
          )}
         >
           {!isMobile && <span className="text-muted-foreground">Search for &quot;</span>}
           <span className={cn("bg-gradient-to-r bg-clip-text font-semibold text-transparent", currentGradient)}>
            {animatedText}
           </span>
           {!isMobile && <span className="text-muted-foreground">&quot;</span>}
        </div>
       )}
    </div>
  );
}
