import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Carrega variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  PATRIMONIO_BASE_URL: z.string().url("PATRIMONIO_BASE_URL deve ser uma URL válida"),
  PATRIMONIO_TOKEN: z.string().min(1, "PATRIMONIO_TOKEN é obrigatório"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default("60000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default("100"),
  // Configurações HTTP para acesso remoto
  TRANSPORT_MODE: z.enum(["stdio", "http"]).default("stdio"),
  HTTP_PORT: z.string().transform(Number).pipe(z.number().positive()).default("3000"),
  HTTP_HOST: z.string().default("0.0.0.0"),
  API_KEYS: z.string().optional().transform((val) => val ? val.split(",").map(k => k.trim()) : []),
  ENABLE_CORS: z.string().transform((val) => val === "true").default("true"),
  CORS_ORIGINS: z.string().optional().transform((val) => val ? val.split(",").map(o => o.trim()) : ["*"]),
});

// Tipo inferido do schema
export type Env = z.infer<typeof envSchema>;

// Valida e exporta as variáveis de ambiente
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Erro na validação das variáveis de ambiente:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { env };
