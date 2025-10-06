import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolHandler } from "../handlers/ToolHandler.js";
import { ResourceHandler } from "../handlers/ResourceHandler.js";
import { logger } from "../utils/logger.js";
import { APP_NAME, APP_VERSION } from "../config/constants.js";
import type { BaseTool } from "../tools/BaseTool.js";

/**
 * Classe principal que gerencia o servidor MCP
 */
export class NeviimMCPServer {
  private mcpServer: McpServer;
  private toolHandler: ToolHandler;
  private resourceHandler: ResourceHandler;
  private transport: StdioServerTransport;
  private isConnected: boolean = false;

  constructor() {
    // Cria a instância do servidor MCP
    this.mcpServer = new McpServer({
      name: APP_NAME,
      version: APP_VERSION,
    });

    // Cria os handlers
    this.toolHandler = new ToolHandler(this.mcpServer);
    this.resourceHandler = new ResourceHandler(this.mcpServer);

    // Cria o transport
    this.transport = new StdioServerTransport();

    logger.info(`MCP Server initialized: ${APP_NAME} v${APP_VERSION}`);
  }

  /**
   * Registra uma ferramenta
   */
  registerTool(tool: BaseTool): void {
    this.toolHandler.registerTool(tool);
  }

  /**
   * Registra múltiplas ferramentas
   */
  registerTools(tools: BaseTool[]): void {
    this.toolHandler.registerTools(tools);
  }

  /**
   * Obtém o handler de ferramentas
   */
  getToolHandler(): ToolHandler {
    return this.toolHandler;
  }

  /**
   * Obtém o handler de recursos
   */
  getResourceHandler(): ResourceHandler {
    return this.resourceHandler;
  }

  /**
   * Conecta o servidor ao transport
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn("Server already connected");
      return;
    }

    try {
      await this.mcpServer.connect(this.transport);
      this.isConnected = true;
      logger.info("MCP Server connected successfully");
    } catch (error) {
      logger.error("Failed to connect MCP Server", error as Error);
      throw error;
    }
  }

  /**
   * Desconecta o servidor
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.warn("Server not connected");
      return;
    }

    try {
      await this.mcpServer.close();
      this.isConnected = false;
      logger.info("MCP Server disconnected");
    } catch (error) {
      logger.error("Error disconnecting MCP Server", error as Error);
      throw error;
    }
  }

  /**
   * Verifica se o servidor está conectado
   */
  isServerConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Obtém a instância do servidor MCP (para acesso direto se necessário)
   */
  getMCPServer(): McpServer {
    return this.mcpServer;
  }
}
