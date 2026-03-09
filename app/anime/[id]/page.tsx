import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/app/components/VideoPlayer';
import { fetchAnimeDetail, fetchAnimeEpisodes, fetchAnimeEpisode } from '@/lib/api';

// ─── TIPE DATA ────────────────────────────────────────────────────────────────

interface AnimeData {
    id: string;
    name: string;
    cover_url: string | null;
    description?: string;
    genres?: string[];
    available_episodes?: number;
    anilist_data?: {
        title?: { english?: string; romaji?: string; native?: string };
        averageScore?: number;
        status?: string;
        format?: string;
        season?: string;
        seasonYear?: number;
        countryOfOrigin?: string;
    };
}

interface EpisodeMeta {
    id: string;
    episode_number: number;
    episode_title?: string;
    has_subtitle?: boolean;
    subtitle_langs?: string[];
    thumbnail?: string;
}

interface EpisodeFull {
    id: string;
    episode_number: number;
    episode_title?: string;
    video_urls?: {
        hls?: string;
        '1080p'?: string;
        '720p'?: string;
        '480p'?: string;
    };
    video_type?: string;
    subtitles?: { lang: string; label: string; url: string; is_default?: boolean }[];
    url_expires_at?: string;
}

// ─── FETCH DATA ───────────────────────────────────────────────────────────────

async function getAnime(id: string): Promise<{ anime: AnimeData; episodes: EpisodeMeta[]; total: number } | null> {
    try {
        const [detailJson, epsJson] = await Promise.all([
            fetchAnimeDetail(id),
            fetchAnimeEpisodes(id, 1, 100),
        ]);

        if (!detailJson?.data) return null;
        const anime: AnimeData = detailJson.data.anime ?? detailJson.data;
        const episodes: EpisodeMeta[] = epsJson?.data ?? [];
        const total: number = epsJson?.meta?.total ?? episodes.length;

        return { anime, episodes, total };
    } catch (e) {
        console.error('Anime Detail Error:', e);
        return null;
    }
}

