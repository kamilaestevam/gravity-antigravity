/**
 * api.ts — Client API para o produto Pedido
 *
 * Comunica com o backend via processos-core (proxy Vite -> :8025)
 */

import type {
  Pedido,
  PedidoItem,
  PedidosListResponse,
  PedidoStatusConfig,
  PedidoColunaConfig,
  PedidoPreferenciasColunas,
  ConsolidacaoPreview,
  ConsolidacaoPayload,
  CampoDivergente,
  ItemConsolidado,
  TransferPayload,
  TransferPreview,
  TransferResultado,
  TransferHistorico,
  EdicaoMassaPayload,
  EdicaoMassaPreview,
  EdicaoMassaResultado,
  CampoEdicaoMassa,
  ColunaMapeada,
  SmartImportPreview,
  SmartImportConfirmar,
  SmartImportResultado,
  SmartImportLinha,
  SmartImportAlerta,
  DecisaoDuplicata,
  DuplicarPayload,
  DuplicarItemPayload,
  DuplicarResultado,
  ExcluirPreview,
  ExcluirResultado,
  Anexo,
  AnexoUploadResultado,
  TemplatePdf,
  GerarPdfPayload,
  GerarPdfResultado,
  TipoDocumentoGerar,
  IdiomaDocumento,
  GerarDocumentoPayload,
  ColunaUsuario,
  ValorColunaUsuario,
} from './types'
import { MOCK_PEDIDOS_RESPONSE } from './mockData'

let context = { tenantId: '', userId: '', userName: '' }

export function setApiContext(ctx: { tenantId: string; userId: string; userName?: string }): void {
  context = { ...context, ...ctx }
}

export function getApiContext(): { tenantId: string; userId: string; userName: string } {
  return context
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': context.tenantId,
      'x-user-id': context.userId,
      'x-user-name': context.userName,
      'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const raw = await response.json().catch(() => null)
    // Servidor retorna { error: { message } } ou { error: string }
    const msg = raw?.error?.message || (typeof raw?.error === 'string' ? raw.error : null)
    throw new Error(msg || `HTTP ${response.status}`)
  }
  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch {
    console.error('[api] resposta não-JSON do servidor (status:', response.status, ')')
    throw new Error(`Resposta inválida do servidor (${response.status})`)
  }
}

// ── Pedidos ───────────────────────────────────────────────────────────────────

/** Codifica IDs legados que contêm '/' (ex: pedi_id_1234/26) para uso em URLs */
function pid(id: string): string {
  return encodeURIComponent(id)
}

export const pedidoApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ data: Pedido[]; total: number }>(`/api/v1/pedidos${query}`)
  },

  buscarPorId: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}`),

  criar: (data: Partial<Pedido>) =>
    request<Pedido>('/api/v1/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<Pedido>) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletar: (id: string) =>
    request<void>(`/api/v1/pedidos/${pid(id)}`, { method: 'DELETE' }),

  alterarStatus: (id: string, status: string) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  duplicar: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}/duplicar`, { method: 'POST' }),
}

// ── Itens do Pedido ───────────────────────────────────────────────────────────

export const pedidoItemApi = {
  adicionar: (pedidoId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(item => {
      // Em dev: sincroniza mock para que listar() fallback reflita o item real
      if (import.meta.env.DEV) {
        const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === pedidoId)
        if (pedido) pedido.itens = [...(pedido.itens ?? []), item]
      }
      return item
    }),

  atualizar: (pedidoId: string, itemId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (pedidoId: string, itemId: string) =>
    request<void>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}`, { method: 'DELETE' }),

  cancelarQuantidade: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade }),
    }),

  atualizarPronta: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}/pronta`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade_pronta_total_item_pedido: quantidade }),
    }),
}

// ── Cursor pagination + inline edit ───────────────────────────────────────────

