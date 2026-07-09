/**
 * Matching do termômetro histórico — SSOT regras de rota, faixa e componente.
 * Doc: documentos-tecnicos/produtos-gravity/bid-frete-internacional/TERMOMETRO-HISTORICO-COCKPIT-TECNICO.md
 */

export type TipoBaseTermometroHistorico = 'CONTRATADO' | 'PROPOSTAS_RECEBIDAS'

export type ComponentePrecoTermometro =
  | 'FRETE_BASE'
  | 'TAXAS_ORIGEM'
  | 'TAXAS_DESTINO'
  | 'TOTAL'

/** Um componente único ou uma lista (multi-seleção — valores somados). */
export type SelecaoComponentesTermometro =
  | ComponentePrecoTermometro
  | readonly ComponentePrecoTermometro[]

export type FaixaAereoTermometro = 'MIN_45' | 'P45' | 'P100' | 'P300' | 'P400_MAIS'

export type FaixaRodoviarioTermometro = 'ATE_15' | '15_24' | '24_30' | 'ACIMA_30'

export type CotacaoReferenciaTermometro = {
  id_cotacao_bid_frete_internacional: string
  tipo_operacao_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  modalidade_cotacao_bid_frete_internacional?: string | null
  tipo_container_cotacao_bid_frete_internacional?: string | null
  incoterm_cotacao_bid_frete_internacional?: string | null
  peso_kg_cotacao_bid_frete_internacional?: number | null
  peso_ton_cotacao_bid_frete_internacional?: number | null
  cubagem_m3_cotacao_bid_frete_internacional?: number | null
}

export type PropostaHistoricoTermometro = {
  data_criacao_proposta_bid_frete_internacional?: string | Date | null
  status_proposta_bid_frete_internacional?: string | null
  valor_frete_proposta_bid_frete_internacional?: number | string | null
  taxas_origem_proposta_bid_frete_internacional?: number | string | null
  taxas_destino_proposta_bid_frete_internacional?: number | string | null
  valor_total_proposta_bid_frete_internacional?: number | string | null
  moeda_proposta_bid_frete_internacional?: string | null
}

export type ItemHistoricoTermometro = CotacaoReferenciaTermometro & {
  data_aprovacao_cotacao_bid_frete_internacional?: string | Date | null
  propostas?: PropostaHistoricoTermometro[]
  propostas_bid_frete_internacional?: PropostaHistoricoTermometro[]
}

export type OpcoesFiltroHistoricoTermometro = {
  /** true = candidato precisa ter o mesmo incoterm da cotação de referência. */
  filtrar_incoterm?: boolean
  /** Lista explícita de incoterms aceitos — vazia/ausente = todos. */
  incoterms?: readonly string[]
}

const STATUS_PROPOSTA_CONTRATADA = new Set(['APROVADA', 'APROVACAO_RECEBIDA'])

