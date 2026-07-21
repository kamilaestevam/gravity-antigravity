/**
 * Composição por moeda do passo Conferência — paridade Bid Frete (brc-tabela-resumo).
 */
import type { EntradaSimulaCusto, TaxaEntradaSimulaCusto } from './schemas-simula-custo'

const fmtMoedaValor = (n: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export function formatarTotalMoedaSimulaCusto(moeda: string, total: number): string {
  return `${moeda} ${fmtMoedaValor(total)}`
}

export function formatarValorNumericoSimulaCusto(total: number): string {
  return fmtMoedaValor(total)
}

export interface LinhaValorInternacionalResumoSimulaCusto {
  rotulo: string
  moeda: string
  valor: number
}

export interface LinhaTaxaResumoSimulaCusto {
  id: string
  nome: string
  moeda: string
  valor: number
}

export interface ComposicaoPorMoedaResumoSimulaCusto {
  moeda: string
  valores_internacionais: number
  taxas_origem: number
  taxas_destino: number
  total: number
}

function linhasTaxaComValor(taxas: TaxaEntradaSimulaCusto[]): LinhaTaxaResumoSimulaCusto[] {
  return taxas
    .filter((taxa) => taxa.valor_total > 0 && taxa.nome.trim().length > 0)
    .map((taxa, indice) => ({
      id: `${taxa.id_taxa_origem_destino ?? 'manual'}-${indice}`,
      nome: taxa.nome.trim(),
      moeda: taxa.moeda.trim() || 'USD',
      valor: taxa.valor_total,
    }))
}

function acumularComposicaoMoeda(
  mapa: Map<string, { valores_internacionais: number; taxas_origem: number; taxas_destino: number }>,
  moeda: string,
  campo: 'valores_internacionais' | 'taxas_origem' | 'taxas_destino',
  valor: number,
) {
  const chave = moeda.trim() || 'USD'
  const atual = mapa.get(chave) ?? { valores_internacionais: 0, taxas_origem: 0, taxas_destino: 0 }
  atual[campo] += valor
  mapa.set(chave, atual)
}

export function montarResumoValoresSimulaCusto(
  form: Pick<
    EntradaSimulaCusto,
    | 'moeda_produto_simula_custo'
    | 'valor_produto_simula_custo'
    | 'moeda_frete_simula_custo'
    | 'valor_frete_simula_custo'
    | 'moeda_seguro_simula_custo'
    | 'valor_seguro_simula_custo'
    | 'taxas_origem'
    | 'taxas_destino'
    | 'itens_produto_simula_custo'
  >,
  rotulos: {
    produto: string
    frete: string
    seguro: string
  },
) {
  const moedaPrioritaria = form.moeda_produto_simula_custo.trim() || 'USD'

  const valoresInternacionais: LinhaValorInternacionalResumoSimulaCusto[] = []
  const itens = form.itens_produto_simula_custo ?? []

  if (itens.length > 0) {
    for (const [indice, item] of itens.entries()) {
      const total =
        item.valor_unitario_item_produto_simula_custo
        * item.quantidade_item_produto_simula_custo
      if (total <= 0) continue
      const ncmFmt = item.ncm_item_produto_simula_custo.replace(/\D/g, '').slice(0, 8)
      const sufixo = ncmFmt.length === 8
        ? ` · ${ncmFmt.slice(0, 4)}.${ncmFmt.slice(4)}`
        : ''
      const descricao = item.descricao_ncm_item_produto_simula_custo?.trim()
      valoresInternacionais.push({
        rotulo: descricao
          ? `${rotulos.produto}${sufixo} — ${descricao}`
          : `${rotulos.produto}${sufixo || ` (${indice + 1})`}`,
        moeda: item.moeda_item_produto_simula_custo.trim() || 'USD',
        valor: total,
      })
    }
  } else if (form.valor_produto_simula_custo > 0) {
    valoresInternacionais.push({
      rotulo: rotulos.produto,
      moeda: form.moeda_produto_simula_custo.trim() || 'USD',
      valor: form.valor_produto_simula_custo,
    })
  }
  if (form.valor_frete_simula_custo > 0) {
    valoresInternacionais.push({
      rotulo: rotulos.frete,
      moeda: form.moeda_frete_simula_custo.trim() || 'USD',
      valor: form.valor_frete_simula_custo,
    })
  }
  if (form.valor_seguro_simula_custo > 0) {
    valoresInternacionais.push({
      rotulo: rotulos.seguro,
      moeda: form.moeda_seguro_simula_custo.trim() || 'USD',
      valor: form.valor_seguro_simula_custo,
    })
  }

  const linhasOrigem = linhasTaxaComValor(form.taxas_origem)
  const linhasDestino = linhasTaxaComValor(form.taxas_destino)

  const mapa = new Map<string, { valores_internacionais: number; taxas_origem: number; taxas_destino: number }>()

  for (const item of valoresInternacionais) {
    acumularComposicaoMoeda(mapa, item.moeda, 'valores_internacionais', item.valor)
  }
  for (const linha of linhasOrigem) {
    acumularComposicaoMoeda(mapa, linha.moeda, 'taxas_origem', linha.valor)
  }
  for (const linha of linhasDestino) {
    acumularComposicaoMoeda(mapa, linha.moeda, 'taxas_destino', linha.valor)
  }

  const composicao: ComposicaoPorMoedaResumoSimulaCusto[] = [...mapa.entries()].map(([moeda, partes]) => ({
    moeda,
    valores_internacionais: partes.valores_internacionais,
    taxas_origem: partes.taxas_origem,
    taxas_destino: partes.taxas_destino,
    total: partes.valores_internacionais + partes.taxas_origem + partes.taxas_destino,
  }))

  const positivos = composicao.filter(({ total }) => total > 0)
  const ordenados = positivos.sort((a, b) => {
    if (a.moeda === moedaPrioritaria) return -1
    if (b.moeda === moedaPrioritaria) return 1
    return a.moeda.localeCompare(b.moeda)
  })

  return {
    moedaPrioritaria,
    valoresInternacionais,
    linhasOrigem,
    linhasDestino,
    composicao: ordenados.length > 0 ? ordenados : [],
  }
}

export function agruparSubtotalTaxasPorMoeda(
  linhas: LinhaTaxaResumoSimulaCusto[],
  moedaPrioritaria: string,
) {
  const mapa = new Map<string, number>()
  for (const linha of linhas) {
    const moeda = linha.moeda.trim() || 'USD'
    mapa.set(moeda, (mapa.get(moeda) ?? 0) + linha.valor)
  }
  const totais = [...mapa.entries()].map(([moeda, total]) => ({ moeda, total }))
  return totais.sort((a, b) => {
    if (a.moeda === moedaPrioritaria) return -1
    if (b.moeda === moedaPrioritaria) return 1
    return a.moeda.localeCompare(b.moeda)
  })
}
