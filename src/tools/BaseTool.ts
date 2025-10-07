import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type {
  MCPToolResult,
  MCPToolDefinition,
  ToolExecutionContext,
  ToolParams,
} from "../core/types.js";
import { handleToolError } from "../middleware/errorHandler.js";
import { validateWithSchema } from "../middleware/validator.js";
import { logger } from "../utils/logger.js";

/**
 * Classe abstrata base para todas as ferramentas MCP
 */
export abstract class BaseTool<TInput extends ToolParams = ToolParams> {
  abstract readonly name: string;
  abstract readonly title: string;
  abstract readonly description: string;
  abstract readonly inputSchema: z.ZodType<TInput>;

  /**
   * Retorna a definição da ferramenta para registro no MCP
   */
  getDefinition(): MCPToolDefinition {
    return {
      title: this.title,
      description: this.description,
      inputSchema: zodToJsonSchema(this.inputSchema, {
        name: this.name,
        $refStrategy: "none",
      }) as any,
    };
  }

  /**
   * Método abstrato que deve ser implementado por cada ferramenta
   */
  protected abstract executeInternal(
    params: TInput,
    context: ToolExecutionContext
  ): Promise<MCPToolResult>;

  /**
   * Executa a ferramenta com validação e tratamento de erros
   */
  async execute(
    params: unknown,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    try {
      // Valida os parâmetros de entrada
      const validationResult = validateWithSchema(this.inputSchema, params);

      if (!validationResult.isValid) {
        const errorMessages = validationResult.errors
          ?.map((err) => `${err.field}: ${err.message}`)
          .join(", ");

        await context.logEntry("error", `Validation failed for ${this.name}`, {
          errors: validationResult.errors,
        });

        return {
          content: [
            {
              type: "text",
              text: `Erro de validação: ${errorMessages}`,
            },
          ],
          isError: true,
        };
      }

      // Log de início da execução
      await context.logEntry("info", `Executing tool: ${this.name}`, {
        params: validationResult.data,
      });

      // Executa a ferramenta
      const result = await this.executeInternal(
        validationResult.data as TInput,
        context
      );

      // Log de sucesso
      await context.logEntry("info", `Tool ${this.name} executed successfully`);

      return result;
    } catch (error) {
      logger.error(`Error executing tool ${this.name}`, error as Error);
      return handleToolError(error, this.name);
    }
  }

  /**
   * Método auxiliar para criar uma resposta de sucesso
   */
  protected success(data: any): MCPToolResult {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  /**
   * Método auxiliar para criar uma resposta de erro
   */
  protected error(message: string): MCPToolResult {
    return {
      content: [
        {
          type: "text",
          text: `Erro: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
