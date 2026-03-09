import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/app/components/VideoPlayer';
import { fetchDramaDetail, fetchEpisodes } from '@/lib/api';

// ─── TIPE DATA SDrama ────────────────────────────────────────────────────────

interface Subtitle {
  lang: string;
  url: string;
}

interface Quality {
  [key: string]: string; // e.g. "1080p", "720p", "480p"
}

interface Episode {
  id: number;
  episode_index: number;
  episode_name: string;
  video_url: string;
  subtitle_url?: string;
  subtitles?: Subtitle[];
  qualities?: Quality;
  status: string;
}

interface DramaDetail {
  id: number;
  title: string;
  cover_url: string;
  introduction?: string;
  chapter_count?: number;
  provider_name?: string;
  language?: string;
}

// ─── FETCH DATA ──────────────────────────────────────────────────────────────

async function getDrama(id: string): Promise<{ drama: DramaDetail; episodes: Episode[] } | null> {
  try {
    const json = await fetchDramaDetail(id);
    if (!json?.data) return null;

    const drama: DramaDetail = json.data.drama ?? json.data;
    // Episodes bisa langsung ikut di /api/dramas/:id
    let episodes: Episode[] = json.data.episodes ?? [];

    // Kalau episode belum ikut (atau kosong), fetch terpisah
    if (episodes.length === 0) {
      const epsJson = await fetchEpisodes(id, 1, 100);
      episodes = epsJson?.data ?? [];
    }

    // Filter hanya yang published
    episodes = episodes.filter((ep: Episode) => ep.status === 'published');

    return { drama, episodes };
  } catch (e) {
    console.error('Drama Detail Error:', e);
    return null;
  }
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default async function DramaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;

  const result = await getDrama(id);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-rose-500 mb-2 font-serif">Oops! Drama Tidak Ditemukan</h1>
        <Link href="/" className="mt-4 bg-white/10 px-6 py-2 rounded-full text-sm hover:bg-white/20 transition-all backdrop-blur-md border border-white/5">
          Kembali ke Home
        </Link>
      </div>
    );
  }

  const { drama, episodes } = result;

  // Episode aktif: cari berdasarkan episode_index dari query param
  const activeEpisode = ep
    ? episodes.find((e) => String(e.episode_index) === ep)
    : episodes[0];

  const activeEp = activeEpisode ?? episodes[0] ?? null;
  const activeIdx = activeEp ? episodes.findIndex((e) => e.id === activeEp.id) : -1;
  const nextEpisode = activeIdx >= 0 ? episodes[activeIdx + 1] ?? null : null;

  // Subtitle bahasa Indonesia diprioritaskan
  const idSubtitle = activeEp?.subtitles?.find((s) => s.lang === 'id') ?? null;
  const enSubtitle = activeEp?.subtitles?.find((s) => s.lang === 'en') ?? null;

  // URL video: utamakan 720p, fallback ke video_url
  const videoUrl =
    activeEp?.qualities?.['720p'] ??
    activeEp?.qualities?.['480p'] ??
    activeEp?.video_url ??
    null;

  return (
    <main className="min-h-screen bg-[#080810] text-white">
      {/* NAVIGASI */}
      <nav className="sticky top-0 z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center gap-3 shadow-2xl">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
        >
          <span>←</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm md:text-lg font-bold truncate text-zinc-100 font-serif tracking-tight">
            {drama.title}
            {activeEp && (
              <span className="text-zinc-500 font-sans ml-3 text-xs md:text-sm font-normal">
                / {activeEp.episode_name}
              </span>
            )}
          </h1>
        </div>
        {drama.provider_name && (
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full hidden sm:block">
            {drama.provider_name}
          </span>
        )}
      </nav>

      <div className="max-w-[1600px] mx-auto p-0 md:p-6 grid grid-cols-1 lg:grid-cols-3 md:gap-8">

        {/* ── PLAYER VIDEO ── */}
        <div className="lg:col-span-2 space-y-0 md:space-y-6">
          <div className="relative w-full aspect-video bg-black md:rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-b md:border border-white/[0.06] sticky top-[57px] md:static z-40 group">
            {videoUrl ? (
              <VideoPlayer
                key={String(activeEp?.id)}
                url={videoUrl}
                poster={drama.cover_url}
                vid={String(activeEp?.id)}
                dramaId={id}
                nextVid={nextEpisode ? String(nextEpisode.episode_index) : null}
                subtitleId={idSubtitle?.url ?? null}
                subtitleEn={enSubtitle?.url ?? null}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-[#0c0c14]">
                <div className="w-12 h-12 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="animate-pulse">Menyiapkan Streaming...</p>
              </div>
            )}

            {nextEpisode && (
              <div className="absolute bottom-6 right-6 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl border border-rose-500/50">
                Lanjut: Ep {nextEpisode.episode_index}
              </div>
            )}
          </div>

          {/* Info Drama */}
          <div className="p-6 md:p-8 bg-zinc-900/40 backdrop-blur-sm md:rounded-3xl border border-white/[0.04] shadow-2xl relative overflow-hidden group">
            {/* Background glow shadow effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-600/20 transition-all duration-700" />

            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              {drama.cover_url && (
                <div className="hidden md:block flex-shrink-0 w-32 h-48 rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-white/10">
                  <Image src={drama.cover_url} alt={drama.title} fill sizes="128px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">{drama.title}</h2>
                <div className="flex flex-wrap gap-2.5 mb-6">
                  <span className="text-[10px] font-extrabold bg-rose-600 px-3 py-1 rounded-full text-white tracking-widest uppercase shadow-lg shadow-rose-600/20">Ultra HD</span>
                  <span className="text-[10px] font-bold bg-white/[0.06] border border-white/5 px-3 py-1 rounded-full text-zinc-300 uppercase tracking-widest">
                    {episodes.length} EPISODE
                  </span>
                  {drama.chapter_count && drama.chapter_count > episodes.length && (
                    <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-500 uppercase tracking-widest">
                      TOTAL {drama.chapter_count} EPS
                    </span>
                  )}
                  {(idSubtitle || enSubtitle) && (
                    <span className="text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-cyan-400 uppercase tracking-widest">
                      SUB INDO
                    </span>
                  )}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-white/[0.08] to-transparent mb-6" />

                <p className="text-zinc-400 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium italic opacity-90">
                  "{drama.introduction || 'Sinopsis tidak tersedia.'}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── LIST EPISODE ── */}
        <div className="lg:col-span-1 p-4 md:p-0">
          <div className="bg-[#0c0c14] md:rounded-3xl border border-white/[0.06] overflow-hidden flex flex-col h-[500px] md:h-[calc(100vh-160px)] sticky top-[72px] shadow-2xl">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.02] flex justify-between items-center backdrop-blur-md">
              <h3 className="font-extrabold text-white text-sm tracking-widest uppercase">Daftar Putar</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 uppercase tracking-tighter">
                Online
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-rose-600/40 transition-all">
              {episodes.map((ep) => {
                const isActive = activeEp?.id === ep.id;
                return (
                  <Link
                    key={ep.id}
                    href={`/drama/${id}?ep=${ep.episode_index}`}
                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group ${isActive
                      ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-[0_8px_32px_-4px_rgba(225,29,72,0.4)] translate-x-1'
                      : 'hover:bg-white/[0.04] text-zinc-400 bg-transparent border border-transparent hover:border-white/5'
                      }`}
                  >
                    <div
                      className={`relative w-14 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 transition-transform ${isActive ? 'bg-white/20 scale-110' : 'bg-zinc-800 text-zinc-600 group-hover:text-zinc-300 group-hover:bg-zinc-700'
                        }`}
                    >
                      {ep.episode_index}
                      {isActive && (
                        <div className="absolute inset-0 border-2 border-white/30 rounded-xl animate-[ping_1.5s_infinite]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-rose-400'}`}>
                        {ep.episode_name}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-rose-100/60' : 'text-zinc-600'}`}>
                        {isActive ? 'Sedang Diputar' : 'Putar Episode'}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_12px_rgba(255,255,255,1)]" />
                    )}
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