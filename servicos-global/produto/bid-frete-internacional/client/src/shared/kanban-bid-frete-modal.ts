/** Preferências do modal rápido Kanban — paridade com Pedido (`KanbanPreferencias.abas`). */

export interface KanbanModalCampoBidFrete {
  campo: string
  label: string
  visivel: boolean
  ordem: number
}

export type KanbanModalAbaBidFrete = 'cotacao' | 'rota' | 'datas'

export interface KanbanModalAbaConfigBidFrete {
  aba: KanbanModalAbaBidFrete
  campos: KanbanModalCampoBidFrete[]
}

export interface KanbanModalConfigBidFrete {
  abas: KanbanModalAbaConfigBidFrete[]
}

export interface KanbanModalCampoDisponivelBidFrete {
  campo: string
  label: string
  categoria: KanbanModalAbaBidFrete
}

export const KANBAN_BF_MODAL_LIMITES: Record<KanbanModalAbaBidFrete, number> = {
  cotacao: 10,
  rota: 6,
  datas: 8,
}

export const KANBAN_BF_MODAL_CAMPOS_DISPONIVEIS: KanbanModalCampoDisponivelBidFrete[] = [
  { campo: 'numero_cotacao_bid_frete_internacional', label: 'Nº Cotação', categoria: 'cotacao' },
  { campo: 'status_cotacao_bid_frete_internacional', label: 'Status', categoria: 'cotacao' },
  { campo: 'tipo_operacao_cotacao_bid_frete_internacional', label: 'Tipo de Operação', categoria: 'cotacao' },
  { campo: 'modal_cotacao_bid_frete_internacional', label: 'Modal', categoria: 'cotacao' },
  { campo: 'modalidade_cotacao_bid_frete_internacional', label: 'Modalidade', categoria: 'cotacao' },
  { campo: 'incoterm_cotacao_bid_frete_internacional', label: 'Incoterm', categoria: 'cotacao' },
  { campo: 'valor_meta_cotacao_bid_frete_internacional', label: 'Valor Meta', categoria: 'cotacao' },
  { campo: 'moeda_meta_cotacao_bid_frete_internacional', label: 'Moeda', categoria: 'cotacao' },
  { campo: 'referencia_interna_cotacao_bid_frete_internacional', label: 'Referência Interna', categoria: 'cotacao' },
  { campo: 'fornecedor_vencedor_nome', label: 'Fornecedor Vencedor', categoria: 'cotacao' },
  { campo: 'origem_nome_cotacao_bid_frete_internacional', label: 'Origem', categoria: 'rota' },
  { campo: 'destino_nome_cotacao_bid_frete_internacional', label: 'Destino', categoria: 'rota' },
  { campo: 'origem_codigo_cotacao_bid_frete_internacional', label: 'Código Origem', categoria: 'rota' },
  { campo: 'destino_codigo_cotacao_bid_frete_internacional', label: 'Código Destino', categoria: 'rota' },
  { campo: 'pais_origem_cotacao_bid_frete_internacional', label: 'País Origem', categoria: 'rota' },
  { campo: 'pais_destino_cotacao_bid_frete_internacional', label: 'País Destino', categoria: 'rota' },
  { campo: 'data_criacao_cotacao_bid_frete_internacional', label: 'Data de Criação', categoria: 'datas' },
  { campo: 'data_limite_resposta_cotacao_bid_frete_internacional', label: 'Data Limite Resposta', categoria: 'datas' },
  { campo: 'data_atualizacao_cotacao_bid_frete_internacional', label: 'Última Atualização', categoria: 'datas' },
]

