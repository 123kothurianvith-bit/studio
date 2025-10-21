
"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  Heart,
  PlusSquare,
  Gamepad,
  Search,
  Swords,
  ScrollText,
  BrainCircuit,
  Compass,
  Trophy,
  Upload,
  BarChart2,
} from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Slider } from './ui/slider';
import { useDebouncedCallback } from 'use-debounce';

type ClientSidebarProps = {
  platforms: string[];
  genres: string[];
  maxPrice: number;
};

export default function ClientSidebar({
  platforms,
  genres,
  maxPrice,
}: ClientSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const handlePriceChange = (newPrice: number[]) => {
    handleFilterChange('price', String(newPrice[0]));
  };

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'Action': return <Swords />;
      case 'RPG': return <ScrollText />;
      case 'Strategy': return <BrainCircuit />;
      case 'Adventure': return <Compass />;
      case 'Sports': return <Trophy />;
      default: return <Gamepad />;
    }
  }

  return (
    <>
      <SidebarHeader>
        <h2 className="text-xl font-semibold text-foreground">Snapter Games</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'}>
                <Link href="/">
                  <Home />
                  <span>Browse Games</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/wishlist'}>
                <Link href="/wishlist">
                  <Heart />
                  <span>Wishlist</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin/add-game'}>
                <Link href="/admin/add-game">
                  <PlusSquare />
                  <span>Add Game (Admin)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
         <SidebarGroup>
           <SidebarGroupLabel>Developer</SidebarGroupLabel>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/publish'}>
                  <Link href="/publish">
                    <Upload />
                    <span>Publish Game</span>
                  </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/my-apps'}>
                  <Link href="/my-apps">
                    <Gamepad />
                    <span>My Apps</span>
                  </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/analytics'}>
                  <Link href="/analytics">
                    <BarChart2 />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <div className="space-y-6 px-2">

            <div className="space-y-2">
              <Label htmlFor="platform-filter">Platform</Label>
              <Select
                value={searchParams.get('platform') || 'all'}
                onValueChange={(value) => handleFilterChange('platform', value)}
              >
                <SelectTrigger id="platform-filter">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre-filter">Genre</Label>
              <Select
                value={searchParams.get('genre') || 'all'}
                onValueChange={(value) => handleFilterChange('genre', value)}
              >
                <SelectTrigger id="genre-filter">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      <div className="flex items-center gap-2">
                        {getGenreIcon(g)}
                        <span>{g}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="price-slider">Max Price</Label>
                <span className="text-sm font-medium text-accent">
                  ${searchParams.get('price') || maxPrice}
                </span>
              </div>
              <Slider
                id="price-slider"
                max={maxPrice}
                step={1}
                defaultValue={[parseInt(searchParams.get('price') || String(maxPrice), 10)]}
                onValueCommit={handlePriceChange}
              />
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
