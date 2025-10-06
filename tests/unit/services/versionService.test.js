import { describe, it, expect, vi, beforeEach } from "vitest";
import { VersionService } from "../../../src/services/versionService.js";
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
describe("VersionService", () => {
    let service;
    const mockBaseUrl = "http://example.com";
    beforeEach(() => {
        vi.clearAllMocks();
        service = new VersionService(mockBaseUrl);
    });
    describe("fetchVersion", () => {
        it("deve buscar versão com sucesso", async () => {
            const mockData = {
                version: "0.1.9",
                build_timestamp: "2025-01-15T10:30:00Z",
            };
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });
            const result = await service.fetchVersion();
            expect(result).toEqual(mockData);
            expect(fetch).toHaveBeenCalledWith("http://example.com/version", expect.objectContaining({
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }));
        });
        it("deve lançar ExternalError quando endpoint não existe (404)", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
                text: async () => "Endpoint não encontrado",
            });
            await expect(service.fetchVersion()).rejects.toThrow(ExternalError);
        });
        it("deve lançar ExternalError em caso de erro HTTP", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Internal Server Error",
                text: async () => "Server error",
            });
            await expect(service.fetchVersion()).rejects.toThrow(ExternalError);
        });
        it("deve lidar com erro de rede", async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));
            await expect(service.fetchVersion()).rejects.toThrow(ExternalError);
        });
        it("não deve enviar Authorization header (endpoint público)", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: "0.1.9" }),
            });
            await service.fetchVersion();
            const callArgs = vi.mocked(fetch).mock.calls[0][1];
            expect(callArgs?.headers).not.toHaveProperty("Authorization");
        });
        it("deve remover trailing slash da baseUrl", () => {
            const serviceWithSlash = new VersionService("http://example.com/");
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: "0.1.9" }),
            });
            serviceWithSlash.fetchVersion();
            expect(fetch).toHaveBeenCalledWith("http://example.com/version", expect.any(Object));
        });
        it("deve incluir timeout na requisição", async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ version: "0.1.9" }),
            });
            await service.fetchVersion();
            expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                signal: expect.any(Object),
            }));
        });
    });
});
//# sourceMappingURL=versionService.test.js.map