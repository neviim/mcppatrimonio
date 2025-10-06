import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatrimonioService } from "../../../src/services/patrimonioService.js";
import { ExternalError, NotFoundError } from "../../../src/middleware/errorHandler.js";
import { fetch } from "undici";

vi.mock("undici", () => ({
  fetch: vi.fn(),
}));

vi.mock("../../../src/utils/logger.js", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PatrimonioService", () => {
  let service: PatrimonioService;
  const mockBaseUrl = "http://example.com";
  const mockToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PatrimonioService(mockBaseUrl, mockToken);
  });

  describe("fetchPatrimonio", () => {
    it("deve buscar patrimônio com sucesso", async () => {
      const mockData = {
        id: "1",
        Patrimonio: "12345",
        Usuario: "João",
        Setor: "TI",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as any);

      const result = await service.fetchPatrimonio("12345");

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        "http://example.com/api/v1/patrimonios/patrimonio/12345",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("deve lançar NotFoundError quando patrimônio não existe", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Patrimônio não encontrado",
      } as any);

      await expect(service.fetchPatrimonio("99999")).rejects.toThrow(NotFoundError);
    });

    it("deve lançar ExternalError em caso de erro HTTP", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Server error",
      } as any);

      await expect(service.fetchPatrimonio("12345")).rejects.toThrow(ExternalError);
    });

    it("deve fazer URL encoding do número do patrimônio", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }),
      } as any);

      await service.fetchPatrimonio("ABC/123");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("ABC%2F123"),
        expect.any(Object)
      );
    });
  });

  describe("fetchPatrimoniosPorSetor", () => {
    it("deve buscar patrimônios por setor com sucesso", async () => {
      const mockData = [
        { id: "1", Setor: "TI" },
        { id: "2", Setor: "TI" },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as any);

      const result = await service.fetchPatrimoniosPorSetor("TI");

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        "http://example.com/api/v1/patrimonios/setor/TI",
        expect.any(Object)
      );
    });

    it("deve retornar array vazio quando setor não tem patrimônios", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any);

      const result = await service.fetchPatrimoniosPorSetor("Vazio");

      expect(result).toEqual([]);
    });

    it("deve fazer URL encoding do nome do setor", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any);

      await service.fetchPatrimoniosPorSetor("Recursos Humanos");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("Recursos%20Humanos"),
        expect.any(Object)
      );
    });
  });

  describe("fetchPatrimoniosPorUsuario", () => {
    it("deve buscar patrimônios por usuário com sucesso", async () => {
      const mockData = [
        { id: "1", Usuario: "João Silva" },
        { id: "2", Usuario: "João Silva" },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as any);

      const result = await service.fetchPatrimoniosPorUsuario("João Silva");

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("Jo%C3%A3o%20Silva"),
        expect.any(Object)
      );
    });
  });

  describe("fetchPatrimonioPorId", () => {
    it("deve buscar patrimônio por ID com sucesso", async () => {
      const mockData = {
        id: "507f1f77bcf86cd799439011",
        Patrimonio: "12345",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as any);

      const result = await service.fetchPatrimonioPorId("507f1f77bcf86cd799439011");

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        "http://example.com/api/v1/patrimonios/507f1f77bcf86cd799439011",
        expect.any(Object)
      );
    });
  });

  describe("updatePatrimonio", () => {
    it("deve atualizar patrimônio com sucesso", async () => {
      const updateData = { Usuario: "Novo Usuário" };
      const mockResponse = {
        id: "1",
        Patrimonio: "12345",
        Usuario: "Novo Usuário",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await service.updatePatrimonio("1", updateData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        "http://example.com/api/v1/patrimonios/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
    });

    it("deve lançar NotFoundError quando patrimônio não existe", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "",
      } as any);

      await expect(
        service.updatePatrimonio("inexistente", { Usuario: "Teste" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("createPatrimonio", () => {
    it("deve criar patrimônio com sucesso", async () => {
      const newData = {
        Patrimonio: "12345",
        Usuario: "João",
        Setor: "TI",
      };
      const mockResponse = {
        id: "1",
        ...newData,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await service.createPatrimonio(newData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        "http://example.com/api/v1/patrimonios/",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newData),
        })
      );
    });

    it("deve lançar ExternalError em caso de erro 400", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "Dados inválidos",
      } as any);

      await expect(
        service.createPatrimonio({ Patrimonio: "" })
      ).rejects.toThrow(ExternalError);
    });
  });

  describe("tratamento de erros", () => {
    it("deve lidar com timeout", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Timeout"));

      await expect(service.fetchPatrimonio("12345")).rejects.toThrow(ExternalError);
    });

    it("deve lidar com erro de rede", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      await expect(service.fetchPatrimonio("12345")).rejects.toThrow(ExternalError);
    });
  });

  describe("configuração", () => {
    it("deve remover trailing slash da baseUrl", () => {
      const serviceWithSlash = new PatrimonioService("http://example.com/", mockToken);

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }),
      } as any);

      serviceWithSlash.fetchPatrimonio("12345");

      expect(fetch).toHaveBeenCalledWith(
        "http://example.com/api/v1/patrimonios/patrimonio/12345",
        expect.any(Object)
      );
    });

    it("deve incluir headers corretos em todas as requisições", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1" }),
      } as any);

      await service.fetchPatrimonio("12345");

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer test-token",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
      );
    });
  });
});
