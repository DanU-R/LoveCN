'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
  url: string;
  poster: string;
  vid: string;
  dramaId: string;
  nextVid: string | null;
}

export default function VideoPlayer({ url, poster, vid, dramaId, nextVid }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // --- 1. JURUS BERSIH-BERSIH (CLEANUP) ---
  useEffect(() => {
    // Saat komponen ini "mati" (pindah episode), fungsi ini akan jalan:
    return () => {
      const player = videoRef.current;
      if (player) {
        // Matikan paksa
        player.pause();
        // Hapus sumber videonya agar tidak buffering di memori
        player.removeAttribute('src'); 
        // Reset player
        player.load();
      }
    };
  }, [vid]); // Jalan setiap ID berubah

  // --- 2. LOGIC AUTO NEXT ---
  const handleEnded = () => {
    if (nextVid) {
      console.log("Video selesai, lanjut ke episode berikutnya...");
      router.replace(`/drama/${dramaId}?vid=${nextVid}&poster=${encodeURIComponent(poster)}`);
    }
  };

  return (
    <div className="w-full h-full bg-black">
      {/* KUNCI SUKSES: 
        1. Gunakan atribut 'src' langsung di tag video (React Way) 
        2. autoPlay tetap dipakai agar langsung main
        3. key={vid} di PARENT (page.tsx) adalah pertahanan utama
      */}
      <video
        ref={videoRef}
        src={url} 
        controls
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        poster={poster}
        preload="auto"
        onEnded={handleEnded}
      >
        Browser Anda tidak mendukung video player.
      </video>
    </div>
  );
}