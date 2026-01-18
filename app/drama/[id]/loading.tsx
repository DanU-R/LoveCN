export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white animate-pulse">
      
      {/* 1. Header Skeleton */}
      <nav className="border-b border-white/5 px-4 py-4 flex items-center gap-4 bg-[#0a0a0a]">
        <div className="w-8 h-8 bg-white/10 rounded"></div> {/* Tombol Back */}
        <div className="w-1/3 h-6 bg-white/10 rounded"></div> {/* Judul */}
      </nav>

      <div className="max-w-[1600px] mx-auto p-0 md:p-6 grid grid-cols-1 lg:grid-cols-3 md:gap-6">
        
        {/* 2. Kolom Kiri: Player & Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Kotak Video Besar */}
          <div className="w-full aspect-video bg-white/5 md:rounded-xl border border-white/5 flex items-center justify-center relative">
             {/* Icon Loading di tengah */}
             <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
             </div>
             {/* Text Loading */}
             <div className="absolute bottom-4 left-4 w-32 h-4 bg-white/10 rounded"></div>
          </div>

          {/* Kotak Info Judul & Sinopsis */}
          <div className="p-4 space-y-4 bg-[#151515] md:rounded-xl border border-white/5">
             <div className="w-1/2 h-8 bg-white/10 rounded"></div> {/* Judul */}
             <div className="flex gap-2">
                <div className="w-12 h-5 bg-white/10 rounded"></div>
                <div className="w-20 h-5 bg-white/10 rounded"></div>
             </div>
             <div className="space-y-2 pt-2">
                <div className="w-full h-3 bg-white/5 rounded"></div>
                <div className="w-full h-3 bg-white/5 rounded"></div>
                <div className="w-3/4 h-3 bg-white/5 rounded"></div>
             </div>
          </div>
        </div>

        {/* 3. Kolom Kanan: List Episode */}
        <div className="lg:col-span-1 p-4 md:p-0">
           <div className="bg-[#151515] rounded-xl border border-white/5 h-[600px] overflow-hidden flex flex-col">
              {/* Header List */}
              <div className="p-4 border-b border-white/5 bg-white/5">
                 <div className="w-1/3 h-6 bg-white/10 rounded"></div>
              </div>
              
              {/* Item List Episode */}
              <div className="p-2 space-y-2 flex-1 overflow-hidden">
                 {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-lg border border-white/5">
                        {/* Kotak Nomor */}
                        <div className="w-16 h-12 bg-white/10 rounded flex-shrink-0"></div>
                        {/* Teks */}
                        <div className="flex-1 space-y-2">
                            <div className="w-1/2 h-4 bg-white/10 rounded"></div>
                            <div className="w-1/3 h-3 bg-white/5 rounded"></div>
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}