#!/usr/bin/env node

/**
 * Entry point do servidor MCP Neviim
 */

import { NeviimMCPServer } from "./core/MCPServer.js";
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
 * Inicializa e inicia o servidor
 */
async function main() {
  try {
    logger.info("Starting Patrimonio MCP Server...");
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Log Level: ${env.LOG_LEVEL}`);

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

    // Conecta o servidor
    await server.connect();

    logger.info("Patrimonio MCP Server is running");

    // Tratamento de sinais de encerramento
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
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
