import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NeviimMCPServer } from "../../src/core/MCPServer.js";
import { PatrimonioService } from "../../src/services/patrimonioService.js";

vi.mock("../../src/services/patrimonioService.js");
vi.mock("../../src/services/estatisticasService.js");
vi.mock("../../src/services/versionService.js");

describe("MCP Server Integration", () => {
  let server: NeviimMCPServer;

  beforeAll(() => {
    process.env.PATRIMONIO_BASE_URL = "http://example.com";
    process.env.PATRIMONIO_TOKEN = "test-token";
  });

  afterAll(() => {
    delete process.env.PATRIMONIO_BASE_URL;
    delete process.env.PATRIMONIO_TOKEN;
  });

  describe("Server initialization", () => {
    it("deve criar servidor MCP com sucesso", () => {
      expect(() => {
        server = new NeviimMCPServer();
      }).not.toThrow();
    });

    it("deve ter nome e versão corretos", () => {
      server = new NeviimMCPServer();
      expect(server).toBeDefined();
      expect(server.getMCPServer()).toBeDefined();
    });

    it("deve ter tool handler definido", () => {
      server = new NeviimMCPServer();
      expect(server.getToolHandler()).toBeDefined();
    });

    it("deve ter resource handler definido", () => {
      server = new NeviimMCPServer();
      expect(server.getResourceHandler()).toBeDefined();
    });
  });
});
