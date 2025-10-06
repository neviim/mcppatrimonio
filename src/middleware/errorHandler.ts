import type { MCPToolResult } from "../core/types.js";
import { logger } from "../utils/logger.js";

/**
 * Classe base para erros customizados
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Autenticação falhou") {
    super(message, 401, true);
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso não encontrado") {
    super(message, 404, true);
  }
}

/**
 * Erro de rate limit excedido
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Limite de requisições excedido") {
    super(message, 429, true);
  }
}

/**
 * Erro externo (API, rede, etc.)
 */
export class ExternalError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message, 502, true);
  }
}

/**
 * Trata erros e converte para MCPToolResult
 */
export function handleToolError(error: unknown, context?: string): MCPToolResult {
  let message: string;
  let statusCode: number = 500;

  if (error instanceof AppError) {
    message = error.message;
    statusCode = error.statusCode;
    logger.error(`[${context || "Tool"}] AppError: ${message}`, error, {
      statusCode,
      isOperational: error.isOperational,
    });
  } else if (error instanceof Error) {
    message = error.message;
    logger.error(`[${context || "Tool"}] Error: ${message}`, error);
  } else {
    message = String(error);
    logger.error(`[${context || "Tool"}] Unknown error: ${message}`);
  }

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

/**
 * Wrapper para executar funções com tratamento de erro
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Converte erros desconhecidos em AppError
    logger.error(`[${context || "SafeExecute"}] Unexpected error`, error as Error);
    throw new AppError(
      `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`,
      500,
      false
    );
  }
}

/**
 * Verifica se um erro é operacional (esperado) ou crítico
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
