/** Preferências do card Kanban — mesmo contrato visual do Pedido (`KanbanCardConfig`). */

export interface KanbanCardCampoBidFrete {
  campo: string
  label: string
  visivel: boolean
  grupo?: 'rota' | 'cotacao' | 'parceiro' | 'documentos' | 'progresso'
}

export interface KanbanCardConfigBidFrete {
  campos: KanbanCardCampoBidFrete[]
  dataCritica: string | null
}

export const KANBAN_BF_CARD_CAMPOS_DISPONIVEIS: KanbanCardCampoBidFrete[] = [
  { campo: 'origem_nome', label: 'Origem', visivel: true, grupo: 'rota' },
  { campo: 'destino_nome', label: 'Destino', visivel: true, grupo: 'rota' },
  { campo: 'valor_total', label: 'Valor Total', visivel: true, grupo: 'cotacao' },
  { campo: 'incoterm', label: 'Incoterm', visivel: true, grupo: 'cotacao' },
  { campo: 'propostas_count', label: 'Nº de Propostas', visivel: false, grupo: 'cotacao' },
  { campo: 'fornecedor_vencedor', label: 'Armador / Fornecedor', visivel: false, grupo: 'parceiro' },
  { campo: 'referencia_interna', label: 'Referência Interna', visivel: false, grupo: 'documentos' },
  { campo: 'modal_modalidade', label: 'Modal / Modalidade', visivel: false, grupo: 'cotacao' },
  { campo: 'status', label: 'Status', visivel: false, grupo: 'progresso' },
]

export const KANBAN_BF_CARD_GRUPOS: { key: KanbanCardCampoBidFrete['grupo']; label: string }[] = [
  { key: 'rota', label: 'Rota' },
  { key: 'cotacao', label: 'Cotação' },
  { key: 'parceiro', label: 'Fornecedor' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'progresso', label: 'Status e Progresso' },
]

export const KANBAN_BF_DATAS_CRITICAS: { campo: string; label: string }[] = [
  { campo: 'data_limite_resposta_cotacao_bid_frete_internacional', label: 'Data limite de resposta' },
  { campo: 'data_criacao_cotacao_bid_frete_internacional', label: 'Data de criação' },
]

export const KANBAN_BF_CARD_PADRAO: KanbanCardConfigBidFrete = {
  campos: KANBAN_BF_CARD_CAMPOS_DISPONIVEIS.map(c => ({ ...c })),
  dataCritica: 'data_limite_resposta_cotacao_bid_frete_internacional',
}

interface LegadoCardConfig {
  exibirValor?: boolean
  exibirIncoterm?: boolean
  exibirArmador?: boolean
  exibirDatas?: boolean
}

function normalizarCampos(salvos: KanbanCardCampoBidFrete[]): KanbanCardCampoBidFrete[] {
  const mapaSalvo = new Map(salvos.map(c => [c.campo, c]))
  return KANBAN_BF_CARD_CAMPOS_DISPONIVEIS.map(def => {
    const salvo = mapaSalvo.get(def.campo)
    return {
      ...def,
      visivel: salvo?.visivel ?? def.visivel,
      label: salvo?.label ?? def.label,
      grupo: salvo?.grupo ?? def.grupo,
    }
  })
}

function migrarLegado(raw: LegadoCardConfig): KanbanCardConfigBidFrete {
  return {
    campos: KANBAN_BF_CARD_CAMPOS_DISPONIVEIS.map(c => {
      if (c.campo === 'valor_total') return { ...c, visivel: raw.exibirValor ?? true }
      if (c.campo === 'incoterm') return { ...c, visivel: raw.exibirIncoterm ?? true }
      if (c.campo === 'fornecedor_vencedor') return { ...c, visivel: raw.exibirArmador ?? false }
      return { ...c }
    }),
    dataCritica: raw.exibirDatas !== false
      ? 'data_limite_resposta_cotacao_bid_frete_internacional'
      : null,
  }
}

export function normalizarCardConfigBidFrete(raw: unknown): KanbanCardConfigBidFrete {
  if (!raw || typeof raw !== 'object') return KANBAN_BF_CARD_PADRAO

  if ('campos' in raw && Array.isArray((raw as KanbanCardConfigBidFrete).campos)) {
    return {
      campos: normalizarCampos((raw as KanbanCardConfigBidFrete).campos),
      dataCritica: (raw as KanbanCardConfigBidFrete).dataCritica ?? KANBAN_BF_CARD_PADRAO.dataCritica,
    }
  }

  if ('exibirValor' in raw || 'exibirIncoterm' in raw) {
    return migrarLegado(raw as LegadoCardConfig)
  }

  return KANBAN_BF_CARD_PADRAO
}
