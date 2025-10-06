import { fetch } from "undici";
import type { VersionInfo } from "../core/types.js";
import { ExternalError } from "../middleware/errorHandler.js";
import { logger } from "../utils/logger.js";
import { HTTP_TIMEOUT } from "../config/constants.js";

interface FetchOptions {
  baseUrl: string;
}

/**
 * Serviço para interagir com o endpoint de versão
 */
export class VersionService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Busca informações de versão da API
   */
  async fetchVersion(): Promise<VersionInfo> {
    const url = `${this.baseUrl}/version`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
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

      return (await response.json()) as VersionInfo;
    } catch (error) {
      if (error instanceof ExternalError) {
        throw error;
      }

      logger.error(`Error fetching version from ${url}`, error as Error);
      throw new ExternalError(
        `Falha ao obter versão: ${error instanceof Error ? error.message : String(error)}`,
        error as Error
      );
    }
  }
}

// Função auxiliar para compatibilidade com código legado
export async function fetchVersion(options: FetchOptions): Promise<VersionInfo> {
  const service = new VersionService(options.baseUrl);
  return service.fetchVersion();
}
