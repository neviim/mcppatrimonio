import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { PatrimonioService } from "../services/patrimonioService.js";
import { commonSchemas } from "../middleware/validator.js";
import { env } from "../config/env.js";

interface GetPatrimonioParams {
  numero: string;
}

/**
 * Tool para obter patrimônio por número
 */
export class GetPatrimonioTool extends BaseTool<GetPatrimonioParams> {
  readonly name = "neviim_get_patrimonio";
  readonly title = "Obter Patrimônio";
  readonly description = "Retorna informações de um patrimônio pelo número.";
  readonly inputSchema = z.object({
    numero: commonSchemas.patrimonioNumero,
  });

  protected async executeInternal(
    params: GetPatrimonioParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new PatrimonioService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const data = await service.fetchPatrimonio(params.numero);
    return this.success(data);
  }
}
