import { beforeEach, afterEach, vi } from "vitest";

/**
 * Setup global para testes
 */

// Limpa todos os mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks();
});

// Restaura mocks após cada teste
afterEach(() => {
  vi.restoreAllMocks();
});

// Configuração de variáveis de ambiente para testes
export const setupTestEnv = () => {
  process.env.PATRIMONIO_BASE_URL = "http://test.example.com";
  process.env.PATRIMONIO_TOKEN = "test-token-123";
};

export const cleanupTestEnv = () => {
  delete process.env.PATRIMONIO_BASE_URL;
  delete process.env.PATRIMONIO_TOKEN;
};
