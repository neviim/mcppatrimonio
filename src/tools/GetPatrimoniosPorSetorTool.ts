import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { PatrimonioService } from "../services/patrimonioService.js";
import { commonSchemas } from "../middleware/validator.js";
import { env } from "../config/env.js";

interface GetPatrimoniosPorSetorParams {
  setor: string;
}

/**
 * Tool para obter patrimônios por setor
 */
export class GetPatrimoniosPorSetorTool extends BaseTool<GetPatrimoniosPorSetorParams> {
  readonly name = "neviim_get_patrimonios_por_setor";
  readonly title = "Obter Patrimônios por Setor";
  readonly description = "Busca todos os patrimônios de um setor específico.";
  readonly inputSchema = z.object({
    setor: commonSchemas.setor,
  });

  protected async executeInternal(
    params: GetPatrimoniosPorSetorParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new PatrimonioService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const data = await service.fetchPatrimoniosPorSetor(params.setor);
    return this.success(data);
  }
}
