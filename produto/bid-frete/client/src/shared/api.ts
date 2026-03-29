/**
 * api.ts — Wrapper de fetch para o BID Frete
 * Inclui mock data para desenvolvimento sem backend.
 */

const API_BASE = '/api/v1/bid-frete'
const MASTER_DATA_BASE = '/api/v1/master-data'

const USE_MOCK = true // Ativar mock enquanto backend nao esta rodando

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  params?: Record<string, string | number | undefined>
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  if (USE_MOCK) {
    return mockResponse(path, options) as T
  }

  const { method = 'GET', body, params } = options

  let url = path
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) searchParams.set(key, String(value))
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || `Erro ${res.status}`)
  }

  return res.json()
}

// ===================== MOCK DATA =====================

function mockResponse(path: string, options: RequestOptions): any {
  const { method = 'GET' } = options

  // Dashboard KPIs
  if (path.endsWith('/dashboard') && !path.includes('portal')) {
    return {
      cotacoes_andamento: 12,
      valor_andamento_usd: 847500.00,
      cotacoes_passadas: 48,
      valor_aprovado_usd: 2350000.00,
      aprovacao: { percentual_em_tempo: 78 },
      savings: { media_saving_percentual: 14.3 },
      funil: [
        { status: 'RASCUNHO', count: 3 },
        { status: 'ABERTA', count: 5 },
        { status: 'EM_ANALISE', count: 4 },
        { status: 'APROVADA', count: 8 },
        { status: 'ENCERRADA', count: 28 },
      ],
    }
  }

  // Dashboard Calendario
  if (path.endsWith('/dashboard/calendario')) {
    return {
      alertas: [
        { tipo: 'vencendo_hoje', label: 'Cotacoes vencendo hoje', count: 2, cor: 'red' },
        { tipo: 'vencendo_3d', label: 'Vencendo em 3 dias', count: 5, cor: 'orange' },
        { tipo: 'aguardando_resposta', label: 'Aguardando resposta', count: 8, cor: 'yellow' },
        { tipo: 'sem_resposta', label: 'Sem resposta (>5 dias)', count: 3, cor: 'red' },
      ],
    }
  }

  // Lista de cotacoes
  if (path.endsWith('/cotacoes') && method === 'GET') {
    return {
      data: MOCK_COTACOES,
      total: MOCK_COTACOES.length,
      page: 1,
      per_page: 20,
    }
  }

  // Detalhe cotacao
  if (path.match(/\/cotacoes\/[^/]+$/) && method === 'GET') {
    return {
      ...MOCK_COTACOES[0],
      timeline: [
        { status: 'RASCUNHO', data: '2026-03-20T10:00:00Z', usuario: 'Daniel' },
        { status: 'ABERTA', data: '2026-03-20T14:30:00Z', usuario: 'Daniel' },
        { status: 'EM_ANALISE', data: '2026-03-22T09:00:00Z', usuario: 'Sistema' },
      ],
      bid_requests: MOCK_BID_REQUESTS,
      bid_responses: MOCK_BID_RESPONSES,
    }
  }

  // Comparativo
  if (path.includes('/comparativo/')) {
    return {
      cotacao: MOCK_COTACOES[0],
      ranking: MOCK_BID_RESPONSES.map((r, i) => ({
        ...r,
        ranking: i + 1,
        score_total: 95 - i * 8,
        score_preco: 90 - i * 5,
        score_transit: 85 - i * 10,
        score_rating: 92 - i * 3,
      })),
    }
  }

  // Fornecedores
  if (path.endsWith('/fornecedores') && method === 'GET') {
    return {
      data: MOCK_FORNECEDORES,
      total: MOCK_FORNECEDORES.length,
    }
  }

  // Detalhe fornecedor
  if (path.match(/\/fornecedores\/[^/]+$/) && method === 'GET') {
    return {
      ...MOCK_FORNECEDORES[0],
      tabela_precos: MOCK_TABELA_PRECOS,
      rating: {
        global: 4.3,
        preco_frete: 4.1,
        atendimento: 4.5,
        tempo_resposta: 3.8,
        confiabilidade: 4.6,
        total_avaliacoes: 24,
        taxa_resposta: 87,
        taxa_aprovacao: 62,
        tempo_medio_resposta_horas: 18,
      },
      avaliacoes_recentes: [
        { nota: 5, comentario: 'Excelente servico, entrega no prazo', data: '2026-03-15' },
        { nota: 4, comentario: 'Bom preco, atendimento poderia ser mais rapido', data: '2026-03-10' },
        { nota: 4, comentario: 'Confiavel, sempre responde dentro do prazo', data: '2026-03-02' },
      ],
    }
  }

  // Portal dashboard
  if (path.endsWith('/portal/dashboard')) {
    return {
      pendentes: 4,
      respondidas: 18,
      aprovadas: 12,
      taxa_resposta: 87,
      rating: 4.3,
      valor_total_aprovado: 1250000,
    }
  }

  // Portal cotacoes pendentes
  if (path.endsWith('/portal/cotacoes-pendentes')) {
    return MOCK_BID_REQUESTS.filter(b => b.status === 'ENVIADO' || b.status === 'VISUALIZADO')
  }

  // Portal minhas respostas
  if (path.endsWith('/portal/minhas-respostas')) {
    return MOCK_BID_RESPONSES
  }

  // Portal meu desempenho
  if (path.endsWith('/portal/meu-desempenho')) {
    return {
      rating_global: 4.3,
      cotacoes_recebidas: 32,
      cotacoes_respondidas: 28,
      cotacoes_aprovadas: 18,
      tempo_medio_resposta: '14h',
      categorias: [
        { nome: 'Preco do frete', nota: 4.1 },
        { nome: 'Atendimento', nota: 4.5 },
        { nome: 'Tempo de resposta', nota: 3.8 },
        { nome: 'Confiabilidade', nota: 4.6 },
      ],
      avaliacoes_recentes: [
        { nota: 5, comentario: 'Excelente trabalho, preco competitivo', data: '2026-03-20', cotacao: 'BID-2026-042' },
        { nota: 4, comentario: 'Bom servico, entrega pontual', data: '2026-03-15', cotacao: 'BID-2026-038' },
      ],
    }
  }

  // Master data
  if (path.includes('/incoterms')) {
    return [
      { codigo: 'FOB', descricao: 'Free on Board' },
      { codigo: 'CIF', descricao: 'Cost, Insurance & Freight' },
      { codigo: 'EXW', descricao: 'Ex Works' },
      { codigo: 'DDP', descricao: 'Delivered Duty Paid' },
      { codigo: 'CFR', descricao: 'Cost and Freight' },
      { codigo: 'FCA', descricao: 'Free Carrier' },
    ]
  }

  if (path.includes('/modais')) {
    return [
      { codigo: 'MARITIMO', descricao: 'Maritimo' },
      { codigo: 'AEREO', descricao: 'Aereo' },
      { codigo: 'RODOVIARIO', descricao: 'Rodoviario' },
      { codigo: 'FERROVIARIO', descricao: 'Ferroviario' },
    ]
  }

  if (path.includes('/moedas')) {
    return [
      { codigo: 'USD', simbolo: '$', descricao: 'Dolar Americano' },
      { codigo: 'EUR', simbolo: '€', descricao: 'Euro' },
      { codigo: 'BRL', simbolo: 'R$', descricao: 'Real Brasileiro' },
    ]
  }

  if (path.includes('/paises')) {
    return [
      { codigo: 'BR', nome: 'Brasil' },
      { codigo: 'US', nome: 'Estados Unidos' },
      { codigo: 'CN', nome: 'China' },
      { codigo: 'DE', nome: 'Alemanha' },
      { codigo: 'JP', nome: 'Japao' },
    ]
  }

  if (path.includes('/portos')) {
    return [
      { codigo: 'BRSSZ', nome: 'Porto de Santos', pais: 'BR', tipo: 'PORTO' },
      { codigo: 'BRPNG', nome: 'Porto de Paranagua', pais: 'BR', tipo: 'PORTO' },
      { codigo: 'CNSHA', nome: 'Shanghai', pais: 'CN', tipo: 'PORTO' },
      { codigo: 'USNYC', nome: 'New York', pais: 'US', tipo: 'PORTO' },
      { codigo: 'DEHAM', nome: 'Hamburg', pais: 'DE', tipo: 'PORTO' },
    ]
  }

  if (path.includes('/containers')) {
    return [
      { tipo: '20GP', descricao: '20\' General Purpose' },
      { tipo: '40GP', descricao: '40\' General Purpose' },
      { tipo: '40HC', descricao: '40\' High Cube' },
      { tipo: '20RF', descricao: '20\' Reefer' },
    ]
  }

  // POST/PUT/PATCH/DELETE - retornar sucesso generico
  if (method !== 'GET') {
    return { success: true, id: 'mock-id-' + Date.now() }
  }

  return {}
}

