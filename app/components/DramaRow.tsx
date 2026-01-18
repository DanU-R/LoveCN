import Link from 'next/link';

export default function DramaRow({ dramas }: { dramas: any[] }) {
  if (!dramas || dramas.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {dramas.map((drama, idx) => {
        const title = drama.title || drama.drama_name || 'Drama';

        return (
          <Link
            key={idx}
            href={`/drama/${drama.id}`}
            className="group flex items-center gap-4 bg-[#1a1a1a] p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all duration-300"
          >
            <div className="w-16 h-20 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={drama.cover}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-bold text-gray-200 truncate group-hover:text-red-500 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-[10px] md:text-xs">
                <span className="text-yellow-400 font-bold flex items-center gap-1">
                  ★ {drama.rating || '4.5'}
                </span>
                <span className="text-gray-500 font-medium">
                  {drama.year || 'Series'} • Sub Indo
                </span>
              </div>
            </div>

            <div className="pr-2">
              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                >
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                </svg>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function DramaRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-24 bg-gray-800/50 rounded-xl border border-white/5 flex items-center gap-4 p-3"
        >
          <div className="w-16 h-20 bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
