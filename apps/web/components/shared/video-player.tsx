"use client";

import { useMemo, useState } from "react";
import { Play, Video } from "lucide-react";

export function getYouTubeEmbedInfo(url: string | null | undefined): { videoId: string; embedUrl: string; thumbnailUrl: string } | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    const videoId = match[2];
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }
  return null;
}

export function WorkerVideoPlayer({ videoUrl, isArabic }: { videoUrl: string; isArabic: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const ytInfo = useMemo(() => getYouTubeEmbedInfo(videoUrl), [videoUrl]);

  if (!videoUrl || !videoUrl.trim()) return null;

  if (ytInfo) {
    if (isPlaying) {
      return (
        <div className="relative aspect-video w-full max-w-2xl overflow-hidden border-2 border-gold bg-black shadow-2xl">
          <iframe
            src={ytInfo.embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
    }

    const currentThumb = thumbError
      ? `https://img.youtube.com/vi/${ytInfo.videoId}/0.jpg`
      : ytInfo.thumbnailUrl;

    return (
      <div
        onClick={() => setIsPlaying(true)}
        className="group relative aspect-video w-full max-w-2xl cursor-pointer overflow-hidden border-2 border-gold/40 bg-black shadow-xl transition-all hover:border-gold"
      >
        {/* YouTube Snapshot Image */}
        <img
          src={currentThumb}
          alt={isArabic ? "صورة غلاف الفيديو" : "Video Snapshot"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setThumbError(true)}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 transition-colors group-hover:from-black/70" />

        {/* Play Button & Action Prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-gold text-black shadow-2xl transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </div>
          <span className="rounded border border-gold/40 bg-black/80 px-3.5 py-1.5 text-xs font-black uppercase text-gold shadow-lg backdrop-blur-md">
            {isArabic ? "انقر لمشاهدة الفيديو" : "Click to Play Video"}
          </span>
        </div>

        {/* YouTube Tag Badge */}
        <div className="absolute top-3 end-3 flex items-center gap-1.5 rounded bg-red-600 px-2.5 py-1 text-[11px] font-black text-white shadow">
          <span>YouTube</span>
        </div>
      </div>
    );
  }

  const isDirectVideoFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(videoUrl);

  if (isDirectVideoFile) {
    return (
      <div className="relative aspect-video w-full max-w-2xl overflow-hidden border-2 border-gold/40 bg-black shadow-xl">
        <video src={videoUrl} controls preload="metadata" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex aspect-video w-full max-w-2xl items-center justify-center overflow-hidden border-2 border-gold/40 bg-black/90 p-6 text-center transition hover:border-gold"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black transition-transform group-hover:scale-110">
          <Play className="ml-1 h-6 w-6 fill-current" />
        </div>
        <span className="text-xs font-black uppercase text-gold">
          {isArabic ? "فتح الفيديو في نافذة جديدة" : "Open Video Link"}
        </span>
      </div>
    </a>
  );
}
