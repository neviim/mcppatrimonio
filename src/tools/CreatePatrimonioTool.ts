import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { PatrimonioService } from "../services/patrimonioService.js";
import { commonSchemas } from "../middleware/validator.js";
import { env } from "../config/env.js";

interface CreatePatrimonioParams {
  data: Record<string, any>;
}

/**
 * Tool para criar patrimônio
 */
export class CreatePatrimonioTool extends BaseTool<CreatePatrimonioParams> {
  readonly name = "neviim_create_patrimonio";
  readonly title = "Criar Patrimônio";
  readonly description = "Cria um novo registro de patrimônio.";
  readonly inputSchema = z.object({
    data: commonSchemas.patrimonioData,
  });

  protected async executeInternal(
    params: CreatePatrimonioParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new PatrimonioService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const result = await service.createPatrimonio(params.data);
    return this.success(result);
  }
}
