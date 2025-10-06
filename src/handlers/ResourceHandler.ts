import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../utils/logger.js";

/**
 * Interface para definição de recursos
 */
interface ResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * Gerenciador de recursos do MCP
 */
export class ResourceHandler {
  private resources: Map<string, ResourceDefinition> = new Map();
  private server: McpServer;

  constructor(server: McpServer) {
    this.server = server;
  }

  /**
   * Registra um recurso
   */
  registerResource(resource: ResourceDefinition): void {
    if (this.resources.has(resource.uri)) {
      logger.warn(`Resource ${resource.uri} already registered, overwriting`);
    }

    this.resources.set(resource.uri, resource);
    logger.info(`Resource registered: ${resource.uri}`);
  }

  /**
   * Registra múltiplos recursos
   */
  registerResources(resources: ResourceDefinition[]): void {
    for (const resource of resources) {
      this.registerResource(resource);
    }
  }

  /**
   * Obtém um recurso pelo URI
   */
  getResource(uri: string): ResourceDefinition | undefined {
    return this.resources.get(uri);
  }

  /**
   * Lista todos os recursos registrados
   */
  listResources(): ResourceDefinition[] {
    return Array.from(this.resources.values());
  }

  /**
   * Remove um recurso
   */
  unregisterResource(uri: string): boolean {
    const removed = this.resources.delete(uri);
    if (removed) {
      logger.info(`Resource unregistered: ${uri}`);
    }
    return removed;
  }

  /**
   * Remove todos os recursos
   */
  unregisterAll(): void {
    this.resources.clear();
    logger.info("All resources unregistered");
  }
}
