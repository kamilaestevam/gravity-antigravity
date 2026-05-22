/**
 * api.ts — Funções de chamada da API do BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */
import type { Cotacao, CotacoesListResponse, Fornecedor, FornecedoresListResponse, BidRequest, BidResponse, DashboardKPIs, CalendarioAlerta, TabelaPreco, Avaliacao, Porto, Moeda, StatusCotacao } from './types';
export declare function mapFornecedorFromServer(rawUnknown: unknown): Fornecedor;
export declare function mapBidResponseFromServer(rawUnknown: unknown): BidResponse;
export declare function mapBidRequestFromServer(rawUnknown: unknown): BidRequest;
export declare function mapCotacaoFromServer(rawUnknown: unknown): Cotacao;
export declare function mapCotacaoToServer(input: Partial<Cotacao>): Record<string, any>;
export declare function getDashboardKpis(): Promise<DashboardKPIs>;
export declare function getDashboardCalendario(): Promise<CalendarioAlerta[]>;
export interface CotacoesListParams {
    status?: StatusCotacao;
    page?: number;
    limit?: number;
    busca?: string;
}
export declare function getCotacoes(params?: CotacoesListParams): Promise<CotacoesListResponse>;
export declare function getCotacao(id: string): Promise<Cotacao>;
export declare function criarCotacao(input: Partial<Cotacao>): Promise<Cotacao>;
export declare function atualizarCotacao(id: string, input: Partial<Cotacao>): Promise<Cotacao>;
export declare function mudarStatusCotacao(id: string, status: StatusCotacao): Promise<Cotacao>;
export declare function excluirCotacao(id: string): Promise<void>;
export declare function dispararBids(cotacaoId: string, fornecedorIds: string[], canais: string[]): Promise<BidRequest[]>;
export declare function getBidsPorCotacao(cotacaoId: string): Promise<BidRequest[]>;
export declare function getRanking(cotacaoId: string): Promise<BidResponse[]>;
export declare function aprovarResposta(cotacaoId: string, responseId: string): Promise<Cotacao>;
export declare function reprovarTodas(cotacaoId: string, motivo: string): Promise<Cotacao>;
export interface FornecedoresListParams {
    tipo?: string;
    status?: string;
    busca?: string;
    page?: number;
    limit?: number;
}
export declare function getFornecedores(params?: FornecedoresListParams): Promise<FornecedoresListResponse>;
export declare function getFornecedor(id: string): Promise<Fornecedor>;
export declare function getTabelaPrecos(fornecedorId: string): Promise<TabelaPreco[]>;
export declare function getAvaliacoes(fornecedorId: string): Promise<Avaliacao[]>;
export declare function getPortalDashboard(): Promise<Record<string, unknown>>;
export declare function getPortalPendentes(): Promise<BidRequest[]>;
export declare function responderBid(bidRequestId: string, data: Partial<BidResponse>): Promise<BidResponse>;
export declare function getPortalRespostas(): Promise<BidResponse[]>;
export declare function getPortalDesempenho(): Promise<Record<string, unknown>>;
export declare function getPublicCotacao(token: string): Promise<Record<string, unknown>>;
export declare function responderPublico(token: string, data: Partial<BidResponse>): Promise<BidResponse>;
export declare function getPortos(tipo?: string): Promise<Porto[]>;
export declare function getMoedas(): Promise<Moeda[]>;
export interface DashboardPainel {
    id: string;
    tenant_id: string;
    user_id: string;
    nome: string;
    ordem: number;
    is_visivel: boolean;
    widgets_json: string;
    created_at: string;
    updated_at: string;
}
export declare const paineisDashboardApi: {
    listar: () => Promise<{
        data: DashboardPainel[];
    }>;
    criar: (nome: string) => Promise<{
        data: DashboardPainel;
    }>;
    atualizar: (id: string, patch: Partial<Pick<DashboardPainel, "nome" | "is_visivel" | "widgets_json">>) => Promise<{
        data: DashboardPainel;
    }>;
    reordenar: (ids: string[]) => Promise<{
        data: {
            reordenado: boolean;
        };
    }>;
    deletar: (id: string) => Promise<{
        data: {
            deletado: boolean;
        };
    }>;
};
export interface DashboardKpis {
    period: string;
    saving_total: number;
    valor_medio_ganho_bid_frete_internacional: number;
    ganho_percentual_ganho_bid_frete_internacional: number;
    transit_time: number;
    volume_mensal: number;
    cotacoes_andamento: number;
    cotacoes_passadas: number;
    valor_andamento_usd: number;
    valor_aprovado_usd: number;
    cotacoes_status: Record<string, number>;
    [key: string]: number | string | Record<string, number> | string[];
}
export interface DashboardTrendBucket {
    month: string;
    volume_mensal: number;
    saving_total: number;
    valor_medio_ganho_bid_frete_internacional: number;
    ganho_percentual_ganho_bid_frete_internacional: number;
    transit_time: number;
    cotacoes_andamento: number;
    cotacoes_passadas: number;
    valor_andamento_usd: number;
    valor_aprovado_usd: number;
    [key: string]: string | number;
}
export interface GabiInsightItem {
    id: string;
    variante: 'default' | 'warn';
    tag: string;
    texto: string;
    stat?: {
        label: string;
        valor: string;
    };
    textoLink?: string;
    rota?: string;
}
export declare const dashboardApi: {
    kpis: (period: string, range?: {
        from: string;
        to: string;
    }) => Promise<DashboardKpis>;
    trend: (period: string, granularity?: string) => Promise<{
        period: string;
        granularity: string;
        value: DashboardTrendBucket[];
    }>;
    insights: (period: string, range?: {
        from: string;
        to: string;
    }) => Promise<{
        period: string;
        role: string;
        insights: GabiInsightItem[];
    }>;
    ncmStatus: () => Promise<{
        total_invalidos: number;
        itens_invalidos: number;
        sem_sync: boolean;
        ultima_sync: null;
    }>;
};
//# sourceMappingURL=api.d.ts.map