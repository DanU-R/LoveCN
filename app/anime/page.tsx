import Link from 'next/link';
import Image from 'next/image';
import HeaderSearch from '../components/HeaderSearch';
import {
    fetchAnimePopular,
    fetchAnimeByGenre,
    fetchAnimeSearch,
} from '@/lib/api';

const ANIME_GENRES = [
    { name: 'Action', genre: 'Action' },
    { name: 'Romance', genre: 'Romance' },
    { name: 'Fantasy', genre: 'Fantasy' },
    { name: 'Comedy', genre: 'Comedy' },
    { name: 'Drama', genre: 'Drama' },
    { name: 'Horror', genre: 'Horror' },
    { name: 'Sci-Fi', genre: 'Sci-Fi' },
    { name: 'Slice of Life', genre: 'Slice of Life' },
    { name: 'Sports', genre: 'Sports' },
    { name: 'Mystery', genre: 'Mystery' },
];

interface Anime {
    id: string;
    name: string;
    cover_url: string | null;
    genres?: string[];
    available_episodes?: number;
    anilist_data?: {
        title?: { english?: string; romaji?: string };
        averageScore?: number;
        status?: string;
        format?: string;
        countryOfOrigin?: string;
        seasonYear?: number;
    };
}

function normalizeAnimeList(json: any): Anime[] {
    if (!json) return [];
    if (Array.isArray(json.data)) return json.data;
    return [];
}

async function getAnimeList(q: string, genre: string): Promise<Anime[]> {
    try {
        if (q) return normalizeAnimeList(await fetchAnimeSearch(q, 30));
        if (genre) return normalizeAnimeList(await fetchAnimeByGenre(genre, 30));
        return normalizeAnimeList(await fetchAnimePopular(30));
    } catch {
        return [];
    }
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; genre?: string }>;
}) {
    const params = await searchParams;
    const label = params.q || params.genre || '';
    return {
        title: label ? `${label} - Anime | LoveCN` : 'Anime - LoveCN',
        description: label
            ? `Nonton anime ${label} sub Indo`
            : 'Streaming anime subtitle Indonesia terlengkap di LoveCN.',
    };
}

