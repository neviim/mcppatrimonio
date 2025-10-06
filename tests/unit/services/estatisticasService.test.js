import { describe, it, expect, vi, beforeEach } from "vitest";
import { EstatisticasService } from "../../../src/services/estatisticasService.js";
import { ExternalError } from "../../../src/middleware/errorHandler.js";
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
describe("EstatisticasService", () => {
    let service;
    const mockBaseUrl = "http://example.com";
    const mockToken = "test-token";
    beforeEach(() => {
        vi.clearAllMocks();
        service = new EstatisticasService(mockBaseUrl, mockToken);
    });
    describe("fetchEstatisticas", () => {
        it("deve buscar estatísticas com sucesso", async () => {
            const mockData = {
                total_patrimonios: 100,
                por_setor: {
                    TI: { total: 50, subtotal: 50 },
                    RH: { total: 50, subtotal: 50 },
                },
                por_tipo_equipamento: {},
                por_locacao: {},
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });
            const result = await service.fetchEstatisticas();
            expect(result).toEqual(mockData);
            expect(fetch).toHaveBeenCalledWith("http://example.com/api/v1/estatisticas/", expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    Authorization: "Bearer test-token",
                    Accept: "application/json",
                }),
            }));
        });
        it("deve lançar ExternalError quando API retorna erro", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Internal Server Error",
                text: async () => "Server error",
            });
            await expect(service.fetchEstatisticas()).rejects.toThrow(ExternalError);
        });
        it("deve lançar ExternalError quando token é inválido (401)", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: "Unauthorized",
                text: async () => "Token inválido",
            });
            await expect(service.fetchEstatisticas()).rejects.toThrow(ExternalError);
        });
        it("deve lidar com erro de rede", async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));
            await expect(service.fetchEstatisticas()).rejects.toThrow(ExternalError);
        });
        it("deve incluir timeout na requisição", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ total_patrimonios: 0 }),
            });
            await service.fetchEstatisticas();
            expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                signal: expect.any(Object),
            }));
        });
        it("deve remover trailing slash da baseUrl", () => {
            const serviceWithSlash = new EstatisticasService("http://example.com/", mockToken);
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ total_patrimonios: 0 }),
            });
            serviceWithSlash.fetchEstatisticas();
            expect(fetch).toHaveBeenCalledWith("http://example.com/api/v1/estatisticas/", expect.any(Object));
        });
    });
});
//# sourceMappingURL=estatisticasService.test.js.map