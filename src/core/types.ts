import { z } from "zod";

// Tipos base para o MCP
export interface MCPToolResult {
  content: Array<{
    type: "text";
    text: string;
    [key: string]: unknown;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

export interface MCPToolDefinition {
  title: string;
  description: string;
  inputSchema: Record<string, any>;
}

// Tipos de contexto de requisição
export interface RequestContext {
  baseUrl: string;
  token: string;
  timestamp: Date;
  requestId: string;
}

// Tipos para patrimônio
export interface Patrimonio {
  id: string;
  numero: string;
  setor: string;
  usuario: string;
  tipoEquipamento: string;
  locacao: string;
  descricao?: string;
  valor?: number;
  dataAquisicao?: string;
  [key: string]: any;
}

export interface PatrimonioQuery {
  numero?: string;
  setor?: string;
  usuario?: string;
  id?: string;
}

// Tipos para estatísticas
export interface Estatisticas {
  total: number;
  porSetor: Record<string, number>;
  porTipoEquipamento: Record<string, number>;
  porLocacao: Record<string, number>;
  valorTotal?: number;
}

// Tipos para versionamento
export interface VersionInfo {
  version: string;
  buildTimestamp: string;
  environment?: string;
}

// Tipo para respostas HTTP
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Tipos para logging
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

// Tipos para cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Tipos para rate limiting
export interface RateLimitInfo {
  remaining: number;
  resetAt: Date;
  limit: number;
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

// Tipos para ferramentas (tools)
export interface ToolExecutionContext {
  server: any; // McpServer instance
  requestContext?: RequestContext;
  logEntry: (level: LogLevel, message: string, context?: Record<string, any>) => Promise<void>;
}

export interface ToolParams {
  [key: string]: any;
}
