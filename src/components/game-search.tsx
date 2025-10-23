
"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function GameSearch({ gameNames = [] }: { gameNames: string[]}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [placeholder, setPlaceholder] = useState("Search...");
  const [ currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (gameNames.length === 0) {
        setPlaceholder("Search...");
        return;
    }

    const intervalId = setInterval(() => {
        setIsVisible(false); // Start fade out
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % gameNames.length);
            setPlaceholder(`Search for "${gameNames[(currentIndex + 1) % gameNames.length]}"`);
            setIsVisible(true); // Start fade in
        }, 500); // Time for fade out
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(intervalId);
  }, [gameNames, currentIndex]);


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

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className={cn("w-full rounded-lg bg-muted pl-8 placeholder-transition", isVisible ? 'placeholder-visible' : 'placeholder-hidden')}
        defaultValue={searchParams.get('q') || ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
