/// <reference types="vite/client" />
/**
 * api.ts — Funções de chamada da API do BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */
const API_BASE = '/api/v1';
const headers = () => ({
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
});
async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `Erro ${res.status}`);
    }
    return res.json();
}
// ─── Dashboard ──────────────────────────────────────────────────────────────
export async function getDashboardKpis() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/kpis`, { headers: headers() });
    return handleResponse(res);
}
export async function getDashboardCalendario() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/calendario`, { headers: headers() });
    return handleResponse(res);
}
export async function getCotacoes(params = {}) {
    const query = new URLSearchParams();
    if (params.status)
        query.set('status', params.status);
    if (params.page)
        query.set('page', String(params.page));
    if (params.limit)
        query.set('limit', String(params.limit));
    if (params.busca)
        query.set('busca', params.busca);
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes?${query}`, { headers: headers() });
    return handleResponse(res);
}
export async function getCotacao(id) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, { headers: headers() });
    return handleResponse(res);
}
export async function criarCotacao(input) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(input),
    });
    return handleResponse(res);
}
export async function atualizarCotacao(id, input) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(input),
    });
    return handleResponse(res);
}
export async function mudarStatusCotacao(id, status) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(res);
}
export async function excluirCotacao(id) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
        method: 'DELETE',
        headers: headers(),
    });
    if (!res.ok)
        throw new Error(`Erro ${res.status} ao excluir cotação`);
}
// ─── Bids (Disparo) ─────────────────────────────────────────────────────────
export async function dispararBids(cotacaoId, fornecedorIds, canais) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/pedidos-cotacao/disparar`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id_cotacao_bid_frete_internacional: cotacaoId, fornecedor_ids: fornecedorIds, canais }),
    });
    return handleResponse(res);
}
export async function getBidsPorCotacao(cotacaoId) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/pedidos-cotacao/cotacao/${cotacaoId}`, { headers: headers() });
    return handleResponse(res);
}
// ─── Comparativo ────────────────────────────────────────────────────────────
export async function getRanking(cotacaoId) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/classificacao`, { headers: headers() });
    return handleResponse(res);
}
export async function aprovarResposta(cotacaoId, responseId) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/aprovar`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id_proposta_bid_frete_internacional: responseId }),
    });
    return handleResponse(res);
}
export async function reprovarTodas(cotacaoId, motivo) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/reprovar`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ motivo }),
    });
    return handleResponse(res);
}
export async function getFornecedores(params = {}) {
    const query = new URLSearchParams();
    if (params.tipo)
        query.set('tipo', params.tipo);
    if (params.status)
        query.set('status', params.status);
    if (params.busca)
        query.set('busca', params.busca);
    if (params.page)
        query.set('page', String(params.page));
    if (params.limit)
        query.set('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores?${query}`, { headers: headers() });
    return handleResponse(res);
}
export async function getFornecedor(id) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores/${id}`, { headers: headers() });
    return handleResponse(res);
}
export async function getTabelaPrecos(fornecedorId) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores/${fornecedorId}/tabelas-valor`, { headers: headers() });
    return handleResponse(res);
}
export async function getAvaliacoes(fornecedorId) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/avaliacoes/fornecedor/${fornecedorId}`, { headers: headers() });
    return handleResponse(res);
}
// ─── Portal do Fornecedor ───────────────────────────────────────────────────
export async function getPortalDashboard() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/dashboard`, { headers: headers() });
    return handleResponse(res);
}
export async function getPortalPendentes() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/pendentes`, { headers: headers() });
    return handleResponse(res);
}
export async function responderBid(bidRequestId, data) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/responder/${bidRequestId}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}
export async function getPortalRespostas() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/propostas`, { headers: headers() });
    return handleResponse(res);
}
export async function getPortalDesempenho() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/desempenho`, { headers: headers() });
    return handleResponse(res);
}
// ─── Portal Público (sem login) ─────────────────────────────────────────────
export async function getPublicCotacao(token) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/publico/${token}`);
    return handleResponse(res);
}
export async function responderPublico(token, data) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/publico/${token}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(res);
}
// ─── Master Data ────────────────────────────────────────────────────────────
export async function getPortos(tipo) {
    const query = tipo ? `?tipo=${tipo}` : '';
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/portos${query}`);
    return handleResponse(res);
}
export async function getMoedas() {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/moedas`);
    return handleResponse(res);
}
export const paineisDashboardApi = {
    listar: () => fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, { headers: headers() })
        .then(res => handleResponse(res))
        .catch(() => ({ data: [] })),
    criar: (nome) => fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ nome }),
    }).then(res => handleResponse(res)),
    atualizar: (id, patch) => fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(patch),
    }).then(res => handleResponse(res)),
    reordenar: (ids) => fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/reordenar`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ ids }),
    }).then(res => handleResponse(res)),
    deletar: (id) => fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
        method: 'DELETE',
        headers: headers(),
    }).then(res => handleResponse(res)),
};
export const dashboardApi = {
    kpis: async (period, range) => {
        const params = new URLSearchParams();
        if (range) {
            params.set('data_inicio', range.from);
            params.set('data_fim', range.to);
        }
        const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard?${params}`, { headers: headers() });
        const raw = await handleResponse(res);
        const mapped = {
            period,
            saving_total: raw.savings?.total_saving_vs_target ?? 0,
            valor_medio_ganho_bid_frete_internacional: raw.savings?.total_valor_aprovado ? (raw.savings?.total_valor_aprovado / (raw.savings?.total_cotacoes_aprovadas_classificacao_bid_frete_internacional || 1)) : 0,
            ganho_percentual_ganho_bid_frete_internacional: raw.savings?.media_saving_percentual ?? 0,
            transit_time: 0,
            volume_mensal: 0,
            cotacoes_andamento: raw.cotacoes_andamento ?? 0,
            cotacoes_passadas: raw.cotacoes_passadas ?? 0,
            valor_andamento_usd: raw.valor_andamento_usd ?? 0,
            valor_aprovado_usd: raw.valor_aprovado_usd ?? 0,
            cotacoes_status: Object.fromEntries((raw.funil ?? []).map((f) => [f.status, f.count])),
        };
        return mapped;
    },
    trend: async (period, granularity = 'month') => {
        const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/widgets`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                metrics: ['volume_mensal'],
                filters: { period },
            }),
        });
        const raw = await handleResponse(res);
        const value = (raw.volume_mensal ?? []).map((item) => ({
            month: item.month,
            volume_mensal: item.value,
            saving_total: 0,
            valor_medio_ganho_bid_frete_internacional: 0,
            ganho_percentual_ganho_bid_frete_internacional: 0,
            transit_time: 0,
            cotacoes_andamento: 0,
            cotacoes_passadas: 0,
            valor_andamento_usd: 0,
            valor_aprovado_usd: 0,
        }));
        return { period, granularity, value };
    },
    insights: async (period, range) => {
        return { period, role: '', insights: [] };
    },
    ncmStatus: async () => {
        return {
            total_invalidos: 0,
            itens_invalidos: 0,
            sem_sync: true,
            ultima_sync: null,
        };
    }
};
//# sourceMappingURL=api.js.map