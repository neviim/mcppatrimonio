import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { VersionService } from "../services/versionService.js";
import { env } from "../config/env.js";

/**
 * Tool para obter versão da API
 */
export class GetVersionTool extends BaseTool<Record<string, never>> {
  readonly name = "neviim_get_version";
  readonly title = "Obter Versão da API";
  readonly description = "Retorna a versão da aplicação e o timestamp do build.";
  readonly inputSchema = z.object({});

  protected async executeInternal(
    params: Record<string, never>,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new VersionService(env.PATRIMONIO_BASE_URL);
    const data = await service.fetchVersion();
    return this.success(data);
  }
}
