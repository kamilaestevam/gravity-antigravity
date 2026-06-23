/**
 * Monta where + DTO para drill-down de alertas/rotas na visão Insights.
 */

const STATUS_ANDAMENTO_ALERTA = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'FALTA_INFORMACAO',
] as const

const STATUS_MAPA_ROTA = [
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'FALTA_INFORMACAO',
] as const

export type ContextoInsightsDetalhe =
  | 'vence_hoje'
  | 'resposta'
  | 'aprovacao'
  | 'nova'
  | 'rota'

export type ParamsRotaInsightsDetalhe = {
  codigo_origem?: string
  codigo_destino?: string
  modal_cotacao_bid_frete_internacional?: string
  data_referencia?: string
}

export function montarWhereInsightsDetalheBidFreteInternacional(
  contexto: ContextoInsightsDetalhe,
  filtroWorkspace: Record<string, unknown>,
  paramsRota?: ParamsRotaInsightsDetalhe,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id_produto_gravity: 'bid-frete-internacional',
    ...filtroWorkspace,
  }

  const referencia = paramsRota?.data_referencia
    ? new Date(`${paramsRota.data_referencia}T12:00:00`)
    : new Date()
  const referenciaValida = Number.isNaN(referencia.getTime()) ? new Date() : referencia

  const inicioDia = new Date(referenciaValida)
  inicioDia.setHours(0, 0, 0, 0)
  const fimDia = new Date(referenciaValida)
  fimDia.setHours(23, 59, 59, 999)
  const seteDiasAtras = new Date(referenciaValida.getTime() - 7 * 24 * 60 * 60 * 1000)

  switch (contexto) {
    case 'vence_hoje':
      return {
        ...base,
        status_cotacao_bid_frete_internacional: { in: [...STATUS_ANDAMENTO_ALERTA] },
        data_limite_resposta_cotacao_bid_frete_internacional: { gte: inicioDia, lte: fimDia },
      }
    case 'resposta':
      return {
        ...base,
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
      }
    case 'aprovacao':
      return {
        ...base,
        status_cotacao_bid_frete_internacional: 'AGUARDANDO_APROVACAO',
      }
    case 'nova':
      return {
        ...base,
        status_cotacao_bid_frete_internacional: { not: 'CANCELADA' },
        data_criacao_cotacao_bid_frete_internacional: { gte: seteDiasAtras },
      }
    case 'rota': {
      const where: Record<string, unknown> = {
        ...base,
        status_cotacao_bid_frete_internacional: { in: [...STATUS_MAPA_ROTA] },
      }
      if (paramsRota?.codigo_origem) {
        where.origem_codigo_cotacao_bid_frete_internacional = paramsRota.codigo_origem
      }
      if (paramsRota?.codigo_destino) {
        where.destino_codigo_cotacao_bid_frete_internacional = paramsRota.codigo_destino
      }
      if (paramsRota?.modal_cotacao_bid_frete_internacional) {
        where.modal_cotacao_bid_frete_internacional = paramsRota.modal_cotacao_bid_frete_internacional
      }
      return where
    }
    default:
      return base
  }
}

type PropostaRow = {
  valor_total_proposta_bid_frete_internacional: number
  moeda_proposta_bid_frete_internacional: string
  dias_transito_proposta_bid_frete_internacional: number
  status_proposta_bid_frete_internacional: string
  data_criacao_proposta_bid_frete_internacional: Date
  fornecedor: { nome_fornecedor_bid_frete_internacional: string } | null
}

type DisparoRow = {
  data_envio_disparo_cotacao_bid_frete_internacional: Date | null
  data_resposta_disparo_cotacao_bid_frete_internacional: Date | null
  fornecedor: { nome_fornecedor_bid_frete_internacional: string } | null
}

export type CotacaoInsightsDetalheDto = {
  id_cotacao_bid_frete_internacional: string
  numero_cotacao_bid_frete_internacional: string
  status_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string | null
  quantidade_volume_cotacao_bid_frete_internacional: number
  peso_kg_cotacao_bid_frete_internacional: number | null
  cubagem_m3_cotacao_bid_frete_internacional: number | null
  incoterm_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  modalidade_cotacao_bid_frete_internacional: string
  valor_meta_cotacao_bid_frete_internacional: number | null
  moeda_meta_cotacao_bid_frete_internacional: string | null
  data_criacao_cotacao_bid_frete_internacional: string
  data_limite_resposta_cotacao_bid_frete_internacional: string | null
  data_aprovacao_cotacao_bid_frete_internacional: string | null
  data_envio_disparo_cotacao_bid_frete_internacional: string | null
  data_primeira_resposta_cotacao_bid_frete_internacional: string | null
  propostas: Array<{
    fornecedor: string
    valor: string
    transit: string
    status: string
    cor: string
  }>
  historico: Array<{
    data: string
    texto: string
    autor: string
  }>
}

