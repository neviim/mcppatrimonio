import crypto from "node:crypto";

/**
 * Gera um ID único para requisições
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Sanitiza uma string removendo caracteres potencialmente perigosos
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>\"'`]/g, "");
}

/**
 * Valida se uma URL é segura
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Mascara tokens e informações sensíveis para logs
 */
export function maskSensitiveData(data: string): string {
  if (data.length <= 8) {
    return "***";
  }
  return `${data.slice(0, 4)}...${data.slice(-4)}`;
}

/**
 * Rate limiter simples em memória
 */
export class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Verifica se uma chave excedeu o limite de requisições
   */
  check(key: string): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove timestamps fora da janela de tempo
    const validTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const resetAt = new Date(oldestTimestamp + this.windowMs);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetAt: new Date(now + this.windowMs),
    };
  }

  /**
   * Limpa o rate limiter para uma chave específica
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Limpa todos os rate limiters
   */
  clearAll(): void {
    this.requests.clear();
  }
}

/**
 * Cache simples em memória com TTL
 */
export class InMemoryCache<T> {
  private cache: Map<string, { data: T; expiresAt: number }> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Armazena um valor no cache
   */
  set(key: string, value: T, ttl: number): void {
    // Se o cache está cheio, remove o item mais antigo
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Recupera um valor do cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Remove um valor do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
