import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { APP_NAME, APP_VERSION, APP_DESCRIPTION } from "../config/constants.js";

/**
 * Tool de informações sobre o servidor
 */
export class InfoTool extends BaseTool<Record<string, never>> {
  readonly name = "info";
  readonly title = "Informações de Neviim";
  readonly description = "Retorna alguns dados da homeLab Jads.";
  readonly inputSchema = z.object({});

  protected async executeInternal(
    params: Record<string, never>,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    return this.success({
      name: APP_NAME,
      version: APP_VERSION,
      description: APP_DESCRIPTION,
      message: "homeLab Jads, uma LLM sendo treinada com dados de automação residencial.",
    });
  }
}
