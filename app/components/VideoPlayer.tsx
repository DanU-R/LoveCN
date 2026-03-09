'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
  url: string;
  poster: string;
  vid: string;
  dramaId: string;
  nextVid: string | null;  // episode_index of next episode
  subtitleId?: string | null;
  subtitleEn?: string | null;
}

export default function VideoPlayer({
  url,
  poster,
  vid,
  dramaId,
  nextVid,
  subtitleId,
  subtitleEn,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const handleEnded = () => {
    if (nextVid) {
      router.replace(`/drama/${dramaId}?ep=${nextVid}`);
    }
  };

  return (
    <div className="w-full h-full bg-black relative">
      <video
        key={vid}
        ref={videoRef}
        src={url}
        controls
        autoPlay
        playsInline
        preload="auto"
        poster={poster}
        onEnded={handleEnded}
        onPlay={() => {
          document.querySelectorAll('video').forEach((v) => {
            if (v !== videoRef.current) v.pause();
          });
        }}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      >
        {/* Subtitle Bahasa Indonesia (default) */}
        {subtitleId && (
          <track
            key={`id-${vid}`}
            kind="subtitles"
            src={subtitleId}
            srcLang="id"
            label="Indonesia"
            default
          />
        )}
        {/* Subtitle Bahasa Inggris */}
        {subtitleEn && (
          <track
            key={`en-${vid}`}
            kind="subtitles"
            src={subtitleEn}
            srcLang="en"
            label="English"
          />
        )}
      </video>
    </div>
  );
}
