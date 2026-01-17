import Link from 'next/link';

export default function HeroSection({ featuredDrama }: { featuredDrama: any }) {
  if (!featuredDrama) return null;
  
  // Ambil judul/cover yang tersedia (handle variasi nama dari API)
  const title = featuredDrama.title || featuredDrama.drama_name || "Tanpa Judul";
  const cover = featuredDrama.cover;

  return (
    <div className="relative h-[75vh] w-full overflow-hidden">
        {/* Background Image dengan efek Gelap */}
        <div className="absolute inset-0">
            <img 
                src={cover} 
                alt={title} 
                className="w-full h-full object-cover brightness-[0.6]" 
            />
            {/* Gradasi Hitam dari bawah ke atas agar teks terbaca */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent"></div>
        </div>

        {/* Konten Teks */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-4xl pt-20">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded w-fit mb-4 tracking-wider">
                🔥 TRENDING #1
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-xl">
                {title}
            </h1>
            <p className="text-gray-200 text-sm md:text-lg mb-8 line-clamp-3 max-w-2xl drop-shadow-md">
                {featuredDrama.introduction || "Saksikan drama pilihan terbaik dengan subtitle Indonesia. Kualitas HD dan update setiap hari hanya di LoveCN."}
            </p>
            <div className="flex gap-4">
                <Link 
                    href={`/drama/${featuredDrama.id}?poster=${encodeURIComponent(cover)}`} 
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold transition-transform hover:scale-105 flex items-center gap-2"
                >
                    ▶ MULAI NONTON
                </Link>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-8 py-3.5 rounded-full font-bold transition-all border border-white/30">
                    + Daftar Saya
                </button>
            </div>
        </div>
    </div>
  );
}