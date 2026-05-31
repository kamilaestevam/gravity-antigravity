/**
 * Taxas de origem/destino linha a linha — catálogo Cadastros + entrada manual.
 */
import type { TipoTaxaOrigemDestino, TaxaOrigemDestinoCadastro } from './cadastrosApi'

export const MOEDAS_LINHA_TAXA = ['USD', 'EUR', 'BRL', 'CNY', 'GBP'] as const

export const OPCOES_MOEDA_LINHA_TAXA = MOEDAS_LINHA_TAXA.map((m) => ({
  valor: m,
  rotulo: m,
}))

export type SecaoTaxaLinhaProposta = 'origem' | 'destino'

export interface LinhaTaxaPropostaBidFreteInternacional {
  id_linha_taxa_proposta_bid_frete_internacional: string
  id_taxa_origem_destino: string | null
  nome_taxa_bid_frete_internacional: string
  valor_taxa_bid_frete_internacional: string
  moeda_taxa_bid_frete_internacional: string
  /** Nome digitado livremente (fora do catálogo). */
  manual: boolean
}

export function criarIdLinhaTaxaProposta(): string {
  return `linha_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function filtrarTaxasCatalogoNaoLegado(
  itens: TaxaOrigemDestinoCadastro[],
): TaxaOrigemDestinoCadastro[] {
  return itens.filter((item) => {
    const legado = (item as TaxaOrigemDestinoCadastro & { legado_taxa_origem_destino?: boolean })
      .legado_taxa_origem_destino
    if (legado === true) return false
    return item.ativo_taxa_origem_destino !== false
  })
}

export function taxasCatalogoPorSecao(
  itens: TaxaOrigemDestinoCadastro[],
  secao: SecaoTaxaLinhaProposta,
): TaxaOrigemDestinoCadastro[] {
  const filtrados = filtrarTaxasCatalogoNaoLegado(itens)
  const tipo: TipoTaxaOrigemDestino = secao === 'origem' ? 'ORIGEM' : 'DESTINO'
  const porTipo = filtrados.filter((t) => t.tipo_taxa_origem_destino === tipo)
  if (porTipo.length > 0) return porTipo
  // Catálogo BID em produção: tipo FRETE — mesma lista nas duas seções
  return filtrados.filter((t) => t.tipo_taxa_origem_destino === 'FRETE')
}

export function criarLinhaTaxaDoCatalogo(
  taxa: TaxaOrigemDestinoCadastro,
  moedaPadrao: string,
): LinhaTaxaPropostaBidFreteInternacional {
  return {
    id_linha_taxa_proposta_bid_frete_internacional: criarIdLinhaTaxaProposta(),
    id_taxa_origem_destino: taxa.id_taxa_origem_destino,
    nome_taxa_bid_frete_internacional: taxa.nome_taxa_origem_destino,
    valor_taxa_bid_frete_internacional: '',
    moeda_taxa_bid_frete_internacional: moedaPadrao,
    manual: false,
  }
}

export function criarLinhaTaxaManual(moedaPadrao: string): LinhaTaxaPropostaBidFreteInternacional {
  return {
    id_linha_taxa_proposta_bid_frete_internacional: criarIdLinhaTaxaProposta(),
    id_taxa_origem_destino: null,
    nome_taxa_bid_frete_internacional: '',
    valor_taxa_bid_frete_internacional: '',
    moeda_taxa_bid_frete_internacional: moedaPadrao,
    manual: true,
  }
}

export function criarLinhasIniciaisDoCatalogo(
  catalogo: TaxaOrigemDestinoCadastro[],
  secao: SecaoTaxaLinhaProposta,
  moedaPadrao: string,
): LinhaTaxaPropostaBidFreteInternacional[] {
  return taxasCatalogoPorSecao(catalogo, secao).map((t) => criarLinhaTaxaDoCatalogo(t, moedaPadrao))
}

export function parseValorLinhaTaxa(valor: string): number {
  const n = parseFloat(valor.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function somarLinhasTaxa(linhas: LinhaTaxaPropostaBidFreteInternacional[]): number {
  return linhas.reduce((acc, linha) => acc + parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional), 0)
}

const fmtMoedaValor = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export interface TotalPorMoedaBidFreteInternacional {
  moeda: string
  total: number
}

export function formatarTotalMoedaBidFrete(
  moeda: string,
  total: number,
): string {
  return `${moeda} ${fmtMoedaValor(total)}`
}

export function formatarValorNumericoBidFrete(total: number): string {
  return fmtMoedaValor(total)
}

function ordenarTotaisPorMoeda(
  totais: TotalPorMoedaBidFreteInternacional[],
  moedaPrioritaria?: string,
): TotalPorMoedaBidFreteInternacional[] {
  const filtrados = totais.filter(({ total }) => total > 0)
  return filtrados.sort((a, b) => {
    if (moedaPrioritaria) {
      if (a.moeda === moedaPrioritaria) return -1
      if (b.moeda === moedaPrioritaria) return 1
    }
    return a.moeda.localeCompare(b.moeda)
  })
}

export function agruparValoresPorMoedaLinhas(
  linhas: LinhaTaxaPropostaBidFreteInternacional[],
  moedaPrioritaria?: string,
): TotalPorMoedaBidFreteInternacional[] {
  const porMoeda = new Map<string, number>()
  for (const linha of linhas) {
    const moeda = linha.moeda_taxa_bid_frete_internacional || 'USD'
    const atual = porMoeda.get(moeda) ?? 0
    porMoeda.set(moeda, atual + parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional))
  }
  return ordenarTotaisPorMoeda(
    [...porMoeda.entries()].map(([moeda, total]) => ({ moeda, total })),
    moedaPrioritaria,
  )
}

export function resumoValoresPorMoeda(
  linhas: LinhaTaxaPropostaBidFreteInternacional[],
): string[] {
  return agruparValoresPorMoedaLinhas(linhas).map(({ moeda, total }) =>
    formatarTotalMoedaBidFrete(moeda, total),
  )
}

/** Valor total da proposta (frete + taxas), agrupado por moeda. */
export function agruparValorTotalPropostaResposta(params: {
  moeda_frete: string
  valor_frete: string
  linhas_taxa_origem: LinhaTaxaPropostaBidFreteInternacional[]
  linhas_taxa_destino: LinhaTaxaPropostaBidFreteInternacional[]
}): TotalPorMoedaBidFreteInternacional[] {
  const porMoeda = new Map<string, number>()
  const acumular = (moeda: string, valor: string) => {
    const m = moeda.trim() || 'USD'
    porMoeda.set(m, (porMoeda.get(m) ?? 0) + parseValorLinhaTaxa(valor))
  }

  acumular(params.moeda_frete, params.valor_frete)
  for (const linha of params.linhas_taxa_origem) {
    acumular(linha.moeda_taxa_bid_frete_internacional, linha.valor_taxa_bid_frete_internacional)
  }
  for (const linha of params.linhas_taxa_destino) {
    acumular(linha.moeda_taxa_bid_frete_internacional, linha.valor_taxa_bid_frete_internacional)
  }

  const ordenados = ordenarTotaisPorMoeda(
    [...porMoeda.entries()].map(([moeda, total]) => ({ moeda, total })),
    params.moeda_frete.trim() || 'USD',
  )

  if (ordenados.length > 0) return ordenados
  return [{ moeda: params.moeda_frete.trim() || 'USD', total: 0 }]
}

export function formatarValorTotalPropostaResposta(params: {
  moeda_frete: string
  valor_frete: string
  linhas_taxa_origem: LinhaTaxaPropostaBidFreteInternacional[]
  linhas_taxa_destino: LinhaTaxaPropostaBidFreteInternacional[]
}): string {
  const partes = agruparValorTotalPropostaResposta(params).map(({ moeda, total }) =>
    formatarTotalMoedaBidFrete(moeda, total),
  )

  if (partes.length > 0) return partes.join(' · ')
  return formatarTotalMoedaBidFrete(params.moeda_frete.trim() || 'USD', 0)
}

export interface ComposicaoPorMoedaPropostaBidFreteInternacional {
  moeda: string
  frete_base: number
  taxas_origem: number
  taxas_destino: number
  total: number
}

function acumularComposicaoMoeda(
  mapa: Map<string, { frete_base: number; taxas_origem: number; taxas_destino: number }>,
  moeda: string,
  campo: 'frete_base' | 'taxas_origem' | 'taxas_destino',
  valor: number,
) {
  const chave = moeda.trim() || 'USD'
  const atual = mapa.get(chave) ?? { frete_base: 0, taxas_origem: 0, taxas_destino: 0 }
  atual[campo] += valor
  mapa.set(chave, atual)
}

/** Detalha frete base + taxas por moeda (sem conversão cambial). */
export function calcularComposicaoPropostaResposta(params: {
  moeda_frete: string
  valor_frete: string
  linhas_taxa_origem: LinhaTaxaPropostaBidFreteInternacional[]
  linhas_taxa_destino: LinhaTaxaPropostaBidFreteInternacional[]
}): ComposicaoPorMoedaPropostaBidFreteInternacional[] {
  const moedaFrete = params.moeda_frete.trim() || 'USD'
  const mapa = new Map<string, { frete_base: number; taxas_origem: number; taxas_destino: number }>()

  acumularComposicaoMoeda(
    mapa,
    moedaFrete,
    'frete_base',
    parseValorLinhaTaxa(params.valor_frete),
  )

  for (const linha of params.linhas_taxa_origem) {
    acumularComposicaoMoeda(
      mapa,
      linha.moeda_taxa_bid_frete_internacional,
      'taxas_origem',
      parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional),
    )
  }

  for (const linha of params.linhas_taxa_destino) {
    acumularComposicaoMoeda(
      mapa,
      linha.moeda_taxa_bid_frete_internacional,
      'taxas_destino',
      parseValorLinhaTaxa(linha.valor_taxa_bid_frete_internacional),
    )
  }

  const composicao = [...mapa.entries()].map(([moeda, partes]) => ({
    moeda,
    frete_base: partes.frete_base,
    taxas_origem: partes.taxas_origem,
    taxas_destino: partes.taxas_destino,
    total: partes.frete_base + partes.taxas_origem + partes.taxas_destino,
  }))

  const positivos = composicao.filter(({ total }) => total > 0)
  const ordenados = positivos.sort((a, b) => {
    if (a.moeda === moedaFrete) return -1
    if (b.moeda === moedaFrete) return 1
    return a.moeda.localeCompare(b.moeda)
  })

  if (ordenados.length > 0) return ordenados

  return [{
    moeda: moedaFrete,
    frete_base: 0,
    taxas_origem: 0,
    taxas_destino: 0,
    total: 0,
  }]
}

export function linhasParaPayloadTaxas(
  linhas: LinhaTaxaPropostaBidFreteInternacional[],
  tipo: SecaoTaxaLinhaProposta,
) {
  const tipoApi = tipo === 'origem' ? 'origem' as const : 'destino' as const
  return linhas
    .filter((l) => l.nome_taxa_bid_frete_internacional.trim().length > 0)
    .map((l) => ({
      tipo_taxa_bid_frete_internacional: tipoApi,
      nome_taxa_bid_frete_internacional: l.nome_taxa_bid_frete_internacional.trim(),
      valor_taxa_bid_frete_internacional: parseValorLinhaTaxa(l.valor_taxa_bid_frete_internacional),
      moeda_taxa_bid_frete_internacional: l.moeda_taxa_bid_frete_internacional,
      id_taxa_origem_destino: l.id_taxa_origem_destino,
    }))
}

export function linhasFromPropostaTaxas(
  taxas: Array<{
    id_taxa_origem_destino?: string | null
    nome_taxa_origem_bid_frete_internacional?: string
    nome_taxa_destino_bid_frete_internacional?: string
    valor_taxa_origem_bid_frete_internacional?: number
    valor_taxa_destino_bid_frete_internacional?: number
    moeda_taxa_origem_bid_frete_internacional?: string
    moeda_taxa_destino_bid_frete_internacional?: string
  }>,
  secao: SecaoTaxaLinhaProposta,
): LinhaTaxaPropostaBidFreteInternacional[] {
  return taxas.map((t) => ({
    id_linha_taxa_proposta_bid_frete_internacional: criarIdLinhaTaxaProposta(),
    id_taxa_origem_destino: t.id_taxa_origem_destino ?? null,
    nome_taxa_bid_frete_internacional:
      secao === 'origem'
        ? (t.nome_taxa_origem_bid_frete_internacional ?? '')
        : (t.nome_taxa_destino_bid_frete_internacional ?? ''),
    valor_taxa_bid_frete_internacional: String(
      secao === 'origem'
        ? (t.valor_taxa_origem_bid_frete_internacional ?? 0)
        : (t.valor_taxa_destino_bid_frete_internacional ?? 0),
    ),
    moeda_taxa_bid_frete_internacional:
      secao === 'origem'
        ? (t.moeda_taxa_origem_bid_frete_internacional ?? 'USD')
        : (t.moeda_taxa_destino_bid_frete_internacional ?? 'USD'),
    manual: t.id_taxa_origem_destino == null,
  }))
}

