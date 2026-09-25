import React from 'react';
import { FRAME_STYLES, PolaroidMemory } from '../types/polaroid';
import { HandDrawnHeart, SparkleFourPoint } from './DoodleArt';

interface InstaxCameraProps {
  activeMemory: PolaroidMemory;
  isPrinting: boolean;
  flashActive: boolean;
  printProgress: number; // 0 to 1 (sliding out)
  developProgress: number; // 0 to 1 (dark film to clear photo)
  showSettledHearts: boolean;
  onTriggerSnap: () => void;
  showPhotoInSlot?: boolean;
}

export const InstaxCamera: React.FC<InstaxCameraProps> = ({
  activeMemory,
  isPrinting,
  flashActive,
  printProgress,
  developProgress,
  showSettledHearts,
  onTriggerSnap,
  showPhotoInSlot = true,
}) => {
  const frameConfig =
    FRAME_STYLES.find((f) => f.id === activeMemory.frameStyle) || FRAME_STYLES[2];

  // Calculate vertical slide-out distance and gentle tilt when settled
  // In idle state, the Polaroid peeks out of the top slot just like the reference image.
  // During printing, it retracts slightly into the rollers and slides upward & settles with a tilt!
  const slideOffsetPx = isPrinting
    ? Math.round(18 - printProgress * 86)
    : showSettledHearts
    ? -68
    : -42;

  const currentTilt = isPrinting
    ? printProgress * -3.5
    : showSettledHearts
    ? activeMemory.rotation || -3.5
    : -2;

  const darkFilmOverlayOpacity = isPrinting || showSettledHearts
    ? Math.max(0, 1 - developProgress)
    : 0.15;

  return (
    <div className="relative flex flex-col items-center justify-end pt-28 sm:pt-32 pb-4 select-none">
      {/* Decorative doodle motion lines on top-left of emerging Polaroid (matching reference image) */}
      <svg
        viewBox="0 0 48 64"
        fill="none"
        className="w-9 h-12 absolute top-8 left-4 sm:left-6 text-[#7D4E60]/70 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M28 12L18 8M24 24C18 23 16 27 21 28C25 29 22 34 16 33M26 44L14 46M28 54L20 58"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Decorative radiating lines on top-right of emerging Polaroid (matching reference image) */}
      <svg
        viewBox="0 0 48 56"
        fill="none"
        className="w-10 h-12 absolute top-10 right-3 sm:right-5 text-[#D86C8E]/75 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M8 16L28 6M12 28L34 26M10 40L28 46"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Tiny Heart Animation burst after Polaroid settles */}
      {showSettledHearts && (
        <div className="pointer-events-none absolute top-2 inset-x-0 flex justify-center gap-8 z-40">
          <div className="animate-bounce flex items-center gap-1 text-[#D86C8E]">
            <HandDrawnHeart className="w-5 h-5 fill-[#F7B9CC]" />
            <span className="font-hand text-sm font-bold">printed! ♡</span>
          </div>
          <SparkleFourPoint className="w-5 h-5 text-[#E47497] animate-ping" />
        </div>
      )}

      {/* EMERGING POLAROID SHEET (Behind camera front lip, sliding out of top slot) */}
      <div
        style={{
          transform: `translateY(${slideOffsetPx}px) rotate(${currentTilt}deg)`,
          transition: isPrinting
            ? 'transform 120ms linear'
            : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`
          absolute top-14 z-10 w-36 sm:w-40 p-2.5 pb-7 rounded-[5px]
          ${frameConfig.bgClass} border ${frameConfig.borderClass}
          shadow-[0_14px_28px_rgba(120,65,85,0.22)]
          ${isPrinting ? 'animate-pulse' : ''}
        `}
      >
        {/* Inner square photo window emerging from camera */}
        <div className="relative w-full aspect-square bg-[#282627] overflow-hidden border border-[#5C3A47]/15">
          {showPhotoInSlot && activeMemory.imageUrl && (
            <img
              src={activeMemory.imageUrl}
              alt={activeMemory.caption || 'Emerging Polaroid'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}

          {/* Instant camera chemical film dark overlay that fades out as the photo develops */}
          <div
            style={{ opacity: darkFilmOverlayOpacity }}
            className="absolute inset-0 bg-[#282627] transition-opacity duration-300 pointer-events-none"
          />

          {/* Subtle glossy diagonal film reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-white/20 pointer-events-none" />
        </div>

        {/* Caption on emerging Polaroid */}
        <p className="font-hand text-xs sm:text-sm text-[#4E303C] text-center mt-1.5 truncate px-1">
          {activeMemory.caption || 'little moments ♡'}
        </p>
      </div>

      {/* CAMERA BODY (Tactile 3D Pastel Blush Pink Instax Mini 11) */}
      <div
        onClick={onTriggerSnap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTriggerSnap();
          }
        }}
        aria-label="Snap instant Polaroid photo"
        style={{
          transform: flashActive
            ? 'scale(0.97) rotate(-1.2deg) translateY(3px)'
            : 'scale(1) rotate(0deg) translateY(0px)',
          transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="
          relative z-20 cursor-pointer group
          w-64 h-64 sm:w-72 sm:h-72
          rounded-[54px]
          bg-gradient-to-b from-[#FAD0DF] via-[#F5B6CB] to-[#EA9AB5]
          shadow-[0_26px_48px_-12px_rgba(148,78,103,0.42),0_8px_20px_-4px_rgba(148,78,103,0.22),inset_0_4px_10px_rgba(255,255,255,0.85),inset_0_-8px_16px_rgba(176,92,122,0.45)]
          border border-[#F9D8E4]
          flex flex-col justify-between p-6
        "
      >
        {/* Top Film Ejection Slot Lip */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-40 sm:w-44 h-3 rounded-t-full bg-gradient-to-b from-[#6B4352] to-[#3A222B] shadow-inner border-x-4 border-[#F4B8CC]" />

        {/* Subtle 3D Molded Grip Contour on Left Side */}
        <div className="
          absolute inset-y-5 left-3 w-14 rounded-full
          bg-gradient-to-r from-white/25 via-transparent to-black/4
          pointer-events-none
        " />

        {/* Top Row: Viewfinder, Ribbed Flash Window, Branding, Sensor Dots */}
        <div className="relative flex items-start justify-between px-1 pt-1">
          {/* Left cluster: Dark Viewfinder + Vertical Flash */}
          <div className="flex items-center gap-2.5">
            {/* Optical Viewfinder Window */}
            <div className="w-7 h-11 rounded-[12px] bg-gradient-to-b from-[#2B1F24] to-[#171114] p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.7)] flex items-center justify-center">
              <div className="w-4 h-6 rounded-[6px] bg-gradient-to-tr from-[#1F181B] via-[#3A2B32] to-[#5E4952] border border-white/15 relative overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-white/35 absolute top-1 left-1 blur-[0.5px]" />
              </div>
            </div>

            {/* Vertical Ribbed Crystal Flash Diffuser */}
            <div className="relative w-8 h-16 rounded-[10px] bg-gradient-to-b from-[#F4E6EB] via-[#E5CED6] to-[#D6B8C2] p-1 shadow-[inset_0_1px_3px_rgba(92,58,71,0.35),0_1px_2px_rgba(255,255,255,0.8)] border border-[#D4A6B6] overflow-hidden">
              {/* Ribbed Fresnel vertical lines */}
              <div
                className="w-full h-full rounded-[6px] opacity-75"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, rgba(130,85,100,0.28) 0px, rgba(130,85,100,0.28) 1.5px, rgba(255,255,255,0.75) 1.5px, rgba(255,255,255,0.75) 4px)',
                }}
              />
              {/* Inner Xenon tube highlight */}
              <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 h-4 bg-white/60 blur-[1px] rounded-xs" />

              {/* Active Flash Burst */}
              {flashActive && (
                <div className="
                  absolute -inset-6 bg-white rounded-full
                  shadow-[0_0_60px_30px_rgba(255,255,255,0.98)]
                  z-50 animate-ping
                " />
              )}
            </div>
          </div>

          {/* Center-Right Branding ("instax mini 11" style) */}
          <div className="pt-2 text-center mr-2">
            <div className="text-[15px] sm:text-base font-bold tracking-tight text-[#A54A69] leading-none font-display">
              instax
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-[#B45B7A] mt-0.5">
              mini 11
            </div>
          </div>

          {/* Right Light Sensor Dots */}
          <div className="flex flex-col items-center gap-1.5 pt-3 pr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#24161C] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.6)]" />
            <div className="w-2 h-2 rounded-full bg-[#2E1D24] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.6)]" />
          </div>
        </div>

        {/* Tactile Shutter Button on Left Grip */}
        <div
          title="Click to snap Polaroid!"
          className="
            absolute top-24 left-6
            w-9 h-9 rounded-full
            bg-gradient-to-b from-[#FCE0EA] to-[#E89EB8]
            shadow-[0_4px_8px_rgba(145,70,96,0.3),inset_0_2px_3px_rgba(255,255,255,0.9)]
            border border-[#F5C2D4]
            flex items-center justify-center
            group-hover:scale-105 active:scale-95 transition-transform
          "
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#F5B8CE] to-[#ECA2BC] shadow-inner border border-white/50" />
        </div>

        {/* Main Multi-Ring Telescopic Camera Lens Barrel (Bottom-Right Center) */}
        <div className="
          relative self-end mr-1 sm:mr-2 mb-1
          w-38 h-38 sm:w-42 sm:h-42 rounded-full
          bg-gradient-to-br from-[#FCE2EB] via-[#F4B4CA] to-[#DF8BA8]
          shadow-[0_14px_24px_-4px_rgba(135,62,88,0.4),inset_0_3px_6px_rgba(255,255,255,0.85)]
          border border-[#FAD4E2]
          flex items-center justify-center
        ">
          {/* Outer Ring 2 */}
          <div className="
            w-31 h-31 sm:w-34 sm:h-34 rounded-full
            bg-gradient-to-br from-[#FAD6E3] via-[#F0ACC3] to-[#DA85A2]
            shadow-[0_6px_14px_rgba(130,60,85,0.3),inset_0_2px_4px_rgba(255,255,255,0.75)]
            border border-[#F8C8D9]
            flex items-center justify-center
          ">
            {/* Inner Barrel Ring 3 */}
            <div className="
              relative w-24 h-24 sm:w-26 sm:h-26 rounded-full
              bg-gradient-to-br from-[#F9CEE0] via-[#EC9FB9] to-[#D47C9A]
              shadow-[inset_0_3px_6px_rgba(120,55,78,0.35),0_2px_4px_rgba(255,255,255,0.7)]
              flex items-center justify-center
            ">
              {/* Tiny Silver Selfie Mirror Square on Left of Inner Ring */}
              <div className="
                absolute left-2.5 top-1/2 -translate-y-1/2
                w-3.5 h-5 rounded-[3px]
                bg-gradient-to-br from-[#FFFDFD] via-[#D8CFD4] to-[#8C7B83]
                border border-[#755A66]/40 shadow-inner
              " />

              {/* Dark Metallic Optical Lens Housing */}
              <div className="
                w-14 h-14 sm:w-16 sm:h-16 rounded-full
                bg-gradient-to-b from-[#2E2529] via-[#181316] to-[#0D0A0C]
                p-1.5
                shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.2)]
                border-2 border-[#4A3A41]
                flex items-center justify-center
              ">
                {/* Deep Glass Optical Element with Reflections */}
                <div className="
                  relative w-full h-full rounded-full
                  bg-radial from-[#2C3545] via-[#141218] to-[#080709]
                  border border-white/15 overflow-hidden
                  flex items-center justify-center
                ">
                  {/* Aperture center */}
                  <div className="w-5 h-5 rounded-full bg-[#060507] border border-white/10" />
                  {/* Lens reflection highlights */}
                  <div className="w-3.5 h-2 rounded-full bg-white/45 rotate-[-30deg] absolute top-2 left-2 blur-[0.3px]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F5B6CB]/50 absolute bottom-2.5 right-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Camera Screen Flash Glow Effect */}
        {flashActive && (
          <div className="
            pointer-events-none fixed inset-0 z-50
            bg-white/75 backdrop-blur-[1px]
            animate-fade-out
          " />
        )}
      </div>

      {/* Soft Floating Drop Shadow Beneath Camera */}
      <div className="w-56 sm:w-64 h-6 bg-[#B96B88]/25 rounded-full blur-md -mt-2 z-10" />
    </div>
  );
};
