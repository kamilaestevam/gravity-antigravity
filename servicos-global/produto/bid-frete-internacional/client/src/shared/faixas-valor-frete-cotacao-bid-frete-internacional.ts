/**
 * Faixas de peso/m³ na cotação (comprador — modal Aéreo).
 */
import type {
  FaixaValorFreteKgsCotacaoBidFreteInternacional,
  TipoValorFreteBidFreteInternacional,
} from '../../../shared/tipo-valor-frete-bid-frete-internacional'
import type { UnidadeFaixaValorFreteKgsBidFreteInternacional } from '../../../shared/tipo-valor-frete-bid-frete-internacional'

export interface LinhaFaixaValorFreteCotacaoFormBidFreteInternacional {
  id_linha_faixa_valor_frete_cotacao: string
  limite_inferior_kg_faixa_valor_frete_cotacao: string
  unidade_faixa_valor_frete_cotacao: '' | UnidadeFaixaValorFreteKgsBidFreteInternacional
}

export function criarIdLinhaFaixaValorFreteCotacao(): string {
  return `fxc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function criarLinhaFaixaValorFreteCotacaoVazia(): LinhaFaixaValorFreteCotacaoFormBidFreteInternacional {
  return {
    id_linha_faixa_valor_frete_cotacao: criarIdLinhaFaixaValorFreteCotacao(),
    limite_inferior_kg_faixa_valor_frete_cotacao: '',
    unidade_faixa_valor_frete_cotacao: '',
  }
}

export function rotuloOrdemFaixaValorFreteCotacao(ordem: number): string {
  return `${ordem}ª faixa`
}

function limiteKgValido(valor: string): boolean {
  const bruto = valor.trim()
  if (bruto === '') return false
  const normalizado = bruto.replace(/^\+/, '')
  if (normalizado === '' || normalizado === '-' || normalizado === '.') return false
  const n = Number(normalizado)
  return Number.isFinite(n)
}

function limiteKgParaNumero(valor: string): number {
  return Number(valor.trim().replace(/^\+/, ''))
}

export function linhasFaixaValorFreteCotacaoComLimitePreenchido(
  linhas: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[],
): LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[] {
  return linhas.filter((linha) => limiteKgValido(linha.limite_inferior_kg_faixa_valor_frete_cotacao))
}

export function linhaFaixaValorFreteCotacaoFormValida(
  linha: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional,
): boolean {
  return limiteKgValido(linha.limite_inferior_kg_faixa_valor_frete_cotacao)
}

export function faixasValorFreteCotacaoFormValidas(
  linhas: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[],
): boolean {
  const comLimite = linhasFaixaValorFreteCotacaoComLimitePreenchido(linhas)
  return comLimite.length > 0 && comLimite.every(linhaFaixaValorFreteCotacaoFormValida)
}

function unidadeFaixaValorFreteCotacaoParaPayload(
  unidade: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional['unidade_faixa_valor_frete_cotacao'],
): UnidadeFaixaValorFreteKgsBidFreteInternacional {
  return unidade === 'M3' ? 'M3' : 'KG'
}

export function faixasValorFreteCotacaoFormParaPayload(
  linhas: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[],
): FaixaValorFreteKgsCotacaoBidFreteInternacional[] {
  return linhasFaixaValorFreteCotacaoComLimitePreenchido(linhas).map((linha, index) => ({
    ordem_faixa_valor_frete_kgs_cotacao_bid_frete_internacional: index + 1,
    limite_inferior_kg_faixa_valor_frete_kgs_cotacao_bid_frete_internacional: limiteKgParaNumero(
      linha.limite_inferior_kg_faixa_valor_frete_cotacao,
    ),
    unidade_faixa_valor_frete_kgs_cotacao_bid_frete_internacional:
      unidadeFaixaValorFreteCotacaoParaPayload(linha.unidade_faixa_valor_frete_cotacao),
  }))
}

export function quantidadeVolumeObrigatoriaNovaCotacaoBidFreteInternacional(
  modal: string,
  tipoValorFrete: TipoValorFreteBidFreteInternacional,
): boolean {
  return modal !== 'AEREO' || tipoValorFrete !== 'FAIXA_PESO'
}

export function textosLinhasFaixaValorFreteCotacaoResumoNovaCotacao(
  linhas: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[],
): string[] {
  return linhasFaixaValorFreteCotacaoComLimitePreenchido(linhas).map((linha) => {
    const limite = linha.limite_inferior_kg_faixa_valor_frete_cotacao.trim()
    const unidade = linha.unidade_faixa_valor_frete_cotacao === 'M3'
      ? 'm³'
      : linha.unidade_faixa_valor_frete_cotacao === 'KG'
        ? 'kg'
        : 'kgs/m3'
    return `${limite} ${unidade}`
  })
}

export function textoFaixasValorFreteCotacaoResumoNovaCotacao(
  linhas: LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[],
): string | null {
  const textos = textosLinhasFaixaValorFreteCotacaoResumoNovaCotacao(linhas)
  if (textos.length === 0) return null
  return textos.join(' · ')
}

export function linhasFaixaValorFreteCotacaoFromJson(
  input: unknown,
): LinhaFaixaValorFreteCotacaoFormBidFreteInternacional[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [criarLinhaFaixaValorFreteCotacaoVazia()]
  }
  return input.map((item, index) => {
    const row = item as Record<string, unknown>
    return {
      id_linha_faixa_valor_frete_cotacao: criarIdLinhaFaixaValorFreteCotacao(),
      limite_inferior_kg_faixa_valor_frete_cotacao: String(
        row.limite_inferior_kg_faixa_valor_frete_kgs_cotacao_bid_frete_internacional ?? '',
      ),
      unidade_faixa_valor_frete_cotacao:
        row.unidade_faixa_valor_frete_kgs_cotacao_bid_frete_internacional === 'M3'
          ? 'M3'
          : row.unidade_faixa_valor_frete_kgs_cotacao_bid_frete_internacional === 'KG'
            ? 'KG'
            : '',
    }
  })
}
