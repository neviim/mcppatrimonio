import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetPatrimonioTool } from "../../../src/tools/GetPatrimonioTool.js";
import { PatrimonioService } from "../../../src/services/patrimonioService.js";
import type { ToolExecutionContext } from "../../../src/core/types.js";
import { NotFoundError } from "../../../src/middleware/errorHandler.js";

vi.mock("../../../src/services/patrimonioService.js");
vi.mock("../../../src/config/env.js", () => ({
  env: {
    PATRIMONIO_BASE_URL: "http://example.com",
    PATRIMONIO_TOKEN: "test-token",
  },
}));

describe("GetPatrimonioTool", () => {
  let tool: GetPatrimonioTool;
  let mockContext: ToolExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
    tool = new GetPatrimonioTool();
    mockContext = {
      server: {} as any,
      logEntry: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("metadata", () => {
    it("deve ter nome correto", () => {
      expect(tool.name).toBe("neviim_get_patrimonio");
    });

    it("deve ter título correto", () => {
      expect(tool.title).toBe("Obter Patrimônio");
    });

    it("deve ter descrição correta", () => {
      expect(tool.description).toBe("Retorna informações de um patrimônio pelo número.");
    });
  });

  describe("execute", () => {
    it("deve executar busca com sucesso", async () => {
      const mockData = {
        id: "1",
        Patrimonio: "12345",
        Usuario: "João",
        Setor: "TI",
      };

      const mockFetchPatrimonio = vi.fn().mockResolvedValue(mockData);
      vi.mocked(PatrimonioService).mockImplementation(() => ({
        fetchPatrimonio: mockFetchPatrimonio,
      }) as any);

      const result = await tool.execute({ numero: "12345" }, mockContext);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(JSON.parse(result.content[0].text)).toEqual(mockData);
      expect(mockFetchPatrimonio).toHaveBeenCalledWith("12345");
    });

    it("deve retornar erro quando patrimônio não existe", async () => {
      const mockFetchPatrimonio = vi.fn().mockRejectedValue(
        new NotFoundError("Patrimônio não encontrado")
      );
      vi.mocked(PatrimonioService).mockImplementation(() => ({
        fetchPatrimonio: mockFetchPatrimonio,
      }) as any);

      const result = await tool.execute({ numero: "99999" }, mockContext);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Patrimônio não encontrado");
    });

    it("deve retornar erro de validação para parâmetros inválidos", async () => {
      const result = await tool.execute({ numero: "" } as any, mockContext);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Erro de validação");
    });

    it("deve criar PatrimonioService com credenciais corretas", async () => {
      const mockFetchPatrimonio = vi.fn().mockResolvedValue({ id: "1" });
      const mockConstructor = vi.fn().mockImplementation(() => ({
        fetchPatrimonio: mockFetchPatrimonio,
      }));
      vi.mocked(PatrimonioService).mockImplementation(mockConstructor as any);

      await tool.execute({ numero: "12345" }, mockContext);

      expect(mockConstructor).toHaveBeenCalledWith(
        "http://example.com",
        "test-token"
      );
    });
  });

  describe("validação de schema", () => {
    it("deve aceitar número de patrimônio válido", () => {
      const result = tool.inputSchema.safeParse({ numero: "12345" });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar número vazio", () => {
      const result = tool.inputSchema.safeParse({ numero: "" });
      expect(result.success).toBe(false);
    });

    it("deve aceitar número com caracteres permitidos", () => {
      const result = tool.inputSchema.safeParse({ numero: "ABC-123" });
      expect(result.success).toBe(true);
    });
  });
});