// ===================== MOCK ENTITIES =====================

const MOCK_COTACOES = [
  {
    id: 'cot-001',
    numero: 'BID-2026-048',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    origem: { codigo: 'CNSHA', nome: 'Shanghai', pais: 'CN' },
    destino: { codigo: 'BRSSZ', nome: 'Santos', pais: 'BR' },
    descricao_mercadoria: 'Componentes eletronicos',
    ncm: '8542.31.90',
    quantidade: 2,
    peso_kg: 18000,
    incoterm: 'FOB',
    status: 'EM_ANALISE',
    valor_alvo_usd: 4500,
    data_criacao: '2026-03-20T10:00:00Z',
    data_limite: '2026-04-05T23:59:59Z',
    fornecedores_convidados: 5,
    respostas_recebidas: 3,
  },
  {
    id: 'cot-002',
    numero: 'BID-2026-047',
    tipo_operacao: 'EXPORTACAO',
    modal: 'AEREO',
    modalidade: 'CONSOLIDADO',
    origem: { codigo: 'BRGRW', nome: 'Guarulhos', pais: 'BR' },
    destino: { codigo: 'USNYC', nome: 'New York', pais: 'US' },
    descricao_mercadoria: 'Pecas automotivas',
    ncm: '8708.99.90',
    quantidade: 1,
    peso_kg: 3200,
    incoterm: 'CIF',
    status: 'ABERTA',
    valor_alvo_usd: 8200,
    data_criacao: '2026-03-22T14:00:00Z',
    data_limite: '2026-04-10T23:59:59Z',
    fornecedores_convidados: 8,
    respostas_recebidas: 1,
  },
  {
    id: 'cot-003',
    numero: 'BID-2026-046',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'LCL',
    origem: { codigo: 'DEHAM', nome: 'Hamburg', pais: 'DE' },
    destino: { codigo: 'BRPNG', nome: 'Paranagua', pais: 'BR' },
    descricao_mercadoria: 'Maquinas industriais',
    ncm: '8455.10.00',
    quantidade: 1,
    peso_kg: 45000,
    incoterm: 'DDP',
    status: 'APROVADA',
    valor_alvo_usd: 12000,
    data_criacao: '2026-03-15T08:00:00Z',
    data_limite: '2026-03-30T23:59:59Z',
    fornecedores_convidados: 4,
    respostas_recebidas: 4,
  },
  {
    id: 'cot-004',
    numero: 'BID-2026-045',
    tipo_operacao: 'IMPORTACAO',
    modal: 'RODOVIARIO',
    modalidade: 'FTL',
    origem: { codigo: 'ARBUE', nome: 'Buenos Aires', pais: 'AR' },
    destino: { codigo: 'BRSPO', nome: 'Sao Paulo', pais: 'BR' },
    descricao_mercadoria: 'Materia-prima alimenticia',
    ncm: '1201.90.00',
    quantidade: 3,
    peso_kg: 72000,
    incoterm: 'FOB',
    status: 'RASCUNHO',
    valor_alvo_usd: 6500,
    data_criacao: '2026-03-25T16:00:00Z',
    data_limite: '2026-04-15T23:59:59Z',
    fornecedores_convidados: 0,
    respostas_recebidas: 0,
  },
  {
    id: 'cot-005',
    numero: 'BID-2026-044',
    tipo_operacao: 'EXPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    origem: { codigo: 'BRSSZ', nome: 'Santos', pais: 'BR' },
    destino: { codigo: 'JPYOK', nome: 'Yokohama', pais: 'JP' },
    descricao_mercadoria: 'Cafe em graos',
    ncm: '0901.11.10',
    quantidade: 4,
    peso_kg: 96000,
    incoterm: 'CFR',
    status: 'ENCERRADA',
    valor_alvo_usd: 15000,
    data_criacao: '2026-03-01T09:00:00Z',
    data_limite: '2026-03-20T23:59:59Z',
    fornecedores_convidados: 6,
    respostas_recebidas: 5,
  },
]

