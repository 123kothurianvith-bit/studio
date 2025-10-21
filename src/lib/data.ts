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

export const games: Game[] = [
  {
    id: '1',
    title: 'Cosmic Rift',
    platform: 'PC',
    price: 59.99,
    genre: 'Action',
    description: 'An epic space shooter where you defend the galaxy from alien hordes. Customize your ship and unleash powerful weapons.',
    coverImage: getImage('cosmic-rift').imageUrl,
    imageHint: getImage('cosmic-rift').imageHint,
  },
  {
    id: '2',
    title: 'Echoes of Etheria',
    platform: 'PlayStation 5',
    price: 69.99,
    genre: 'RPG',
    description: 'A vast open-world fantasy RPG. Forge your destiny as a hero of legend and unravel the secrets of a dying world.',
    coverImage: getImage('echoes-of-etheria').imageUrl,
    imageHint: getImage('echoes-of-etheria').imageHint,
  },
  {
    id: '3',
    title: 'Cyber Sentinel',
    platform: 'Xbox Series X',
    price: 69.99,
    genre: 'Action',
    description: 'In a dystopian future, you are the last line of defense. Use advanced cybernetics to fight a corrupt mega-corporation.',
    coverImage: getImage('cyber-sentinel').imageUrl,
    imageHint: getImage('cyber-sentinel').imageHint,
  },
  {
    id: '4',
    title: 'Path of the Ronin',
    platform: 'PlayStation 5',
    price: 49.99,
    genre: 'Adventure',
    description: 'Explore feudal Japan as a masterless samurai. Your choices will determine your path and the fate of the land.',
    coverImage: getImage('path-of-the-ronin').imageUrl,
    imageHint: getImage('path-of-the-ronin').imageHint,
  },
  {
    id: '5',
    title: 'Gridiron Glory 2K24',
    platform: 'Xbox Series X',
    price: 59.99,
    genre: 'Sports',
    description: 'The most realistic football simulation returns with new features, improved graphics, and updated rosters.',
    coverImage: getImage('gridiron-glory-2k24').imageUrl,
    imageHint: getImage('gridiron-glory-2k24').imageHint,
  },
  {
    id: '6',
    title: 'Aether Odyssey',
    platform: 'Nintendo Switch',
    price: 59.99,
    genre: 'RPG',
    description: 'Journey through a world of floating islands on your airship. Discover ancient ruins and battle sky pirates.',
    coverImage: getImage('aether-odyssey').imageUrl,
    imageHint: getImage('aether-odyssey').imageHint,
  },
  {
    id: '7',
    title: 'Neon Overdrive',
    platform: 'PC',
    price: 29.99,
    genre: 'Action',
    description: 'A high-speed, retro-futuristic arcade racer. Drift through neon-lit cityscapes and outrun your rivals.',
    coverImage: getImage('neon-overdrive').imageUrl,
    imageHint: getImage('neon-overdrive').imageHint,
  },
  {
    id: '8',
    title: 'Frontier Fortress',
    platform: 'PC',
    price: 39.99,
    genre: 'Strategy',
    description: 'Build and defend your fortress in a harsh, unforgiving world. Manage resources, train an army, and survive the siege.',
    coverImage: getImage('frontier-fortress').imageUrl,
    imageHint: getImage('frontier-fortress').imageHint,
  },
];