export const pedidoVirtualApi = {
  /** Listagem com cursor keyset — para TabelaVirtualGlobal */
  listar: (params: {
    cursor?: string
    page?: number
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
  } = {}) => {
    const q = new URLSearchParams()
    if (params.cursor)         q.set('cursor', params.cursor)
    if (params.page != null)   q.set('page', String(params.page))
    if (params.sort)             q.set('sort', params.sort)
    if (params.dir)              q.set('dir', params.dir)
    if (params.limit)            q.set('limit', String(params.limit))
    if (params.status)           q.set('status', params.status)
    if (params.busca)            q.set('busca', params.busca)
    return request<PedidosListResponse>(`/api/v1/pedidos?${q}`).catch(err => {
      if (import.meta.env.DEV) return MOCK_PEDIDOS_RESPONSE
      throw err
    })
  },

  /** Contar total de matches find-in-page no banco (pedidos + itens) */
  localizar: (params: { termo: string; status?: string; busca?: string }) => {
    const q = new URLSearchParams()
    q.set('termo', params.termo)
    if (params.status) q.set('status', params.status)
    if (params.busca)  q.set('busca', params.busca)
    return request<{ total: number }>(`/api/v1/pedidos/localizar?${q}`)
  },

  /** Edição inline de um campo */
  editarCampo: (id: string, campo: string, valor: unknown) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}/campo`, {
      method: 'PATCH',
      body: JSON.stringify({ campo, valor: valor === undefined ? null : valor }),
    }).catch(err => {
      if (import.meta.env.DEV) {
        const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
        if (pedido) return { ...pedido, [campo]: valor } as Pedido
      }
      throw err
    }),
}

// ── Init — agrega 4 queries em 1 request ─────────────────────────────────────

export interface PedidoInitResponse {
  pedidos:      PedidosListResponse
  status:       { data: PedidoStatusConfig[] }
  preferencias: PedidoPreferenciasColunas | null
  colunas:      ColunaUsuario[]
}

export const pedidoInitApi = {
  carregar: (params: {
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
  } = {}): Promise<PedidoInitResponse> => {
    const q = new URLSearchParams()
    if (params.sort)   q.set('sort', params.sort)
    if (params.dir)    q.set('dir', params.dir)
    if (params.limit)  q.set('limit', String(params.limit))
    if (params.status) q.set('status', params.status)
    if (params.busca)  q.set('busca', params.busca)
    return request<PedidoInitResponse>(`/api/v1/pedidos/init?${q}`).catch(err => {
      if (import.meta.env.DEV) {
        // DEV sem backend: retorna mock combinado
        return {
          pedidos:      MOCK_PEDIDOS_RESPONSE,
          status:       { data: [] },
          preferencias: null,
          colunas:      [],
        }
      }
      throw err
    })
  },
}

// ── Configuração de status e colunas ──────────────────────────────────────────

export const pedidoConfigApi = {
  listarStatus: () =>
    request<{ data: PedidoStatusConfig[] }>('/api/v1/pedidos/config/status'),

  listarColunas: () =>
    request<{ data: PedidoColunaConfig[] }>('/api/v1/pedidos/config/colunas'),

  getPreferenciasUsuario: () =>
    request<PedidoPreferenciasColunas>('/api/v1/pedidos/config/preferencias/usuario'),

  salvarPreferenciasUsuario: (prefs: PedidoPreferenciasColunas) =>
    request<PedidoPreferenciasColunas>('/api/v1/pedidos/config/preferencias/usuario', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),
}

// ── Ações em lote ─────────────────────────────────────────────────────────────

export const pedidoLoteApi = {
  mudarStatusConfirmar: (ids: string[], novoStatus: string) =>
    request<{ sucesso: number; erros: { id: string; motivo: string }[] }>('/api/v1/pedidos/lote/status/confirmar', {
      method: 'POST',
      body: JSON.stringify({ ids, status_novo: novoStatus }),
    }),

  exportar: (ids: string[], formato: 'csv' | 'excel' = 'csv') =>
    request<{ url: string; total: number }>('/api/v1/pedidos/lote/exportar', {
      method: 'POST',
      body: JSON.stringify({ ids, formato }),
    }),
}

// ── Importacao ────────────────────────────────────────────────────────────────

export const importacaoApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return request<{ preview: Partial<Pedido>[]; total: number }>('/api/v1/pedidos/importar', {
      method: 'POST',
      headers: {
        'x-tenant-id': context.tenantId,
        'x-user-id': context.userId,
        'x-user-name': context.userName,
        'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
      },
      body: formData,
    })
  },

  confirmar: (pedidos: Partial<Pedido>[]) =>
    request<{ criados: number }>('/api/v1/pedidos/importar/confirmar', {
      method: 'POST',
      body: JSON.stringify({ pedidos }),
    }),
}

// ── Consolidação de Pedidos ───────────────────────────────────────────────────

export const pedidoConsolidarApi = {
  /** Retorna divergências de campos e sugestões de merge para os ids selecionados */
  preview: (ids: string[]) =>
    request<ConsolidacaoPreview>('/api/v1/pedidos/consolidar/preview', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockConsolidarPreview(ids)
      throw err
    }),

  /** Executa o merge e retorna o pedido consolidado criado */
  confirmar: (payload: ConsolidacaoPayload) =>
    request<Pedido>('/api/v1/pedidos/consolidar/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockConsolidarConfirmar(payload)
      throw err
    }),
}

/** Mock de preview — detecta divergências nos pedidos selecionados do MOCK_PEDIDOS_RESPONSE */
function mockConsolidarPreview(ids: string[]): ConsolidacaoPreview {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => ids.includes(p.id))
  if (pedidos.length < 2) {
    throw new Error('Selecione ao menos 2 pedidos para consolidar')
  }

  const camposDivergentes: CampoDivergente[] = []

  const verificarCampo = (campo: keyof typeof pedidos[0], rotulo: string) => {
    const valores = pedidos.map(p => ({
      pedido_id: p.id,
      numero_pedido: p.numero_pedido,
      valor: (p[campo] as string | number | null) ?? null,
    }))
    const unicos = new Set(valores.map(v => String(v.valor)))
    if (unicos.size > 1) {
      camposDivergentes.push({
        campo,
        rotulo,
        valores,
        valor_sugerido: valores[0].valor,
      })
    }
    return unicos.size === 1
  }

  const camposIguais: string[] = []
  if (verificarCampo('incoterm', 'Incoterm')) camposIguais.push('incoterm')
  if (verificarCampo('moeda_pedido', 'Moeda')) camposIguais.push('moeda_pedido')
  if (verificarCampo('nome_exportador', 'Exportador')) camposIguais.push('nome_exportador')
  if (verificarCampo('data_emissao_pedido', 'Data Emissão do Pedido')) camposIguais.push('data_emissao_pedido')
  if (verificarCampo('cobertura_cambial_pedido', 'Cobertura Cambial')) camposIguais.push('cobertura_cambial_pedido')
  if (verificarCampo('condicao_pagamento_pedido', 'Condição de Pagamento')) camposIguais.push('condicao_pagamento_pedido')

  // Mapa de itens por part_number
  const itensPorPart: Record<string, ItemConsolidado> = {}
  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      if (itensPorPart[item.part_number]) {
        itensPorPart[item.part_number].quantidade_total += item.saldo_item_pedido
        itensPorPart[item.part_number].pedidos_origem.push(pedido.numero_pedido)
        itensPorPart[item.part_number].pode_fundir = true
      } else {
        itensPorPart[item.part_number] = {
          part_number: item.part_number,
          descricao_item: item.descricao_item,
          ncm: item.ncm,
          unidade_comercializada_item: item.unidade_comercializada_item ?? null,
          moeda_item: item.moeda_item,
          valor_unitario_item: item.valor_unitario_item ?? null,
          quantidade_total: item.saldo_item_pedido,
          pedidos_origem: [pedido.numero_pedido],
          pode_fundir: false,
        }
      }
    }
  }

  const valorTotal = pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)
  const primeiraPedido = pedidos[0]
  const ano = new Date().getFullYear()
  const seq = String(MOCK_PEDIDOS_RESPONSE.data.length + 1).padStart(3, '0')
  const numeroSugerido = `PO-CONS-${ano}/${seq}`

  return {
    ids,
    campos_divergentes: camposDivergentes,
    campos_iguais: camposIguais,
    itens: Object.values(itensPorPart),
    valor_total_soma: valorTotal,
    moeda: primeiraPedido.moeda_pedido,
    numero_sugerido: numeroSugerido,
  }
}

/** Mock de confirmar — cria pedido consolidado e "remove" originais do estado */
function mockConsolidarConfirmar(payload: ConsolidacaoPayload): Pedido {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => payload.ids.includes(p.id))
  const primeiro = pedidos[0]

  const itensMerge: PedidoItem[] = []
  const partNumbers = new Set<string>()

  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      if (payload.fundir_itens_mesmo_part_number && partNumbers.has(item.part_number)) {
        const existente = itensMerge.find(i => i.part_number === item.part_number)
        if (existente) {
          existente.quantidade_inicial_item_pedido += item.quantidade_inicial_item_pedido
          existente.saldo_item_pedido += item.saldo_item_pedido
        }
      } else {
        partNumbers.add(item.part_number)
        itensMerge.push({ ...item, pedido_id: 'consolidado-mock' })
      }
    }
  }

  const novoPedido: Pedido = {
    ...primeiro,
    id: `pedi_cons_${Date.now()}`,
    numero_pedido: payload.numero_pedido,
    status: 'consolidado',
    pedidos_origem_id: payload.ids,
    valor_total_pedido: pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0),
    itens: itensMerge,
    pedido_criado_em: new Date().toISOString(),
    pedido_atualizado_em: new Date().toISOString(),
    ...payload.campos_escolhidos,
  }

  // Remover originais do mock e adicionar o consolidado
  const idx = MOCK_PEDIDOS_RESPONSE.data.findIndex(p => payload.ids.includes(p.id))
  MOCK_PEDIDOS_RESPONSE.data = MOCK_PEDIDOS_RESPONSE.data.filter(p => !payload.ids.includes(p.id))
  MOCK_PEDIDOS_RESPONSE.data.splice(Math.max(0, idx), 0, novoPedido)
  MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length

  return novoPedido
}

// ── Transferência de Pedidos ──────────────────────────────────────────────────

export const pedidoTransferirApi = {
  /** Pré-visualização — retorna impacto sem alterar o banco */
  preview: (payload: Omit<TransferPayload, 'numero_pedido_novo'>) =>
    request<TransferPreview>('/api/v1/pedidos/transferir/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Confirmação — executa a transferência */
  confirmar: (payload: TransferPayload) =>
    request<TransferResultado>('/api/v1/pedidos/transferir/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Lista histórico de transferências de um pedido (para reversão) */
  historico: (pedido_id: string) =>
    request<TransferHistorico[]>(`/api/v1/pedidos/${pedido_id}/transferencias`),

  /** Reverter uma transferência específica */
  reverter: (transfer_id: string) =>
    request<TransferResultado>(`/api/v1/pedidos/transferir/${transfer_id}/reverter`, {
      method: 'POST',
    }),
}

// ── Mocks DEV para Transferência ──────────────────────────────────────────────

function mockTransferirPreview(payload: Omit<TransferPayload, 'numero_pedido_novo'>): TransferPreview {
  const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === payload.pedido_id)
  const item = pedido?.itens.find(i => i.id === payload.item_id)

  const quantidadeApos = (item?.saldo_item_pedido ?? 0) - payload.quantidade_origem
  const encerra = quantidadeApos <= 0

  const alertas: string[] = []
  if (encerra) alertas.push('Pedido de origem ficará com quantidade zero após a transferência')
  if (payload.quantidade_origem > (item?.saldo_item_pedido ?? 0)) {
    alertas.push('Quantidade solicitada excede quantidade disponível no item')
  }

  return {
    cenario: payload.cenario,
    origem: {
      pedido_numero: pedido?.numero_pedido ?? payload.pedido_id,
      item_part_number: item?.part_number ?? payload.item_id,
      saldo_item_pedido: item?.saldo_item_pedido ?? 0,
      quantidade_apos: Math.max(0, quantidadeApos),
      encerra,
    },
    destinos: payload.destinos.map(d => ({
      tipo: d.tipo === 'mesmo' ? 'existente' : d.tipo,
      pedido_numero: d.pedido_id
        ? MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === d.pedido_id)?.numero_pedido
        : undefined,
      quantidade: d.quantidade,
      alertas: [],
    })),
    alertas_globais: alertas,
  }
}

function mockTransferirConfirmar(payload: TransferPayload): TransferResultado {
  const pedidosDestino = payload.destinos
    .filter(d => d.pedido_id)
    .map(d => d.pedido_id as string)

  const pedidosCriados: string[] = payload.destinos
    .filter(d => d.tipo === 'novo')
    .map(() => `pedi_new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`)

  return {
    pedido_origem_id: payload.pedido_id,
    pedidos_destino_ids: pedidosDestino,
    pedidos_criados: pedidosCriados,
    itens_excluidos: [],
    pedidos_encerrados: [],
  }
}

function mockTransferirHistorico(pedido_id: string): TransferHistorico[] {
  // Retorna histórico vazio em DEV — não há transferências mock gravadas
  return []
}

function mockTransferirReverter(transfer_id: string): TransferResultado {
  return {
    pedido_origem_id: transfer_id,
    pedidos_destino_ids: [],
    pedidos_criados: [],
    itens_excluidos: [],
    pedidos_encerrados: [],
  }
}

// ── Edição em Massa ───────────────────────────────────────────────────────────

export const pedidoEdicaoMassaApi = {
  /** Preview — mostra impacto antes de confirmar */
  preview: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaPreview>('/api/v1/pedidos/edicao-em-massa/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) {
        console.warn('[EdicaoMassa] preview caiu no mock:', err?.message)
        return mockEdicaoMassaPreview(payload)
      }
      throw err
    }),

  /** Confirmar — executa a edição em massa */
  confirmar: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaResultado>('/api/v1/pedidos/edicao-em-massa/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) {
        console.warn('[EdicaoMassa] confirmar caiu no mock:', err?.message)
        return mockEdicaoMassaConfirmar(payload)
      }
      throw err
    }),
}

/** Calcula o novo valor simulado dado o valor atual e a operação */
function calcularNovoValorMock(atual: string | number | null, c: CampoEdicaoMassa): string | number {
  switch (c.operacao) {
    case 'substituir':
      return c.valor
    case 'somar':
      return Number(atual ?? 0) + Number(c.valor)
    case 'subtrair':
      return Number(atual ?? 0) - Number(c.valor)
    case 'percentual':
      return Number(atual ?? 0) * (1 + Number(c.valor) / 100)
    case 'avancar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() + Number(c.valor))
      return d.toISOString().slice(0, 10)
    }
    case 'recuar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() - Number(c.valor))
      return d.toISOString().slice(0, 10)
    }
    default:
      return c.valor
  }
}

/** Mock DEV — preview de edição em massa */
function mockEdicaoMassaPreview(payload: EdicaoMassaPayload): EdicaoMassaPreview {
  const pedidosMock = MOCK_PEDIDOS_RESPONSE.data.filter(p => payload.pedido_ids.includes(p.id))
  // Fallback: quando IDs reais não batem com mock, usa count do payload
  const pedidos = pedidosMock.length > 0 ? pedidosMock : MOCK_PEDIDOS_RESPONSE.data.slice(0, payload.pedido_ids.length)
  return {
    pedidos_afetados: payload.pedido_ids.length,
    itens_afetados: pedidos.reduce((s, p) => s + (p.itens?.length ?? 0), 0),
    campos: payload.campos.map(c => {
      const valores = pedidos.map(p => String((p as Record<string, unknown>)[c.campo] ?? ''))
      const distintos = [...new Set(valores)]
      return {
        campo: c.campo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.valor,
        multiplos_valores: distintos.length > 1,
        valores_distintos: distintos,
        alertas: [],
      }
    }),
    alertas_globais: [],
    por_pedido: pedidos.map(p => ({
      pedido_id: p.id,
      numero_pedido: p.numero_pedido,
      alteracoes: payload.campos
        .filter(c => c.nivel === 'pedido')
        .map(c => {
          const atual = (p as Record<string, unknown>)[c.campo] as string | number | null ?? null
          return {
            campo: c.campo,
            valor_atual: atual,
            valor_novo: calcularNovoValorMock(atual, c),
          }
        }),
    })),
  }
}

/** Mock DEV — confirmar edição em massa */
function mockEdicaoMassaConfirmar(payload: EdicaoMassaPayload): EdicaoMassaResultado {
  let itensAtualizados = 0
  payload.pedido_ids.forEach(id => {
    const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
    if (!pedido) return
    payload.campos.forEach(c => {
      if (c.nivel === 'pedido') {
        aplicarOperacaoMock(pedido as Record<string, unknown>, c)
      } else {
        pedido.itens?.forEach(item => {
          aplicarOperacaoMock(item as Record<string, unknown>, c)
          itensAtualizados++
        })
      }
    })
  })
  return {
    pedidos_atualizados: payload.pedido_ids.length,
    itens_atualizados: itensAtualizados,
    campos_alterados: payload.campos.map(c => c.campo),
    erros: [],
  }
}

/** Aplica a operação de edição em massa em um objeto mock */
function aplicarOperacaoMock(obj: Record<string, unknown>, c: CampoEdicaoMassa): void {
  const atual = obj[c.campo]
  switch (c.operacao) {
    case 'substituir':
      obj[c.campo] = c.valor
      break
    case 'somar':
      obj[c.campo] = Number(atual ?? 0) + Number(c.valor)
      break
    case 'subtrair':
      obj[c.campo] = Number(atual ?? 0) - Number(c.valor)
      break
    case 'percentual':
      obj[c.campo] = Number(atual ?? 0) * (1 + Number(c.valor) / 100)
      break
    case 'avancar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() + Number(c.valor))
      obj[c.campo] = d.toISOString()
      break
    }
    case 'recuar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() - Number(c.valor))
      obj[c.campo] = d.toISOString()
      break
    }
  }
}

// ── Smart Import ──────────────────────────────────────────────────────────────

export const smartImportApi = {
  /** Upload + parse + mapeamento IA — retorna preview com mapeamento e linhas */
  analisar: (arquivo: File) => {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    // Omitir Content-Type — browser define boundary automaticamente
    return fetch('/api/v1/pedidos/smart-import/analisar', {
      method: 'POST',
      headers: {
        'x-tenant-id': context.tenantId,
        'x-user-id': context.userId,
        'x-user-name': context.userName,
        'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
      },
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }
      const data: SmartImportPreview = await res.json()
      return data
    }).catch(err => {
      if (import.meta.env.DEV) return mockSmartImportAnalisar(arquivo.name)
      throw err
    })
  },

  /** Confirmar importacao com decisoes do usuario */
  confirmar: (payload: SmartImportConfirmar) =>
    request<SmartImportResultado>('/api/v1/pedidos/smart-import/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockSmartImportConfirmar(payload)
      throw err
    }),

  /** Buscar mapeamento salvo para hash de colunas */
  mapeamentoSalvo: (hashColunas: string) =>
    request<ColunaMapeada[] | null>(`/api/v1/pedidos/smart-import/mapeamento/${hashColunas}`),
}

// ── Mocks DEV para Smart Import ───────────────────────────────────────────────

/** Mock de analisar: simula mapeamento IA com dados ficticios */
function mockSmartImportAnalisar(nomeArquivo: string): SmartImportPreview {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? 'xlsx'
  void ext

  // Colunas com valores de exemplo reais do arquivo
  const colunasMock: Array<{ coluna: string; campo: string | null; conf: number; exemplo: string | null }> = [
    { coluna: 'PO Number',    campo: 'numero_pedido',       conf: 97, exemplo: '021597-00'          },
    { coluna: 'Supplier',     campo: 'exportador',          conf: 88, exemplo: 'STORK THERMEQ B.V.' },
    { coluna: 'NCM',          campo: 'ncm',                 conf: 95, exemplo: '8471.30.19'          },
    { coluna: 'Part No.',     campo: 'part_number',         conf: 91, exemplo: 'STE-A4-001'          },
    { coluna: 'Description',  campo: 'descricao_item',       conf: 85, exemplo: 'Heat exchanger plate'},
    { coluna: 'Qty',          campo: 'quantidade_inicial_item_pedido',  conf: 78, exemplo: '100'                 },
    { coluna: 'Unit',         campo: 'unidade',             conf: 72, exemplo: 'UN'                  },
    { coluna: 'Unit Price',   campo: 'valor_unitario_item',       conf: 83, exemplo: '330,00'              },
    { coluna: 'Currency',     campo: 'moeda_pedido',        conf: 90, exemplo: 'USD'                 },
    { coluna: 'Incoterms',    campo: 'incoterm',            conf: 94, exemplo: 'FOB'                 },
    { coluna: 'Ship Date',    campo: 'data_embarque',       conf: 67, exemplo: '30/05/2023'          },
    { coluna: 'Internal Ref', campo: null,                  conf: 15, exemplo: 'HPB-2023-042'        },
  ]

  const mapeamento: ColunaMapeada[] = colunasMock.map(c => ({
    coluna_arquivo: c.coluna,
    campo_sistema: c.campo,
    confianca: c.conf,
    nivel: c.conf >= 90 ? 'auto' : c.conf >= 50 ? 'confirmado' : 'ignorado',
    inferido_por: c.conf >= 90 ? 'ia' : c.conf >= 50 ? 'dados' : 'ia',
    exemplo_valor: c.exemplo,
  }))

  const alertasDuplicata: SmartImportAlerta[] = [{
    campo: 'numero_pedido',
    tipo: 'duplicado_sistema',
    mensagem: 'Pedido PO-2026/003 ja existe no sistema',
    nivel: 'aviso',
  }]

  const linhas: SmartImportLinha[] = [
    {
      linha_arquivo: 2,
      numero_pedido: '021597-00',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: '021597-00',
        exportador: 'STORK THERMEQ B.V.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        data_embarque: '30/05/2023',
        part_number: 'STE-A4-001',
        descricao_item: 'Heat exchanger plate',
        quantidade_inicial_item_pedido: 100,
        unidade: 'UN',
        valor_unitario_item: 330.00,
        ncm: '8471.30.19',
      },
    },
    {
      linha_arquivo: 3,
      numero_pedido: 'PO-2026/011',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: 'PO-2026/011',
        exportador: 'Dongguan Electronics Ltd.',
        incoterm: 'CIF',
        moeda_pedido: 'USD',
        part_number: 'DGL-7700',
        descricao_item: 'Motor controller board',
        quantidade_inicial_item_pedido: 50,
        unidade: 'UN',
        valor_unitario_item: 85.00,
        ncm: '8544.42.90',
      },
    },
    {
      linha_arquivo: 4,
      numero_pedido: 'PO-2026/003',
      status: 'aviso',
      alertas: alertasDuplicata,
      dados: {
        numero_pedido: 'PO-2026/003',
        exportador: 'Berlin GmbH',
        incoterm: 'DAP',
        moeda_pedido: 'EUR',
        part_number: 'BRL-220V',
        descricao_item: 'Power supply unit',
        quantidade_inicial_item_pedido: 200,
        unidade: 'UN',
        valor_unitario_item: 45.00,
      },
    },
    {
      linha_arquivo: 5,
      numero_pedido: 'PO-2026/012',
      status: 'aviso',
      alertas: [{
        campo: 'ncm',
        tipo: 'formato_invalido',
        mensagem: 'NCM "8471" parece incompleto (esperado 8 digitos)',
        nivel: 'aviso',
      }],
      dados: {
        numero_pedido: 'PO-2026/012',
        exportador: 'Guangzhou Supplies Co.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        part_number: 'GZH-CAB-001',
        descricao_item: 'Cable assembly',
        quantidade_inicial_item_pedido: 500,
        unidade: 'MT',
        valor_unitario_item: 3.20,
        ncm: '8471',
      },
    },
    {
      linha_arquivo: 6,
      numero_pedido: null,
      status: 'erro',
      alertas: [
        {
          campo: 'quantidade_inicial_item_pedido',
          tipo: 'valor_negativo',
          mensagem: 'Quantidade deve ser maior que zero',
          nivel: 'erro',
        },
      ],
      dados: { quantidade_inicial_item_pedido: -5, exportador: 'Unknown Supplier' },
    },
  ]

  // Dados brutos para visualização do documento original
  const dados_brutos = linhas.map(l => ({
    linha: l.linha_arquivo,
    valores: Object.fromEntries(
      Object.entries(l.dados).map(([k, v]) => [k, String(v ?? '')])
    ),
  }))

  return {
    preview_id: `mock-preview-${Date.now()}`,
    total_linhas: linhas.length,
    total_pedidos: 4,
    total_itens: 6,
    mapeamento,
    confianca_global: 83,
    memoria_aplicada: false,
    linhas,
    dados_brutos,
  }
}

/** Mock de confirmar: simula criacao de pedidos e insere no MOCK_PEDIDOS_RESPONSE */
function mockSmartImportConfirmar(payload: SmartImportConfirmar): SmartImportResultado {
  const ids = payload.linhas_incluidas.map(
    (_, i) => `pedi_imp_${Date.now()}_${i}`
  )
  const atualizados = Object.values(payload.decisoes_duplicatas).filter(d => d === 'sobrescrever').length
  const pulados     = Object.values(payload.decisoes_duplicatas).filter(d => d === 'pular').length
  const criados     = ids.length - atualizados - pulados

  // Adiciona pedidos mockados ao store em memória para aparecerem na lista
  const novosPedidos: Pedido[] = ids.map((id, i) => ({
    id,
    tenant_id: 'tenant-demo',
    company_id: 'company-demo',
    tipo_operacao: 'importacao' as const,
    numero_pedido: `PO-IMP-${Date.now()}-${i + 1}`,
    status: 'draft' as const,
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    nome_exportador: 'Importado via Smart Import',
    nome_fabricante: null,
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 0,
    casas_decimais_valor_pedido: 2,
    casas_decimais_quantidade_pedido: 2,
    unidade_comercializada_pedido: 'UN',
    quantidade_total_inicial_pedido: 0,
    quantidade_transferida_total: 0,
    cobertura_cambial_pedido: 'sem_cobertura',
    condicao_pagamento_pedido: null,
    data_emissao_pedido: new Date().toISOString().split('T')[0],
    numero_proforma: null,
    numero_invoice: null,
    referencia_importador: null,
    referencia_exportador: null,
    referencia_fabricante: null,
    itens: [],
    pedido_criado_em: new Date().toISOString(),
    pedido_atualizado_em: new Date().toISOString(),
  }))

  MOCK_PEDIDOS_RESPONSE.data.unshift(...novosPedidos)
  MOCK_PEDIDOS_RESPONSE.total += novosPedidos.length

  return {
    criados,
    atualizados,
    pulados,
    erros: [],
    ids_criados: ids,
  }
}

// ── Exportacao ────────────────────────────────────────────────────────────────

export const exportacaoApi = {
  exportar: (formato: 'csv' | 'excel', filtros?: Record<string, string>) =>
    request<Blob>('/api/v1/pedidos/exportar', {
      method: 'POST',
      body: JSON.stringify({ formato, filtros }),
    }),
}

// ── Duplicar Pedidos ──────────────────────────────────────────────────────────

export const pedidoDuplicarApi = {
  /** Preview: verifica o que será copiado/resetado conforme config do tenant */
  preview: (ids: string[]) =>
    request<{
      config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
      pedidos: { id: string; numero_pedido: string; total_itens: number }[]
    }>('/api/v1/pedidos/duplicar/preview', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockDuplicarPreview(ids)
      throw err
    }),

  /** Confirmar duplicação de um ou mais pedidos */
  confirmar: (payload: DuplicarPayload) =>
    request<DuplicarResultado>('/api/v1/pedidos/duplicar/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockDuplicarConfirmar(payload)
      throw err
    }),

  /** Duplicar itens dentro de um pedido */
  duplicarItens: (payload: DuplicarItemPayload) =>
    request<DuplicarResultado>('/api/v1/pedidos/duplicar/itens', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockDuplicarItens(payload)
      throw err
    }),
}

function mockDuplicarPreview(ids: string[]): {
  config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
  pedidos: { id: string; numero_pedido: string; total_itens: number }[]
} {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data
    .filter(p => ids.includes(p.id))
    .map(p => ({ id: p.id, numero_pedido: p.numero_pedido, total_itens: p.itens?.length ?? 0 }))
  return {
    config: { numero_auto: false, copiar_datas: false, status_inicial: 'copiar' },
    pedidos,
  }
}

function mockDuplicarConfirmar(payload: DuplicarPayload): DuplicarResultado {
  const criados = payload.ids.map(id => {
    const original = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
    const numeroNovo = payload.numeros?.[id] ?? `PO-COPY-${Date.now()}-${id.slice(-4)}`
    const novoId = `pedi_dup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    if (original) {
      const copia = { ...original, id: novoId, numero_pedido: numeroNovo, pedido_criado_em: new Date().toISOString(), pedido_atualizado_em: new Date().toISOString() }
      MOCK_PEDIDOS_RESPONSE.data.push(copia)
      MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length
    }
    return { original_id: id, novo_id: novoId, numero_pedido: numeroNovo }
  })
  return { criados, erros: [] }
}

