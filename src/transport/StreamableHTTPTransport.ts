import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";

/**
 * Implementação de transporte usando Streamable HTTP
 * para permitir conexões remotas seguras via HTTP com streaming bidirecional
 */
export class StreamableHTTPTransport implements Transport {
  private req: Request;
  private res: Response;
  private closed: boolean = false;
  private _sessionId: string;

  onmessage?: (message: unknown) => void;
  onerror?: (error: Error) => void;
  onclose?: () => void;

  constructor(req: Request, res: Response, sessionId: string) {
    this.req = req;
    this.res = res;
    this._sessionId = sessionId;

    // Configura headers para streaming HTTP
    this.res.setHeader("Content-Type", "application/json");
    this.res.setHeader("Cache-Control", "no-cache");
    this.res.setHeader("Connection", "keep-alive");
    this.res.setHeader("X-Accel-Buffering", "no");
    this.res.setHeader("Transfer-Encoding", "chunked");

    // Detecta quando o cliente fecha a conexão
    this.req.on("close", () => {
      logger.debug("HTTP client disconnected", { sessionId: this._sessionId });
      this.close();
    });

    logger.debug("StreamableHTTPTransport created", { sessionId: this._sessionId });
  }

  /**
   * Inicia o transporte
   */
  async start(): Promise<void> {
    logger.debug("StreamableHTTP transport started", { sessionId: this._sessionId });
  }

  /**
   * Envia uma mensagem JSON-RPC para o cliente
   */
  async send(message: unknown): Promise<void> {
    if (this.closed) {
      throw new Error("Transport is closed");
    }

    try {
      const data = JSON.stringify(message);
      // Envia como linha separada por newline para streaming
      this.res.write(data + "\n");
      logger.debug("HTTP message sent", { sessionId: this._sessionId, message });
    } catch (error) {
      logger.error("Failed to send HTTP message", error as Error);
      throw error;
    }
  }

  /**
   * Processa mensagem recebida do cliente
   */
  handleMessage(message: unknown): void {
    if (this.closed) {
      logger.warn("Received message on closed transport", { sessionId: this._sessionId });
      return;
    }

    try {
      if (this.onmessage) {
        this.onmessage(message);
      }
    } catch (error) {
      logger.error("Error handling message", error as Error);
      if (this.onerror) {
        this.onerror(error as Error);
      }
    }
  }

  /**
   * Fecha o transporte
   */
  async close(): Promise<void> {
    if (this.closed) {
      return;
    }

    this.closed = true;

    try {
      if (!this.res.writableEnded) {
        this.res.end();
      }
      logger.debug("StreamableHTTP transport closed", { sessionId: this._sessionId });

      if (this.onclose) {
        this.onclose();
      }
    } catch (error) {
      logger.error("Error closing HTTP transport", error as Error);
    }
  }

  /**
   * Verifica se o transporte está fechado
   */
  isClosed(): boolean {
    return this.closed;
  }

  /**
   * Obtém o ID da sessão
   */
  getSessionId(): string {
    return this._sessionId;
  }
}
