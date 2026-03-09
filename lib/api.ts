const BASE_URL = 'https://api-short.stor.co.id';
const API_KEY = process.env.API_KEY || process.env.STOR_API_KEY || '';

const defaultHeaders = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function sdramaFetch(path: string, revalidate = 3600) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate },
      headers: defaultHeaders,
    });
    if (!res.ok) throw new Error(`SDrama API Error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('SDrama Fetch Error:', error);
    return null;
  }
}

async function sdramaFetchNoCache(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      cache: 'no-store',
      headers: defaultHeaders,
    });
    if (!res.ok) throw new Error(`SDrama API Error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('SDrama Fetch Error:', error);
    return null;
  }
}

// ─── Drama List ──────────────────────────────────────────────────────────────

/** Drama trending (diprioritaskan bahasa China) */
export async function fetchTrending(perPage = 30) {
  return sdramaFetch(`/api/dramas/trending?language=zh&per_page=${perPage}`, 1800);
}

/** Drama populer */
export async function fetchPopular(perPage = 30) {
  return sdramaFetch(`/api/dramas/popular?language=zh&per_page=${perPage}`, 1800);
}

/** Cari drama berdasarkan query dan/atau tag */
export async function fetchSearch(q: string, tag?: string, perPage = 30) {
  const params = new URLSearchParams({ q, per_page: String(perPage) });
  if (tag) params.set('tag', tag);
  return sdramaFetch(`/api/search?${params.toString()}`, 300);
}

/** Daftar drama berdasarkan tag (genre) */
export async function fetchByTag(tag: string, perPage = 30) {
  return sdramaFetch(`/api/dramas?tag=${encodeURIComponent(tag)}&language=zh&per_page=${perPage}`, 1800);
}

// ─── Drama Detail ─────────────────────────────────────────────────────────────

/** Detail drama + episode (URL bertanda waktu valid 1 jam) */
export async function fetchDramaDetail(id: string | number) {
  // Signed URLs expire tiap jam, jadi jangan cache terlalu lama
  return sdramaFetchNoCache(`/api/dramas/${id}`);
}

/** List episode dengan pagination (signed URLs) */
export async function fetchEpisodes(id: string | number, page = 1, perPage = 100) {
  return sdramaFetchNoCache(`/api/dramas/${id}/episodes?page=${page}&per_page=${perPage}&status=published`);
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export async function fetchTags() {
  return sdramaFetch('/api/tags', 86400);
}

export async function fetchProviders() {
  return sdramaFetch('/api/providers', 86400);
}

// ─── Anime ────────────────────────────────────────────────────────────────────

/** Anime populer */
export async function fetchAnimePopular(perPage = 30) {
  return sdramaFetch(`/api/anime/popular?per_page=${perPage}`, 1800);
}

/** Anime terbaru */
export async function fetchAnimeLatest(perPage = 30) {
  return sdramaFetch(`/api/anime/latest?per_page=${perPage}`, 1800);
}

/** Anime spotlight */
export async function fetchAnimeSpotlight() {
  return sdramaFetch('/api/anime/spotlight', 1800);
}

/** Filter anime berdasarkan genre */
export async function fetchAnimeByGenre(genre: string, perPage = 30) {
  return sdramaFetch(`/api/anime?genre=${encodeURIComponent(genre)}&per_page=${perPage}`, 1800);
}

/** Cari anime */
export async function fetchAnimeSearch(q: string, perPage = 30) {
  return sdramaFetch(`/api/anime/search?q=${encodeURIComponent(q)}&per_page=${perPage}`, 300);
}

/** Daftar genre anime */
export async function fetchAnimeGenres() {
  return sdramaFetch('/api/anime/genres', 86400);
}

/** Detail anime (termasuk episode_count) */
export async function fetchAnimeDetail(id: string) {
  return sdramaFetchNoCache(`/api/anime/${id}`);
}

/** List episode anime (hanya metadata, tanpa signed URL) */
export async function fetchAnimeEpisodes(id: string, page = 1, perPage = 50) {
  return sdramaFetchNoCache(`/api/anime/${id}/episodes?page=${page}&per_page=${perPage}`);
}

/** Data satu episode dengan signed video URL + subtitles */
export async function fetchAnimeEpisode(id: string, ep: number) {
  return sdramaFetchNoCache(`/api/anime/${id}/episodes/${ep}`);
}
