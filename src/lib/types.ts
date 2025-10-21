import type { ImagePlaceholder } from './placeholder-images';

export type Game = {
  id: string;
  title: string;
  platform: 'PC' | 'PlayStation 5' | 'Xbox Series X' | 'Nintendo Switch';
  price: number;
  genre: 'Action' | 'RPG' | 'Strategy' | 'Adventure' | 'Sports';
  description: string;
  coverImage: ImagePlaceholder['imageUrl'];
  imageHint: ImagePlaceholder['imageHint'];
};
