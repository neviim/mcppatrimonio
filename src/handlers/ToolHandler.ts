import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { BaseTool } from "../tools/BaseTool.js";
import type { RequestContext, ToolExecutionContext } from "../core/types.js";
import { logger } from "../utils/logger.js";
import { generateRequestId } from "../utils/security.js";
import { env } from "../config/env.js";

/**
 * Gerenciador de ferramentas (tools) do MCP
 */
export class ToolHandler {
  private tools: Map<string, BaseTool> = new Map();
  private server: McpServer;

  constructor(server: McpServer) {
    this.server = server;
  }

  /**
   * Registra uma ferramenta no handler e no servidor MCP
   */
  registerTool(tool: BaseTool): void {
    if (this.tools.has(tool.name)) {
      logger.warn(`Tool ${tool.name} already registered, overwriting`);
    }

    this.tools.set(tool.name, tool);

    // Registra a tool no servidor MCP
    this.server.registerTool(
      tool.name,
      tool.getDefinition(),
      async (params: unknown) => {
        return this.executeTool(tool.name, params) as any;
      }
    );

    logger.info(`Tool registered: ${tool.name}`);
  }

  /**
   * Registra múltiplas ferramentas
   */
  registerTools(tools: BaseTool[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  /**
   * Executa uma ferramenta pelo nome
   */
  private async executeTool(toolName: string, params: unknown) {
    const tool = this.tools.get(toolName);

    if (!tool) {
      logger.error(`Tool not found: ${toolName}`);
      return {
        content: [
          {
            type: "text",
            text: `Erro: Ferramenta '${toolName}' não encontrada`,
          },
        ],
        isError: true,
      };
    }

    // Cria contexto de execução
    const requestContext: RequestContext = {
      baseUrl: env.PATRIMONIO_BASE_URL,
      token: env.PATRIMONIO_TOKEN,
      timestamp: new Date(),
      requestId: generateRequestId(),
    };

    const executionContext: ToolExecutionContext = {
      server: this.server,
      requestContext,
      logEntry: async (level, message, context) => {
        const mappedLevel = level === "warn" ? "warning" : level;
        await this.server.sendLoggingMessage({
          level: mappedLevel as "debug" | "info" | "error" | "warning",
          data: { message, context, requestId: requestContext.requestId },
        });
      },
    };

    // Executa a ferramenta
    return tool.execute(params, executionContext);
  }

  /**
   * Obtém uma ferramenta pelo nome
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Lista todas as ferramentas registradas
   */
  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Remove uma ferramenta
   */
  unregisterTool(name: string): boolean {
    const removed = this.tools.delete(name);
    if (removed) {
      logger.info(`Tool unregistered: ${name}`);
    }
    return removed;
  }

  /**
   * Remove todas as ferramentas
   */
  unregisterAll(): void {
    this.tools.clear();
    logger.info("All tools unregistered");
  }
}
