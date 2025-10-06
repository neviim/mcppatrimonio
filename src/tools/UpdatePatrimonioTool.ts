import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { PatrimonioService } from "../services/patrimonioService.js";
import { commonSchemas } from "../middleware/validator.js";
import { env } from "../config/env.js";

interface UpdatePatrimonioParams {
  id: string;
  data: Record<string, any>;
}

/**
 * Tool para atualizar patrimônio
 */
export class UpdatePatrimonioTool extends BaseTool<UpdatePatrimonioParams> {
  readonly name = "neviim_update_patrimonio";
  readonly title = "Atualizar Patrimônio";
  readonly description = "Atualiza informações de um patrimônio específico pelo seu ID.";
  readonly inputSchema = z.object({
    id: commonSchemas.patrimonioId,
    data: commonSchemas.patrimonioData,
  });

  protected async executeInternal(
    params: UpdatePatrimonioParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new PatrimonioService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const result = await service.updatePatrimonio(params.id, params.data);
    return this.success(result);
  }
}