function mockDuplicarItens(payload: DuplicarItemPayload): DuplicarResultado {
  const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === payload.pedido_id)
  const criados: DuplicarResultado['criados'] = []

  if (pedido?.itens) {
    for (const itemId of payload.item_ids) {
      const original = (pedido.itens as Record<string, unknown>[]).find((i) => (i as { id: string }).id === itemId)
      if (original) {
        const novoId = `pite_dup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        (pedido.itens as Record<string, unknown>[]).push({ ...original, id: novoId })
        criados.push({ original_id: itemId, novo_id: novoId, numero_pedido: pedido.numero_pedido })
      }
    }
  }

  return { criados, erros: [] }
}

// ── Excluir Pedidos ───────────────────────────────────────────────────────────

export const pedidoExcluirApi = {
  /** Preview: quais pedidos podem ser excluídos, quais estão bloqueados */
  preview: (ids: string[]) =>
    request<ExcluirPreview>('/api/v1/pedidos/excluir/preview', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockExcluirPreview(ids)
      throw err
    }),

  /** Confirmar exclusão definitiva dos pedidos permitidos */
  confirmar: (ids: string[]) =>
    request<ExcluirResultado>('/api/v1/pedidos/excluir/confirmar', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockExcluirConfirmar(ids)
      throw err
    }),

  /** Excluir itens de um pedido */
  excluirItens: (pedido_id: string, item_ids: string[]) =>
    request<ExcluirResultado>('/api/v1/pedidos/excluir/itens', {
      method: 'POST',
      body: JSON.stringify({ pedido_id, item_ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockExcluirItens(pedido_id, item_ids)
      throw err
    }),
}

const STATUS_PERMITIDOS_TODOS = ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado']

function getMockStatusPermitidos(): string[] {
  try {
    const raw = localStorage.getItem('pedido:regras_config')
    if (raw) {
      const config = JSON.parse(raw) as { excluir?: { statusPermitidos?: string[] } }
      return config?.excluir?.statusPermitidos ?? STATUS_PERMITIDOS_TODOS
    }
  } catch { /* ignore */ }
  return STATUS_PERMITIDOS_TODOS
}

function mockExcluirPreview(ids: string[]): ExcluirPreview {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => ids.includes(p.id))
  const permitidos: ExcluirPreview['permitidos'] = []
  const bloqueados: ExcluirPreview['bloqueados'] = []
  const statusPermitidos = getMockStatusPermitidos()

  for (const p of pedidos) {
    if (statusPermitidos.includes(p.status)) {
      permitidos.push({ id: p.id, numero_pedido: p.numero_pedido, total_itens: p.itens?.length ?? 0 })
    } else {
      bloqueados.push({
        id: p.id,
        numero_pedido: p.numero_pedido,
        status: p.status,
        motivo: `Status "${p.status}" não permite exclusão. Permitidos: ${statusPermitidos.join(', ')}`,
      })
    }
  }
  return { permitidos, bloqueados }
}

function mockExcluirConfirmar(ids: string[]): ExcluirResultado {
  const antes = MOCK_PEDIDOS_RESPONSE.data.length
  const itensRemovidos = MOCK_PEDIDOS_RESPONSE.data
    .filter(p => ids.includes(p.id))
    .reduce((acc, p) => acc + (p.itens?.length ?? 0), 0)
  MOCK_PEDIDOS_RESPONSE.data = MOCK_PEDIDOS_RESPONSE.data.filter(p => !ids.includes(p.id))
  MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length
  return { excluidos: antes - MOCK_PEDIDOS_RESPONSE.data.length, itens_excluidos: itensRemovidos, pedidos_excluidos_por_sem_item: 0 }
}

function mockExcluirItens(_pedido_id: string, item_ids: string[]): ExcluirResultado {
  return { excluidos: 0, itens_excluidos: item_ids.length, pedidos_excluidos_por_sem_item: 0 }
}

// ── Regras de Configuração ────────────────────────────────────────────────────

export interface RegrasConfigBackend {
  duplicar_numero_auto: boolean
  duplicar_copiar_datas: boolean
  duplicar_status_inicial: string
  excluir_status_permitidos: string[]
  excluir_pedido_sem_item_permitido: boolean
  excluir_confirmar_com_preview: boolean
  alerta_numero_duplicado: boolean
  alerta_valor_total_divergente: boolean
  alerta_quantidade_total_divergente: boolean
  alerta_quantidade_pronta_divergente: boolean
  alerta_peso_liquido_divergente: boolean
  alerta_peso_bruto_divergente: boolean
  alerta_cubagem_divergente: boolean
}

const REGRAS_CONFIG_DEFAULT: RegrasConfigBackend = {
  duplicar_numero_auto: false,
  duplicar_copiar_datas: false,
  duplicar_status_inicial: 'copiar',
  excluir_status_permitidos: ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'],
  excluir_pedido_sem_item_permitido: true,
  excluir_confirmar_com_preview: true,
  alerta_numero_duplicado: true,
  alerta_valor_total_divergente: true,
  alerta_quantidade_total_divergente: true,
  alerta_quantidade_pronta_divergente: true,
  alerta_peso_liquido_divergente: true,
  alerta_peso_bruto_divergente: true,
  alerta_cubagem_divergente: true,
}

export const configRegrasApi = {
  obter: (): Promise<RegrasConfigBackend> =>
    request<RegrasConfigBackend>('/api/v1/pedidos/config/regras').catch(err => {
      if (import.meta.env.DEV) return REGRAS_CONFIG_DEFAULT
      throw err
    }),

  salvar: (dados: Partial<RegrasConfigBackend>): Promise<RegrasConfigBackend> =>
    request<RegrasConfigBackend>('/api/v1/pedidos/config/regras', {
      method: 'PUT',
      body: JSON.stringify(dados),
    }).catch(err => {
      if (import.meta.env.DEV) return { ...REGRAS_CONFIG_DEFAULT, ...dados }
      throw err
    }),
}

// ── Anexos ────────────────────────────────────────────────────────────────────

export const anexosApi = {
  listar: (vinculo: 'pedido' | 'item', vinculo_id: string) =>
    request<Anexo[]>(`/api/v1/pedidos/anexos?vinculo=${vinculo}&vinculo_id=${encodeURIComponent(vinculo_id)}`).catch(
      err => {
        if (import.meta.env.DEV) return mockAnexosListar(vinculo, vinculo_id)
        throw err
      }
    ),

  upload: (
    vinculo: 'pedido' | 'item',
    vinculo_id: string,
    arquivo: File,
    descricao?: string,
    categoria?: string
  ) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    form.append('vinculo', vinculo)
    form.append('vinculo_id', vinculo_id)
    if (descricao) form.append('descricao', descricao)
    if (categoria) form.append('categoria', categoria)
    // Não enviar Content-Type — o browser define boundary automaticamente para multipart
    return fetch('/api/v1/pedidos/anexos', {
      method: 'POST',
      headers: {
        'x-tenant-id': context.tenantId,
        'x-user-id': context.userId,
        'x-user-name': context.userName,
        'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
      },
      body: form,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }
      return res.json() as Promise<AnexoUploadResultado>
    }).catch(err => {
      if (import.meta.env.DEV) return mockAnexosUpload(vinculo, vinculo_id, arquivo, descricao, categoria)
      throw err
    })
  },

  download: (id: string) =>
    fetch(`/api/v1/pedidos/anexos/${id}/download`, {
      headers: {
        'x-tenant-id': context.tenantId,
        'x-user-id': context.userId,
        'x-user-name': context.userName,
        'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
      },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.blob()
    }),

  excluir: (id: string) =>
    request<void>(`/api/v1/pedidos/anexos/${id}`, { method: 'DELETE' }).catch(err => {
      if (import.meta.env.DEV) { mockAnexosExcluir(id); return }
      throw err
    }),
}

// ── PDF ───────────────────────────────────────────────────────────────────────

/** Tipo local para o gerenciador de templates da aba Configurações */
export interface PdfTemplate {
  id: string
  nome: string
  conteudo: string
  criadoEm: string
}

export const pdfApi = {
  listarTemplates: () =>
    request<{ data: PdfTemplate[] }>('/api/v1/pedidos/pdf/templates').catch(err => {
      if (import.meta.env.DEV) return { data: mockPdfTemplatesLocal() }
      throw err
    }),

  gerar: (payload: GerarPdfPayload) =>
    request<GerarPdfResultado>('/api/v1/pedidos/pdf/gerar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockPdfGerar(payload)
      throw err
    }),

  criarTemplate: (data: { nome: string; conteudo: string }) =>
    request<PdfTemplate>('/api/v1/pedidos/pdf/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(err => {
      if (import.meta.env.DEV) {
        const novo: PdfTemplate = {
          id: `tpl_${Date.now()}`,
          nome: data.nome,
          conteudo: data.conteudo,
          criadoEm: new Date().toISOString().slice(0, 10),
        }
        return novo
      }
      throw err
    }),

  atualizarTemplate: (id: string, data: { nome: string; conteudo: string }) =>
    request<PdfTemplate>(`/api/v1/pedidos/pdf/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).catch(err => {
      if (import.meta.env.DEV) {
        return { id, nome: data.nome, conteudo: data.conteudo, criadoEm: new Date().toISOString().slice(0, 10) } as PdfTemplate
      }
      throw err
    }),

  deletarTemplate: (id: string) =>
    request<void>(`/api/v1/pedidos/pdf/templates/${id}`, { method: 'DELETE' }).catch(err => {
      if (import.meta.env.DEV) return
      throw err
    }),
}

// ── Gerar Documento (multilíngue) ────────────────────────────────────────────

export const gerarDocumentoApi = {
  gerar: (payload: GerarDocumentoPayload) =>
    request<GerarPdfResultado>('/api/v1/pedidos/pdf/documentos/gerar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockGerarDocumento(payload)
      throw err
    }),
}

