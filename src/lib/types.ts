
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
  downloads?: number;
  ratings?: { userId: string; rating: number; comment?: string }[];
};

export interface UserAccount {
    role: 'user' | 'developer';
    email: string;
    wishlistIds?: string[];
    followingDeveloperIds?: string[];
    developerName?: string; // Storing public dev name here after first publish
}
