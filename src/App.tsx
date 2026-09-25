/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Download,
  Heart,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Type,
  Upload,
  Volume2,
  VolumeX,
  Check,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  CAPTION_SUGGESTIONS,
  CaptionFontId,
  FRAME_STYLES,
  FrameStyleId,
  INITIAL_MEMORIES,
  PolaroidMemory,
  SAMPLE_PHOTOS,
  STICKER_OPTIONS,
  StickerId,
} from './types/polaroid';
import {
  BabysBreathSprig,
  CuteCameraDoodle,
  DaisyFlowerDoodle,
  HandDrawnHeart,
  IphoneHeartReactionBubble,
  OverlappingPolaroidsDoodle,
  PaperclipSilver,
  SatinBowDoodle,
  SparkleFourPoint,
} from './components/DoodleArt';
import { InstaxCamera } from './components/InstaxCamera';
import { PolaroidCard } from './components/PolaroidCard';
import { WebcamModal } from './components/WebcamModal';
import { MemoryLightboxModal } from './components/MemoryLightboxModal';
import { soundFX } from './utils/soundEffects';
import { downloadPolaroidAsPng } from './utils/exportPolaroid';

const STORAGE_KEY = 'capture_little_moments_memories_v1';

export default function App() {
  // Persisted Scrapbook Gallery Memories
  const [memories, setMemories] = useState<PolaroidMemory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to default
    }
    return INITIAL_MEMORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch {
      // ignore storage quota errors if large data URLs are uploaded
    }
  }, [memories]);

  // Studio Customization State
  const [uploadedImage, setUploadedImage] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [hasCustomUpload, setHasCustomUpload] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<FrameStyleId>('pastel-pink');
  const [selectedStickers, setSelectedStickers] = useState<StickerId[]>([
    'heart-corner',
    'bow-top',
  ]);
  const [caption, setCaption] = useState<string>('collect moments, not things ♡');
  const [captionFont, setCaptionFont] = useState<CaptionFontId>('hand');
  const [rotation, setRotation] = useState<number>(-2);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Camera & Instant Film Printing Animation State
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [printProgress, setPrintProgress] = useState<number>(1); // 0 = inside camera slot, 1 = fully slid out
  const [developProgress, setDevelopProgress] = useState<number>(1); // 0 = dark chemical film, 1 = recognizable photo
  const [showSettledHearts, setShowSettledHearts] = useState<boolean>(false);
  const [justAddedToast, setJustAddedToast] = useState<boolean>(false);

  // Gallery Filter & Modals
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'liked'>('all');
  const [darkroomClassicMode, setDarkroomClassicMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWebcamOpen, setIsWebcamOpen] = useState<boolean>(false);
  const [inspectedMemory, setInspectedMemory] = useState<PolaroidMemory | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const studioStageRef = useRef<HTMLDivElement | null>(null);
  const gallerySectionRef = useRef<HTMLElement | null>(null);
  const printTimerRef = useRef<number | null>(null);

  // Current live studio preview memory object
  const currentStudioMemory: PolaroidMemory = {
    id: 'studio-live-preview',
    imageUrl: uploadedImage,
    caption: caption || 'little moments ♡',
    frameStyle,
    stickers: selectedStickers,
    rotation,
    captionFont,
    createdAt: 'Just now',
    likes: 1,
    isLiked: true,
    activeReaction: '💗',
  };

  // Trigger the full Instant Camera Ejection + Paper Slide + Gradual Photo Development sequence
  const runCameraPrintAnimation = (
    photoUrl: string,
     alsoSaveToGallery: boolean = false
  ) => {
    if (printTimerRef.current) {
      window.clearInterval(printTimerRef.current);
    }

    soundFX.playCameraShutterAndPrint();

    // Step 1: Camera Flash + slight camera recoil
    setFlashActive(true);
    setIsPrinting(true);
    setShowSettledHearts(false);
    setPrintProgress(0);
    setDevelopProgress(0.04);

    setTimeout(() => {
      setFlashActive(false);
    }, 240);

    // Step 2: Animate Polaroid sliding out of the slot (0 -> 1 over ~1.2s)
    // and photo gradually developing from dark emulsion to clear photo (0 -> 1 over ~2.4s)
    const startTime = performance.now();
    const slideDuration = 1200;
    const developDuration = 2400;

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const nextSlide = Math.min(1, elapsed / slideDuration);
      const nextDevelop = Math.min(1, Math.max(0.05, (elapsed - 250) / developDuration));

      // Smooth cubic-out easing for paper sliding out
      const easedSlide = 1 - Math.pow(1 - nextSlide, 3);
      setPrintProgress(easedSlide);
      setDevelopProgress(nextDevelop);

      if (nextSlide >= 1 && nextDevelop >= 1) {
        window.clearInterval(interval);
        setIsPrinting(false);
        setShowSettledHearts(true);
        soundFX.playSparkleChime();
      }
    }, 30);

    printTimerRef.current = interval;

    if (alsoSaveToGallery) {
      const newMemory: PolaroidMemory = {
        id: `mem-${Date.now()}`,
        imageUrl: photoUrl,
        caption: caption.trim() || 'little moments ♡',
        frameStyle,
        stickers: [...selectedStickers],
        rotation:
          rotation === 0
            ? Number(((Math.random() * 7 - 3.5) || -2.5).toFixed(1))
            : rotation,
        captionFont,
        createdAt: 'Just now ♡',
        likes: 1,
        isLiked: true,
        activeReaction: '💗',
      };

      setMemories((prev) => [newMemory, ...prev]);
      setJustAddedToast(true);
      setTimeout(() => setJustAddedToast(false), 3600);
    }
  };

  // Handle user uploading their own photo file
  const handleFileChange = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setUploadedImage(result);
        setHasCustomUpload(true);
        // Immediately animate the uploaded photo sliding out of the camera & developing!
        runCameraPrintAnimation(result, false);
        // Ensure the developing stage is comfortably in view on mobile/desktop
        studioStageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSticker = (id: StickerId) => {
    soundFX.playSoftPop();
    setSelectedStickers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playSoftPop();
  };

  const handleLikeMemory = (id: string, reaction?: string) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const alreadySameReaction = reaction && m.activeReaction === reaction;
        return {
          ...m,
          isLiked: true,
          likes: alreadySameReaction ? m.likes : m.likes + 1,
          activeReaction: reaction || m.activeReaction || '💗',
        };
      })
    );
    if (inspectedMemory && inspectedMemory.id === id) {
      setInspectedMemory((prev) =>
        prev
          ? {
              ...prev,
              isLiked: true,
              likes: prev.likes + 1,
              activeReaction: reaction || prev.activeReaction || '💗',
            }
          : null
      );
    }
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLoadMemoryIntoStudio = (mem: PolaroidMemory) => {
    setUploadedImage(mem.imageUrl);
    setCaption(mem.caption);
    setFrameStyle(mem.frameStyle);
    setSelectedStickers(mem.stickers);
    setRotation(mem.rotation);
    setCaptionFont(mem.captionFont);
    document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' });
    runCameraPrintAnimation(mem.imageUrl, false);
  };

  const filteredMemories =
    galleryFilter === 'liked'
      ? memories.filter((m) => m.isLiked)
      : memories;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCEBF1] via-[#FDF2F6] to-[#F9E3EC] text-[#5C3A47] paper-texture overflow-x-hidden">
      {/* =====================================================================
          TOP NAVIGATION BAR (Strict 3-Zone Contract + Reference Aesthetic)
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FCEBF1]/85 backdrop-blur-md border-b border-[#F2C8D7]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Brand Title (Single line wordmark) */}
          <a
            href="#home"
            className="font-hand text-2xl sm:text-3xl font-bold tracking-wide text-[#A64B6B] hover:opacity-85 transition-opacity whitespace-nowrap"
          >
            Polaroid ♡
          </a>

          {/* Zone 2: 4 Clean Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6E4253]"
          >
            <a
              href="#home"
              className="text-[#B84A72] border-b-2 border-[#D86C8E] pb-0.5 whitespace-nowrap"
            >
              Home
            </a>
            <a
              href="#create"
              className="hover:text-[#B84A72] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Create
            </a>
            <a
              href="#gallery"
              className="hover:text-[#B84A72] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Gallery
            </a>
            <a
              href="#about"
              className="hover:text-[#B84A72] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              About
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? 'Mute camera sound effects' : 'Unmute camera sound effects'}
              title={soundEnabled ? 'Camera sounds ON' : 'Camera sounds OFF'}
              className="w-9 h-9 rounded-full bg-white/70 hover:bg-white border border-[#F3C8D7] flex items-center justify-center text-[#B85275] transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-60" />
              )}
            </button>

            <a
              href="#create"
              onClick={() => soundFX.playSoftPop()}
              className="font-hand text-lg sm:text-xl text-[#8A4F64] hover:text-[#C85A7C] transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <HandDrawnHeart className="w-4 h-4 text-[#D86C8E]" filled />
              <span>good vibes only ♡</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        {/* =====================================================================
            HERO SECTION ("Capture little moments ♡" + Center Pastel Camera)
           ===================================================================== */}
        <section
          id="home"
          className="relative pt-6 pb-10 sm:pt-10 sm:pb-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          {/* Floating Aesthetic Decorations Around the Hero */}
          <div className="pointer-events-none absolute top-6 left-2 sm:left-4 animate-float-slow">
            <HandDrawnHeart className="w-7 h-7 text-[#D87A98]" />
          </div>
          <div className="pointer-events-none absolute top-28 left-1 sm:left-3 animate-twinkle">
            <SparkleFourPoint className="w-7 h-7 text-[#E598B2]" />
          </div>
          <div className="pointer-events-none absolute top-44 left-0 sm:left-1 animate-float-reverse">
            <DaisyFlowerDoodle className="w-7 h-7 text-[#9C657B]" />
          </div>
          <div className="pointer-events-none absolute top-4 right-4 sm:right-10 animate-float-slow">
            <SatinBowDoodle className="w-24 h-16" />
          </div>
          <div className="pointer-events-none absolute top-5 left-2/3 hidden sm:block animate-float-reverse">
            <HandDrawnHeart className="w-5 h-5 text-[#D87A98]" />
          </div>

          {/* Left Column: Headline, Subheading, CTA Button & "snap / smile / save the moment" */}
          <div className="lg:col-span-5 relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left pl-0 lg:pl-6">
            <div className="transform lg:-rotate-6 transition-transform">
              <h1
                className="font-display font-bold text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-tight text-[#B5496E]"
                style={{ textWrap: 'balance' }}
              >
                Capture
                <br />
                little{' '}
                <span className="text-[#C85A7F]">
                  m<span className="text-[#EC9BB7]">o</span>ments
                </span>{' '}
                <span className="inline-block transform rotate-6 text-[#B5496E]">
                  ♡
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 font-note text-base sm:text-lg text-[#6D4454] max-w-sm leading-relaxed">
                Turn your favorite memories into
                <br />
                something you can keep forever.
              </p>

              {/* Primary CTA Button: "Create My Polaroid ♡" */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    runCameraPrintAnimation(uploadedImage, false);
                    setTimeout(() => {
                      document
                        .getElementById('create')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }, 450);
                  }}
                  className="
                    group relative inline-flex items-center gap-2.5
                    px-7 py-3.5 rounded-full
                    bg-gradient-to-r from-[#E47A9C] via-[#DF6E92] to-[#D66287]
                    text-white font-display font-semibold text-base sm:text-lg
                    shadow-[0_10px_24px_-4px_rgba(214,98,135,0.55),inset_0_2px_2px_rgba(255,255,255,0.45)]
                    hover:shadow-[0_14px_28px_-4px_rgba(214,98,135,0.7)]
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-150 cursor-pointer whitespace-nowrap
                  "
                >
                  <Camera className="w-5 h-5 transition-transform group-hover:rotate-[-8deg] group-hover:scale-110" />
                  <span>Create My Polaroid ♡</span>
                </button>
              </div>
            </div>

            {/* Decorative Text Below CTA: "snap / smile / save the moment ♡" */}
            <div className="mt-7 self-start ml-2 sm:ml-4 transform -rotate-6 flex items-start gap-2 text-[#6B3F50]">
              {/* Radiating burst lines on left */}
              <svg
                viewBox="0 0 24 36"
                fill="none"
                className="w-4 h-7 text-[#8C566B] mt-0.5 shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M18 6L6 2M16 14L3 14M18 22L6 27"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <div className="font-hand text-lg sm:text-xl leading-tight">
                <div>snap</div>
                <div className="ml-2">smile ◡̈</div>
                <div>save the moment ♡</div>
                <div className="mt-1 ml-6 text-[#B5496E]">♡</div>
              </div>
            </div>

            {/* Extra sparkles between text and camera */}
            <div className="hidden lg:block absolute right-0 top-1/2 pointer-events-none">
              <SparkleFourPoint className="w-6 h-6 text-[#E48CA8] animate-twinkle" />
            </div>
            <div className="hidden lg:block absolute right-4 bottom-4 pointer-events-none">
              <HandDrawnHeart className="w-5 h-5 text-[#D86C8E]" />
            </div>
          </div>

          {/* Center Column: Interactive Pastel-Pink Instant Camera with Emerging Polaroid */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative z-20">
            <InstaxCamera
              activeMemory={currentStudioMemory}
              isPrinting={isPrinting}
              flashActive={flashActive}
              printProgress={printProgress}
              developProgress={developProgress}
              showSettledHearts={showSettledHearts}
              onTriggerSnap={() => runCameraPrintAnimation(uploadedImage, false)}
              showPhotoInSlot={hasCustomUpload || isPrinting || showSettledHearts}
            />
            <span className="font-hand text-sm text-[#9E6278] -mt-1">
              click the camera or upload below to print ✨
            </span>
          </div>

          {/* Right Column: "little ♡ memories, big feelings ♡", iPhone Heart Bubble, Blank Polaroids & Baby's Breath */}
          <div className="lg:col-span-3 relative z-20 flex flex-col items-center lg:items-start justify-between h-full py-4">
            {/* Decorative Handwritten Quote */}
            <div className="transform -rotate-12 text-center lg:text-left mt-2 lg:mt-6 ml-0 lg:ml-2">
              <p className="font-hand text-2xl sm:text-[26px] leading-tight text-[#6D3D50]">
                little ♡
                <br />
                memories,
                <br />
                big feelings ♡
              </p>
            </div>

            {/* iPhone-inspired Heart Reaction Bubble & Sparkles */}
            <div className="my-4 flex items-center gap-6 self-center lg:self-end mr-0 lg:mr-8">
              <SparkleFourPoint className="w-6 h-6 text-[#E489A7] animate-twinkle" />
              <IphoneHeartReactionBubble className="w-12 h-11 animate-float-slow" />
            </div>

            {/* Overlapping Blank Polaroids Illustration & Baby's Breath Flowers */}
            <div className="relative self-center lg:self-end flex items-end gap-2 mt-2">
              <HandDrawnHeart className="w-5 h-5 text-[#BA7E93] mb-6 mr-2" />
              <OverlappingPolaroidsDoodle className="w-32 h-36 drop-shadow-xs animate-float-reverse" />
              <BabysBreathSprig className="w-20 h-24 -ml-8 -mb-4 drop-shadow-xs" />
            </div>
          </div>
        </section>

        {/* =====================================================================
            MAIN INTERACTIVE FEATURE — CREATE YOUR POLAROID STUDIO
           ===================================================================== */}
        <section
          id="create"
          aria-label="Create and customize your Polaroid"
          className="relative z-20 mt-2 scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* LEFT & CENTER CARD (Cols 1-7): Step 1 Upload + Step 2 Customize */}
            <div className="lg:col-span-7 rounded-3xl bg-[#FFF9FB]/90 backdrop-blur-md border border-[#F4D0DD] shadow-[0_14px_34px_-10px_rgba(160,92,116,0.14)] p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* STEP 1: Upload Your Photo (5 cols) */}
              <div className="md:col-span-5 flex flex-col">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span className="w-6 h-6 rounded-full bg-[#E4789A] text-white text-xs font-bold flex items-center justify-center shadow-2xs tabular-nums">
                    1
                  </span>
                  <h2 className="font-display font-bold text-base sm:text-lg text-[#7D4358]">
                    Upload Your Photo
                  </h2>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  className="hidden"
                />

                {/* Interactive Drag & Drop Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    handleFileChange(e.dataTransfer.files?.[0]);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`
                    group relative rounded-2xl border-2 border-dashed p-5
                    flex flex-col items-center justify-center text-center
                    min-h-[195px] cursor-pointer transition-all duration-150
                    ${
                      isDraggingOver
                        ? 'border-[#D85C84] bg-[#FCE4EC]/70 scale-[1.01]'
                        : 'border-[#E5B2C4] bg-[#FDF5F8]/80 hover:bg-[#FCEBF1]/70 hover:border-[#D98BA6]'
                    }
                  `}
                >
                  {hasCustomUpload ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md mb-2.5 relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#E4789A] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                      <span className="font-display font-semibold text-sm text-[#7D4358]">
                        Photo ready! Click to change
                      </span>
                      <span className="text-[11px] text-[#A67486] mt-0.5">
                        or drag & drop another memory ♡
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#EBC2D1] shadow-2xs flex items-center justify-center text-[#B36A84] mb-3 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="font-display font-bold text-sm sm:text-base text-[#6E3F52]">
                        Click to upload
                      </p>
                      <p className="text-xs text-[#9C6C7F] mt-0.5">
                        or drag and drop
                      </p>
                      <p className="text-[11px] text-[#B6899B] mt-3 tabular-nums">
                        (JPG, PNG · Max 10MB)
                      </p>
                    </>
                  )}
                </div>

                {/* Webcam Button + Quick Sample Memories */}
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playSoftPop();
                      setIsWebcamOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#FCEBF1] hover:bg-[#F9DCE7] border border-[#F2C6D6] text-xs font-semibold text-[#7D4358] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#D86C8E]" />
                    <span>Or Take Instant Booth Selfie 📷</span>
                  </button>

                  {/* Sample Memories Strip for 1-Click Testing */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[#9E6B7E] mb-1.5 px-0.5">
                      <span>Or try a sample moment:</span>
                      <span className="font-hand text-sm text-[#D86C8E]">───e ♡</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SAMPLE_PHOTOS.map((sample) => {
                        const isSelected = uploadedImage === sample.url;
                        return (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => {
                              setUploadedImage(sample.url);
                              setHasCustomUpload(true);
                              setCaption(sample.defaultCaption);
                              runCameraPrintAnimation(sample.url, false);
                            }}
                            title={`Try ${sample.label}`}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#D86C8E] scale-105 shadow-xs'
                                : 'border-white opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={sample.url}
                              alt={sample.label}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Customize Your Polaroid (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-between md:border-l md:border-[#F5D8E2] md:pl-6">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#E4789A] text-white text-xs font-bold flex items-center justify-center shadow-2xs tabular-nums">
                        2
                      </span>
                      <h2 className="font-display font-bold text-base sm:text-lg text-[#7D4358]">
                        Customize Your Polaroid
                      </h2>
                    </div>
                    <span className="font-hand text-sm text-[#B86B86]">
                      live preview ↘
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Control Row 1: Frame Style */}
                    <div className="rounded-xl bg-[#FDF4F7] border border-[#F3D2DE] px-3.5 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7D4358] whitespace-nowrap">
                        <span className="w-5 h-5 rounded-md bg-[#FADCE6] text-[#C85A7C] flex items-center justify-center text-xs">
                          🖼️
                        </span>
                        <span>Frame Style</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {FRAME_STYLES.map((style) => {
                          const active = frameStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => {
                                soundFX.playSoftPop();
                                setFrameStyle(style.id);
                              }}
                              title={style.name}
                              aria-label={`Select ${style.name} frame`}
                              style={{ backgroundColor: style.swatchBg }}
                              className={`w-6 h-6 rounded-md border transition-transform cursor-pointer relative overflow-hidden ${
                                active
                                  ? 'border-[#C85A7C] ring-2 ring-[#E4789A]/40 scale-110'
                                  : 'border-[#D9B8C4] hover:scale-105'
                              }`}
                            >
                              {style.swatchSecondary && (
                                <span
                                  style={{ backgroundColor: style.swatchSecondary }}
                                  className="absolute inset-x-0 bottom-0 h-2"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Control Row 2: Add Stickers & Doodles */}
                    <div className="rounded-xl bg-[#FDF4F7] border border-[#F3D2DE] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7D4358] whitespace-nowrap">
                        <span className="w-5 h-5 rounded-md bg-[#FADCE6] text-[#C85A7C] flex items-center justify-center text-xs">
                          💗
                        </span>
                        <span>Add Stickers</span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {STICKER_OPTIONS.map((sticker) => {
                          const isSelected = selectedStickers.includes(sticker.id);
                          return (
                            <button
                              key={sticker.id}
                              type="button"
                              onClick={() => toggleSticker(sticker.id)}
                              title={sticker.label}
                              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F7C6D7] text-[#8C3B58] border border-[#D86C8E] scale-105 shadow-2xs'
                                  : 'bg-white/80 text-[#7D4E60] border border-transparent hover:bg-white'
                              }`}
                            >
                              {sticker.icon}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Control Row 3: Add Caption & Handwritten Style */}
                    <div className="rounded-xl bg-[#FDF4F7] border border-[#F3D2DE] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7D4358] whitespace-nowrap">
                        <Type className="w-4 h-4 text-[#C85A7C]" />
                        <span>Add Caption</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                        <input
                          type="text"
                          value={caption}
                          maxLength={46}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder='e.g. "collect moments..."'
                          className="w-full rounded-lg bg-white/90 border border-[#EBCAD6] px-2.5 py-1 text-xs sm:text-sm text-[#5C3A47] placeholder:text-[#B994A3] focus:outline-none focus:border-[#D86C8E]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playSoftPop();
                            const order: CaptionFontId[] = ['hand', 'note', 'display'];
                            const next =
                              order[(order.indexOf(captionFont) + 1) % order.length];
                            setCaptionFont(next);
                          }}
                          title="Switch handwritten font style"
                          className="px-2 py-1 rounded-lg bg-white border border-[#EBCAD6] text-[11px] font-hand text-[#7D4358] hover:bg-[#FCEBF1] whitespace-nowrap cursor-pointer"
                        >
                          {captionFont === 'hand'
                            ? 'Script'
                            : captionFont === 'note'
                            ? 'Note'
                            : 'Sans'}
                        </button>
                      </div>
                    </div>

                    {/* Control Row 4: Rotate Polaroid */}
                    <div className="rounded-xl bg-[#FDF4F7] border border-[#F3D2DE] px-3.5 py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7D4358] whitespace-nowrap">
                        <RotateCcw className="w-4 h-4 text-[#C85A7C]" />
                        <span>Rotate</span>
                      </div>

                      <div className="flex items-center gap-2.5 flex-1 max-w-[220px]">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playSoftPop();
                            setRotation(0);
                          }}
                          title="Reset rotation to 0°"
                          className="text-[#9E6B7E] hover:text-[#C85A7C] transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min={-12}
                          max={12}
                          step={0.5}
                          value={rotation}
                          onChange={(e) => setRotation( parseFloat(e.target.value) )}
                          aria-label="Rotate Polaroid angle"
                          className="w-full accent-[#DF6E92] cursor-pointer h-1.5 bg-[#F2CEDB] rounded-lg"
                        />
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#EBCAD6] text-[11px] font-medium text-[#7D4358] tabular-nums min-w-[38px] text-center">
                          {rotation > 0 ? `+${rotation}°` : `${rotation}°`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Studio Print Button: "Create Polaroid ♡" */}
                <div className="mt-4 pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      runCameraPrintAnimation(uploadedImage, true);
                    }}
                    className="
                      w-full py-3 px-6 rounded-full
                      bg-gradient-to-r from-[#E482A1] via-[#DF7396] to-[#D6668B]
                      text-white font-display font-semibold text-sm sm:text-base
                      shadow-[0_8px_20px_-4px_rgba(214,102,139,0.5),inset_0_1px_2px_rgba(255,255,255,0.5)]
                      hover:shadow-[0_12px_24px_-4px_rgba(214,102,139,0.65)]
                      hover:-translate-y-0.5 active:translate-y-0
                      transition-all duration-150
                      flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap
                    "
                  >
                    <Camera className="w-4 h-4" />
                    <span>Create Polaroid ♡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MIDDLE-RIGHT CARD (Cols 8-10): Frame Ideas + Interactive Instant Printer Preview */}
            <div className="lg:col-span-3 rounded-3xl bg-[#FFF9FB]/90 backdrop-blur-md border border-[#F4D0DD] shadow-[0_14px_34px_-10px_rgba(160,92,116,0.14)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-hand font-bold text-xl text-[#6D3D50] transform -rotate-2">
                    Frame Ideas
                  </h3>
                  <div className="flex items-center gap-1 text-[#D86C8E]">
                    <HandDrawnHeart className="w-4 h-4" />
                    <SparkleFourPoint className="w-4 h-4" />
                  </div>
                </div>

                {/* 6 Clickable Mini Polaroid Frame Presets (Matching Reference Image) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {FRAME_STYLES.map((style) => {
                    const isSelected = frameStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          soundFX.playSoftPop();
                          setFrameStyle(style.id);
                        }}
                        className={`group p-1.5 pb-4 rounded-[5px] ${style.bgClass} border ${
                          isSelected
                            ? 'border-[#D86C8E] ring-2 ring-[#E4789A]/35 -translate-y-0.5'
                            : `${style.borderClass} hover:-translate-y-0.5`
                        } shadow-xs transition-all cursor-pointer relative overflow-hidden`}
                      >
                        {style.bottomBgClass && (
                          <div
                            className={`absolute inset-x-0 bottom-0 h-3.5 ${style.bottomBgClass}`}
                          />
                        )}
                        <div
                          className="w-full aspect-square rounded-[2px] border border-black/5"
                          style={{
                            backgroundColor:
                              style.id === 'pastel-pink'
                                ? '#F6C2D2'
                                : style.id === 'lavender'
                                ? '#D3C6EA'
                                : style.id === 'cream-warm'
                                ? '#F6E5CB'
                                : '#FAF5F7',
                          }}
                        />
                        <span className="block text-[9px] font-medium text-[#7D4E60] mt-1 truncate relative z-10">
                          {style.name.split(' ')[1] || style.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Decorative Hearts at bottom of Frame Ideas card */}
              <div className="mt-4 pt-3 border-t border-[#F6DCE5] flex items-center justify-between text-xs text-[#9B667A]">
                <HandDrawnHeart className="w-4 h-4 text-[#C86485]" />
                <span className="font-hand text-sm">tap any frame to preview ♡</span>
                <div className="flex items-center">
                  <HandDrawnHeart className="w-4 h-4 text-[#C86485]" />
                  <HandDrawnHeart className="w-3.5 h-3.5 text-[#D87A98] -mt-3" />
                </div>
              </div>
            </div>

            {/* FAR-RIGHT STICKY NOTE (Cols 11-12): Cute Caption Ideas ♡ */}
            <div className="lg:col-span-2 relative sticky-note-pink rounded-2xl p-5 border border-[#F3BBD0] flex flex-col justify-between transform lg:rotate-1">
              {/* Silver Paperclip at Top Right */}
              <div className="absolute -top-3 right-3 pointer-events-none">
                <PaperclipSilver className="w-6 h-11" />
              </div>

              <div>
                <h3 className="font-hand font-bold text-xl leading-tight text-[#6D384C] mb-3 pr-4">
                  Cute
                  <br />
                  Caption
                  <br />
                  Ideas ♡
                </h3>

                <ul className="space-y-2 text-xs sm:text-[13px] font-hand text-[#5C3343]">
                  {CAPTION_SUGGESTIONS.map((suggestion) => {
                    const isCurrent = caption === suggestion;
                    return (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playSoftPop();
                            setCaption(suggestion);
                          }}
                          className={`text-left leading-snug hover:text-[#B8436B] transition-colors cursor-pointer flex items-start gap-1.5 ${
                            isCurrent ? 'font-bold text-[#B8436B]' : ''
                          }`}
                        >
                          <span className="mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-3 text-right">
                <span className="text-[11px] font-hand text-[#9B5670]">
                  click any line to use ✨
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================
              LIVE INTERACTIVE CAMERA PRINTING & DEVELOPING STAGE
              (Shows the user's photo physically sliding out of the pastel camera
               slot, flashing, gradually emerging from dark film, and settling!)
             =================================================================== */}
          <div
            ref={studioStageRef}
            className="mt-6 rounded-3xl bg-gradient-to-r from-[#FDF4F7]/95 via-[#FFF9FB]/95 to-[#FDF4F7]/95 border border-[#F3CAD8] p-5 sm:p-7 shadow-[0_12px_30px_-8px_rgba(155,84,109,0.12)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Explanation & Instant Status */}
              <div className="lg:col-span-4 space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A7C]">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Film Developing Stage</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#6B3B4E]">
                  {isPrinting
                    ? 'Printing & developing your Polaroid...'
                    : 'Your Live Polaroid Preview ♡'}
                </h3>
                <p className="text-xs sm:text-sm text-[#87586A] leading-relaxed">
                  Watch your photo slide out from the instant camera slot, gently
                  emerge from dark film into full clarity, and settle onto your desk.
                </p>

                {justAddedToast && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE4EC] border border-[#F0B4C8] text-xs font-semibold text-[#A84265] animate-bounce">
                    <HandDrawnHeart className="w-4 h-4" filled />
                    <span>Saved to “Your Little Memories ♡” below!</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => runCameraPrintAnimation(uploadedImage, false)}
                    className="px-4 py-2 rounded-full bg-[#FCEBF1] hover:bg-[#F8D8E4] border border-[#F0C0D1] text-xs font-semibold text-[#7D4358] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D86C8E]" />
                    <span>Replay Ejection & Film Develop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playSoftPop();
                      downloadPolaroidAsPng(currentStudioMemory);
                    }}
                    className="px-4 py-2 rounded-full bg-white hover:bg-[#FDF2F6] border border-[#EBC2D1] text-xs font-semibold text-[#7D4358] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D86C8E]" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>

              {/* Center: Pastel Camera Printer Slot + Sliding/Settling Polaroid */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2">
                {/* Pastel Pink Instant Camera Printer Ejection Bar */}
                <div
                  style={{
                    transform: flashActive ? 'scale(0.98) translateY(-2px)' : 'scale(1)',
                    transition: 'transform 150ms ease-out',
                  }}
                  className="relative z-30 w-72 sm:w-80 h-11 rounded-2xl bg-gradient-to-b from-[#FAD0DF] via-[#F4B6CB] to-[#EA9AB5] border border-[#FADCE7] shadow-[0_10px_20px_-4px_rgba(148,78,103,0.35),inset_0_2px_4px_rgba(255,255,255,0.85)] flex items-center justify-between px-4"
                >
                  {/* Flash indicator LED */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${
                        flashActive
                          ? 'bg-white shadow-[0_0_24px_10px_rgba(255,255,255,1)] scale-125'
                          : isPrinting
                          ? 'bg-[#FFE4EC] animate-ping'
                          : 'bg-[#E27296]'
                      }`}
                    />
                    <span className="font-display font-bold text-xs text-[#9E4665]">
                      instax slot ♡
                    </span>
                  </div>

                  {/* Dark Paper Ejection Roller Slot at Bottom of Bar */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-56 sm:w-64 h-2.5 rounded-full bg-[#362029] border-x-4 border-[#F4B6CB] shadow-inner" />

                  <span className="font-hand text-xs text-[#9E4665]">
                    {isPrinting
                      ? `${Math.round(developProgress * 100)}% developed`
                      : 'ready to snap'}
                  </span>
                </div>

                {/* Emerging Polaroid Frame Sliding Down from Camera Slot */}
                <div className="relative overflow-visible pt-3 pb-2 flex flex-col items-center">
                  <div
                    style={{
                      transform: `translateY(${
                        isPrinting ? `${(1 - printProgress) * -75}px` : '0px'
                      }) rotate(${
                        isPrinting
                          ? (1 - printProgress) * 2
                          : currentStudioMemory.rotation
                      }deg)`,
                      transition: isPrinting
                        ? 'transform 90ms linear'
                        : 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="relative z-20"
                  >
                    <PolaroidCard
                      memory={currentStudioMemory}
                      developStage={developProgress}
                      isPrinting={isPrinting}
                      size="md"
                      interactive={true}
                      onDownload={downloadPolaroidAsPng}
                      onSelect={(mem) => setInspectedMemory(mem)}
                    />
                  </div>

                  {/* Soft Floating Shadow Beneath the Emerging Polaroid */}
                  <div
                    style={{
                      transform: `scale(${0.65 + printProgress * 0.35})`,
                      opacity: 0.25 + printProgress * 0.5,
                    }}
                    className="w-44 h-5 bg-[#9E526E]/30 rounded-full blur-md mt-2 transition-all duration-300"
                  />

                  {/* Tiny Floating Hearts After Settle */}
                  {showSettledHearts && !isPrinting && (
                    <div className="pointer-events-none absolute -right-8 top-1/3 flex flex-col items-center gap-1 animate-bounce">
                      <span className="text-lg">💗</span>
                      <span className="text-xs text-[#D86C8E] font-hand">
                        kept forever ♡
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Quick Action to Create Multiple Polaroids */}
              <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center gap-3 text-center lg:text-right">
                <div className="rounded-2xl bg-[#FCEBF1]/70 border border-[#F3CAD8] p-4 w-full space-y-2.5">
                  <p className="font-hand text-lg text-[#7D4358]">
                    Want to make another one? ♡
                  </p>
                  <p className="text-xs text-[#8F5D70]">
                    Every Polaroid you create is pinned to your scrapbook desk
                    below!
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#FFF5F8] border border-[#EBC2D1] text-xs font-semibold text-[#7D4358] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D86C8E]" />
                      <span>Upload Another Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        runCameraPrintAnimation(uploadedImage, true);
                        setTimeout(() => {
                          gallerySectionRef.current?.scrollIntoView({
                            behavior: 'smooth',
                          });
                        }, 950);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#E4789A] hover:bg-[#D66589] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Print & View in Scrapbook ♡</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            POLAROID SCRAPBOOK GALLERY — "Your Little Memories ♡"
           ===================================================================== */}
        <section
          id="gallery"
          ref={gallerySectionRef}
          aria-label="Your Little Memories Scrapbook Gallery"
          className="relative mt-12 scroll-mt-20"
        >
          <div className="scrapbook-paper rounded-[32px] border border-[#F0D6DF] p-6 sm:p-10 relative overflow-hidden">
            {/* Decorative Corner Doodles on the Scrapbook Sheet */}
            <div className="pointer-events-none absolute top-5 right-6 hidden sm:block">
              <BabysBreathSprig className="w-16 h-20 opacity-90" />
            </div>
            <div className="pointer-events-none absolute bottom-5 left-6">
              <CuteCameraDoodle className="w-9 h-9 text-[#C56282] transform -rotate-12" />
            </div>
            <div className="pointer-events-none absolute bottom-6 right-8">
              <SparkleFourPoint className="w-6 h-6 text-[#E48AA6] animate-twinkle" />
            </div>

            {/* Gallery Header & Interactive Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-2.5">
                <HandDrawnHeart className="w-6 h-6 text-[#D86C8E]" filled />
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#6E3D50]">
                  Your Little Memories ♡
                </h2>
                {/* Radiating doodle burst lines */}
                <svg
                  viewBox="0 0 28 32"
                  fill="none"
                  className="w-6 h-6 text-[#D86C8E]"
                  aria-hidden="true"
                >
                  <path
                    d="M4 8L18 3M6 16L22 16M4 24L18 29"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Interactive Segmented Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8E4EC]/80 border border-[#EFC6D6]">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playSoftPop();
                      setGalleryFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      galleryFilter === 'all'
                        ? 'bg-white text-[#6E3D50] shadow-2xs'
                        : 'text-[#8C586C] hover:text-[#6E3D50]'
                    }`}
                  >
                    All Polaroids ({memories.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playSoftPop();
                      setGalleryFilter('liked');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      galleryFilter === 'liked'
                        ? 'bg-white text-[#6E3D50] shadow-2xs'
                        : 'text-[#8C586C] hover:text-[#6E3D50]'
                    }`}
                  >
                    Favorites ♡ ({memories.filter((m) => m.isLiked).length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playSoftPop();
                    setDarkroomClassicMode((prev) => !prev);
                  }}
                  title="Toggle between developed photos and darkroom film preview"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    darkroomClassicMode
                      ? 'bg-[#4E303C] text-white border-[#4E303C]'
                      : 'bg-white/80 text-[#7D4358] border-[#EFC6D6] hover:bg-white'
                  }`}
                >
                  {darkroomClassicMode ? 'Darkroom Film (Hover to Reveal)' : 'Darkroom Mode'}
                </button>
              </div>
            </div>

            {/* Scattered Desk Polaroid Grid */}
            {filteredMemories.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <p className="font-hand text-2xl text-[#8C586C]">
                  No Polaroids in this view yet ♡
                </p>
                <button
                  type="button"
                  onClick={() => setGalleryFilter('all')}
                  className="px-4 py-2 rounded-full bg-[#E4789A] text-white text-xs font-semibold cursor-pointer"
                >
                  Show All Memories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-5 py-4 place-items-center relative z-10">
                {filteredMemories.map((memory) => (
                  <PolaroidCard
                    key={memory.id}
                    memory={memory}
                    size="sm"
                    darkroomPreviewMode={darkroomClassicMode}
                    onLike={handleLikeMemory}
                    onDownload={downloadPolaroidAsPng}
                    onSelect={(mem) => setInspectedMemory(mem)}
                  />
                ))}
              </div>
            )}

            {/* Subtle Scrapbook Desk Note at Bottom */}
            <div className="mt-6 text-center relative z-10">
              <span className="font-hand text-base text-[#9A6679]">
                hover any Polaroid to lift, react with 💗, or click to view closer ✨
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ADDITIONAL SECTION — "Why keep memories?"
           ===================================================================== */}
        <section
          id="about"
          aria-label="Why keep memories"
          className="mt-14 pt-4 scroll-mt-20"
        >
          {/* Section Title with Hand-Drawn Radiating Lines */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg
              viewBox="0 0 28 32"
              fill="none"
              className="w-6 h-6 text-[#B55476]"
              aria-hidden="true"
            >
              <path
                d="M24 8L10 3M22 16L6 16M24 24L10 29"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h2
              className="font-display font-bold text-2xl sm:text-3xl text-[#7D3B54] text-center"
              style={{ textWrap: 'balance' }}
            >
              Why keep memories?
            </h2>
            <svg
              viewBox="0 0 28 32"
              fill="none"
              className="w-6 h-6 text-[#B55476]"
              aria-hidden="true"
            >
              <path
                d="M4 8L18 3M6 16L22 16M4 24L18 29"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Three Cute Pastel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Card 1: Capture */}
            <div className="rounded-3xl bg-[#FFF8FA]/85 backdrop-blur-sm border border-[#F5D2DF] p-6 shadow-[0_10px_28px_-8px_rgba(165,92,118,0.12)] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#FCE4EC] border border-[#F3BED0] flex items-center justify-center shrink-0 text-[#D45B82]">
                <CuteCameraDoodle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#8C3B58]">
                  Capture
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5262] mt-1 leading-relaxed">
                  Save the moments you never want to forget.
                </p>
              </div>
            </div>

            {/* Card 2: Create */}
            <div className="rounded-3xl bg-[#FFF8FA]/85 backdrop-blur-sm border border-[#F5D2DF] p-6 shadow-[0_10px_28px_-8px_rgba(165,92,118,0.12)] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#FCE4EC] border border-[#F3BED0] flex items-center justify-center shrink-0 text-[#D45B82]">
                <SparkleFourPoint className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#8C3B58]">
                  Create
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5262] mt-1 leading-relaxed">
                  Turn ordinary photos into little pieces of art.
                </p>
              </div>
            </div>

            {/* Card 3: Remember */}
            <div className="rounded-3xl bg-[#FFF8FA]/85 backdrop-blur-sm border border-[#F5D2DF] p-6 shadow-[0_10px_28px_-8px_rgba(165,92,118,0.12)] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#FCE4EC] border border-[#F3BED0] flex items-center justify-center shrink-0 text-[#D45B82]">
                <HandDrawnHeart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#8C3B58]">
                  Remember
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5262] mt-1 leading-relaxed">
                  Come back to your favorite moments whenever you want.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          SOFT PASTEL FOOTER ("Keep the little moments close ♡")
         ===================================================================== */}
      <footer className="relative bg-gradient-to-b from-[#F8D5E2] to-[#F4C6D7] border-t border-[#EBB5C9] pt-8 pb-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left Doodles: Heart, Camera, Sparkle */}
          <div className="flex items-center gap-5 text-[#A8486B]">
            <HandDrawnHeart className="w-5 h-5 text-[#E07A9A]" filled />
            <HandDrawnHeart className="w-6 h-6" />
            <CuteCameraDoodle className="w-7 h-7" />
            <SparkleFourPoint className="w-5 h-5 text-[#E07A9A]" />
          </div>

          {/* Center Message */}
          <p className="font-hand text-2xl sm:text-[26px] text-[#6E344A] tracking-wide text-center">
            Keep the little moments close ♡
          </p>

          {/* Right Doodles & Quick Actions */}
          <div className="flex items-center gap-4 text-[#8C435D]">
            <SparkleFourPoint className="w-5 h-5 text-[#E07A9A]" />
            <button
              type="button"
              onClick={() => {
                soundFX.playSoftPop();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Scroll to top"
              title="Back to top ♡"
              className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#B84A72]" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playSoftPop();
                document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Create a Polaroid"
              title="Create a Polaroid"
              className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#B84A72]" />
            </button>
          </div>
        </div>
      </footer>

      {/* Live Webcam Photo Booth Modal */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(dataUrl) => {
          setUploadedImage(dataUrl);
          setHasCustomUpload(true);
          runCameraPrintAnimation(dataUrl, false);
        }}
      />

      {/* Closer View Lightbox Modal for Scrapbook Polaroids */}
      <MemoryLightboxModal
        memory={inspectedMemory}
        onClose={() => setInspectedMemory(null)}
        onDownload={downloadPolaroidAsPng}
        onLike={handleLikeMemory}
        onDelete={handleDeleteMemory}
        onLoadIntoStudio={handleLoadMemoryIntoStudio}
      />
    </div>
  );
}
