import { fetch } from "undici";
import type { Patrimonio } from "../core/types.js";
import { ExternalError, NotFoundError } from "../middleware/errorHandler.js";
import { logger } from "../utils/logger.js";
import { HTTP_TIMEOUT } from "../config/constants.js";

interface FetchOptions {
  baseUrl: string;
  token: string;
}

interface PatrimonioFetchOptions extends FetchOptions {
  numero?: string;
  setor?: string;
  usuario?: string;
  id?: string;
}

/**
 * Serviço para interagir com a API de patrimônios
 */
export class PatrimonioService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
  }

  /**
   * Faz uma requisição HTTP para a API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: AbortSignal.timeout(HTTP_TIMEOUT),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");

        if (response.status === 404) {
          throw new NotFoundError(`Recurso não encontrado: ${url}`);
        }

        throw new ExternalError(
          `HTTP ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ExternalError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error fetching ${url}`, error as Error);
      throw new ExternalError(
        `Falha na comunicação com a API: ${error instanceof Error ? error.message : String(error)}`,
        error as Error
      );
    }
  }

  /**
   * Busca um patrimônio pelo número
   */
  async fetchPatrimonio(numero: string): Promise<Patrimonio> {
    return this.request<Patrimonio>(
      `/api/v1/patrimonios/patrimonio/${encodeURIComponent(numero)}`
    );
  }

  /**
   * Busca patrimônios por setor
   */
  async fetchPatrimoniosPorSetor(setor: string): Promise<Patrimonio[]> {
    return this.request<Patrimonio[]>(
      `/api/v1/patrimonios/setor/${encodeURIComponent(setor)}`
    );
  }

  /**
   * Busca patrimônios por usuário
   */
  async fetchPatrimoniosPorUsuario(usuario: string): Promise<Patrimonio[]> {
    return this.request<Patrimonio[]>(
      `/api/v1/patrimonios/usuario/${encodeURIComponent(usuario)}`
    );
  }

  /**
   * Busca um patrimônio por ID
   */
  async fetchPatrimonioPorId(id: string): Promise<Patrimonio> {
    return this.request<Patrimonio>(
      `/api/v1/patrimonios/${encodeURIComponent(id)}`
    );
  }

  /**
   * Atualiza um patrimônio
   */
  async updatePatrimonio(id: string, data: Partial<Patrimonio>): Promise<Patrimonio> {
    return this.request<Patrimonio>(`/api/v1/patrimonios/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Cria um novo patrimônio
   */
  async createPatrimonio(data: Partial<Patrimonio>): Promise<Patrimonio> {
    return this.request<Patrimonio>("/api/v1/patrimonios/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Funções auxiliares para compatibilidade com código legado
export async function fetchPatrimonio(options: PatrimonioFetchOptions): Promise<Patrimonio> {
  const service = new PatrimonioService(options.baseUrl, options.token);
  return service.fetchPatrimonio(options.numero!);
}

export async function fetchPatrimoniosPorSetor(
  options: PatrimonioFetchOptions
): Promise<Patrimonio[]> {
  const service = new PatrimonioService(options.baseUrl, options.token);
  return service.fetchPatrimoniosPorSetor(options.setor!);
}

export async function fetchPatrimoniosPorUsuario(
  options: PatrimonioFetchOptions
): Promise<Patrimonio[]> {
  const service = new PatrimonioService(options.baseUrl, options.token);
  return service.fetchPatrimoniosPorUsuario(options.usuario!);
}

export async function fetchPatrimonioPorId(
  options: PatrimonioFetchOptions
): Promise<Patrimonio> {
  const service = new PatrimonioService(options.baseUrl, options.token);
  return service.fetchPatrimonioPorId(options.id!);
}

export async function updatePatrimonio(
  options: PatrimonioFetchOptions & { data: Partial<Patrimonio> }
): Promise<Patrimonio> {
  const service = new PatrimonioService(options.baseUrl, options.token);
  return service.updatePatrimonio(options.id!, options.data);
}

export async function createPatrimonio(
  options: PatrimonioFetchOptions & { data: Partial<Patrimonio> }
): Promise<Patrimonio> {
  const service = new PatrimonioService(options.baseUrl, options.token);
  return service.createPatrimonio(options.data);
}
