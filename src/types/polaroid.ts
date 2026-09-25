import cafeLatteImg from '../assets/images/memory_cafe_latte_1790360478371.jpg';
import cherryBlossomsImg from '../assets/images/memory_cherry_blossoms_1790360498436.jpg';
import sunsetBeachImg from '../assets/images/memory_sunset_beach_1790360511900.jpg';
import picnicMeadowImg from '../assets/images/memory_picnic_meadow_1790360526868.jpg';

export type FrameStyleId =
  | 'white'
  | 'pastel-pink'
  | 'cream'
  | 'lavender'
  | 'white-pink-bottom'
  | 'cream-warm';

export type StickerId =
  | 'heart-corner'
  | 'flower-corner'
  | 'bow-top'
  | 'emoji-smile'
  | 'tiny-hearts'
  | 'washi-tape'
  | 'iphone-heart'
  | 'sparkle-stars';

export type CaptionFontId = 'hand' | 'note' | 'display';

export interface FrameStyleConfig {
  id: FrameStyleId;
  name: string;
  bgClass: string;
  bottomBgClass?: string;
  borderClass: string;
  swatchBg: string;
  swatchSecondary?: string;
  canvasBg: string;
  canvasBottomBg?: string;
}

export interface StickerConfig {
  id: StickerId;
  label: string;
  icon: string;
  positionClass: string;
}

export interface PolaroidMemory {
  id: string;
  imageUrl: string;
  caption: string;
  frameStyle: FrameStyleId;
  stickers: StickerId[];
  rotation: number;
  captionFont: CaptionFontId;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  activeReaction?: string;
}

export const FRAME_STYLES: FrameStyleConfig[] = [
  {
    id: 'pastel-pink',
    name: 'Pastel Pink',
    bgClass: 'bg-[#FADADD]',
    borderClass: 'border-[#F3C1C8]',
    swatchBg: '#FADADD',
    canvasBg: '#FADADD',
  },
  {
    id: 'cream',
    name: 'Soft Cream',
    bgClass: 'bg-[#FAF3EB]',
    borderClass: 'border-[#EFE4D6]',
    swatchBg: '#FAF3EB',
    canvasBg: '#FAF3EB',
  },
  {
    id: 'white',
    name: 'Classic White',
    bgClass: 'bg-[#FFFDFD]',
    borderClass: 'border-[#F2E6EA]',
    swatchBg: '#FFFDFD',
    canvasBg: '#FFFDFD',
  },
  {
    id: 'lavender',
    name: 'Dreamy Lavender',
    bgClass: 'bg-[#E6DFF2]',
    borderClass: 'border-[#D5C9E8]',
    swatchBg: '#E6DFF2',
    canvasBg: '#E6DFF2',
  },
  {
    id: 'white-pink-bottom',
    name: 'Blush Dipped',
    bgClass: 'bg-[#FFFDFD]',
    bottomBgClass: 'bg-[#FCE4EC]',
    borderClass: 'border-[#F5D0DC]',
    swatchBg: '#FFFDFD',
    swatchSecondary: '#FCE4EC',
    canvasBg: '#FFFDFD',
    canvasBottomBg: '#FCE4EC',
  },
  {
    id: 'cream-warm',
    name: 'Buttercream',
    bgClass: 'bg-[#F8ECD9]',
    bottomBgClass: 'bg-[#FDF8F2]',
    borderClass: 'border-[#EDDDC4]',
    swatchBg: '#F8ECD9',
    swatchSecondary: '#FDF8F2',
    canvasBg: '#F8ECD9',
    canvasBottomBg: '#FDF8F2',
  },
];

