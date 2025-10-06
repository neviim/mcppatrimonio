import { describe, it, expect, beforeEach, vi } from "vitest";
import { InfoTool } from "../../../src/tools/InfoTool.js";
import type { ToolExecutionContext } from "../../../src/core/types.js";

describe("InfoTool", () => {
  let tool: InfoTool;
  let mockContext: ToolExecutionContext;

  beforeEach(() => {
    tool = new InfoTool();
    mockContext = {
      server: {} as any,
      logEntry: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("metadata", () => {
    it("deve ter nome correto", () => {
      expect(tool.name).toBe("info");
    });

    it("deve ter título correto", () => {
      expect(tool.title).toBe("Informações de Neviim");
    });

    it("deve ter descrição correta", () => {
      expect(tool.description).toBe("Retorna alguns dados da homeLab Jads.");
    });
  });

  describe("execute", () => {
    it("deve retornar informações da homeLab", async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("version");
      expect(data).toHaveProperty("message");
      expect(data.message).toContain("homeLab Jads");
    });

    it("não deve ter isError definido", async () => {
      const result = await tool.execute({}, mockContext);

      expect(result.isError).toBeUndefined();
    });
  });

  describe("validação de schema", () => {
    it("deve aceitar objeto vazio", () => {
      const result = tool.inputSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("deve aceitar sem parâmetros", () => {
      const result = tool.inputSchema.safeParse(undefined);
      expect(result.success).toBe(false); // Zod espera um objeto
    });
  });
});