async function getEpisodeFull(animeId: string, epNumber: number): Promise<EpisodeFull | null> {
    try {
        const json = await fetchAnimeEpisode(animeId, epNumber);
        return json?.data ?? null;
    } catch {
        return null;
    }
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function AnimeDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ ep?: string }>;
}) {
    const { id } = await params;
    const { ep } = await searchParams;

    const result = await getAnime(id);

    if (!result) {
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold text-purple-400 mb-2 font-serif">Oops! Anime Tidak Ditemukan</h1>
                <Link href="/anime" className="mt-4 bg-white/10 px-6 py-2 rounded-full text-sm hover:bg-white/20 transition-all backdrop-blur-md border border-white/5">
                    Kembali ke Anime
                </Link>
            </div>
        );
    }

    const { anime, episodes, total } = result;
    const displayTitle = anime.anilist_data?.title?.english ?? anime.name;

    // Tentukan episode aktif
    const activeEpNumber = ep ? parseInt(ep, 10) : episodes[0]?.episode_number ?? 1;
    const activeEpMeta = episodes.find((e) => e.episode_number === activeEpNumber) ?? episodes[0];

    // Fetch signed URL episode aktif
    const activeEpFull = activeEpMeta
        ? await getEpisodeFull(id, activeEpMeta.episode_number)
        : null;

    const nextEp = activeEpMeta
        ? episodes.find((e) => e.episode_number === activeEpMeta.episode_number + 1)
        : null;

    // Pilih URL video: utamakan 720p, lalu HLS, lalu 480p
    const videoUrl =
        activeEpFull?.video_urls?.['720p'] ??
        activeEpFull?.video_urls?.['480p'] ??
        activeEpFull?.video_urls?.['hls'] ??
        null;

    const subtitleId = activeEpFull?.subtitles?.find((s) => s.lang === 'id')?.url ?? null;
    const subtitleEn = activeEpFull?.subtitles?.find((s) => s.lang === 'en')?.url ?? null;

    const statusLabel: Record<string, string> = {
        FINISHED: 'Selesai',
        RELEASING: 'Ongoing',
        NOT_YET_RELEASED: 'Belum Rilis',
        CANCELLED: 'Dibatalkan',
    };

    return (
        <main className="min-h-screen bg-[#080810] text-white">
            {/* NAV */}
            <nav className="sticky top-0 z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center gap-3 shadow-2xl">
                <Link
                    href="/anime"
                    className="text-zinc-400 hover:text-white text-sm font-bold px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
                >
                    ←
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-sm md:text-lg font-bold truncate text-zinc-100 font-serif tracking-tight">
                        {displayTitle}
                        {activeEpMeta && (
                            <span className="text-zinc-500 font-sans ml-3 text-xs md:text-sm font-normal">
                                / Ep {activeEpMeta.episode_number}
                                {activeEpMeta.episode_title ? ` — ${activeEpMeta.episode_title}` : ''}
                            </span>
                        )}
                    </h1>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-purple-400 bg-purple-600/10 border border-purple-600/20 px-3 py-1 rounded-full hidden sm:block">
                    🎌 Anime
                </span>
            </nav>

            <div className="max-w-[1600px] mx-auto p-0 md:p-6 grid grid-cols-1 lg:grid-cols-3 md:gap-8">

                {/* ── PLAYER ── */}
                <div className="lg:col-span-2 space-y-0 md:space-y-6">
                    <div className="relative w-full aspect-video bg-black md:rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-b md:border border-white/[0.06] sticky top-[57px] md:static z-40 group">
                        {videoUrl ? (
                            <VideoPlayer
                                key={String(activeEpMeta?.id)}
                                url={videoUrl}
                                poster={anime.cover_url ?? ''}
                                vid={String(activeEpMeta?.id)}
                                dramaId={id}
                                nextVid={nextEp ? String(nextEp.episode_number) : null}
                                subtitleId={subtitleId}
                                subtitleEn={subtitleEn}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-[#0c0c14]">
                                <div className="w-12 h-12 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="animate-pulse">Menyiapkan Streaming...</p>
                            </div>
                        )}

                        {nextEp && (
                            <div className="absolute bottom-6 right-6 bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none shadow-xl border border-purple-500/50">
                                Lanjut: Ep {nextEp.episode_number}
                            </div>
                        )}
                    </div>

                    {/* Info Anime */}
                    <div className="p-6 md:p-8 bg-zinc-900/40 backdrop-blur-sm md:rounded-3xl border border-white/[0.04] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700" />

                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            {anime.cover_url && (
                                <div className="hidden md:block flex-shrink-0 w-32 h-48 rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-white/10">
                                    <Image src={anime.cover_url} alt={displayTitle} fill sizes="128px" className="object-cover" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1 tracking-tight">{displayTitle}</h2>
                                {anime.anilist_data?.title?.romaji && (
                                    <p className="text-sm text-zinc-500 mb-4 italic">{anime.anilist_data.title.romaji}</p>
                                )}
                                <div className="flex flex-wrap gap-2.5 mb-5">
                                    <span className="text-[10px] font-extrabold bg-purple-600 px-3 py-1 rounded-full text-white tracking-widest uppercase shadow-lg shadow-purple-600/20">
                                        {anime.anilist_data?.format ?? 'TV'}
                                    </span>
                                    <span className="text-[10px] font-bold bg-white/[0.06] border border-white/5 px-3 py-1 rounded-full text-zinc-300 uppercase tracking-widest">
                                        {episodes.length} / {total} EPS
                                    </span>
                                    {anime.anilist_data?.averageScore && (
                                        <span className="text-[10px] font-bold bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full text-yellow-400 uppercase tracking-widest">
                                            ★ {(anime.anilist_data.averageScore / 10).toFixed(1)}/10
                                        </span>
                                    )}
                                    {anime.anilist_data?.seasonYear && (
                                        <span className="text-[10px] font-bold bg-white/[0.06] border border-white/5 px-3 py-1 rounded-full text-zinc-400 uppercase tracking-widest">
                                            {anime.anilist_data.seasonYear}
                                        </span>
                                    )}
                                </div>
                                {anime.genres && anime.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {anime.genres.map((g) => (
                                            <Link
                                                key={g}
                                                href={`/anime?genre=${g}`}
                                                className="text-[10px] bg-purple-600/10 border border-purple-600/30 text-purple-400 px-3 py-1 rounded-full hover:bg-purple-600/20 transition-all uppercase font-bold tracking-tighter"
                                            >
                                                {g}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <div className="h-px w-full bg-gradient-to-r from-white/[0.08] to-transparent mb-5" />
                                <p className="text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-4 opacity-90">
                                    {anime.description ?? 'Sinopsis tidak tersedia.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── LIST EPISODE ── */}
                <div className="lg:col-span-1 p-4 md:p-0">
                    <div className="bg-[#0c0c14] md:rounded-3xl border border-white/[0.06] overflow-hidden flex flex-col h-[500px] md:h-[calc(100vh-160px)] sticky top-[72px] shadow-2xl">
                        <div className="p-5 border-b border-white/[0.06] bg-white/[0.02] flex justify-between items-center backdrop-blur-md">
                            <h3 className="font-extrabold text-white text-sm tracking-widest uppercase">Anime List</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 uppercase tracking-tighter">
                                HD Ready
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-purple-600/40 transition-all">
                            {episodes.map((ep) => {
                                const isActive = activeEpMeta?.episode_number === ep.episode_number;
                                return (
                                    <Link
                                        key={ep.id}
                                        href={`/anime/${id}?ep=${ep.episode_number}`}
                                        className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-[0_8px_32px_-4px_rgba(147,51,234,0.4)] translate-x-1'
                                            : 'hover:bg-white/[0.04] text-zinc-400 bg-transparent border border-transparent hover:border-white/5'
                                            }`}
                                    >
                                        <div
                                            className={`relative w-14 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 transition-transform ${isActive ? 'bg-white/20 scale-110' : 'bg-zinc-800 text-zinc-600 group-hover:text-zinc-300 group-hover:bg-zinc-700'
                                                }`}
                                        >
                                            {ep.episode_number}
                                            {isActive && (
                                                <div className="absolute inset-0 border-2 border-white/30 rounded-xl animate-[ping_1.5s_infinite]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-purple-400'}`}>
                                                {ep.episode_title ?? `Episode ${ep.episode_number}`}
                                            </p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-purple-100/60' : 'text-zinc-600'}`}>
                                                {isActive ? 'Sedang Diputar' : 'Putar Anime'}
                                                {ep.has_subtitle && !isActive && (
                                                    <span className="ml-2 text-cyan-500">· SUB</span>
                                                )}
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