export const STICKER_OPTIONS: StickerConfig[] = [
  {
    id: 'heart-corner',
    label: 'Blush Heart',
    icon: '♡',
    positionClass: '-top-2.5 -left-2.5',
  },
  {
    id: 'sparkle-stars',
    label: 'Sparkle Star',
    icon: '☆',
    positionClass: '-bottom-2 -left-2',
  },
  {
    id: 'emoji-smile',
    label: 'Warm Smile',
    icon: '😊',
    positionClass: '-top-3 -right-2.5',
  },
  {
    id: 'flower-corner',
    label: 'Sakura Blossom',
    icon: '🌸',
    positionClass: '-top-2.5 -left-2',
  },
  {
    id: 'bow-top',
    label: 'Satin Bow',
    icon: '🎀',
    positionClass: '-top-4 right-2',
  },
  {
    id: 'washi-tape',
    label: 'Pink Washi Tape',
    icon: '🩹',
    positionClass: '-top-3 left-1/2 -translate-x-1/2',
  },
  {
    id: 'tiny-hearts',
    label: 'Twin Hearts',
    icon: '💕',
    positionClass: '-top-2.5 left-4',
  },
  {
    id: 'iphone-heart',
    label: 'Love Bubble',
    icon: '💗',
    positionClass: '-top-3.5 -right-3',
  },
];

export const CAPTION_SUGGESTIONS: string[] = [
  'collect moments, not things ♡',
  'a little blurry, but always special',
  'snap smile repeat ♡',
  'life looks better in Polaroids',
  'made of memories & little moments',
  'some moments deserve to be kept forever',
];

export const SAMPLE_PHOTOS = [
  {
    id: 'sample-latte',
    label: 'Morning Cafe ♡',
    url: cafeLatteImg,
    defaultCaption: 'good vibes only ♡',
  },
  {
    id: 'sample-blossoms',
    label: 'Sakura Sky 🌸',
    url: cherryBlossomsImg,
    defaultCaption: 'collect moments, not things ♡',
  },
  {
    id: 'sample-sunset',
    label: 'Pastel Waves ✨',
    url: sunsetBeachImg,
    defaultCaption: 'snap smile repeat ♡',
  },
  {
    id: 'sample-picnic',
    label: 'Meadow Picnic 🎀',
    url: picnicMeadowImg,
    defaultCaption: 'life looks better in Polaroids ♡',
  },
];

export const INITIAL_MEMORIES: PolaroidMemory[] = [
  {
    id: 'mem-1',
    imageUrl: cafeLatteImg,
    caption: 'good vibes only ♡',
    frameStyle: 'white',
    stickers: ['heart-corner'],
    rotation: -4.5,
    captionFont: 'hand',
    createdAt: 'Sep 2026',
    likes: 24,
    isLiked: true,
    activeReaction: '💗',
  },
  {
    id: 'mem-2',
    imageUrl: cherryBlossomsImg,
    caption: 'collect moments not things ♡',
    frameStyle: 'cream',
    stickers: ['flower-corner'],
    rotation: 2.8,
    captionFont: 'hand',
    createdAt: 'Sep 2026',
    likes: 19,
    isLiked: false,
  },
  {
    id: 'mem-3',
    imageUrl: sunsetBeachImg,
    caption: 'snap smile repeat ♡',
    frameStyle: 'white',
    stickers: ['bow-top'],
    rotation: -2.2,
    captionFont: 'hand',
    createdAt: 'Sep 2026',
    likes: 31,
    isLiked: true,
    activeReaction: '✨',
  },
  {
    id: 'mem-4',
    imageUrl: picnicMeadowImg,
    caption: 'life looks better in Polaroids ♡',
    frameStyle: 'cream-warm',
    stickers: ['emoji-smile'],
    rotation: 3.6,
    captionFont: 'hand',
    createdAt: 'Sep 2026',
    likes: 27,
    isLiked: false,
  },
  {
    id: 'mem-5',
    imageUrl: cafeLatteImg,
    caption: 'made of memories & little moments ♡',
    frameStyle: 'pastel-pink',
    stickers: ['tiny-hearts'],
    rotation: -3.4,
    captionFont: 'hand',
    createdAt: 'Sep 2026',
    likes: 42,
    isLiked: true,
    activeReaction: '🎀',
  },
  {
    id: 'mem-6',
    imageUrl: cherryBlossomsImg,
    caption: 'a little blurry but always special ♡',
    frameStyle: 'white-pink-bottom',
    stickers: ['washi-tape'],
    rotation: 4.2,
    captionFont: 'hand',
    createdAt: 'Sep 2026',
    likes: 36,
    isLiked: false,
  },
];
