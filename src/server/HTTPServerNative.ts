import express, { type Application } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import type { NeviimMCPServer } from "../core/MCPServer.js";

/**
 * Servidor HTTP para conexões remotas MCP usando Streamable HTTP nativo do SDK
 */
export class HTTPServerNative {
  private app: Application;
  private mcpServer: NeviimMCPServer;
  private transports: Map<string, StreamableHTTPServerTransport> = new Map();
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

    // Endpoint MCP via StreamableHTTP (requer autenticação)
    this.app.post("/mcp", authMiddleware, async (req: AuthenticatedRequest, res) => {
      try {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // Stateless mode
        });

        // Conecta o transport ao servidor MCP
        await this.mcpServer.getMCPServer().connect(transport);

        logger.info("Handling MCP request", {
          keyId: req.apiKeyId,
          ip: req.ip,
        });

        // Processa a requisição (passando req.body como terceiro parâmetro)
        await transport.handleRequest(req, res, req.body);

        // Cleanup quando a requisição terminar
        res.on("close", () => {
          logger.debug("MCP request closed");
          transport.close();
        });
      } catch (error) {
        logger.error("Failed to handle MCP request", error as Error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          });
        }
      }
    });

    // Lista sessões ativas (requer autenticação)
    this.app.get("/mcp/sessions", authMiddleware, (req: AuthenticatedRequest, res) => {
      const sessions = Array.from(this.transports.keys()).map((sessionId) => ({
        sessionId,
        active: true,
      }));

      res.json({
        count: sessions.length,
        sessions,
      });
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
          logger.info(`MCP endpoint: http://${env.HTTP_HOST}:${env.HTTP_PORT}/mcp`);
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

      // Limpa todas as sessões
      this.transports.clear();

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
    return this.transports.size;
  }
}
