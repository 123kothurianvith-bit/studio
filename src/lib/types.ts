

import type { ImagePlaceholder } from './placeholder-images';

export type Game = {
  id: string;
  title: string;
  platform: 'Android';
  price: number;
  genre: 'Action' | 'RPG' | 'Strategy' | 'Adventure' | 'Sports' | 'User Published';
  description: string;
  imageHint: ImagePlaceholder['imageHint'];
  downloadUrl?: string;
  averageRating?: number;
  publisherId?: string;
  developerName?: string;
  isFeatured?: boolean;
  featuredDescription?: string;
  iconUrl?: string;
  downloads?: number;
};

    