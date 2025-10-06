import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";
import { PatrimonioService } from "../services/patrimonioService.js";
import { commonSchemas } from "../middleware/validator.js";
import { env } from "../config/env.js";

interface GetPatrimoniosPorUsuarioParams {
  usuario: string;
}

/**
 * Tool para obter patrimônios por usuário
 */
export class GetPatrimoniosPorUsuarioTool extends BaseTool<GetPatrimoniosPorUsuarioParams> {
  readonly name = "neviim_get_patrimonios_por_usuario";
  readonly title = "Obter Patrimônios por Usuário";
  readonly description = "Busca todos os patrimônios de um usuário específico.";
  readonly inputSchema = z.object({
    usuario: commonSchemas.usuario,
  });

  protected async executeInternal(
    params: GetPatrimoniosPorUsuarioParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    const service = new PatrimonioService(env.PATRIMONIO_BASE_URL, env.PATRIMONIO_TOKEN);
    const data = await service.fetchPatrimoniosPorUsuario(params.usuario);
    return this.success(data);
  }
}