function mockGerarDocumento(payload: GerarDocumentoPayload): GerarPdfResultado {
  const tipoLabel: Record<string, string> = {
    pedido_de_venda: 'Pedido de Venda', proforma_invoice: 'Proforma Invoice', invoice: 'Invoice',
  }
  const html = `<!DOCTYPE html><html lang="${payload.idioma}"><head>
<meta charset="utf-8"><title>${tipoLabel[payload.tipo_documento] ?? payload.tipo_documento}</title>
<style>body{font-family:sans-serif;margin:40px;color:#1e293b}h1{color:#3b82f6}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}</style>
</head><body>
<h1>[MOCK] ${tipoLabel[payload.tipo_documento] ?? payload.tipo_documento}</h1>
<p><strong>Idioma:</strong> ${payload.idioma.toUpperCase()} &nbsp;&nbsp; <strong>Pedido:</strong> ${payload.pedido_id}</p>
<p style="color:#94a3b8;font-size:12px">Este é um documento de demonstração gerado em ambiente de desenvolvimento.</p>
<table><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>
<tr><td>Tipo</td><td>${tipoLabel[payload.tipo_documento]}</td></tr>
<tr><td>Idioma</td><td>${payload.idioma.toUpperCase()}</td></tr>
<tr><td>Pedido ID</td><td>${payload.pedido_id}</td></tr>
<tr><td>Salvar como anexo</td><td>${payload.salvar_como_anexo ? 'Sim' : 'Não'}</td></tr>
</tbody></table>
</body></html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return {
    url_download: URL.createObjectURL(blob),
    anexo_id: `anexo_doc_${Date.now()}`,
    is_pdf: false,
  }
}

// ── Mocks Anexos ──────────────────────────────────────────────────────────────

const _mockAnexosStore: Anexo[] = []

function mockAnexosListar(vinculo: 'pedido' | 'item', vinculo_id: string): Anexo[] {
  return _mockAnexosStore.filter(a => a.vinculo === vinculo && a.vinculo_id === vinculo_id)
}

function mockAnexosUpload(
  vinculo: 'pedido' | 'item',
  vinculo_id: string,
  arquivo: File,
  descricao?: string,
  categoria?: string
): AnexoUploadResultado {
  const id = `anx_mock_${Date.now()}`
  const anexo: Anexo = {
    id,
    tenant_id: context.tenantId,
    vinculo,
    vinculo_id,
    nome_arquivo: arquivo.name,
    tipo_arquivo: arquivo.type || 'application/octet-stream',
    tamanho_bytes: arquivo.size,
    descricao,
    categoria,
    storage_key: `${context.tenantId}/${vinculo_id}/${id}_${arquivo.name}`,
    uploaded_by: context.userId,
    uploaded_at: new Date().toISOString(),
  }
  _mockAnexosStore.push(anexo)
  return { id, nome_arquivo: arquivo.name, tamanho_bytes: arquivo.size, url_download: `/api/v1/pedidos/anexos/${id}/download` }
}

function mockAnexosExcluir(id: string): void {
  const idx = _mockAnexosStore.findIndex(a => a.id === id)
  if (idx !== -1) _mockAnexosStore.splice(idx, 1)
}

// ── Mocks PDF ─────────────────────────────────────────────────────────────────

function mockPdfTemplatesLocal(): PdfTemplate[] {
  return [
    { id: 'tpl_mock_001', nome: 'Template PO Padrão',       conteudo: '<h1>{{numero_pedido}}</h1>',  criadoEm: '2026-04-01' },
    { id: 'tpl_mock_002', nome: 'Template Proforma Invoice', conteudo: '<h1>{{exportador}}</h1>',    criadoEm: '2026-04-02' },
  ]
}

function mockPdfGerar(payload: GerarPdfPayload): GerarPdfResultado {
  const anexoId = `anx_pdf_mock_${Date.now()}`
  const tpl = mockPdfTemplatesLocal().find(t => t.id === payload.template_id)
  const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>${tpl?.nome ?? 'Template'}</title>
<style>body{font-family:sans-serif;margin:40px;color:#1e293b}h1{color:#3b82f6}pre{background:#f8fafc;padding:16px;border-radius:8px;font-size:13px;overflow:auto}</style>
</head><body>
<h1>[MOCK] ${tpl?.nome ?? 'Template personalizado'}</h1>
<p><strong>Pedido:</strong> ${payload.pedido_id}</p>
<p style="color:#94a3b8;font-size:12px">Este é um documento de demonstração gerado em ambiente de desenvolvimento.</p>
${tpl ? `<p><strong>Conteúdo do template:</strong></p><pre>${tpl.conteudo.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : ''}
</body></html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return {
    url_download: URL.createObjectURL(blob),
    anexo_id: anexoId,
    is_pdf: false,
  }
}

