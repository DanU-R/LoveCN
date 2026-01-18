'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
  url: string;
  poster: string;
  vid: string;
  dramaId: string;
  nextVid: string | null;
}

export default function VideoPlayer({
  url,
  poster,
  vid,
  dramaId,
  nextVid
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const handleEnded = () => {
    if (nextVid) {
      router.replace(`/drama/${dramaId}?vid=${nextVid}`);
    }
  };

  return (
    <div className="w-full h-full bg-black relative">
      <video
        key={vid}              // ⬅️ INI KUNCI UTAMA
        ref={videoRef}
        src={url}
        controls
        autoPlay
        playsInline
        preload="auto"
        poster={poster}
        onEnded={handleEnded}
                onPlay={() => {
        document.querySelectorAll('video').forEach(v => {
            if (v !== videoRef.current) v.pause();
        });
        }}

        className="w-full h-full object-contain"
      />
    </div>
  );
  
}


