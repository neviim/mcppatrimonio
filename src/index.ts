#!/usr/bin/env node

/**
 * Entry point do servidor MCP Neviim
 */

import { NeviimMCPServer } from "./core/MCPServer.js";
import { HTTPServerNative } from "./server/HTTPServerNative.js";
import { logger } from "./utils/logger.js";
import { env } from "./config/env.js";

// Importa todas as ferramentas
import {
  InfoTool,
  GetPatrimonioTool,
  GetPatrimoniosPorSetorTool,
  GetPatrimoniosPorUsuarioTool,
  GetPatrimonioPorIdTool,
  UpdatePatrimonioTool,
  CreatePatrimonioTool,
  GetEstatisticasTool,
  GetVersionTool,
} from "./tools/index.js";

/**
 * Inicializa e inicia o servidor no modo STDIO
 */
async function startStdioMode(server: NeviimMCPServer) {
  logger.info("Starting in STDIO mode...");

  // Conecta o servidor usando STDIO transport
  await server.connect();

  logger.info("Patrimonio MCP Server is running in STDIO mode");
}

/**
 * Inicializa e inicia o servidor no modo HTTP
 */
async function startHttpMode(server: NeviimMCPServer) {
  logger.info("Starting in HTTP mode...");
  logger.info(`HTTP Host: ${env.HTTP_HOST}`);
  logger.info(`HTTP Port: ${env.HTTP_PORT}`);

  if (!env.API_KEYS || env.API_KEYS.length === 0) {
    logger.warn("⚠️  No API keys configured - HTTP endpoint will be unsecured!");
    logger.warn("⚠️  Set API_KEYS environment variable for production use");
  } else {
    logger.info(`✓ Authentication enabled with ${env.API_KEYS.length} API key(s)`);
  }

  // Cria e inicia o servidor HTTP
  const httpServer = new HTTPServerNative(server);
  await httpServer.start();

  logger.info("Patrimonio MCP Server is running in HTTP mode");

  return httpServer;
}

/**
 * Inicializa e inicia o servidor
 */
async function main() {
  let httpServer: HTTPServerNative | undefined;

  try {
    logger.info("Starting Patrimonio MCP Server...");
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Log Level: ${env.LOG_LEVEL}`);
    logger.info(`Transport Mode: ${env.TRANSPORT_MODE}`);

    // Cria a instância do servidor
    const server = new NeviimMCPServer();

    // Registra todas as ferramentas
    const tools = [
      new InfoTool(),
      new GetPatrimonioTool(),
      new GetPatrimoniosPorSetorTool(),
      new GetPatrimoniosPorUsuarioTool(),
      new GetPatrimonioPorIdTool(),
      new UpdatePatrimonioTool(),
      new CreatePatrimonioTool(),
      new GetEstatisticasTool(),
      new GetVersionTool(),
    ];

    server.registerTools(tools);

    logger.info(`Registered ${tools.length} tools`);

    // Inicia o servidor no modo apropriado
    if (env.TRANSPORT_MODE === "http") {
      httpServer = await startHttpMode(server);
    } else {
      await startStdioMode(server);
    }

    // Tratamento de sinais de encerramento
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        if (httpServer) {
          await httpServer.stop();
        }
        await server.disconnect();
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown", error as Error);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // Tratamento de erros não capturados
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection", reason as Error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server", error as Error);
    process.exit(1);
  }
}

// Inicia o servidor
main();