const MOCK_FORNECEDORES = [
  {
    id: 'forn-001',
    nome: 'GlobalShip Logistics',
    email: 'cotacoes@globalship.com',
    telefone: '+55 11 3456-7890',
    cnpj: '12.345.678/0001-90',
    tipo: 'FREIGHT_FORWARDER',
    status: 'ATIVO',
    modais: ['MARITIMO', 'AEREO'],
    paises_atuacao: ['BR', 'CN', 'US', 'DE'],
    cotacoes_participadas: 28,
    cotacoes_respondidas: 24,
    rating: 4.3,
  },
  {
    id: 'forn-002',
    nome: 'AirCargo Express',
    email: 'bids@aircargo.com.br',
    telefone: '+55 11 2345-6789',
    cnpj: '23.456.789/0001-01',
    tipo: 'COMPANHIA_AEREA',
    status: 'ATIVO',
    modais: ['AEREO'],
    paises_atuacao: ['BR', 'US', 'EU'],
    cotacoes_participadas: 15,
    cotacoes_respondidas: 14,
    rating: 4.6,
  },
  {
    id: 'forn-003',
    nome: 'MercoTransport SA',
    email: 'comercial@mercotransport.com',
    telefone: '+55 41 3456-7890',
    cnpj: '34.567.890/0001-12',
    tipo: 'TRANSPORTADORA',
    status: 'ATIVO',
    modais: ['RODOVIARIO'],
    paises_atuacao: ['BR', 'AR', 'PY', 'UY'],
    cotacoes_participadas: 12,
    cotacoes_respondidas: 11,
    rating: 4.1,
  },
  {
    id: 'forn-004',
    nome: 'Pacific Lines',
    email: 'quotes@pacificlines.com',
    telefone: '+86 21 5678-9012',
    cnpj: '',
    tipo: 'ARMADOR',
    status: 'ATIVO',
    modais: ['MARITIMO'],
    paises_atuacao: ['CN', 'JP', 'KR', 'BR'],
    cotacoes_participadas: 20,
    cotacoes_respondidas: 18,
    rating: 4.4,
  },
  {
    id: 'forn-005',
    nome: 'EuroFreight GmbH',
    email: 'bid@eurofreight.de',
    telefone: '+49 40 1234-5678',
    cnpj: '',
    tipo: 'FREIGHT_FORWARDER',
    status: 'INATIVO',
    modais: ['MARITIMO', 'RODOVIARIO', 'FERROVIARIO'],
    paises_atuacao: ['DE', 'FR', 'NL', 'BR'],
    cotacoes_participadas: 8,
    cotacoes_respondidas: 5,
    rating: 3.7,
  },
]

