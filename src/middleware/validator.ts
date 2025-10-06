import { z } from "zod";
import type { ValidationResult, ValidationError } from "../core/types.js";

/**
 * Valida dados usando um schema Zod
 */
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult & { data?: T } {
  try {
    const validated = schema.parse(data);
    return {
      isValid: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        value: err.path.reduce((obj: any, key) => obj?.[key], data),
      }));

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: [
        {
          field: "unknown",
          message: error instanceof Error ? error.message : "Erro desconhecido",
        },
      ],
    };
  }
}

/**
 * Valida se uma string é um número de patrimônio válido
 */
export function isValidPatrimonioNumero(numero: string): boolean {
  return /^[A-Za-z0-9-_]+$/.test(numero) && numero.length > 0;
}

/**
 * Valida se uma string é um ID válido (UUID ou similar)
 */
export function isValidId(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) || (id.length > 0 && id.length <= 100);
}

/**
 * Schemas de validação comuns
 */
export const commonSchemas = {
  patrimonioNumero: z
    .string()
    .min(1, "Número do patrimônio é obrigatório")
    .refine(isValidPatrimonioNumero, {
      message: "Número do patrimônio inválido",
    }),

  patrimonioId: z
    .string()
    .min(1, "ID do patrimônio é obrigatório")
    .refine(isValidId, {
      message: "ID do patrimônio inválido",
    }),

  setor: z.string().min(1, "Nome do setor é obrigatório"),

  usuario: z.string().min(1, "Nome do usuário é obrigatório"),

  patrimonioData: z.record(z.any()).refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Dados do patrimônio não podem estar vazios",
    }
  ),
};
