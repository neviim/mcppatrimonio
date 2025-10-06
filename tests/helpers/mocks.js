/**
 * Mocks e fixtures para testes
 */
export const mockPatrimonio = {
    id: "507f1f77bcf86cd799439011",
    Patrimonio: "12345",
    Usuario: "João Silva",
    Setor: "TI",
    Descricao: "Notebook Dell",
    Valor: 3500.0,
    DataAquisicao: "2025-01-01",
    Estado: "Novo",
    Locacao: "Sala 101",
};
export const mockPatrimonios = [
    mockPatrimonio,
    {
        id: "507f1f77bcf86cd799439012",
        Patrimonio: "12346",
        Usuario: "Maria Santos",
        Setor: "TI",
        Descricao: "Mouse Logitech",
        Valor: 150.0,
    },
];
export const mockEstatisticas = {
    total_patrimonios: 100,
    por_setor: {
        TI: {
            total: 50,
            subtotal: 50,
        },
        RH: {
            total: 50,
            subtotal: 50,
        },
    },
    por_tipo_equipamento: {
        Notebook: 30,
        Desktop: 20,
    },
    por_locacao: {
        "Sala 101": 25,
        "Sala 102": 25,
    },
};
export const mockVersionInfo = {
    version: "0.1.9",
    build_timestamp: "2025-01-15T10:30:00Z",
};
/**
 * Cria um mock de Response do fetch
 */
export const createMockResponse = (data, ok = true, status = 200) => ({
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: async () => data,
    text: async () => JSON.stringify(data),
});
/**
 * Cria um mock de erro HTTP
 */
export const createMockErrorResponse = (status, statusText, message = "") => ({
    ok: false,
    status,
    statusText,
    json: async () => {
        throw new Error("Response was not ok");
    },
    text: async () => message,
});
/**
 * Mock de logger para evitar poluição do console durante testes
 */
export const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};
//# sourceMappingURL=mocks.js.map