const MOCK_BID_REQUESTS = [
  {
    id: 'br-001',
    fornecedor: MOCK_FORNECEDORES[0],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    quantidade: 2,
    peso_kg: 18000,
    status: 'RESPONDIDO',
    canal_envio: 'EMAIL',
    data_envio: '2026-03-20T15:00:00Z',
    data_resposta: '2026-03-21T10:30:00Z',
    data_limite: '2026-04-05T23:59:59Z',
  },
  {
    id: 'br-002',
    fornecedor: MOCK_FORNECEDORES[1],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    quantidade: 2,
    peso_kg: 18000,
    status: 'RESPONDIDO',
    canal_envio: 'WHATSAPP',
    data_envio: '2026-03-20T15:00:00Z',
    data_resposta: '2026-03-22T08:15:00Z',
    data_limite: '2026-04-05T23:59:59Z',
  },
  {
    id: 'br-003',
    fornecedor: MOCK_FORNECEDORES[3],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    quantidade: 2,
    peso_kg: 18000,
    status: 'RESPONDIDO',
    canal_envio: 'EMAIL',
    data_envio: '2026-03-20T15:00:00Z',
    data_resposta: '2026-03-23T16:45:00Z',
    data_limite: '2026-04-05T23:59:59Z',
  },
  {
    id: 'br-004',
    fornecedor: MOCK_FORNECEDORES[2],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    quantidade: 2,
    peso_kg: 18000,
    status: 'ENVIADO',
    canal_envio: 'EMAIL',
    data_envio: '2026-03-20T15:00:00Z',
    data_limite: '2026-04-05T23:59:59Z',
  },
  {
    id: 'br-005',
    fornecedor: MOCK_FORNECEDORES[4],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    quantidade: 2,
    peso_kg: 18000,
    status: 'VISUALIZADO',
    canal_envio: 'PORTAL',
    data_envio: '2026-03-20T15:00:00Z',
    data_limite: '2026-04-05T23:59:59Z',
  },
]