export const KANBAN_BF_MODAL_PADRAO: KanbanModalConfigBidFrete = {
  abas: [
    {
      aba: 'cotacao',
      campos: [
        { campo: 'numero_cotacao_bid_frete_internacional', label: 'Nº Cotação', visivel: true, ordem: 0 },
        { campo: 'status_cotacao_bid_frete_internacional', label: 'Status', visivel: true, ordem: 1 },
        { campo: 'tipo_operacao_cotacao_bid_frete_internacional', label: 'Tipo de Operação', visivel: true, ordem: 2 },
        { campo: 'modal_cotacao_bid_frete_internacional', label: 'Modal', visivel: true, ordem: 3 },
        { campo: 'modalidade_cotacao_bid_frete_internacional', label: 'Modalidade', visivel: true, ordem: 4 },
        { campo: 'incoterm_cotacao_bid_frete_internacional', label: 'Incoterm', visivel: true, ordem: 5 },
        { campo: 'valor_meta_cotacao_bid_frete_internacional', label: 'Valor Meta', visivel: true, ordem: 6 },
        { campo: 'moeda_meta_cotacao_bid_frete_internacional', label: 'Moeda', visivel: true, ordem: 7 },
      ],
    },
    {
      aba: 'rota',
      campos: [
        { campo: 'origem_nome_cotacao_bid_frete_internacional', label: 'Origem', visivel: true, ordem: 0 },
        { campo: 'destino_nome_cotacao_bid_frete_internacional', label: 'Destino', visivel: true, ordem: 1 },
        { campo: 'origem_codigo_cotacao_bid_frete_internacional', label: 'Código Origem', visivel: false, ordem: 2 },
        { campo: 'destino_codigo_cotacao_bid_frete_internacional', label: 'Código Destino', visivel: false, ordem: 3 },
      ],
    },
    {
      aba: 'datas',
      campos: [
        { campo: 'data_criacao_cotacao_bid_frete_internacional', label: 'Data de Criação', visivel: true, ordem: 0 },
        { campo: 'data_limite_resposta_cotacao_bid_frete_internacional', label: 'Data Limite Resposta', visivel: true, ordem: 1 },
      ],
    },
  ],
}

function clonarAbas(abas: KanbanModalAbaConfigBidFrete[]): KanbanModalAbaConfigBidFrete[] {
  return abas.map(a => ({
    ...a,
    campos: a.campos.map(c => ({ ...c })),
  }))
}

function normalizarAbas(salvas: KanbanModalAbaConfigBidFrete[]): KanbanModalAbaConfigBidFrete[] {
  return KANBAN_BF_MODAL_PADRAO.abas.map(padrao => {
    const salva = salvas.find(a => a.aba === padrao.aba)
    const camposSalvos = salva?.campos ?? []
    const mapa = new Map(camposSalvos.map(c => [c.campo, c]))
    const disponiveis = KANBAN_BF_MODAL_CAMPOS_DISPONIVEIS.filter(d => d.categoria === padrao.aba)
    const campos = disponiveis
      .filter(d => mapa.has(d.campo) || padrao.campos.some(p => p.campo === d.campo))
      .map((d, idx) => {
        const existente = mapa.get(d.campo) ?? padrao.campos.find(p => p.campo === d.campo)
        return {
          campo: d.campo,
          label: existente?.label ?? d.label,
          visivel: existente?.visivel ?? false,
          ordem: existente?.ordem ?? idx,
        }
      })
      .sort((a, b) => a.ordem - b.ordem)

    const extras = camposSalvos
      .filter(c => !disponiveis.some(d => d.campo === c.campo))
      .map((c, i) => ({ ...c, ordem: campos.length + i }))

    return { aba: padrao.aba, campos: [...campos, ...extras] }
  })
}

export function normalizarModalConfigBidFrete(raw: unknown): KanbanModalConfigBidFrete {
  if (!raw || typeof raw !== 'object' || !('abas' in raw) || !Array.isArray((raw as KanbanModalConfigBidFrete).abas)) {
    return { abas: clonarAbas(KANBAN_BF_MODAL_PADRAO.abas) }
  }
  return { abas: normalizarAbas((raw as KanbanModalConfigBidFrete).abas) }
}

export function clonarModalConfigBidFrete(config: KanbanModalConfigBidFrete): KanbanModalConfigBidFrete {
  return { abas: clonarAbas(config.abas) }
}
