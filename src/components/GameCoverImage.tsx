'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';

interface GameCoverImageProps {
  src?: string | null;
  appId?: number | null;
  title: string;
  className?: string;
  isEndless?: boolean;
}

// 6 Curated Vibrant Gaming Gradient Palettes for Title Hashes
const PALETTES = [
  { from: 'from-violet-600', to: 'to-indigo-800', accent: '#8b5cf6', text: 'text-violet-100' },
  { from: 'from-sky-500', to: 'to-blue-800', accent: '#0ea5e9', text: 'text-sky-100' },
  { from: 'from-emerald-500', to: 'to-teal-800', accent: '#10b981', text: 'text-emerald-100' },
  { from: 'from-amber-500', to: 'to-rose-700', accent: '#f59e0b', text: 'text-amber-100' },
  { from: 'from-fuchsia-600', to: 'to-pink-700', accent: '#d946ef', text: 'text-pink-100' },
  { from: 'from-cyan-600', to: 'to-slate-800', accent: '#06b6d4', text: 'text-cyan-100' },
];

function getPaletteForTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

function getInitials(title: string) {
  const clean = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase() || 'GP';
}

export function GameCoverImage({
  src,
  appId,
  title,
  className = 'w-10 h-10 object-cover',
  isEndless = false,
}: GameCoverImageProps) {
  // Candidate Steam URLs to try in order when an image fails to load
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const fallbackUrls = React.useMemo(() => {
    const list: string[] = [];
    if (src && src.trim() && src !== 'null' && src !== 'undefined') {
      list.push(src.trim());
    }
    if (appId) {
      const steamAppId = Number(appId);
      list.push(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/header.jpg`);
      list.push(`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`);
      list.push(`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/capsule_616x353.jpg`);
      list.push(`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/capsule_231x87.jpg`);
    }
    // Deduplicate while preserving order
    return Array.from(new Set(list));
  }, [src, appId]);

  // Reset if src or appId changes
  useEffect(() => {
    setAttemptIndex(0);
    setHasFailedAll(fallbackUrls.length === 0);
  }, [fallbackUrls]);

  const currentUrl = fallbackUrls[attemptIndex];

  const handleImageError = () => {
    if (attemptIndex + 1 < fallbackUrls.length) {
      setAttemptIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const palette = getPaletteForTitle(title);
  const initials = getInitials(title);

  if (hasFailedAll || !currentUrl) {
    return (
      <div
        className={`${className} bg-gradient-to-br ${
          isEndless ? 'from-purple-600 via-pink-600 to-indigo-800' : `${palette.from} ${palette.to}`
        } text-white flex flex-col items-center justify-center relative overflow-hidden select-none shrink-0 shadow-sm border border-white/10`}
        title={title}
      >
        {isEndless ? (
          <Sparkles className="w-3.5 h-3.5 opacity-90 mb-0.5" />
        ) : (
          <Gamepad2 className="w-3.5 h-3.5 opacity-80 mb-0.5" />
        )}
        <span className="font-extrabold text-[10px] tracking-wider leading-none text-white/95">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={title}
      loading="lazy"
      decoding="async"
      onError={handleImageError}
      className={className}
    />
  );
}
