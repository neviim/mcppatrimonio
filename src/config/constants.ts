export const APP_NAME = "neviim";
export const APP_VERSION = "0.2.0";
export const APP_DESCRIPTION = "Servidor MCP para gestão de patrimônio - homeLab Jads";

// Timeouts (em ms)
export const HTTP_TIMEOUT = 30000;
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000;

// Cache
export const CACHE_TTL = 300000; // 5 minutos
export const CACHE_MAX_SIZE = 100;

// Rate Limiting
export const DEFAULT_RATE_LIMIT_WINDOW = 60000; // 1 minuto
export const DEFAULT_RATE_LIMIT_MAX = 100;

// Headers padrão
export const DEFAULT_HEADERS = {
  "Accept": "application/json",
  "Content-Type": "application/json",
} as const;

// Endpoints da API
export const API_ENDPOINTS = {
  PATRIMONIOS: "/api/v1/patrimonios",
  ESTATISTICAS: "/api/v1/estatisticas",
  VERSION: "/version",
} as const;
