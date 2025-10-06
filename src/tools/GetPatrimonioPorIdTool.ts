import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { PatrimonioService } from "../services/patrimonioService.js";
import { commonSchemas } from "../middleware/validator.js";
import { env } from "../config/env.js";

interface GetPatrimonioPorIdParams {
  id: string;
}

/**
 * Tool para obter patrimônio por ID
 */
export class GetPatrimonioPorIdTool extends BaseTool<GetPatrimonioPorIdParams> {
  readonly name = "neviim_get_patrimonio_por_id";
  readonly title = "Obter Patrimônio por ID";
  readonly description = "Busca um patrimônio específico pelo seu ID único.";
  readonly inputSchema = z.object({
    id: commonSchemas.patrimonioId,
  });

  protected async executeInternal(
    params: GetPatrimonioPorIdParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new PatrimonioService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const data = await service.fetchPatrimonioPorId(params.id);
    return this.success(data);
  }
}