const MOCK_BID_RESPONSES = [
  {
    id: 'resp-001',
    bid_request_id: 'br-001',
    fornecedor: MOCK_FORNECEDORES[0],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    modal: 'MARITIMO',
    moeda: 'USD',
    valor_frete: 3800,
    taxas_origem: 450,
    taxas_destino: 620,
    valor_total: 4870,
    transit_time_dias: 32,
    free_time_dias: 14,
    transbordos: 0,
    escalas: ['Ningbo'],
    validade: '2026-04-15',
    observacoes: 'Direto, sem transbordo. Free time estendido.',
    status: 'PENDENTE',
    data_resposta: '2026-03-21T10:30:00Z',
  },
  {
    id: 'resp-002',
    bid_request_id: 'br-002',
    fornecedor: MOCK_FORNECEDORES[1],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    modal: 'MARITIMO',
    moeda: 'USD',
    valor_frete: 4100,
    taxas_origem: 380,
    taxas_destino: 550,
    valor_total: 5030,
    transit_time_dias: 28,
    free_time_dias: 10,
    transbordos: 1,
    escalas: ['Singapore', 'Santos'],
    validade: '2026-04-10',
    observacoes: 'Transit time menor com transbordo em Singapore.',
    status: 'PENDENTE',
    data_resposta: '2026-03-22T08:15:00Z',
  },
  {
    id: 'resp-003',
    bid_request_id: 'br-003',
    fornecedor: MOCK_FORNECEDORES[3],
    cotacao_numero: 'BID-2026-048',
    rota: 'Shanghai → Santos',
    modal: 'MARITIMO',
    moeda: 'USD',
    valor_frete: 3650,
    taxas_origem: 520,
    taxas_destino: 680,
    valor_total: 4850,
    transit_time_dias: 35,
    free_time_dias: 21,
    transbordos: 0,
    escalas: [],
    validade: '2026-04-20',
    observacoes: 'Melhor free time do mercado. Direto sem escalas.',
    status: 'PENDENTE',
    data_resposta: '2026-03-23T16:45:00Z',
  },
]

const MOCK_TABELA_PRECOS = [
  {
    id: 'tp-001',
    origem: { codigo: 'CNSHA', nome: 'Shanghai' },
    destino: { codigo: 'BRSSZ', nome: 'Santos' },
    modal: 'MARITIMO',
    modalidade: 'FCL',
    moeda: 'USD',
    valor_frete: 3800,
    taxas_origem: 450,
    taxas_destino: 620,
    transit_time_dias: 32,
    validade_inicio: '2026-01-01',
    validade_fim: '2026-06-30',
  },
  {
    id: 'tp-002',
    origem: { codigo: 'DEHAM', nome: 'Hamburg' },
    destino: { codigo: 'BRSSZ', nome: 'Santos' },
    modal: 'MARITIMO',
    modalidade: 'FCL',
    moeda: 'EUR',
    valor_frete: 2900,
    taxas_origem: 380,
    taxas_destino: 550,
    transit_time_dias: 22,
    validade_inicio: '2026-01-01',
    validade_fim: '2026-06-30',
  },
]

// --- Cotacoes ---
export const cotacoesApi = {
  listar: (params?: Record<string, any>) => request(`${API_BASE}/cotacoes`, { params }),
  detalhe: (id: string) => request(`${API_BASE}/cotacoes/${id}`),
  criar: (data: any) => request(`${API_BASE}/cotacoes`, { method: 'POST', body: data }),
  atualizar: (id: string, data: any) => request(`${API_BASE}/cotacoes/${id}`, { method: 'PUT', body: data }),
  mudarStatus: (id: string, data: any) => request(`${API_BASE}/cotacoes/${id}/status`, { method: 'PATCH', body: data }),
  excluir: (id: string) => request(`${API_BASE}/cotacoes/${id}`, { method: 'DELETE' }),
}

