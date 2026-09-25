import { FRAME_STYLES, PolaroidMemory, STICKER_OPTIONS } from '../types/polaroid';

export async function downloadPolaroidAsPng(memory: PolaroidMemory): Promise<void> {
  const canvas = document.createElement('canvas');
  const width = 900;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const frameConfig =
    FRAME_STYLES.find((f) => f.id === memory.frameStyle) || FRAME_STYLES[2];

  // 1. Draw outer Polaroid frame
  ctx.fillStyle = frameConfig.canvasBg;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 24);
  ctx.fill();

  // Optional dipped bottom color
  if (frameConfig.canvasBottomBg) {
    ctx.fillStyle = frameConfig.canvasBottomBg;
    ctx.beginPath();
    ctx.roundRect(0, height - 220, width, 220, [0, 0, 24, 24]);
    ctx.fill();
  }

  // Subtle frame border
  ctx.strokeStyle = 'rgba(180, 120, 140, 0.25)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  // 2. Load and draw user photo inside the square window
  const photoX = 64;
  const photoY = 64;
  const photoSize = width - 128; // 772x772

  // Dark inner backdrop first
  ctx.fillStyle = '#2B2829';
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  try {
    const img = await loadImage(memory.imageUrl);
    // Cover-fit crop into square
    const scale = Math.max(photoSize / img.width, photoSize / img.height);
    const sw = photoSize / scale;
    const sh = photoSize / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoSize, photoSize);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoSize, photoSize);
    ctx.restore();
  } catch {
    // Keep dark inner backdrop if image fails
  }

  // Subtle inner shadow border around photo window
  ctx.strokeStyle = 'rgba(92, 58, 71, 0.14)';
  ctx.lineWidth = 3;
  ctx.strokeRect(photoX, photoY, photoSize, photoSize);

  // 3. Draw handwritten caption at bottom
  ctx.fillStyle = '#5C3A47';
  ctx.font = '600 54px "Caveat", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const captionText = memory.caption || 'little moments ♡';
  ctx.fillText(captionText, width / 2, height - 115, width - 120);

  // 4. Draw stickers if selected
  memory.stickers.forEach((stickerId) => {
    const sticker = STICKER_OPTIONS.find((s) => s.id === stickerId);
    if (!sticker) return;
    ctx.save();
    ctx.font = '56px sans-serif';
    if (stickerId === 'heart-corner' || stickerId === 'flower-corner') {
      ctx.fillStyle = '#E06C8F';
      ctx.fillText(sticker.icon, 76, 82);
    } else if (stickerId === 'bow-top') {
      ctx.fillText('🎀', width - 95, 72);
    } else if (stickerId === 'emoji-smile') {
      ctx.fillText('😊', width - 82, 85);
    } else if (stickerId === 'washi-tape') {
      ctx.fillStyle = 'rgba(244, 172, 196, 0.72)';
      ctx.translate(width / 2, 48);
      ctx.rotate(-0.04);
      ctx.fillRect(-110, -22, 220, 44);
    } else if (stickerId === 'tiny-hearts') {
      ctx.fillStyle = '#E06C8F';
      ctx.fillText('💕', 140, 74);
    } else if (stickerId === 'iphone-heart') {
      ctx.fillText('💗', width - 90, 78);
    } else if (stickerId === 'sparkle-stars') {
      ctx.fillStyle = '#E08A9C';
      ctx.fillText('✨', 90, height - 90);
    }
    ctx.restore();
  });

  // 5. Trigger file download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  const cleanName = (memory.caption || 'polaroid-moment')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  link.download = `${cleanName || 'polaroid'}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
