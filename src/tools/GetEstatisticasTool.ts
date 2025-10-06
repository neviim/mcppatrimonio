import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { EstatisticasService } from "../services/estatisticasService.js";
import { env } from "../config/env.js";

/**
 * Tool para obter estatísticas
 */
export class GetEstatisticasTool extends BaseTool<Record<string, never>> {
  readonly name = "neviim_get_estatisticas";
  readonly title = "Obter Estatísticas";
  readonly description =
    "Retorna estatísticas sobre os patrimônios: total, totais por setor, tipo de equipamento e locação.";
  readonly inputSchema = z.object({});

  protected async executeInternal(
    params: Record<string, never>,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new EstatisticasService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const data = await service.fetchEstatisticas();
    return this.success(data);
  }
}