export default async function AnimePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; genre?: string }>;
}) {
    const params = await searchParams;
    const q = params.q?.trim() || '';
    const activeGenre = params.genre?.trim() || '';
    const isFiltered = Boolean(q || activeGenre);

    const animeList = await getAnimeList(q, activeGenre);
    const featured = !isFiltered && animeList.length > 0 ? animeList[0] : null;
    const list = !isFiltered && animeList.length > 0 ? animeList.slice(1) : animeList;

    const sectionTitle = q
        ? `Hasil pencarian: "${q}"`
        : activeGenre
            ? `Genre: ${activeGenre}`
            : 'Anime Populer';

    return (
        <main className="min-h-screen bg-[#080810] text-white pb-20">

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-50 bg-[#080810]/80 backdrop-blur-2xl border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <Link href="/" className="text-xl font-extrabold tracking-tight flex-shrink-0">
                        Love<span className="text-rose-500">CN</span>
                    </Link>

                    <nav className="flex gap-1 ml-1">
                        <Link href="/" className="px-3 py-1 rounded-full text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition">
                            🎬 Drama
                        </Link>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                            🎌 Anime
                        </span>
                    </nav>

                    <div className="flex-1" />
                    <div className="w-[220px] sm:w-[300px]">
                        <HeaderSearch placeholder="Cari anime..." baseHref="/anime" />
                    </div>
                </div>

                {/* Genre strip */}
                <div className="border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        {(q || activeGenre) && (
                            <Link href="/anime" className="flex-shrink-0 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                                ← Semua
                            </Link>
                        )}
                        {ANIME_GENRES.map((g) => {
                            const isActive = activeGenre === g.genre;
                            return (
                                <Link
                                    key={g.genre}
                                    href={`/anime?genre=${g.genre}`}
                                    className={`flex-shrink-0 px-4 py-1 rounded-full text-xs font-medium border transition-all ${isActive
                                            ? 'bg-white text-black border-white'
                                            : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {g.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── HERO ── */}
            {featured && (
                <div className="relative w-full h-[70vh] overflow-hidden">
                    {featured.cover_url && (
                        <Image
                            src={featured.cover_url}
                            alt={featured.name}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover scale-105 brightness-[0.3]"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/90 via-[#080810]/20 to-transparent" />

                    <div className="absolute bottom-12 left-6 md:left-12 max-w-xl z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-purple-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">
                                🎌 Populer #1
                            </span>
                            {featured.anilist_data?.countryOfOrigin && (
                                <span className="bg-white/10 backdrop-blur text-zinc-300 text-[11px] px-2 py-1 rounded-full border border-white/10">
                                    {featured.anilist_data.countryOfOrigin === 'JP' ? '🇯🇵 Jepang'
                                        : featured.anilist_data.countryOfOrigin === 'CN' ? '🇨🇳 China'
                                            : featured.anilist_data.countryOfOrigin === 'KR' ? '🇰🇷 Korea'
                                                : featured.anilist_data.countryOfOrigin}
                                </span>
                            )}
                            {featured.anilist_data?.seasonYear && (
                                <span className="bg-white/10 backdrop-blur text-zinc-300 text-[11px] px-2 py-1 rounded-full border border-white/10">
                                    {featured.anilist_data.seasonYear}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-2xl">
                            {featured.anilist_data?.title?.english ?? featured.name}
                        </h1>
                        <div className="flex items-center gap-3 mb-5">
                            {featured.anilist_data?.averageScore && (
                                <span className="text-yellow-400 font-bold text-sm">
                                    ★ {(featured.anilist_data.averageScore / 10).toFixed(1)}/10
                                </span>
                            )}
                            {featured.available_episodes && (
                                <span className="text-zinc-400 text-sm">📺 {featured.available_episodes} Episode</span>
                            )}
                            {featured.genres && featured.genres.length > 0 && (
                                <span className="text-zinc-500 text-xs">{featured.genres.slice(0, 3).join(' • ')}</span>
                            )}
                        </div>
                        <Link
                            href={`/anime/${featured.id}`}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-purple-600/40 hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                            ▶ Tonton Sekarang
                        </Link>
                    </div>
                </div>
            )}

            {/* ── GRID ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2.5">
                        <span className="w-1 h-5 bg-purple-600 rounded-full" />
                        {sectionTitle}
                    </h2>
                    {isFiltered && (
                        <span className="text-sm text-zinc-500">{animeList.length} anime</span>
                    )}
                </div>

                {list.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {list.map((item) => (
                            <Link key={item.id} href={`/anime/${item.id}`} className="group">
                                <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-purple-500/50 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/10 group-hover:shadow-xl">
                                    {item.cover_url ? (
                                        <Image
                                            src={item.cover_url}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-5xl text-zinc-700">🎌</div>
                                    )}

                                    {/* Hover overlay + play */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="w-10 h-10 rounded-full bg-purple-600/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Score badge */}
                                    {item.anilist_data?.averageScore && (
                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-yellow-400 text-[10px] font-bold">
                                            ★ {(item.anilist_data.averageScore / 10).toFixed(1)}
                                        </div>
                                    )}
                                    {/* Episode count */}
                                    {item.available_episodes && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-4">
                                            <span className="text-[10px] text-zinc-300 font-medium">{item.available_episodes} Eps</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 px-0.5">
                                    <h3 className="text-xs sm:text-sm text-zinc-200 line-clamp-1 font-medium group-hover:text-purple-400 transition-colors">
                                        {item.anilist_data?.title?.english ?? item.name}
                                    </h3>
                                    {item.genres && item.genres.length > 0 && (
                                        <p className="text-[10px] text-zinc-600 mt-0.5">{item.genres.slice(0, 2).join(', ')}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <p className="text-4xl mb-4">🎌</p>
                        <p className="text-zinc-400 text-lg">
                            {q ? `Anime "${q}" tidak ditemukan` : 'Tidak ada anime tersedia'}
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
