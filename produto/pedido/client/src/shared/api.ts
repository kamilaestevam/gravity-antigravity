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

let context = { tenantId: '', userId: '' }

export function setApiContext(ctx: { tenantId: string; userId: string }): void {
  context = ctx
}

export function getApiContext(): { tenantId: string; userId: string } {
  return context
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': context.tenantId,
      'x-user-id': context.userId,
      'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
    throw new Error(error.error?.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// ── Pedidos ───────────────────────────────────────────────────────────────────

export const pedidoApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ data: Pedido[]; total: number }>(`/api/v1/pedidos${query}`)
  },

  buscarPorId: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${id}`),

  criar: (data: Partial<Pedido>) =>
    request<Pedido>('/api/v1/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<Pedido>) =>
    request<Pedido>(`/api/v1/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletar: (id: string) =>
    request<void>(`/api/v1/pedidos/${id}`, { method: 'DELETE' }),

  alterarStatus: (id: string, status: string) =>
    request<Pedido>(`/api/v1/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  duplicar: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${id}/duplicar`, { method: 'POST' }),
}

// ── Itens do Pedido ───────────────────────────────────────────────────────────

export const pedidoItemApi = {
  adicionar: (pedidoId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (pedidoId: string, itemId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (pedidoId: string, itemId: string) =>
    request<void>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}`, { method: 'DELETE' }),

  cancelarQuantidade: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade }),
    }),

  atualizarPronta: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}/pronta`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade_pronta_total: quantidade }),
    }),
}

// ── Cursor pagination + inline edit ───────────────────────────────────────────

export const pedidoVirtualApi = {
  /** Listagem com cursor keyset — para TabelaVirtualGlobal */
  listar: (params: {
    cursor?: string
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
  } = {}) => {
    const q = new URLSearchParams()
    if (params.cursor) q.set('cursor', params.cursor)
    if (params.sort)   q.set('sort', params.sort)
    if (params.dir)    q.set('dir', params.dir)
    if (params.limit)  q.set('limit', String(params.limit))
    if (params.status) q.set('status', params.status)
    if (params.busca)  q.set('busca', params.busca)
    return request<PedidosListResponse>(`/api/v1/pedidos?${q}`).catch(err => {
      if (import.meta.env.DEV) return MOCK_PEDIDOS_RESPONSE
      throw err
    })
  },

  /** Edição inline de um campo com optimistic lock (lança em 409) */
  editarCampo: (id: string, campo: string, valor: unknown, version?: number) =>
    request<Pedido>(`/api/v1/pedidos/${id}/campo`, {
      method: 'PATCH',
      body: JSON.stringify({ campo, valor, version }),
    }).catch(err => {
      if (import.meta.env.DEV) {
        const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
        if (pedido) return { ...pedido, [campo]: valor } as Pedido
      }
      throw err
    }),
}

// ── Configuração de status e colunas ──────────────────────────────────────────

