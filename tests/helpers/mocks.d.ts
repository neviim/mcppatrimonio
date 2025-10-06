import type { Patrimonio, Estatisticas, VersionInfo } from "../../src/core/types.js";
/**
 * Mocks e fixtures para testes
 */
export declare const mockPatrimonio: Patrimonio;
export declare const mockPatrimonios: Patrimonio[];
export declare const mockEstatisticas: Estatisticas;
export declare const mockVersionInfo: VersionInfo;
/**
 * Cria um mock de Response do fetch
 */
export declare const createMockResponse: (data: any, ok?: boolean, status?: number) => {
    ok: boolean;
    status: number;
    statusText: string;
    json: () => Promise<any>;
    text: () => Promise<string>;
};
/**
 * Cria um mock de erro HTTP
 */
export declare const createMockErrorResponse: (status: number, statusText: string, message?: string) => {
    ok: boolean;
    status: number;
    statusText: string;
    json: () => Promise<never>;
    text: () => Promise<string>;
};
/**
 * Mock de logger para evitar poluição do console durante testes
 */
export declare const mockLogger: {
    info: any;
    warn: any;
    error: any;
    debug: any;
};
//# sourceMappingURL=mocks.d.ts.map