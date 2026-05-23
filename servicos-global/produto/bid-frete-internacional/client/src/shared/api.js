/// <reference types="vite/client" />
/**
 * api.ts — Funções de chamada da API do BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */
const API_BASE = '/api/v1';
const headers = () => {
    const customHeaders = {
        'Content-Type': 'application/json',
        'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
    };
    const orgId = sessionStorage.getItem('gravity_tenant_id') ||
        sessionStorage.getItem('gravity_company_id') ||
        sessionStorage.getItem('gravity_id_organizacao') ||
        import.meta.env.VITE_TENANT_ID ||
        import.meta.env.VITE_DEV_TENANT_ID ||
        'org_dev_default';
    const userId = sessionStorage.getItem('gravity_id_usuario') ||
        import.meta.env.VITE_USER_ID ||
        'user_dev_default';
    customHeaders['x-id-organizacao'] = orgId;
    customHeaders['x-id-usuario'] = userId;
    return customHeaders;
};
async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `Erro ${res.status}`);
    }
    return res.json();
}
// ─── Bidirectional Mappers ──────────────────────────────────────────────────
export function mapFornecedorFromServer(rawUnknown) {
    if (!rawUnknown)
        return rawUnknown;
    const raw = rawUnknown;
    return {
        id: raw.id_fornecedor_bid_frete_internacional ?? raw.id,
        id_organizacao: raw.id_organizacao,
        nome: raw.nome_fornecedor_bid_frete_internacional ?? raw.nome,
        nome_fantasia: raw.nome_fantasia_fornecedor_bid_frete_internacional ?? raw.nome_fantasia,
        tipo: raw.tipo_fornecedor_bid_frete_internacional ?? raw.tipo,
        status: raw.status_fornecedor_bid_frete_internacional ?? raw.status,
        cnpj: raw.cnpj_fornecedor_bid_frete_internacional ?? raw.cnpj,
        email: raw.email_fornecedor_bid_frete_internacional ?? raw.email,
        telefone: raw.telefone_fornecedor_bid_frete_internacional ?? raw.telefone,
        whatsapp: raw.whatsapp_fornecedor_bid_frete_internacional ?? raw.whatsapp,
        website: raw.website_fornecedor_bid_frete_internacional ?? raw.website,
        pais: raw.pais_fornecedor_bid_frete_internacional ?? raw.pais,
        cidade: raw.cidade_fornecedor_bid_frete_internacional ?? raw.cidade,
        aceita_cotacao_aberta_fornecedor_bid_frete_internacional: !!(raw.aceita_cotacao_aberta_fornecedor_bid_frete_internacional),
        resposta_automatica: !!(raw.cotacao_automatica_fornecedor_bid_frete_internacional ?? raw.resposta_automatica),
        nota_global_classificacao_bid_frete_internacional: raw.nota_global_classificacao_bid_frete_internacional ?? null,
        total_cotacoes: raw.total_cotacoes ?? 0,
        taxa_resposta: raw.taxa_resposta ?? null,
        taxa_aprovacao: raw.taxa_aprovacao ?? null,
        tempo_medio_resposta: raw.tempo_medio_resposta ?? null,
        created_at: raw.data_criacao_fornecedor_bid_frete_internacional ?? raw.created_at,
        updated_at: raw.data_atualizacao_fornecedor_bid_frete_internacional ?? raw.updated_at,
    };
}
export function mapBidResponseFromServer(rawUnknown) {
    if (!rawUnknown)
        return rawUnknown;
    const raw = rawUnknown;
    return {
        id: raw.id_proposta_bid_frete_internacional ?? raw.id,
        id_organizacao: raw.id_organizacao,
        id_cotacao_bid_frete_internacional: raw.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: raw.id_fornecedor_bid_frete_internacional,
        fornecedor: raw.fornecedor ? mapFornecedorFromServer(raw.fornecedor) : undefined,
        id_pedido_cotacao_bid_frete_internacional: raw.id_pedido_cotacao_bid_frete_internacional,
        moeda_ganho_bid_frete_internacional: raw.moeda_proposta_bid_frete_internacional ?? raw.moeda_ganho_bid_frete_internacional ?? 'USD',
        valor_frete_proposta_bid_frete_internacional: raw.valor_frete_proposta_bid_frete_internacional,
        taxas_origem_proposta_bid_frete_internacional: raw.taxas_origem_proposta_bid_frete_internacional,
        taxas_destino_proposta_bid_frete_internacional: raw.taxas_destino_proposta_bid_frete_internacional,
        valor_total_proposta_bid_frete_internacional: raw.valor_total_proposta_bid_frete_internacional,
        dias_transito_proposta_bid_frete_internacional: raw.dias_transito_proposta_bid_frete_internacional,
        dias_free_time_proposta_bid_frete_internacional: raw.dias_free_time_proposta_bid_frete_internacional,
        transbordos_proposta_bid_frete_internacional: raw.transbordos_proposta_bid_frete_internacional,
        escalas_proposta_bid_frete_internacional: raw.escalas_proposta_bid_frete_internacional,
        validade: raw.validade_proposta_bid_frete_internacional ?? raw.validade,
        observacoes_proposta_bid_frete_internacional: raw.observacoes_proposta_bid_frete_internacional,
        score_total: raw.score_total ?? null,
        score_preco: raw.score_preco ?? null,
        score_transit: raw.score_transit ?? null,
        score_rating: raw.score_rating ?? null,
        aprovada: raw.status_proposta_bid_frete_internacional === 'APROVADA' || !!raw.aprovada,
        aprovada_em: raw.aprovada_em ?? null,
        aprovada_por: raw.aprovada_por ?? null,
        created_at: raw.data_criacao_proposta_bid_frete_internacional ?? raw.created_at,
    };
}
export function mapBidRequestFromServer(rawUnknown) {
    if (!rawUnknown)
        return rawUnknown;
    const raw = rawUnknown;
    return {
        id: raw.id_pedido_cotacao_bid_frete_internacional ?? raw.id,
        id_organizacao: raw.id_organizacao,
        id_cotacao_bid_frete_internacional: raw.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: raw.id_fornecedor_bid_frete_internacional,
        fornecedor: raw.fornecedor ? mapFornecedorFromServer(raw.fornecedor) : undefined,
        canal_pedido_cotacao_bid_frete_internacional: raw.canal_pedido_cotacao_bid_frete_internacional,
        status: raw.status_pedido_cotacao_bid_frete_internacional ?? raw.status,
        token_publico: raw.token_resposta_pedido_cotacao_bid_frete_internacional ?? raw.token_publico,
        data_envio_pedido_cotacao_bid_frete_internacional: raw.data_envio_pedido_cotacao_bid_frete_internacional,
        data_visualizacao_pedido_cotacao_bid_frete_internacional: raw.data_visualizacao_pedido_cotacao_bid_frete_internacional,
        data_resposta_pedido_cotacao_bid_frete_internacional: raw.data_resposta_pedido_cotacao_bid_frete_internacional,
        expirado_em: raw.data_expiracao_token_pedido_cotacao_bid_frete_internacional ?? raw.expirado_em,
        created_at: raw.data_criacao_pedido_cotacao_bid_frete_internacional ?? raw.created_at,
        response: raw.proposta ? mapBidResponseFromServer(raw.proposta) : undefined,
    };
}
export function mapCotacaoFromServer(rawUnknown) {
    if (!rawUnknown)
        return rawUnknown;
    const raw = rawUnknown;
    const propostas = raw.propostas || raw.bid_responses || [];
    const approvedProposta = propostas.find((p) => p.status_proposta_bid_frete_internacional === 'APROVADA' || p.aprovada === true);
    return {
        id: raw.id_cotacao_bid_frete_internacional ?? raw.id,
        id_organizacao: raw.id_organizacao,
        id_usuario: raw.id_usuario,
        numero_cotacao_bid_frete_internacional: raw.numero_cotacao_bid_frete_internacional,
        referencia_interna_cotacao_bid_frete_internacional: raw.referencia_interna_cotacao_bid_frete_internacional,
        tipo_operacao_cotacao_bid_frete_internacional: raw.tipo_operacao_cotacao_bid_frete_internacional,
        modal_cotacao_bid_frete_internacional: raw.modal_cotacao_bid_frete_internacional,
        modalidade_cotacao_bid_frete_internacional: raw.modalidade_cotacao_bid_frete_internacional,
        status: raw.status_cotacao_bid_frete_internacional ?? raw.status,
        origem_codigo_cotacao_bid_frete_internacional: raw.origem_codigo_cotacao_bid_frete_internacional,
        origem_nome_cotacao_bid_frete_internacional: raw.origem_nome_cotacao_bid_frete_internacional,
        origem_pais_cotacao_bid_frete_internacional: raw.origem_pais_cotacao_bid_frete_internacional,
        destino_codigo_cotacao_bid_frete_internacional: raw.destino_codigo_cotacao_bid_frete_internacional,
        destino_nome_cotacao_bid_frete_internacional: raw.destino_nome_cotacao_bid_frete_internacional,
        destino_pais_cotacao_bid_frete_internacional: raw.destino_pais_cotacao_bid_frete_internacional,
        descricao_mercadoria_cotacao_bid_frete_internacional: raw.descricao_mercadoria_cotacao_bid_frete_internacional,
        ncm_cotacao_bid_frete_internacional: raw.ncm_cotacao_bid_frete_internacional,
        quantidade_cotacao_bid_frete_internacional: raw.quantidade_cotacao_bid_frete_internacional,
        tipo_container_cotacao_bid_frete_internacional: raw.tipo_container_cotacao_bid_frete_internacional,
        peso_kg_cotacao_bid_frete_internacional: raw.peso_kg_cotacao_bid_frete_internacional,
        cubagem_m3_cotacao_bid_frete_internacional: raw.cubagem_m3_cotacao_bid_frete_internacional,
        incoterm_cotacao_bid_frete_internacional: raw.incoterm_cotacao_bid_frete_internacional,
        cep_destino: raw.zipcode_destino_cotacao_bid_frete_internacional ?? raw.cep_destino,
        visibilidade_cotacao_bid_frete_internacional: raw.visibilidade_cotacao_bid_frete_internacional,
        anonima: !!(raw.anonima_cotacao_bid_frete_internacional ?? raw.anonima),
        valor_alvo: raw.valor_meta_cotacao_bid_frete_internacional ?? raw.valor_alvo,
        moeda_alvo: raw.moeda_meta_cotacao_bid_frete_internacional ?? raw.moeda_alvo ?? 'USD',
        prazo_resposta: raw.data_limite_resposta_cotacao_bid_frete_internacional ?? raw.prazo_resposta,
        // approved proposal aggregates if they exist
        valor_aprovado_ganho_bid_frete_internacional: raw.valor_aprovado_ganho_bid_frete_internacional ??
            (approvedProposta ? approvedProposta.valor_total_proposta_bid_frete_internacional : null),
        moeda_aprovada: raw.moeda_aprovada ??
            (approvedProposta ? (approvedProposta.moeda_proposta_bid_frete_internacional ?? approvedProposta.moeda_ganho_bid_frete_internacional) : null),
        ganho_valor_cotacao_bid_frete_internacional: raw.ganho_valor_cotacao_bid_frete_internacional,
        ganho_percentual_ganho_bid_frete_internacional: raw.ganho_percentual_cotacao_bid_frete_internacional ?? raw.ganho_percentual_ganho_bid_frete_internacional,
        created_at: raw.data_criacao_cotacao_bid_frete_internacional ?? raw.created_at,
        updated_at: raw.data_atualizacao_cotacao_bid_frete_internacional ?? raw.updated_at,
        bid_requests: (raw.pedidos_cotacao || raw.bid_requests || []).map(mapBidRequestFromServer),
        bid_responses: (raw.propostas || raw.bid_responses || []).map(mapBidResponseFromServer),
    };
}
export function mapCotacaoToServer(input) {
    const result = { ...input };
    if (input.cep_destino !== undefined) {
        result.zipcode_destino_cotacao_bid_frete_internacional = input.cep_destino;
        delete result.cep_destino;
    }
    if (input.anonima !== undefined) {
        result.anonima_cotacao_bid_frete_internacional = input.anonima;
        delete result.anonima;
    }
    if (input.valor_alvo !== undefined) {
        result.valor_meta_cotacao_bid_frete_internacional = input.valor_alvo;
        delete result.valor_alvo;
    }
    if (input.moeda_alvo !== undefined) {
        result.moeda_meta_cotacao_bid_frete_internacional = input.moeda_alvo;
        delete result.moeda_alvo;
    }
    if (input.prazo_resposta !== undefined) {
        if (input.prazo_resposta) {
            try {
                const d = new Date(input.prazo_resposta);
                if (!isNaN(d.getTime())) {
                    result.data_limite_resposta_cotacao_bid_frete_internacional = d.toISOString();
                }
                else {
                    result.data_limite_resposta_cotacao_bid_frete_internacional = input.prazo_resposta;
                }
            }
            catch {
                result.data_limite_resposta_cotacao_bid_frete_internacional = input.prazo_resposta;
            }
        }
        else {
            result.data_limite_resposta_cotacao_bid_frete_internacional = null;
        }
        delete result.prazo_resposta;
    }
    // Remove client-only properties
    delete result.id;
    delete result.status;
    delete result.created_at;
    delete result.updated_at;
    delete result.bid_requests;
    delete result.bid_responses;
    return result;
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
    const data = await handleResponse(res);
    return {
        ...data,
        cotacoes: (data.cotacoes || []).map(mapCotacaoFromServer),
    };
}
export async function getCotacao(id) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, { headers: headers() });
    const data = await handleResponse(res);
    return mapCotacaoFromServer(data.cotacao);
}
export async function criarCotacao(input) {
    const serverInput = mapCotacaoToServer(input);
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(serverInput),
    });
    const data = await handleResponse(res);
    return mapCotacaoFromServer(data.cotacao);
}
export async function atualizarCotacao(id, input) {
    const serverInput = mapCotacaoToServer(input);
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(serverInput),
    });
    const data = await handleResponse(res);
    return mapCotacaoFromServer(data.cotacao);
}
export async function mudarStatusCotacao(id, status) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status }),
    });
    const data = await handleResponse(res);
    return mapCotacaoFromServer(data.cotacao);
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
    const data = await handleResponse(res);
    return mapCotacaoFromServer(data.cotacao);
}
export async function reprovarTodas(cotacaoId, motivo) {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/reprovar`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ motivo }),
    });
    const data = await handleResponse(res);
    return mapCotacaoFromServer(data.cotacao);
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