function fmtDataHora(iso: Date | string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function fmtValor(moeda: string | null | undefined, valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return '—'
  const codigo = moeda ?? 'USD'
  return `${codigo} ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function resolverPrimeiraResposta(disparos: DisparoRow[], propostas: PropostaRow[]): Date | null {
  let menor: number | null = null
  for (const disparo of disparos) {
    const resposta = disparo.data_resposta_disparo_cotacao_bid_frete_internacional
    if (!resposta) continue
    const ts = new Date(resposta).getTime()
    if (!Number.isFinite(ts)) continue
    if (menor == null || ts < menor) menor = ts
  }
  for (const proposta of propostas) {
    const ts = new Date(proposta.data_criacao_proposta_bid_frete_internacional).getTime()
    if (!Number.isFinite(ts)) continue
    if (menor == null || ts < menor) menor = ts
  }
  return menor != null ? new Date(menor) : null
}

function resolverPrimeiroEnvioDisparo(disparos: DisparoRow[]): Date | null {
  let menor: number | null = null
  for (const disparo of disparos) {
    const envio = disparo.data_envio_disparo_cotacao_bid_frete_internacional
    if (!envio) continue
    const ts = new Date(envio).getTime()
    if (!Number.isFinite(ts)) continue
    if (menor == null || ts < menor) menor = ts
  }
  return menor != null ? new Date(menor) : null
}

function corStatusProposta(status: string): string {
  if (status === 'APROVADA') return '#34d399'
  if (status === 'REPROVADA' || status === 'RECUSADA') return '#f87171'
  if (status === 'PENDENTE' || status === 'EM_ANALISE') return '#fbbf24'
  return '#60a5fa'
}

function montarHistorico(
  cotacao: {
    data_criacao_cotacao_bid_frete_internacional: Date
    data_limite_resposta_cotacao_bid_frete_internacional: Date | null
    data_aprovacao_cotacao_bid_frete_internacional: Date | null
    status_cotacao_bid_frete_internacional: string
  },
  disparos: DisparoRow[],
  propostas: PropostaRow[],
): CotacaoInsightsDetalheDto['historico'] {
  const eventos: Array<{ ts: number; data: string; texto: string; autor: string }> = []

  eventos.push({
    ts: new Date(cotacao.data_criacao_cotacao_bid_frete_internacional).getTime(),
    data: fmtDataHora(cotacao.data_criacao_cotacao_bid_frete_internacional),
    texto: 'Cotação criada',
    autor: 'Sistema',
  })

  if (cotacao.data_limite_resposta_cotacao_bid_frete_internacional) {
    eventos.push({
      ts: new Date(cotacao.data_limite_resposta_cotacao_bid_frete_internacional).getTime(),
      data: fmtDataHora(cotacao.data_limite_resposta_cotacao_bid_frete_internacional),
      texto: 'Prazo para resposta definido',
      autor: 'Sistema',
    })
  }

  const disparosEnviados = disparos.filter(d => d.data_envio_disparo_cotacao_bid_frete_internacional)
  if (disparosEnviados.length > 0) {
    const primeiroEnvio = disparosEnviados.reduce((min, d) => {
      const ts = new Date(d.data_envio_disparo_cotacao_bid_frete_internacional!).getTime()
      return ts < min ? ts : min
    }, Infinity)
    eventos.push({
      ts: primeiroEnvio,
      data: fmtDataHora(new Date(primeiroEnvio)),
      texto: `Disparada para ${disparosEnviados.length} fornecedor(es)`,
      autor: 'Portal',
    })
  }

  for (const p of propostas) {
    eventos.push({
      ts: new Date(p.data_criacao_proposta_bid_frete_internacional).getTime(),
      data: fmtDataHora(p.data_criacao_proposta_bid_frete_internacional),
      texto: `Proposta recebida de ${p.fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'fornecedor'}`,
      autor: 'Portal',
    })
  }

  if (cotacao.data_aprovacao_cotacao_bid_frete_internacional) {
    eventos.push({
      ts: new Date(cotacao.data_aprovacao_cotacao_bid_frete_internacional).getTime(),
      data: fmtDataHora(cotacao.data_aprovacao_cotacao_bid_frete_internacional),
      texto: 'Cotação aprovada',
      autor: 'Sistema',
    })
  }

  eventos.push({
    ts: Date.now(),
    data: fmtDataHora(new Date()),
    texto: `Status atual: ${cotacao.status_cotacao_bid_frete_internacional}`,
    autor: 'Sistema',
  })

  return eventos
    .sort((a, b) => b.ts - a.ts)
    .map(({ data, texto, autor }) => ({ data, texto, autor }))
}

export function mapearCotacaoInsightsDetalhe(row: {
  id_cotacao_bid_frete_internacional: string
  numero_cotacao_bid_frete_internacional: string
  status_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string | null
  quantidade_volume_cotacao_bid_frete_internacional: number
  peso_kg_cotacao_bid_frete_internacional: number | null
  cubagem_m3_cotacao_bid_frete_internacional: number | null
  incoterm_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  modalidade_cotacao_bid_frete_internacional: string
  valor_meta_cotacao_bid_frete_internacional: number | null
  moeda_meta_cotacao_bid_frete_internacional: string | null
  data_criacao_cotacao_bid_frete_internacional: Date
  data_limite_resposta_cotacao_bid_frete_internacional: Date | null
  data_aprovacao_cotacao_bid_frete_internacional: Date | null
  propostas: PropostaRow[]
  disparo_cotacao_bid_frete_internacional: DisparoRow[]
}): CotacaoInsightsDetalheDto {
  const propostasOrdenadas = [...row.propostas].sort(
    (a, b) => a.valor_total_proposta_bid_frete_internacional - b.valor_total_proposta_bid_frete_internacional,
  )
  const primeiroEnvio = resolverPrimeiroEnvioDisparo(row.disparo_cotacao_bid_frete_internacional)
  const primeiraResposta = resolverPrimeiraResposta(
    row.disparo_cotacao_bid_frete_internacional,
    row.propostas,
  )

  return {
    id_cotacao_bid_frete_internacional: row.id_cotacao_bid_frete_internacional,
    numero_cotacao_bid_frete_internacional: row.numero_cotacao_bid_frete_internacional,
    status_cotacao_bid_frete_internacional: row.status_cotacao_bid_frete_internacional,
    origem_nome_cotacao_bid_frete_internacional: row.origem_nome_cotacao_bid_frete_internacional,
    origem_codigo_cotacao_bid_frete_internacional: row.origem_codigo_cotacao_bid_frete_internacional,
    destino_nome_cotacao_bid_frete_internacional: row.destino_nome_cotacao_bid_frete_internacional,
    destino_codigo_cotacao_bid_frete_internacional: row.destino_codigo_cotacao_bid_frete_internacional,
    descricao_mercadoria_cotacao_bid_frete_internacional: row.descricao_mercadoria_cotacao_bid_frete_internacional,
    ncm_cotacao_bid_frete_internacional: row.ncm_cotacao_bid_frete_internacional,
    quantidade_volume_cotacao_bid_frete_internacional: row.quantidade_volume_cotacao_bid_frete_internacional,
    peso_kg_cotacao_bid_frete_internacional: row.peso_kg_cotacao_bid_frete_internacional,
    cubagem_m3_cotacao_bid_frete_internacional: row.cubagem_m3_cotacao_bid_frete_internacional,
    incoterm_cotacao_bid_frete_internacional: row.incoterm_cotacao_bid_frete_internacional,
    modal_cotacao_bid_frete_internacional: row.modal_cotacao_bid_frete_internacional,
    modalidade_cotacao_bid_frete_internacional: row.modalidade_cotacao_bid_frete_internacional,
    valor_meta_cotacao_bid_frete_internacional: row.valor_meta_cotacao_bid_frete_internacional,
    moeda_meta_cotacao_bid_frete_internacional: row.moeda_meta_cotacao_bid_frete_internacional,
    data_criacao_cotacao_bid_frete_internacional: row.data_criacao_cotacao_bid_frete_internacional.toISOString(),
    data_limite_resposta_cotacao_bid_frete_internacional: row.data_limite_resposta_cotacao_bid_frete_internacional?.toISOString() ?? null,
    data_aprovacao_cotacao_bid_frete_internacional: row.data_aprovacao_cotacao_bid_frete_internacional?.toISOString() ?? null,
    data_envio_disparo_cotacao_bid_frete_internacional: primeiroEnvio?.toISOString() ?? null,
    data_primeira_resposta_cotacao_bid_frete_internacional: primeiraResposta?.toISOString() ?? null,
    propostas: propostasOrdenadas.map((p, idx) => ({
      fornecedor: p.fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor',
      valor: fmtValor(p.moeda_proposta_bid_frete_internacional, p.valor_total_proposta_bid_frete_internacional),
      transit: `${p.dias_transito_proposta_bid_frete_internacional} dias`,
      status: idx === 0 && propostasOrdenadas.length > 1 ? 'Melhor Preço' : p.status_proposta_bid_frete_internacional,
      cor: corStatusProposta(p.status_proposta_bid_frete_internacional),
    })),
    historico: montarHistorico(row, row.disparo_cotacao_bid_frete_internacional, row.propostas),
  }
}
