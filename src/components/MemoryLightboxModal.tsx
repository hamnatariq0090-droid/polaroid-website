import React from 'react';
import { Download, Heart, Trash2, X, Sparkles } from 'lucide-react';
import { PolaroidMemory } from '../types/polaroid';
import { PolaroidCard } from './PolaroidCard';
import { soundFX } from '../utils/soundEffects';

interface MemoryLightboxModalProps {
  memory: PolaroidMemory | null;
  onClose: () => void;
  onDownload: (memory: PolaroidMemory) => void;
  onLike: (id: string, reaction?: string) => void;
  onDelete?: (id: string) => void;
  onLoadIntoStudio?: (memory: PolaroidMemory) => void;
}

const REACTIONS = ['💗', '✨', '🎀', '🌸', '🥰', '💌'];

export const MemoryLightboxModal: React.FC<MemoryLightboxModalProps> = ({
  memory,
  onClose,
  onDownload,
  onLike,
  onDelete,
  onLoadIntoStudio,
}) => {
  if (!memory) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D222D]/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Polaroid Memory Closer View"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#FFF9FB] border-2 border-[#F4C8D7] p-6 sm:p-8 shadow-2xl flex flex-col items-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Polaroid viewer"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FCEBF0] text-[#7D4E60] hover:bg-[#F7D4E0] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <span className="font-hand text-lg text-[#C96B8B]">
            kept forever in your scrapbook ♡
          </span>
        </div>

        {/* Large Polaroid Display */}
        <div className="my-2">
          <PolaroidCard
            memory={{ ...memory, rotation: -1.5 }}
            size="lg"
            interactive={false}
          />
        </div>

        {/* iPhone-inspired Reaction Pill */}
        <div className="mt-6 flex items-center gap-1.5 bg-[#FDF0F4] border border-[#F3C6D5] rounded-full px-3.5 py-1.5 shadow-xs">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                soundFX.playSoftPop();
                onLike(memory.id, emoji);
              }}
              className={`w-8 h-8 rounded-full text-base flex items-center justify-center hover:scale-125 transition-transform cursor-pointer ${
                memory.activeReaction === emoji
                  ? 'bg-white shadow-xs scale-110'
                  : 'hover:bg-white/60'
              }`}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              soundFX.playSoftPop();
              onDownload(memory);
            }}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E4789A] to-[#D66589] text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Polaroid ♡
          </button>

          {onLoadIntoStudio && (
            <button
              type="button"
              onClick={() => {
                soundFX.playSoftPop();
                onLoadIntoStudio(memory);
                onClose();
              }}
              className="px-4 py-2.5 rounded-full bg-[#FCEBF0] text-[#7D4E60] border border-[#F2C2D3] text-xs sm:text-sm font-semibold hover:bg-[#F9DCE6] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D86C8E]" />
              Customize in Studio
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                soundFX.playSoftPop();
                onDelete(memory.id);
                onClose();
              }}
              aria-label="Remove memory from scrapbook"
              className="p-2.5 rounded-full bg-[#FFF2F5] text-[#B85D79] hover:bg-[#FADCE5] border border-[#F2C2D3] transition-colors cursor-pointer"
              title="Remove from scrapbook"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
