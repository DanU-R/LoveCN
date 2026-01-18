import Link from 'next/link';
import Image from 'next/image';
import HeaderSearch from './components/HeaderSearch';

const CATEGORIES = [
  { name: 'Romantis', slug: 'romance' },
  { name: 'Kerajaan (Wuxia)', slug: 'costume' },
  { name: 'CEO & Bos', slug: 'ceo' },
  { name: 'Fantasi', slug: 'fantasy' },
  { name: 'Sekolah', slug: 'school' },
  { name: 'Action', slug: 'action' },
  { name: 'Komedi', slug: 'comedy' },
  { name: 'Misteri', slug: 'mystery' },
];

interface Drama {
  id: string | number;
  title?: string;
  drama_name?: string;
  name?: string;
  cover: string;
  rating?: number | string;
}

function getTitle(item: Drama): string {
  return item.title || item.drama_name || item.name || 'Drama Tanpa Judul';
}

function normalizeList(json: any): Drama[] {
  if (!json) return [];
  if (Array.isArray(json.data?.list)) return json.data.list;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

async function fetchDramas(query = ''): Promise<Drama[]> {
  try {
    const url = query
      ? `https://dramabos.asia/api/melolo/api/v1/search?q=${encodeURIComponent(
          query
        )}&lang=id&count=20`
      : `https://dramabos.asia/api/melolo/api/v1/home?offset=0&count=30&lang=id`;

    const res = await fetch(url, {
      next: { revalidate: query ? 300 : 1800 },
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!res.ok) return [];
    const json = await res.json();
    return normalizeList(json);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  return {
    title: query
      ? `${query} - Drama China | LoveCN`
      : 'LoveCN - Nonton Drama China Sub Indo',
    description: query
      ? `Hasil pencarian drama china kategori ${query}`
      : 'Streaming drama China subtitle Indonesia',
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const isSearch = Boolean(query);

  const dramas = await fetchDramas(query);

  const featured = !isSearch && dramas.length > 0 ? dramas[0] : null;
  const list = !isSearch && dramas.length > 0 ? dramas.slice(1) : dramas;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold font-serif tracking-tight flex-shrink-0"
          >
            Love<span className="text-red-600">CN</span>
          </Link>

          <div className="flex-1" />

          <div className="w-[260px] sm:w-[320px]">
            <HeaderSearch />
          </div>
        </div>

        <div className="border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {query && (
              <Link
                href="/"
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-red-600/20 text-red-500 text-xs font-bold"
              >
                Home
              </Link>
            )}

            {CATEGORIES.map((cat) => {
              const active = query === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/?q=${cat.slug}`}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs border transition ${
                    active
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {featured && (
        <div className="relative w-full h-[70vh]">
          <Image
            src={featured.cover}
            alt={getTitle(featured)}
            fill
            priority
            className="object-cover brightness-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          <div className="absolute bottom-10 left-6 max-w-xl">
            <h1 className="text-4xl font-extrabold mb-4">
              {getTitle(featured)}
            </h1>
            <Link
              href={`/drama/${featured.id}`}
              className="bg-red-600 px-6 py-3 rounded-full font-bold"
            >
              ▶ Mulai Nonton
            </Link>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600 rounded-full" />
          {isSearch ? (
            <>
              Hasil untuk:{' '}
              <span className="text-red-500 capitalize">{query}</span>
            </>
          ) : (
            'Rekomendasi Terbaru'
          )}
        </h2>

        {isSearch && (
          <p className="text-sm text-gray-500 mb-6">
            Ditemukan {dramas.length} drama
          </p>
        )}

        {list.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.map((item) => (
              <Link key={item.id} href={`/drama/${item.id}`} className="group">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-[#1a1a1a]">
                  <Image
                    src={item.cover}
                    alt={getTitle(item)}
                    fill
                    className="object-cover group-hover:scale-110 transition"
                  />
                </div>
                <h3 className="mt-2 text-sm text-gray-200 line-clamp-1 group-hover:text-red-500">
                  {getTitle(item)}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            Drama "{query}" tidak ditemukan
          </div>
        )}
      </section>
    </main>
  );
}
