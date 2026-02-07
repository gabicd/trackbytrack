// Cache em memória simples com TTL

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 24 * 60 * 60 * 1000; // 24 horas em ms
  }

  // Gera chave única para o cache
  generateKey(artist, album) {
    return `${artist.toLowerCase().trim()}-${album.toLowerCase().trim()}`;
  }

  // Busca do cache
  get(artist, album) {
    const key = this.generateKey(artist, album);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Verifica se expirou
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Cache HIT: ${key}`);
    return cached.data;
  }

  // Salva no cache
  set(artist, album, data, ttl = this.defaultTTL) {
    const key = this.generateKey(artist, album);
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      createdAt: Date.now()
    });

    console.log(`💾 Cache SET: ${key} (TTL: ${ttl / 1000 / 60 / 60}h)`);
  }

  // Limpa cache expirado (pode rodar periodicamente)
  cleanExpired() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache limpo: ${cleaned} itens expirados removidos`);
    }
  }

  // Estatísticas do cache
  stats() {
    return {
      size: this.cache.size,
      items: Array.from(this.cache.keys())
    };
  }

  // Limpa todo o cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }
}

export const cache = new MemoryCache();

// Limpa cache expirado a cada 1 hora
setInterval(() => cache.cleanExpired(), 60 * 60 * 1000);
