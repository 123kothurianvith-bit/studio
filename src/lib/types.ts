import type { ImagePlaceholder } from './placeholder-images';

export type Game = {
  id: string;
  title: string;
  platform: 'Android';
  price: number;
  genre: 'Action' | 'RPG' | 'Strategy' | 'Adventure' | 'Sports' | 'User Published';
  description: string;
  coverImage: ImagePlaceholder['imageUrl'];
  imageHint: ImagePlaceholder['imageHint'];
};
