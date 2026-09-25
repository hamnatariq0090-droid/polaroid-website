import React, { useState } from 'react';
import { Download, Heart, Sparkles, Maximize2 } from 'lucide-react';
import {
  FRAME_STYLES,
  PolaroidMemory,
  StickerId,
} from '../types/polaroid';
import {
  DaisyFlowerDoodle,
  HandDrawnHeart,
  IphoneHeartReactionBubble,
  SatinBowDoodle,
  SparkleFourPoint,
} from './DoodleArt';
import { soundFX } from '../utils/soundEffects';

interface PolaroidCardProps {
  memory: PolaroidMemory;
  /** 0 = dark unexposed instant film, 1 = fully developed recognizable photo */
  developStage?: number;
  isPrinting?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  darkroomPreviewMode?: boolean;
  onLike?: (id: string, reaction?: string) => void;
  onDownload?: (memory: PolaroidMemory) => void;
  onSelect?: (memory: PolaroidMemory) => void;
}

const REACTION_CHOICES = ['💗', '✨', '🎀', '🌸', '🥰'];

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  memory,
  developStage = 1,
  isPrinting = false,
  interactive = true,
  size = 'md',
  darkroomPreviewMode = false,
  onLike,
  onDownload,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [burstHearts, setBurstHearts] = useState<number[]>([]);

  const frameConfig =
    FRAME_STYLES.find((f) => f.id === memory.frameStyle) || FRAME_STYLES[2];

  const triggerHeartBurst = () => {
    const id = Date.now();
    setBurstHearts((prev) => [...prev, id]);
    setTimeout(() => {
      setBurstHearts((prev) => prev.filter((item) => item !== id));
    }, 900);
  };

  const sizeClasses = {
    sm: 'w-40 p-2.5 pb-7 rounded-[6px]',
    md: 'w-48 sm:w-52 p-3 pb-8 rounded-[8px]',
    lg: 'w-64 sm:w-72 p-4 pb-11 rounded-[10px]',
  }[size];

  const captionSizeClasses = {
    sm: 'text-sm mt-2.5',
    md: 'text-base sm:text-[17px] mt-3',
    lg: 'text-xl sm:text-2xl mt-4',
  }[size];

  const fontClass =
    memory.captionFont === 'note'
      ? 'font-note'
      : memory.captionFont === 'display'
      ? 'font-display font-semibold text-sm'
      : 'font-hand font-semibold';

  // Calculate visual development opacity so user's photo emerges authentically from dark film
  const effectiveDevelop = darkroomPreviewMode && !isHovered ? 0.12 : developStage;
  const darkEmulsionOpacity = Math.max(0, 1 - effectiveDevelop);

  const renderSticker = (stickerId: StickerId) => {
    switch (stickerId) {
      case 'heart-corner':
        return (
          <div
            key={stickerId}
            className="absolute -top-2.5 -left-2.5 z-20 pointer-events-none drop-shadow-sm transform -rotate-12"
          >
            <div className="w-6 h-6 rounded-full bg-[#FAD1DF] border border-[#C96B8B] flex items-center justify-center">
              <HandDrawnHeart className="w-4 h-4 text-[#C95B7E]" filled />
            </div>
          </div>
        );
      case 'flower-corner':
        return (
          <div
            key={stickerId}
            className="absolute -top-2.5 -left-2 z-20 pointer-events-none drop-shadow-sm"
          >
            <DaisyFlowerDoodle className="w-7 h-7 text-[#8C5B72]" />
          </div>
        );
      case 'bow-top':
        return (
          <div
            key={stickerId}
            className="absolute -top-4 -right-3 z-20 pointer-events-none transform rotate-12 drop-shadow-sm"
          >
            <SatinBowDoodle className="w-12 h-9" />
          </div>
        );
      case 'emoji-smile':
        return (
          <div
            key={stickerId}
            className="absolute -top-2.5 -right-2.5 z-20 pointer-events-none w-7 h-7 rounded-full bg-[#FCE09B] border border-[#C99B49] shadow-xs flex items-center justify-center text-sm transform rotate-6"
          >
            😊
          </div>
        );
      case 'tiny-hearts':
        return (
          <div
            key={stickerId}
            className="absolute -top-3 left-3 z-20 pointer-events-none flex items-center gap-1"
          >
            <HandDrawnHeart className="w-4 h-4 text-[#D86C8E] fill-[#F7B9CC]" />
            <HandDrawnHeart className="w-3.5 h-3.5 text-[#9B506B] -mt-2" />
          </div>
        );
      case 'washi-tape':
        return (
          <div
            key={stickerId}
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-16 h-5 bg-[#F6B8CE]/75 border-x border-dashed border-[#E28AA8]/60 shadow-2xs transform -rotate-2 backdrop-blur-[1px]"
          />
        );
      case 'iphone-heart':
        return (
          <div
            key={stickerId}
            className="absolute -top-4 -right-3 z-20 pointer-events-none transform rotate-6"
          >
            <IphoneHeartReactionBubble className="w-9 h-8" />
          </div>
        );
      case 'sparkle-stars':
        return (
          <div
            key={stickerId}
            className="absolute bottom-2 right-2 z-20 pointer-events-none"
          >
            <SparkleFourPoint className="w-5 h-5 text-[#E07A9A]" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `rotate(${ isHovered && interactive ? memory.rotation * 0.35 : memory.rotation }deg) translateY(${
          isHovered && interactive ? '-10px' : '0px'
        }) scale(${isHovered && interactive ? 1.035 : 1})`,
        transition:
          'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`group relative select-none ${sizeClasses} ${frameConfig.bgClass} border ${
        frameConfig.borderClass
      } ${
        isHovered && interactive ? 'polaroid-shadow-hover z-30' : 'polaroid-shadow z-10'
      } transition-shadow duration-200`}
    >
      {/* Optional Dipped Bottom Background */}
      {frameConfig.bottomBgClass && (
        <div
          className={`absolute inset-x-0 bottom-0 h-14 rounded-b-[7px] ${frameConfig.bottomBgClass} pointer-events-none`}
        />
      )}

      {/* Subtle Paper Grain on Frame */}
      <div className="absolute inset-0 rounded-[7px] paper-texture pointer-events-none opacity-60" />

      {/* Custom Stickers & Doodles */}
      {memory.stickers.map((s) => renderSticker(s))}

      {/* Hover Floating Tiny Hearts Animation */}
      {interactive && isHovered && (
        <div className="
          pointer-events-none absolute -top-5 inset-x-0 flex justify-between px-1 z-30
          animate-bounce
        ">
          <span className="text-xs text-[#E06C8F] drop-shadow-2xs">♡</span>
          <span className="text-xs text-[#E58AA7] -mt-2 drop-shadow-2xs">✨</span>
          <span className="text-xs text-[#D86C8E] drop-shadow-2xs">💗</span>
        </div>
      )}

      {/* Heart Burst when liked */}
      {burstHearts.map((bId) => (
        <div
          key={bId}
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-40 animate-ping"
        >
          <span className="text-3xl">💗</span>
        </div>
      ))}

      {/* Inner Square Photo Window */}
      <div
        onClick={() => {
          if (onSelect) {
            soundFX.playSoftPop();
            onSelect(memory);
          }
        }}
        className={`relative w-full aspect-square overflow-hidden bg-[#2C2A2B] border border-[#5C3A47]/15 shadow-inner ${
          onSelect ? 'cursor-pointer' : ''
        }`}
      >
        {/* User's Recognizable Original Photo */}
        {!imgError && memory.imageUrl ? (
          <img
            src={memory.imageUrl}
            alt={memory.caption || 'Polaroid memory'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
              interactive ? 'group-hover:scale-105' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#3A3537] to-[#262324] flex flex-col items-center justify-center p-3 text-center">
            <Sparkles className="w-6 h-6 text-[#F5B8CC]/70 mb-1" />
            <span className="text-[11px] text-[#F5B8CC]/80 font-hand">
              sweet memory ♡
            </span>
          </div>
        )}

        {/* Instant Film Darkroom Chemical Developing Overlay */}
        {darkEmulsionOpacity > 0.01 && (
          <div
            style={{ opacity: darkEmulsionOpacity }}
            className="
              absolute inset-0 bg-[#2C2A2B] pointer-events-none
              transition-opacity duration-500 flex items-center justify-center
            "
          >
            {isPrinting && (
              <div className="flex flex-col items-center gap-1 text-[#F9D5E2]/80">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="text-xs font-hand tracking-wide">
                  developing film...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Subtle glossy instant-film sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />

        {/* Active iPhone-style Reaction Badge in bottom-right of photo */}
        {memory.activeReaction && (
          <div className="absolute bottom-1.5 right-1.5 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-full shadow-xs border border-[#F3C6D5] text-xs flex items-center gap-0.5">
            <span>{memory.activeReaction}</span>
            {memory.likes > 0 && (
              <span className="text-[10px] font-medium text-[#7D4E60] tabular-nums">
                {memory.likes}
              </span>
            )}
          </div>
        )}

        {/* Quick Inspect Icon on Hover */}
        {interactive && onSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundFX.playSoftPop();
              onSelect(memory);
            }}
            aria-label="Inspect Polaroid memory"
            className="
              opacity-0 group-hover:opacity-100 focus-visible:opacity-100
              transition-opacity duration-150
              absolute top-2 right-2 w-7 h-7 rounded-full
              bg-white/85 backdrop-blur-xs text-[#6E3F52]
              hover:bg-white shadow-xs flex items-center justify-center
            "
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Handwritten Caption Area */}
      <div className="relative z-10 text-center px-1">
        <p
          className={`${fontClass} ${captionSizeClasses} text-[#4E303C] leading-snug tracking-wide truncate`}
          title={memory.caption}
        >
          {memory.caption || 'little moments ♡'}
        </p>
      </div>

      {/* Hover Action Bar (iPhone-inspired reaction & download) */}
      {interactive && (onLike || onDownload) && (
        <div
          className="
            opacity-0 group-hover:opacity-100 focus-within:opacity-100
            transition-opacity duration-150
            absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-30
            bg-white/95 backdrop-blur-md border border-[#F2C6D5]
            rounded-full px-2 py-1 shadow-md flex items-center gap-1 whitespace-nowrap
          "
        >
          {onLike &&
            REACTION_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playSoftPop();
                  triggerHeartBurst();
                  onLike(memory.id, emoji);
                }}
                title={`React with ${emoji}`}
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center hover:scale-125 transition-transform ${
                  memory.activeReaction === emoji ? 'bg-[#FCE4EC]' : 'hover:bg-[#FDF0F4]'
                }`}
              >
                {emoji}
              </button>
            ))}

          {onDownload && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playSoftPop();
                onDownload(memory);
              }}
              title="Download Polaroid PNG"
              className="w-6 h-6 rounded-full text-[#7D4E60] hover:text-[#D85C84] hover:bg-[#FDF0F4] flex items-center justify-center transition-colors ml-0.5 border-l border-[#F2D5DF] pl-1"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
