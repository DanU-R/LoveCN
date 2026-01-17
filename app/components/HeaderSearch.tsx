'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const doSearch = async (val: string) => {
    if (!val) { setResults([]); return; }
    try {
        const res = await fetch(`https://dramabos.asia/api/melolo/api/v1/search?q=${val}&lang=id`);
        const data = await res.json();
        setResults(data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleInput = (e: any) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setTimeout(() => doSearch(e.target.value), 500);
  };

  // Klik luar untuk tutup
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    });
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full md:w-80">
      <input 
        type="text" 
        placeholder="Cari drama..." 
        value={query}
        onChange={handleInput}
        className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-[#1a1a1a] rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto border border-white/10">
            {results.map((d:any, i:number) => (
                <Link key={i} href={`/drama/${d.id}?poster=${d.cover}`} className="flex gap-3 p-3 hover:bg-white/5 border-b border-white/5">
                    <img src={d.cover} className="w-10 h-14 object-cover rounded"/>
                    <div className="text-sm">
                        <div className="font-bold text-white line-clamp-1">{d.title || d.drama_name}</div>
                        <div className="text-xs text-gray-400">Series • {d.rating || 'N/A'}★</div>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}