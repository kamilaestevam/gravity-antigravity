/**
 * texto-analise-riscos-leitura-smart-read.ts — textos padronizados (análise descritiva + disclaimer fiscal)
 */

export const DISCLAIMER_CLASSIFICACAO_FISCAL =
  'Sugestão de apoio à conferência — a responsabilidade pela classificação fiscal (NCM/HS) é integralmente do usuário e do despachante habilitado.'

const PLACEHOLDERS_EXTRACAO = new Set([
  'descpt',
  'descen',
  'portuguese',
  'english',
  'ncm',
  'hscode',
  'hs',
  'hs code',
])

export function textoExtracaoEhPlaceholder(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return true
  return PLACEHOLDERS_EXTRACAO.has(valor.trim().toLowerCase())
}

export function formatarNumeroComercialExibicao(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatarRotuloMoeda(moeda: string | null | undefined): string {
  const m = moeda?.trim()
  if (!m) return ''
  return m.length <= 4 ? `${m.toUpperCase()} ` : ''
}

/** Padrão: linha, produto, colunas qty × preço → total esperado vs lido. */
export function formatarAnaliseDivergenciaLinha(params: {
  indiceLinha: number
  descricao: string | null
  qty: number
  precoUnit: number
  totalLido: number
  moeda?: string | null
}): string {
  const { indiceLinha, descricao, qty, precoUnit, totalLido, moeda } = params
  const esperado = qty * precoUnit
  const divergencia = Math.abs(esperado - totalLido)
  const prefixoMoeda = formatarRotuloMoeda(moeda)
  const rotuloProduto = descricao?.trim()
    ? `na linha ${indiceLinha + 1} («${descricao.trim().slice(0, 80)}»)`
    : `na linha ${indiceLinha + 1}`

  return (
    `De acordo com a análise ${rotuloProduto}, ` +
    `itemQuantity (${formatarNumeroComercialExibicao(qty)}) × itemUnitPriceWithCurrency ` +
    `(${prefixoMoeda}${formatarNumeroComercialExibicao(precoUnit)}) ` +
    `deveria resultar em ${prefixoMoeda}${formatarNumeroComercialExibicao(esperado)}, ` +
    `mas itemTotalPriceWithCurrency consta ${prefixoMoeda}${formatarNumeroComercialExibicao(totalLido)} ` +
    `(divergência de ${prefixoMoeda}${formatarNumeroComercialExibicao(divergencia)}).`
  )
}

export function formatarAnaliseDivergenciaSoma(
  somaLinhas: number,
  totalDocumento: number,
  moeda?: string | null,
): string {
  const divergencia = Math.abs(somaLinhas - totalDocumento)
  const prefixoMoeda = formatarRotuloMoeda(moeda)
  return (
    `De acordo com a análise, a soma de itemTotalPriceWithCurrency de todas as linhas ` +
    `(${prefixoMoeda}${formatarNumeroComercialExibicao(somaLinhas)}) ` +
    `deveria coincidir com values.totalDocumentValue ` +
    `(${prefixoMoeda}${formatarNumeroComercialExibicao(totalDocumento)}), ` +
    `mas há divergência de ${prefixoMoeda}${formatarNumeroComercialExibicao(divergencia)}. ` +
    'Verifique descontos, outras despesas, arredondamentos comerciais ou erro de extração.'
  )
}

export function textoContemDisclaimerClassificacao(texto: string | undefined): boolean {
  if (!texto?.trim()) return false
  const norm = texto.toLowerCase()
  return norm.includes('responsabilidade') && norm.includes('classificação fiscal')
}

export function anexarDisclaimerClassificacao(texto: string | undefined): string {
  const base = texto?.trim() ?? ''
  if (textoContemDisclaimerClassificacao(base)) return base
  if (!base) return DISCLAIMER_CLASSIFICACAO_FISCAL
  return `${base} ${DISCLAIMER_CLASSIFICACAO_FISCAL}`
}

export function ehRiscoClassificacaoFiscal(titulo: string, categoria: string): boolean {
  const t = titulo.toLowerCase()
  if (categoria === 'ncm' || categoria === 'normativo') return true
  return (
    t.includes('ncm') ||
    t.includes('hs code') ||
    t.includes('hscode') ||
    t.includes('classificação fiscal') ||
    t.includes('classificacao fiscal')
  )
}

export function textoPareceInstrucaoParaIa(texto: string | undefined): boolean {
  if (!texto?.trim()) return false
  const norm = texto.toLowerCase()
  return norm.includes('a ia deve') || norm.includes('aguardando') || norm.includes('sugerido pela análise')
}
