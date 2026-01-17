import Link from 'next/link';

export default function DramaRow({ dramas }: { dramas: any[] }) {
  if (!dramas || dramas.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dramas.map((drama, idx) => {
            const title = drama.title || drama.drama_name || "Drama";
            return (
                <Link 
                    key={idx} 
                    href={`/drama/${drama.id}?poster=${encodeURIComponent(drama.cover)}`} 
                    className="group relative block bg-[#1a1a1a] rounded-lg overflow-hidden transition-all duration-300 hover:z-10 hover:scale-105 hover:shadow-2xl hover:shadow-red-900/20"
                >
                    {/* Gambar Poster */}
                    <div className="aspect-[3/4] overflow-hidden relative">
                        <img 
                            src={drama.cover} 
                            alt={title} 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:brightness-110" 
                        />
                        {/* Rating Pojok Kanan */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] text-yellow-400 font-bold border border-white/10">
                            ★ {drama.rating || '4.5'}
                        </div>
                    </div>

                    {/* Judul (Hanya muncul saat hover atau di bawah) */}
                    <div className="p-3 bg-[#181818]">
                        <h3 className="text-sm font-medium text-gray-200 truncate group-hover:text-red-500 transition-colors">
                            {title}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-1">
                            {drama.year || 'Series'} • Subtitle Indo
                        </p>
                    </div>
                </Link>
            );
        })}
    </div>
  );
}

// Efek Loading (Tulang-tulang)
export function DramaRowSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-800 rounded-lg"></div>
            ))}
        </div>
    );
}