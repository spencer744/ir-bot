/**
 * Video URL helpers for hero background, deal walkthrough, and gallery.
 * Distinguishes embed URLs (YouTube/Vimeo) from direct video file URLs (MP4/WebM).
 */

export function isEmbedVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(trimmed);
}

export function getEmbedVideoUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}
