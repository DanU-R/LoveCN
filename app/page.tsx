import Link from 'next/link';
import Image from 'next/image';
import HeaderSearch from './components/HeaderSearch';
import DramaRow, { DramaRowSkeleton } from './components/DramaRow'; // 

// --- DATA KATEGORI ---
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

// --- TIPE DATA ---
interface Drama {
  id: string | number;
  title?: string;
  drama_name?: string;
  name?: string;
  cover: string;
  rating?: number | string;
}

// --- HELPER FUNCTIONS ---
function getTitle(item: Drama): string {
  return item.title || item.drama_name || item.name || 'Drama Tanpa Judul';
}

const getDramas = (json: any): Drama[] => {
  if (!json) return [];
  if (json.data && Array.isArray(json.data.list)) return json.data.list;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
};

// --- DATA FETCHING ---
async function fetchDramas(query: string = ''): Promise<Drama[]> {
  try {
    let url = '';
    if (query) {
      // API Search (juga dipakai untuk Kategori)
      url = `https://dramabos.asia/api/melolo/api/v1/search?q=${encodeURIComponent(query)}&lang=id&count=20`;
    } else {
      // API Home
      url = `https://dramabos.asia/api/melolo/api/v1/home?offset=0&count=30&lang=id`;
    }

    const res = await fetch(url, {
      next: { revalidate: query ? 300 : 1800 }, 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!res.ok) throw new Error(`Gagal: ${res.status}`);
    const json = await res.json();
    return getDramas(json);
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// --- METADATA SEO ---
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q || '';
  return {
    title: query ? `${query} - Drama China | LoveCN` : 'LoveCN - Nonton Drama China Sub Indo',
    description: query 
      ? `Nonton drama china kategori ${query} subtitle Indonesia.` 
      : 'Streaming Drama China terbaru subtitle Indonesia.',
  };
}

// --- KOMPONEN UTAMA ---
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q || '';
  
  const dramas = await fetchDramas(query);

  // Logic: Kalau ada query (pencarian/kategori), tidak ada featured banner
  const featured = !query && dramas.length > 0 ? dramas[0] : null;
  const list = !query && dramas.length > 0 ? dramas.slice(1) : dramas;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      
      {/* === HEADER (Sticky) === */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all">
        {/* Bar Atas: Logo & Search */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold font-serif tracking-tighter group flex-shrink-0">
            Love<span className="text-red-600 group-hover:text-red-500 transition-colors">CN</span>
          </Link>
          <HeaderSearch />
        </div>

        {/* Bar Bawah: KATEGORI (Scrollable) */}
        <div className="border-t border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {/* Tombol Home Kecil */}
                    {query && (
                        <Link 
                            href="/" 
                            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-red-600/20 text-red-500 border border-red-600/30 text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                        >
                            🏠 Home
                        </Link>
                    )}

                    {/* Loop Categories */}
                    {CATEGORIES.map((cat) => {
                        const isActive = query.toLowerCase() === cat.slug;
                        return (
                            <Link 
                                key={cat.slug} 
                                href={`/?q=${cat.slug}`}
                                className={`
                                    flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-white text-black border-white font-bold scale-105' 
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/30'
                                    }
                                `}
                            >
                                {cat.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
      </header>

      {/* === HERO SECTION (Hanya muncul di Home Awal) === */}
      {featured && (
        <div className="relative w-full h-[55vh] md:h-[75vh] overflow-hidden group">
          <Image 
            src={featured.cover}
            alt={getTitle(featured)}
            fill
            className="object-cover brightness-[0.5] group-hover:brightness-[0.6] transition-all duration-700"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-4xl">
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded mb-3 inline-block shadow-lg">
              🔥 TRENDING #1
            </span>
            <h1 className="text-3xl md:text-6xl font-extrabold text-white mb-3 leading-tight drop-shadow-2xl">
              {getTitle(featured)}
            </h1>
            <div className="flex gap-3 mt-6">
                <Link 
                  href={`/drama/${featured.id}?poster=${encodeURIComponent(featured.cover)}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-red-900/50 shadow-lg"
                >
                  ▶ MULAI NONTON
                </Link>
            </div>
          </div>
        </div>
      )}

      {/* === LIST CONTENT === */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600 rounded-full"></span>
          {query ? <span className="capitalize">{query.replace('search?q=', '')} Drama</span> : "Rekomendasi Terbaru"}
        </h2>

        {dramas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
            {list.map((item: Drama, idx: number) => {
              if (!item.id || !item.cover) return null;
              return (
                <Link 
                  key={idx} 
                  href={`/drama/${item.id}`} 
                  className="group block"
                >
                  <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-[#1a1a1a]">
                    <Image 
                      src={item.cover}
                      alt={getTitle(item)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      loading="lazy"
                    />
                    {item.rating && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-[10px] text-yellow-400 font-bold border border-white/10">
                        ★ {item.rating}
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-red-500 transition-colors">
                      {getTitle(item)}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-gray-400 font-medium mb-2">
                Drama "{query}" tidak ditemukan 😔
            </p>
            <Link href="/" className="text-red-500 text-sm hover:underline">
                Reset Pencarian
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}