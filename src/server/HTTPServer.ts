import express, { type Application } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { StreamableHTTPTransport } from "../transport/StreamableHTTPTransport.js";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import type { NeviimMCPServer } from "../core/MCPServer.js";

/**
 * Servidor HTTP para conexões remotas MCP usando Streamable HTTP
 */
export class HTTPServer {
  private app: Application;
  private mcpServer: NeviimMCPServer;
  private activeSessions: Map<string, StreamableHTTPTransport> = new Map();
  private server?: any;

  constructor(mcpServer: NeviimMCPServer) {
    this.app = express();
    this.mcpServer = mcpServer;
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Configura middlewares do Express
   */
  private setupMiddleware(): void {
    // Parser JSON
    this.app.use(express.json());

    // CORS
    if (env.ENABLE_CORS) {
      this.app.use(
        cors({
          origin: env.CORS_ORIGINS,
          credentials: true,
        })
      );
    }

    // Logging de requisições
    this.app.use((req, res, next) => {
      logger.debug("HTTP Request", {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      next();
    });
  }

  /**
   * Configura as rotas da API
   */
  private setupRoutes(): void {
    // Health check (público)
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        service: "MCP Patrimonio Server",
        timestamp: new Date().toISOString(),
        transport: "streamable-http",
      });
    });

    // Informações do servidor (público)
    this.app.get("/info", (req, res) => {
      res.json({
        name: "MCP Patrimonio Server",
        version: "0.2.0",
        transport: "streamable-http",
        capabilities: {
          tools: true,
          resources: true,
          prompts: false,
        },
      });
    });

    // Inicia uma nova sessão MCP (requer autenticação)
    this.app.post("/mcp/session", authMiddleware, async (req: AuthenticatedRequest, res) => {
      try {
        const sessionId = uuidv4();
        logger.info("Creating new MCP session", {
          sessionId,
          keyId: req.apiKeyId,
          ip: req.ip,
        });

        // Cria um transporte para esta sessão
        const transport = new StreamableHTTPTransport(req, res, sessionId);

        // Armazena a sessão
        this.activeSessions.set(sessionId, transport);

        // Remove a sessão quando fechada
        transport.onclose = () => {
          this.activeSessions.delete(sessionId);
          logger.info("MCP session closed", { sessionId });
        };

        // Conecta o transport ao servidor MCP
        await this.mcpServer.getMCPServer().connect(transport);

        logger.info("MCP session established", {
          sessionId,
          totalSessions: this.activeSessions.size,
        });
      } catch (error) {
        logger.error("Failed to create MCP session", error as Error);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to create MCP session",
          });
        }
      }
    });

    // Envia mensagem para uma sessão existente (requer autenticação)
    this.app.post("/mcp/message/:sessionId", authMiddleware, async (req: AuthenticatedRequest, res) => {
      try {
        const { sessionId } = req.params;
        const message = req.body;

        const transport = this.activeSessions.get(sessionId);
        if (!transport) {
          res.status(404).json({
            error: "Not Found",
            message: "Session not found or expired",
          });
          return;
        }

        if (transport.isClosed()) {
          this.activeSessions.delete(sessionId);
          res.status(410).json({
            error: "Gone",
            message: "Session has been closed",
          });
          return;
        }

        // Processa a mensagem
        transport.handleMessage(message);

        res.status(202).json({
          status: "accepted",
          sessionId,
        });
      } catch (error) {
        logger.error("Failed to process message", error as Error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to process message",
        });
      }
    });

    // Lista sessões ativas (requer autenticação)
    this.app.get("/mcp/sessions", authMiddleware, (req: AuthenticatedRequest, res) => {
      const sessions = Array.from(this.activeSessions.entries()).map(([id, transport]) => ({
        sessionId: id,
        active: !transport.isClosed(),
      }));

      res.json({
        count: sessions.length,
        sessions,
      });
    });

    // Fecha uma sessão (requer autenticação)
    this.app.delete("/mcp/session/:sessionId", authMiddleware, async (req: AuthenticatedRequest, res) => {
      try {
        const { sessionId } = req.params;

        const transport = this.activeSessions.get(sessionId);
        if (!transport) {
          res.status(404).json({
            error: "Not Found",
            message: "Session not found",
          });
          return;
        }

        await transport.close();
        this.activeSessions.delete(sessionId);

        logger.info("MCP session terminated", { sessionId });

        res.json({
          status: "closed",
          sessionId,
        });
      } catch (error) {
        logger.error("Failed to close session", error as Error);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to close session",
        });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: "Not Found",
        message: "Endpoint not found",
      });
    });

    // Error handler
    this.app.use((err: Error, req: any, res: any, next: any) => {
      logger.error("Express error handler", err);
      res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    });
  }

  /**
   * Inicia o servidor HTTP
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(env.HTTP_PORT, env.HTTP_HOST, () => {
          logger.info(`HTTP Server listening on ${env.HTTP_HOST}:${env.HTTP_PORT}`);
          logger.info(`MCP endpoint: http://${env.HTTP_HOST}:${env.HTTP_PORT}/mcp/session`);
          resolve();
        });

        this.server.on("error", (error: Error) => {
          logger.error("HTTP Server error", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Para o servidor HTTP
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      // Fecha todas as sessões ativas
      for (const [sessionId, transport] of this.activeSessions.entries()) {
        logger.info("Closing session during shutdown", { sessionId });
        transport.close();
      }
      this.activeSessions.clear();

      this.server.close((err: Error) => {
        if (err) {
          logger.error("Error stopping HTTP server", err);
          reject(err);
        } else {
          logger.info("HTTP Server stopped");
          resolve();
        }
      });
    });
  }

  /**
   * Obtém o número de sessões ativas
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }
}