export const pedidoConfigApi = {
  listarStatus: () =>
    request<{ data: PedidoStatusConfig[] }>('/api/v1/pedidos/config/status'),

  listarColunas: () =>
    request<{ data: PedidoColunaConfig[] }>('/api/v1/pedidos/config/colunas'),

  getPreferenciasUsuario: () =>
    request<PedidoPreferenciasColunas>('/api/v1/pedidos/config/preferencias-usuario'),

  salvarPreferenciasUsuario: (prefs: PedidoPreferenciasColunas) =>
    request<PedidoPreferenciasColunas>('/api/v1/pedidos/config/preferencias-usuario', {
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
  if (verificarCampo('exportador_nome', 'Exportador')) camposIguais.push('exportador_nome')
  if (verificarCampo('data_emissao_pedido', 'Data de Emissão')) camposIguais.push('data_emissao_pedido')
  if (verificarCampo('cobertura_cambial', 'Cobertura Cambial')) camposIguais.push('cobertura_cambial')
  if (verificarCampo('condicao_pagamento', 'Condição de Pagamento')) camposIguais.push('condicao_pagamento')

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
          descricao: item.descricao,
          ncm: item.ncm,
          unidade_comercializada_item: item.unidade_comercializada_item,
          moeda_item: item.moeda_item,
          valor_unitario: item.valor_unitario,
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
    pedidos_origem: payload.ids,
    valor_total_pedido: pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0),
    itens: itensMerge,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    }).catch(err => {
      if (import.meta.env.DEV) return mockTransferirPreview(payload)
      throw err
    }),

  /** Confirmação — executa a transferência */
  confirmar: (payload: TransferPayload) =>
    request<TransferResultado>('/api/v1/pedidos/transferir/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockTransferirConfirmar(payload)
      throw err
    }),

  /** Lista histórico de transferências de um pedido (para reversão) */
  historico: (pedido_id: string) =>
    request<TransferHistorico[]>(`/api/v1/pedidos/${pedido_id}/transferencias`).catch(err => {
      if (import.meta.env.DEV) return mockTransferirHistorico(pedido_id)
      throw err
    }),

  /** Reverter uma transferência específica */
  reverter: (transfer_id: string) =>
    request<TransferResultado>(`/api/v1/pedidos/transferir/${transfer_id}/reverter`, {
      method: 'POST',
    }).catch(err => {
      if (import.meta.env.DEV) return mockTransferirReverter(transfer_id)
      throw err
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
      if (import.meta.env.DEV) return mockEdicaoMassaPreview(payload)
      throw err
    }),

  /** Confirmar — executa a edição em massa */
  confirmar: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaResultado>('/api/v1/pedidos/edicao-em-massa/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockEdicaoMassaConfirmar(payload)
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
  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => payload.pedido_ids.includes(p.id))
  return {
    pedidos_afetados: pedidos.length,
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
    { coluna: 'Description',  campo: 'descricao',           conf: 85, exemplo: 'Heat exchanger plate'},
    { coluna: 'Qty',          campo: 'quantidade_inicial_item_pedido',  conf: 78, exemplo: '100'                 },
    { coluna: 'Unit',         campo: 'unidade',             conf: 72, exemplo: 'UN'                  },
    { coluna: 'Unit Price',   campo: 'valor_unitario',      conf: 83, exemplo: '330,00'              },
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
      numero_pedido_sugerido: 'PO-2026/010',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: '021597-00',
        exportador: 'STORK THERMEQ B.V.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        data_embarque: '30/05/2023',
        part_number: 'STE-A4-001',
        descricao: 'Heat exchanger plate',
        quantidade_inicial_item_pedido: 100,
        unidade: 'UN',
        valor_unitario: 330.00,
        ncm: '8471.30.19',
      },
    },
    {
      linha_arquivo: 3,
      numero_pedido: 'PO-2026/011',
      numero_pedido_sugerido: 'PO-2026/011',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: 'PO-2026/011',
        exportador: 'Dongguan Electronics Ltd.',
        incoterm: 'CIF',
        moeda_pedido: 'USD',
        part_number: 'DGL-7700',
        descricao: 'Motor controller board',
        quantidade_inicial_item_pedido: 50,
        unidade: 'UN',
        valor_unitario: 85.00,
        ncm: '8544.42.90',
      },
    },
    {
      linha_arquivo: 4,
      numero_pedido: 'PO-2026/003',
      numero_pedido_sugerido: 'PO-2026/003',
      status: 'aviso',
      alertas: alertasDuplicata,
      dados: {
        numero_pedido: 'PO-2026/003',
        exportador: 'Berlin GmbH',
        incoterm: 'DAP',
        moeda_pedido: 'EUR',
        part_number: 'BRL-220V',
        descricao: 'Power supply unit',
        quantidade_inicial_item_pedido: 200,
        unidade: 'UN',
        valor_unitario: 45.00,
      },
    },
    {
      linha_arquivo: 5,
      numero_pedido: 'PO-2026/012',
      numero_pedido_sugerido: 'PO-2026/012',
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
        descricao: 'Cable assembly',
        quantidade_inicial_item_pedido: 500,
        unidade: 'MT',
        valor_unitario: 3.20,
        ncm: '8471',
      },
    },
    {
      linha_arquivo: 6,
      numero_pedido: null,
      numero_pedido_sugerido: null,
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
    status: 'rascunho',
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    exportador_nome: 'Importado via Smart Import',
    fabricante_nome: null,
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 0,
    casas_decimais_total_pedido: 2,
    casas_decimais_quantidade_total_pedido: 2,
    unidade_comercializada_pedido: 'UN',
    quantidade_total_inicial_pedido: 0,
    quantidade_transferida_total: 0,
    cobertura_cambial: null,
    condicao_pagamento: null,
    data_emissao_pedido: new Date().toISOString().split('T')[0],
    numero_proforma: null,
    numero_invoice: null,
    referencia_importador: null,
    referencia_exportador: null,
    referencia_fabricante: null,
    itens: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
      const copia = { ...original, id: novoId, numero_pedido: numeroNovo, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      MOCK_PEDIDOS_RESPONSE.data.push(copia)
      MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length
    }
    return { original_id: id, novo_id: novoId, numero_pedido: numeroNovo }
  })
  return { criados, erros: [] }
}

function mockDuplicarItens(payload: DuplicarItemPayload): DuplicarResultado {
  return {
    criados: payload.item_ids.map(id => ({
      original_id: id,
      novo_id: `pite_dup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      numero_pedido: payload.pedido_id,
    })),
    erros: [],
  }
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

const STATUS_PERMITIDOS_DEFAULT = ['draft']

function mockExcluirPreview(ids: string[]): ExcluirPreview {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => ids.includes(p.id))
  const permitidos: ExcluirPreview['permitidos'] = []
  const bloqueados: ExcluirPreview['bloqueados'] = []

  for (const p of pedidos) {
    if (STATUS_PERMITIDOS_DEFAULT.includes(p.status)) {
      permitidos.push({ id: p.id, numero_pedido: p.numero_pedido, total_itens: p.itens?.length ?? 0 })
    } else {
      bloqueados.push({
        id: p.id,
        numero_pedido: p.numero_pedido,
        status: p.status,
        motivo: `Status "${p.status}" não permite exclusão. Apenas pedidos em rascunho podem ser excluídos.`,
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
    request<GerarPdfResultado>('/api/v1/pedidos/documentos/gerar', {
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
}