// ── Colunas do Usuário ────────────────────────────────────────────────────────

/** Mock com 3 colunas de exemplo para desenvolvimento */
const MOCK_COLUNAS_USUARIO: ColunaUsuario[] = [
  {
    id: 'col_mock_1',
    tenant_id: 'tenant-mock',
    nome: 'Margem %',
    chave: 'margem_percentual',
    tipo: 'percentual',
    escopo: 'pedido',
    visibilidade: 'todos',
    obrigatorio: false,
    ordem: 1,
    ativo: true,
    created_by: 'user-mock',
    created_at: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'col_mock_2',
    tenant_id: 'tenant-mock',
    nome: 'Prioridade',
    chave: 'prioridade',
    tipo: 'select',
    escopo: 'ambos',
    visibilidade: 'todos',
    obrigatorio: false,
    opcoes: ['Alta', 'Média', 'Baixa'],
    ordem: 2,
    ativo: true,
    created_by: 'user-mock',
    created_at: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'col_mock_3',
    tenant_id: 'tenant-mock',
    nome: 'Ref. Interna',
    chave: 'ref_interna',
    tipo: 'texto',
    escopo: 'item',
    visibilidade: 'privado',
    obrigatorio: false,
    ordem: 3,
    ativo: true,
    created_by: 'user-mock',
    created_at: '2026-04-01T00:00:00.000Z',
  },
]

