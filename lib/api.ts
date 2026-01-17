const BASE_URL = "https://dramabos.asia/api/melolo"; 

export const fetchAPI = async (endpoint: string) => {
  try {
    // Menambahkan header User-Agent agar tidak diblokir server
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      next: { revalidate: 3600 }, 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Gagal Fetch:", error);
    return null;
  }
};