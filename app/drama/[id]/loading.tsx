export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white animate-pulse pb-20">
      
      {/* === HEADER SKELETON === */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/5">
        {/* Bar Atas */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo Skeleton */}
          <div className="w-24 h-8 bg-white/10 rounded"></div>
          {/* Search Bar Skeleton */}
          <div className="w-full max-w-xs h-10 bg-white/10 rounded-full"></div>
        </div>

        {/* Bar Kategori */}
        <div className="border-t border-white/5 bg-white/[0.02]">
           <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-20 h-7 bg-white/5 rounded-full flex-shrink-0"></div>
              ))}
           </div>
        </div>
      </div>

      {/* === HERO SECTION SKELETON === */}
      <div className="relative w-full h-[55vh] md:h-[75vh] bg-white/5 flex items-end">
          <div className="w-full p-6 md:p-12 max-w-4xl space-y-4">
             <div className="w-24 h-6 bg-white/10 rounded"></div>
             <div className="w-3/4 md:w-1/2 h-10 md:h-16 bg-white/10 rounded"></div>
             <div className="w-32 h-10 bg-white/10 rounded-full"></div>
          </div>
      </div>

      {/* === LIST CONTENT SKELETON === */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-1 h-6 bg-white/20 rounded-full"></div>
           <div className="w-48 h-6 bg-white/10 rounded"></div>
        </div>

        {/* Grid Poster */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
            {[...Array(10)].map((_, idx) => (
                <div key={idx} className="space-y-3">
                    {/* Gambar Poster */}
                    <div className="aspect-[2/3] bg-white/5 rounded-lg border border-white/5"></div>
                    {/* Judul */}
                    <div className="space-y-2">
                        <div className="w-full h-4 bg-white/10 rounded"></div>
                        <div className="w-2/3 h-3 bg-white/5 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}