let mockColunasStore: ColunaUsuario[] = [...MOCK_COLUNAS_USUARIO]
const mockValoresStore: ValorColunaUsuario[] = []

export const colunasUsuarioApi = {
  listar: (): Promise<ColunaUsuario[]> =>
    request<ColunaUsuario[]>('/api/v1/pedidos/colunas-usuario').catch(err => {
      if (import.meta.env.DEV) return mockColunasStore.filter(c => c.ativo)
      throw err
    }),

  criar: (
    data: Omit<ColunaUsuario, 'id' | 'tenant_id' | 'chave' | 'created_by' | 'created_at'>,
  ): Promise<ColunaUsuario> =>
    request<ColunaUsuario>('/api/v1/pedidos/colunas-usuario', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(err => {
      if (import.meta.env.DEV) {
        const chave = data.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/%/g, '_percentual')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '')
        const nova: ColunaUsuario = {
          ...data,
          id: `col_${Date.now()}`,
          tenant_id: 'tenant-mock',
          chave,
          created_by: 'user-mock',
          created_at: new Date().toISOString(),
        }
        mockColunasStore.push(nova)
        return nova
      }
      throw err
    }),

  atualizar: (id: string, data: Partial<ColunaUsuario>): Promise<ColunaUsuario> =>
    request<ColunaUsuario>(`/api/v1/pedidos/colunas-usuario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).catch(err => {
      if (import.meta.env.DEV) {
        const idx = mockColunasStore.findIndex(c => c.id === id)
        if (idx === -1) throw new Error('Coluna não encontrada')
        // Não permite mudar o tipo
        const { tipo: _tipo, ...semTipo } = data
        mockColunasStore[idx] = { ...mockColunasStore[idx], ...semTipo }
        return mockColunasStore[idx]
      }
      throw err
    }),

  excluir: (id: string): Promise<void> =>
    request<void>(`/api/v1/pedidos/colunas-usuario/${id}`, { method: 'DELETE' }).catch(err => {
      if (import.meta.env.DEV) {
        const idx = mockColunasStore.findIndex(c => c.id === id)
        if (idx >= 0) mockColunasStore[idx] = { ...mockColunasStore[idx], ativo: false }
        return
      }
      throw err
    }),

  reordenar: (ids: string[]): Promise<void> =>
    request<void>('/api/v1/pedidos/colunas-usuario/reordenar', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) {
        ids.forEach((id, idx) => {
          const col = mockColunasStore.find(c => c.id === id)
          if (col) col.ordem = idx + 1
        })
        return
      }
      throw err
    }),

  salvarValores: (
    vinculo: 'pedido' | 'item',
    vinculo_id: string,
    valores: Record<string, string>,
  ): Promise<void> =>
    request<void>('/api/v1/pedidos/colunas-usuario/valores', {
      method: 'POST',
      body: JSON.stringify({ vinculo, vinculo_id, valores }),
    }).catch(err => {
      if (import.meta.env.DEV) {
        for (const [coluna_id, valor] of Object.entries(valores)) {
          const idx = mockValoresStore.findIndex(
            v => v.coluna_id === coluna_id && v.vinculo_id === vinculo_id,
          )
          if (idx >= 0) {
            mockValoresStore[idx] = { ...mockValoresStore[idx], valor }
          } else {
            mockValoresStore.push({
              id: `val_${Date.now()}_${coluna_id}`,
              tenant_id: 'tenant-mock',
              coluna_id,
              vinculo,
              vinculo_id,
              valor,
            })
          }
        }
        return
      }
      throw err
    }),

  listarValores: (vinculo: 'pedido' | 'item', vinculo_id: string): Promise<ValorColunaUsuario[]> =>
    request<ValorColunaUsuario[]>(
      `/api/v1/pedidos/colunas-usuario/valores?vinculo=${vinculo}&vinculo_id=${vinculo_id}`,
    ).catch(err => {
      if (import.meta.env.DEV) {
        return mockValoresStore.filter(
          v => v.vinculo === vinculo && v.vinculo_id === vinculo_id,
        )
      }
      throw err
    }),

  /**
   * Análise semântica via Gemini.
   * Retorna { gemini: false } quando GEMINI_GABI_ENABLED=false no servidor —
   * o chamador deve usar o fallback determinístico local.
   */
  gabiAnalisar: async (
    expressao: string,
    campos: Array<{ chave: string; label: string; unidade?: string; papel?: string; tipo?: string }>,
  ): Promise<{ gemini: false } | { gemini: true; titulo: string; texto: string; sugestao?: string }> => {
    try {
      const res = await request<{ gemini: boolean; titulo?: string; texto?: string; sugestao?: string }>(
        '/api/v1/pedidos/colunas-usuario/gabi-analise',
        { method: 'POST', body: JSON.stringify({ expressao, campos }) },
      )
      if (res.gemini && res.titulo && res.texto) {
        return { gemini: true, titulo: res.titulo, texto: res.texto, sugestao: res.sugestao }
      }
      return { gemini: false }
    } catch {
      return { gemini: false } // falha de rede → fallback silencioso
    }
  },
}

// ── Dashboard API ─────────────────────────────────────────────────────────────

export interface DashboardKpis {
  period: string
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_concluidos: number
  pedidos_cancelados: number
  pedidos_atrasados: number
  valor_total: number
  valor_total_brl: number
  moedas_sem_taxa: string[]
  cobertura_pendente: number
  qtd_total: number
  itens_prontos: number
  qtd_inicial_total: number
  qtd_atual_total: number
  qtd_transferida_total: number
  valor_itens_total: number
  taxa_atraso: number
  ticket_medio: number
  taxa_conclusao_itens: number
  exposicao_financeira: number
  taxa_transferencia: number
  [key: string]: number | string | string[]
}

export interface DashboardTrendBucket {
  month: string
  label: string
  total_pedidos: number
  valor_total: number
  cobertura_pendente: number
  valor_itens_total: number
  [key: string]: string | number
}

export interface DashboardTrendResponse {
  period: string
  granularity: string
  value: DashboardTrendBucket[]
}

export interface DashboardDistributionGroup {
  status: string
  count: number
  valor_total: number
}

export interface DashboardDistributionResponse {
  period: string
  value: DashboardDistributionGroup[]
}

export const dashboardApi = {
  kpis: (period: string) =>
    request<DashboardKpis>(`/api/v1/pedidos/dashboard/kpis?period=${encodeURIComponent(period)}`),

  trend: (period: string, granularity = 'month') =>
    request<DashboardTrendResponse>(
      `/api/v1/pedidos/dashboard/trend?period=${encodeURIComponent(period)}&granularity=${granularity}`,
    ),

  distribution: (period: string) =>
    request<DashboardDistributionResponse>(
      `/api/v1/pedidos/dashboard/distribution?period=${encodeURIComponent(period)}`,
    ),
}

// ── Kanban Preferências ───────────────────────────────────────────────────────

export const kanbanConfigApi = {
  obterPreferencias: (): Promise<{ data: import('./types').KanbanPreferencias | null }> =>
    request<{ data: import('./types').KanbanPreferencias | null }>('/api/v1/pedidos/kanban/preferencias')
      .catch(() => ({ data: null })),

  salvarPreferencias: (payload: import('./types').KanbanPreferencias): Promise<{ data: import('./types').KanbanPreferencias }> =>
    request<{ data: import('./types').KanbanPreferencias }>('/api/v1/pedidos/kanban/preferencias', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  restaurarPadrao: (): Promise<{ data: { restaurado: boolean } }> =>
    request<{ data: { restaurado: boolean } }>('/api/v1/pedidos/kanban/preferencias', {
      method: 'DELETE',
    }),
}
