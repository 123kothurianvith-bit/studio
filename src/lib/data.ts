import type { Game } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    return {
      imageUrl: 'https://picsum.photos/seed/error/600/800',
      imageHint: 'placeholder',
    };
  }
  return { imageUrl: image.imageUrl, imageHint: image.imageHint };
};

export const games: Game[] = [];
