import Link from 'next/link';
import Image from 'next/image';
import HeaderSearch from './components/HeaderSearch';
import { fetchTrending, fetchSearch, fetchByTag } from '@/lib/api';

const CATEGORIES = [
  { name: 'Romantis', tag: 'Romance' },
  { name: 'Kerajaan (Wuxia)', tag: 'Costume' },
  { name: 'CEO & Bos', tag: 'CEO' },
  { name: 'Fantasi', tag: 'Fantasy' },
  { name: 'Sekolah', tag: 'School' },
  { name: 'Action', tag: 'Action' },
  { name: 'Komedi', tag: 'Comedy' },
  { name: 'Misteri', tag: 'Thriller' },
];

interface Drama {
  id: number;
  title: string;
  cover_url: string;
  introduction?: string;
  chapter_count?: number;
  provider_name?: string;
}

function normalizeDramaList(json: any): Drama[] {
  if (!json) return [];
  if (Array.isArray(json.data)) return json.data;
  return [];
}

async function fetchDramas(query: string, tag: string): Promise<Drama[]> {
  try {
    if (query) return normalizeDramaList(await fetchSearch(query, undefined, 30));
    if (tag) return normalizeDramaList(await fetchByTag(tag, 30));
    return normalizeDramaList(await fetchTrending(30));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const label = params.q || params.tag || '';
  return {
    title: label ? `${label} - Drama China | LoveCN` : 'LoveCN - Nonton Drama China Sub Indo',
    description: label
      ? `Hasil drama china: ${label}`
      : 'Streaming drama China subtitle Indonesia terlengkap.',
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const activeTag = params.tag?.trim() || '';
  const isFiltered = Boolean(query || activeTag);

  const dramas = await fetchDramas(query, activeTag);
  const featured = !isFiltered && dramas.length > 0 ? dramas[0] : null;
  const list = !isFiltered && dramas.length > 0 ? dramas.slice(1) : dramas;

  const sectionTitle = query
    ? `Hasil pencarian: "${query}"`
    : activeTag
      ? `Genre: ${CATEGORIES.find(c => c.tag === activeTag)?.name ?? activeTag}`
      : 'Trending Sekarang';

  return (
    <main className="min-h-screen bg-[#080810] text-white pb-20">

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#080810]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xl font-extrabold tracking-tight">
              Love<span className="text-rose-500">CN</span>
            </span>
          </Link>

          {/* Nav Pills */}
          <nav className="flex gap-1 ml-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white">
              🎬 Drama
            </span>
            <Link href="/anime" className="px-3 py-1 rounded-full text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition">
              🎌 Anime
            </Link>
          </nav>

          <div className="flex-1" />

          <div className="w-[220px] sm:w-[300px]">
            <HeaderSearch />
          </div>
        </div>

        {/* Category Strip */}
        <div className="border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {(query || activeTag) && (
              <Link href="/" className="flex-shrink-0 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
                ← Home
              </Link>
            )}
            {CATEGORIES.map((cat) => {
              const isActive = activeTag === cat.tag;
              return (
                <Link
                  key={cat.tag}
                  href={`/?tag=${cat.tag}`}
                  className={`flex-shrink-0 px-4 py-1 rounded-full text-xs font-medium border transition-all ${isActive
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── HERO FEATURED ──────────────────────────────── */}
      {featured && (
        <div className="relative w-full h-[72vh] overflow-hidden">
          <Image
            src={featured.cover_url}
            alt={featured.title}
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105 brightness-[0.35]"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/90 via-[#080810]/20 to-transparent" />

          <div className="absolute bottom-12 left-6 md:left-12 max-w-xl z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-rose-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">
                🔥 Trending #1
              </span>
              {featured.provider_name && (
                <span className="bg-white/10 backdrop-blur text-zinc-300 text-[11px] px-2 py-1 rounded-full border border-white/10">
                  {featured.provider_name}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-2xl">
              {featured.title}
            </h1>
            {featured.introduction && (
              <p className="text-zinc-300 text-sm md:text-base mb-5 line-clamp-2 leading-relaxed">
                {featured.introduction}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/drama/${featured.id}`}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-rose-600/40 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                ▶ Mulai Nonton
              </Link>
              {featured.chapter_count && (
                <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur text-zinc-300 text-sm px-4 py-2.5 rounded-full border border-white/10">
                  📺 {featured.chapter_count} Episode
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DRAMA GRID ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2.5">
            <span className="w-1 h-5 bg-rose-600 rounded-full" />
            {sectionTitle}
          </h2>
          {isFiltered && (
            <span className="text-sm text-zinc-500">{dramas.length} drama</span>
          )}
        </div>

        {list.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {list.map((item) => (
              <Link key={item.id} href={`/drama/${item.id}`} className="group">
                {/* Poster */}
                <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-rose-500/50 transition-all duration-300 shadow-lg group-hover:shadow-rose-500/10 group-hover:shadow-xl">
                  <Image
                    src={item.cover_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-rose-600/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                      </svg>
                    </div>
                  </div>
                  {/* Episode badge */}
                  {item.chapter_count && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-4">
                      <span className="text-[10px] text-zinc-300 font-medium">{item.chapter_count} Eps</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="mt-2 px-0.5">
                  <h3 className="text-xs sm:text-sm text-zinc-200 line-clamp-1 font-medium group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.provider_name && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">{item.provider_name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-4xl mb-4">🎬</p>
            <p className="text-zinc-400 text-lg">
              {query ? `Drama "${query}" tidak ditemukan` : 'Tidak ada drama tersedia'}
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-rose-400 hover:text-rose-300 underline-offset-2 hover:underline">
              Kembali ke Home
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
