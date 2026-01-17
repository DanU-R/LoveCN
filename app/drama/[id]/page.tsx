import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer';

// --- TIPE DATA ---
interface Episode {
  vid: string;
  episode: number;
  duration?: number;
}

interface DramaDetail {
  id: string;
  title: string;
  cover: string;
  intro?: string;
  videos: Episode[];
}

interface VideoData {
  url: string;
  format?: string;
}

// --- FUNGSI AMBIL DATA ---
async function getDramaDetail(id: string): Promise<DramaDetail | null> {
  const url = `https://dramabos.asia/api/melolo/api/v1/detail/${id}?lang=id`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 0 }, 
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;

    const json = await res.json();
    const data = json.data || json; 

    if (data && data.videos) {
        return data;
    }
    return null;
  } catch (e) {
    console.error("Detail Error:", e);
    return null;
  }
}

async function getVideoUrl(vid: string): Promise<VideoData | null> {
  if (!vid) return null;
  try {
    const res = await fetch(`https://dramabos.asia/api/melolo/api/v1/video/${vid}?lang=id`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const json = await res.json();
    if (json.url) return json;
    return json.data || null;
  } catch (e) {
    console.error("Video Error:", e);
    return null;
  }
}

// --- HALAMAN UTAMA ---
export default async function DramaPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vid?: string; poster?: string }>;
}) {
  const { id } = await params;
  const { vid, poster } = await searchParams;

  // 1. Ambil Data Detail
  const drama = await getDramaDetail(id);

  if (!drama) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold text-red-500 mb-2">Drama Tidak Ditemukan</h1>
            <Link href="/" className="mt-4 bg-white/10 px-4 py-2 rounded text-sm">Kembali ke Home</Link>
        </div>
    );
  }

  // 2. Normalisasi Data
  const title = drama.title || "Tanpa Judul";
  const videoList = drama.videos || [];
  const mainCover = drama.cover || poster || "/placeholder.jpg";

  // 3. Logic Episode Aktif & Next Episode
  // Cari index episode yang sedang aktif
  const currentIndex = vid 
    ? videoList.findIndex((ep) => String(ep.vid) === vid) 
    : 0; // Default index 0 (Episode 1)
  
  const activeEpisode = videoList[currentIndex];
  const activeVid = activeEpisode ? activeEpisode.vid : null;
  const activeNumber = activeEpisode ? activeEpisode.episode : 1;

  // LOGIC AUTO NEXT: Ambil episode di index berikutnya (index + 1)
  const nextEpisode = videoList[currentIndex + 1]; 
  const nextVid = nextEpisode ? nextEpisode.vid : null;

  // 4. Ambil Video Stream
  const videoStream = activeVid ? await getVideoUrl(String(activeVid)) : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* NAVIGASI */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/10 px-4 py-3 flex items-center gap-3 shadow-md">
        <Link href="/" className="text-gray-400 hover:text-white text-sm font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10">
           <span>←</span>
        </Link>
        <h1 className="text-sm md:text-lg font-bold truncate text-white flex-1">
          {title} <span className="text-gray-500 mx-2">|</span> Episode {activeNumber}
        </h1>
      </nav>

      <div className="max-w-[1600px] mx-auto p-0 md:p-6 grid grid-cols-1 lg:grid-cols-3 md:gap-6">
        
        {/* PLAYER VIDEO */}
        <div className="lg:col-span-2 space-y-0 md:space-y-4">
          <div className="relative w-full aspect-video bg-black md:rounded-xl overflow-hidden shadow-2xl border-b md:border border-white/10 sticky top-[57px] md:static z-40 group">
            {videoStream?.url ? (
              // --- PASSING DATA KE PLAYER (Updated) ---
              <VideoPlayer 
                key={String(activeVid)}
                url={videoStream.url} 
                poster={mainCover} 
                vid={String(activeVid)}
                dramaId={id}           // Kirim ID Drama
                nextVid={nextVid}      // Kirim ID Next Episode
              />
              // ----------------------------------------
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-[#151515]">
                 <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p>Memuat Video...</p>
                 <p className="text-xs text-gray-700 mt-2">VID: {activeVid}</p>
              </div>
            )}
            
            {/* Indikator Next Episode (Muncul jika ada next episode) */}
            {nextEpisode && (
                <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Next: Episode {nextEpisode.episode}
                </div>
            )}
          </div>

          {/* Info Drama */}
          <div className="p-4 md:p-5 bg-[#0a0a0a] md:bg-[#151515] md:rounded-xl md:border border-white/5">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white font-bold">HD</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">Total {videoList.length} Eps</span>
                    </div>
                </div>
                {/* Tombol Next Manual (Opsional, buat jaga-jaga) */}
                {nextVid && (
                    <Link 
                        href={`/drama/${id}?vid=${nextVid}&poster=${encodeURIComponent(mainCover)}`}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        Next Eps ▶
                    </Link>
                )}
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {drama.intro || "Sinopsis tidak tersedia."}
            </p>
          </div>
        </div>

        {/* LIST EPISODE */}
        <div className="lg:col-span-1 p-4 md:p-0">
          <div className="bg-[#151515] rounded-xl border border-white/5 overflow-hidden flex flex-col h-[500px] md:h-[600px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white">Daftar Episode</h3>
              <span className="text-xs text-gray-400">{videoList.length} Video</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
              {videoList.map((ep) => {
                const isActive = String(ep.vid) === String(activeVid);
                return (
                  <Link 
                    key={ep.vid} 
                    href={`/drama/${id}?vid=${ep.vid}&poster=${encodeURIComponent(mainCover)}`}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group
                      ${isActive ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-300 bg-[#0a0a0a]'}
                    `}
                  >
                    <div className={`
                        relative w-16 h-12 rounded flex items-center justify-center font-bold text-lg flex-shrink-0 border 
                        ${isActive ? 'bg-red-700 border-red-500' : 'bg-black border-white/10 text-gray-500'}
                    `}>
                        {ep.episode}
                        {isActive && <div className="absolute w-2 h-2 bg-white rounded-full bottom-1 animate-pulse"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                        Episode {ep.episode}
                      </p>
                      <p className={`text-xs truncate ${isActive ? 'text-red-100' : 'text-gray-600'}`}>
                         {isActive ? 'Sedang Diputar' : 'Klik untuk Play'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}