// --- Fornecedores ---
export const fornecedoresApi = {
  listar: (params?: Record<string, any>) => request(`${API_BASE}/fornecedores`, { params }),
  detalhe: (id: string) => request(`${API_BASE}/fornecedores/${id}`),
  criar: (data: any) => request(`${API_BASE}/fornecedores`, { method: 'POST', body: data }),
  atualizar: (id: string, data: any) => request(`${API_BASE}/fornecedores/${id}`, { method: 'PUT', body: data }),
  mudarStatus: (id: string, status: string) => request(`${API_BASE}/fornecedores/${id}/status`, { method: 'PATCH', body: { status } }),
  excluir: (id: string) => request(`${API_BASE}/fornecedores/${id}`, { method: 'DELETE' }),
  listarTabela: (id: string) => request(`${API_BASE}/fornecedores/${id}/tabela-preco`),
  adicionarTabela: (id: string, data: any) => request(`${API_BASE}/fornecedores/${id}/tabela-preco`, { method: 'POST', body: data }),
  atualizarTabela: (id: string, tpId: string, data: any) => request(`${API_BASE}/fornecedores/${id}/tabela-preco/${tpId}`, { method: 'PUT', body: data }),
  excluirTabela: (id: string, tpId: string) => request(`${API_BASE}/fornecedores/${id}/tabela-preco/${tpId}`, { method: 'DELETE' }),
}

// --- BIDs ---
export const bidsApi = {
  disparar: (data: any) => request(`${API_BASE}/bids/disparar`, { method: 'POST', body: data }),
  dispararAberto: (data: any) => request(`${API_BASE}/bids/cotacao-aberta`, { method: 'POST', body: data }),
  listarPorCotacao: (cotacaoId: string) => request(`${API_BASE}/bids/cotacao/${cotacaoId}`),
}

// --- Comparativo ---
export const comparativoApi = {
  ranking: (cotacaoId: string) => request(`${API_BASE}/comparativo/${cotacaoId}`),
  aprovar: (cotacaoId: string, responseId: string) => request(`${API_BASE}/comparativo/${cotacaoId}/aprovar`, { method: 'POST', body: { response_id: responseId } }),
  reprovar: (cotacaoId: string, motivo?: string) => request(`${API_BASE}/comparativo/${cotacaoId}/reprovar`, { method: 'POST', body: { motivo } }),
}

// --- Avaliacoes ---
export const avaliacoesApi = {
  avaliar: (data: any) => request(`${API_BASE}/avaliacoes`, { method: 'POST', body: data }),
  ratingFornecedor: (id: string) => request(`${API_BASE}/avaliacoes/fornecedor/${id}`),
  ranking: (params?: Record<string, any>) => request(`${API_BASE}/avaliacoes/ranking`, { params }),
}

// --- Dashboard ---
export const dashboardApi = {
  kpis: (params?: Record<string, any>) => request(`${API_BASE}/dashboard`, { params }),
  calendario: () => request(`${API_BASE}/dashboard/calendario`),
}

// --- Portal do Fornecedor ---
export const portalApi = {
  dashboard: () => request(`${API_BASE}/portal/dashboard`),
  cotacoesPendentes: () => request(`${API_BASE}/portal/cotacoes-pendentes`),
  minhasRespostas: (params?: Record<string, any>) => request(`${API_BASE}/portal/minhas-respostas`, { params }),
  responder: (bidRequestId: string, data: any) => request(`${API_BASE}/portal/responder/${bidRequestId}`, { method: 'POST', body: data }),
  meuDesempenho: () => request(`${API_BASE}/portal/meu-desempenho`),
}

// --- Portal Publico (sem auth) ---
export const portalPublicApi = {
  verCotacao: (token: string) => request(`${API_BASE}/portal/public/cotacao/${token}`),
  responder: (token: string, data: any) => request(`${API_BASE}/portal/public/responder/${token}`, { method: 'POST', body: data }),
}

// --- Master Data ---
export const masterDataApi = {
  portos: (params?: Record<string, any>) => request(`${MASTER_DATA_BASE}/portos`, { params }),
  incoterms: () => request(`${MASTER_DATA_BASE}/incoterms`),
  modais: () => request(`${MASTER_DATA_BASE}/modais`),
  moedas: () => request(`${MASTER_DATA_BASE}/moedas`),
  paises: () => request(`${MASTER_DATA_BASE}/paises`),
  containers: () => request(`${MASTER_DATA_BASE}/containers`),
}
