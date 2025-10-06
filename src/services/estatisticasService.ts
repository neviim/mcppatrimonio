import { fetch } from "undici";
import type { Estatisticas } from "../core/types.js";
import { ExternalError } from "../middleware/errorHandler.js";
import { logger } from "../utils/logger.js";
import { HTTP_TIMEOUT } from "../config/constants.js";

interface FetchOptions {
  baseUrl: string;
  token: string;
}

/**
 * Serviço para interagir com a API de estatísticas
 */
export class EstatisticasService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
  }

  /**
   * Busca estatísticas gerais
   */
  async fetchEstatisticas(): Promise<Estatisticas> {
    const url = `${this.baseUrl}/api/v1/estatisticas/`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(HTTP_TIMEOUT),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new ExternalError(
          `HTTP ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`
        );
      }

      return (await response.json()) as Estatisticas;
    } catch (error) {
      if (error instanceof ExternalError) {
        throw error;
      }

      logger.error(`Error fetching statistics from ${url}`, error as Error);
      throw new ExternalError(
        `Falha ao obter estatísticas: ${error instanceof Error ? error.message : String(error)}`,
        error as Error
      );
    }
  }
}

// Função auxiliar para compatibilidade com código legado
export async function fetchEstatisticas(options: FetchOptions): Promise<Estatisticas> {
  const service = new EstatisticasService(options.baseUrl, options.token);
  return service.fetchEstatisticas();
}