function numeroPositivo(valor: unknown): number | null {
  const n = Number(valor)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function listarPropostasItemHistoricoTermometro(
  item: ItemHistoricoTermometro,
): PropostaHistoricoTermometro[] {
  return item.propostas ?? item.propostas_bid_frete_internacional ?? []
}

export function normalizarSelecaoComponentesTermometro(
  selecao: SelecaoComponentesTermometro,
): ComponentePrecoTermometro[] {
  return Array.isArray(selecao) ? [...selecao] : [selecao as ComponentePrecoTermometro]
}

function extrairValorComponenteUnico(
  proposta: PropostaHistoricoTermometro,
  componente: ComponentePrecoTermometro,
): number | null {
  switch (componente) {
    case 'FRETE_BASE':
      return numeroPositivo(proposta.valor_frete_proposta_bid_frete_internacional)
    case 'TAXAS_ORIGEM':
      return numeroPositivo(proposta.taxas_origem_proposta_bid_frete_internacional)
    case 'TAXAS_DESTINO':
      return numeroPositivo(proposta.taxas_destino_proposta_bid_frete_internacional)
    case 'TOTAL':
      return numeroPositivo(proposta.valor_total_proposta_bid_frete_internacional)
    default:
      return null
  }
}

/**
 * Valor do(s) componente(s) selecionado(s) — multi-seleção soma os componentes.
 * TOTAL na seleção prevalece (já representa a soma completa da proposta).
 */
export function extrairValorComponenteProposta(
  proposta: PropostaHistoricoTermometro,
  selecao: SelecaoComponentesTermometro,
): number | null {
  const componentes = normalizarSelecaoComponentesTermometro(selecao)
  if (componentes.length === 0) return null
  if (componentes.includes('TOTAL')) {
    return extrairValorComponenteUnico(proposta, 'TOTAL')
  }
  let soma = 0
  let encontrouValor = false
  for (const componente of componentes) {
    const valor = extrairValorComponenteUnico(proposta, componente)
    if (valor != null) {
      soma += valor
      encontrouValor = true
    }
  }
  return encontrouValor ? soma : null
}

export function resolverToneladasCotacao(cotacao: CotacaoReferenciaTermometro): number {
  const ton = numeroPositivo(cotacao.peso_ton_cotacao_bid_frete_internacional)
  if (ton != null) return ton
  const kg = numeroPositivo(cotacao.peso_kg_cotacao_bid_frete_internacional)
  if (kg != null) return kg / 1000
  return 0
}

export function calcularPesoCubadoAereoKg(cotacao: CotacaoReferenciaTermometro): number {
  const peso = numeroPositivo(cotacao.peso_kg_cotacao_bid_frete_internacional) ?? 0
  const cubado = (numeroPositivo(cotacao.cubagem_m3_cotacao_bid_frete_internacional) ?? 0) * 167
  return Math.max(peso, cubado)
}

export function calcularFaixaAereoTermometro(
  cotacao: CotacaoReferenciaTermometro,
): FaixaAereoTermometro {
  const peso = calcularPesoCubadoAereoKg(cotacao)
  if (peso < 45) return 'MIN_45'
  if (peso < 100) return 'P45'
  if (peso < 300) return 'P100'
  if (peso < 400) return 'P300'
  return 'P400_MAIS'
}

export function calcularCargaReferenciaRodoviario(cotacao: CotacaoReferenciaTermometro): number {
  const ton = resolverToneladasCotacao(cotacao)
  const m3 = numeroPositivo(cotacao.cubagem_m3_cotacao_bid_frete_internacional) ?? 0
  return Math.max(ton, m3)
}

export function calcularFaixaRodoviarioTermometro(
  cotacao: CotacaoReferenciaTermometro,
): FaixaRodoviarioTermometro {
  const ref = calcularCargaReferenciaRodoviario(cotacao)
  if (ref <= 15) return 'ATE_15'
  if (ref <= 24) return '15_24'
  if (ref <= 30) return '24_30'
  return 'ACIMA_30'
}

function mesmaFaixaCargaTermometro(
  referencia: CotacaoReferenciaTermometro,
  candidato: CotacaoReferenciaTermometro,
): boolean {
  const modal = referencia.modal_cotacao_bid_frete_internacional

  if (modal === 'AEREO') {
    return calcularFaixaAereoTermometro(referencia) === calcularFaixaAereoTermometro(candidato)
  }

  if (modal === 'RODOVIARIO') {
    return calcularFaixaRodoviarioTermometro(referencia)
      === calcularFaixaRodoviarioTermometro(candidato)
  }

  if (modal === 'MARITIMO') {
    if (referencia.modalidade_cotacao_bid_frete_internacional === 'FCL') {
      return referencia.tipo_container_cotacao_bid_frete_internacional != null
        && referencia.tipo_container_cotacao_bid_frete_internacional
          === candidato.tipo_container_cotacao_bid_frete_internacional
    }
    // LCL marítimo — sem filtro de peso/cubagem
    return referencia.modalidade_cotacao_bid_frete_internacional
      === candidato.modalidade_cotacao_bid_frete_internacional
  }

  return true
}

export function cotacaoCompativelTermometro(
  referencia: CotacaoReferenciaTermometro,
  candidato: CotacaoReferenciaTermometro,
  opcoes: OpcoesFiltroHistoricoTermometro = {},
): boolean {
  if (candidato.id_cotacao_bid_frete_internacional === referencia.id_cotacao_bid_frete_internacional) {
    return false
  }

  if (candidato.tipo_operacao_cotacao_bid_frete_internacional
    !== referencia.tipo_operacao_cotacao_bid_frete_internacional) {
    return false
  }

  if (candidato.modal_cotacao_bid_frete_internacional !== referencia.modal_cotacao_bid_frete_internacional) {
    return false
  }

  if (candidato.origem_codigo_cotacao_bid_frete_internacional
    !== referencia.origem_codigo_cotacao_bid_frete_internacional) {
    return false
  }

  if (candidato.destino_codigo_cotacao_bid_frete_internacional
    !== referencia.destino_codigo_cotacao_bid_frete_internacional) {
    return false
  }

  if (referencia.modal_cotacao_bid_frete_internacional === 'MARITIMO') {
    if (referencia.modalidade_cotacao_bid_frete_internacional
      !== candidato.modalidade_cotacao_bid_frete_internacional) {
      return false
    }
  }

  if (opcoes.filtrar_incoterm === true) {
    const incRef = referencia.incoterm_cotacao_bid_frete_internacional ?? ''
    const incCand = candidato.incoterm_cotacao_bid_frete_internacional ?? ''
    if (incRef !== incCand) return false
  }

  if (opcoes.incoterms != null && opcoes.incoterms.length > 0) {
    const incCand = candidato.incoterm_cotacao_bid_frete_internacional?.trim() ?? ''
    if (!opcoes.incoterms.includes(incCand)) return false
  }

  return mesmaFaixaCargaTermometro(referencia, candidato)
}

export function filtrarHistoricoTermometro<T extends ItemHistoricoTermometro>(
  referencia: CotacaoReferenciaTermometro,
  candidatos: T[] | null | undefined,
  opcoes: OpcoesFiltroHistoricoTermometro = {},
): T[] {
  if (!candidatos?.length) return []
  return candidatos.filter((item) => cotacaoCompativelTermometro(referencia, item, opcoes))
}

export function melhorValorComponentePropostas(
  propostas: PropostaHistoricoTermometro[],
  selecao: SelecaoComponentesTermometro,
  tipoBase: TipoBaseTermometroHistorico,
): number | null {
  if (propostas.length === 0) return null

  if (tipoBase === 'CONTRATADO') {
    const contratada = propostas.find(
      (p) => p.status_proposta_bid_frete_internacional != null
        && STATUS_PROPOSTA_CONTRATADA.has(p.status_proposta_bid_frete_internacional),
    )
    if (contratada != null) {
      return extrairValorComponenteProposta(contratada, selecao)
    }
    const primeira = propostas[0]
    return primeira != null ? extrairValorComponenteProposta(primeira, selecao) : null
  }

  const valores = propostas
    .map((p) => extrairValorComponenteProposta(p, selecao))
    .filter((v): v is number => v != null)
  if (valores.length === 0) return null
  return Math.min(...valores)
}

export function valorHistoricoCotacaoTermometro(
  item: ItemHistoricoTermometro,
  tipoBase: TipoBaseTermometroHistorico,
  selecao: SelecaoComponentesTermometro,
): number | null {
  const propostas = listarPropostasItemHistoricoTermometro(item)
  return melhorValorComponentePropostas(propostas, selecao, tipoBase)
}

export function dataReferenciaHistoricoTermometro(
  item: ItemHistoricoTermometro,
  tipoBase: TipoBaseTermometroHistorico,
): Date | null {
  if (tipoBase === 'CONTRATADO') {
    const bruto = item.data_aprovacao_cotacao_bid_frete_internacional
    if (bruto == null || bruto === '') return null
    const data = bruto instanceof Date ? bruto : new Date(bruto)
    return Number.isFinite(data.getTime()) ? data : null
  }

  let menor: number | null = null
  for (const proposta of listarPropostasItemHistoricoTermometro(item)) {
    const bruto = proposta.data_criacao_proposta_bid_frete_internacional
    if (bruto == null || bruto === '') continue
    const data = bruto instanceof Date ? bruto : new Date(bruto)
    const ts = data.getTime()
    if (!Number.isFinite(ts)) continue
    if (menor == null || ts < menor) menor = ts
  }
  return menor != null ? new Date(menor) : null
}
