/**
 * Faixas de peso/m³ na proposta (fornecedor — modal Aéreo).
 */
import type { FaixaValorFreteKgsPropostaBidFreteInternacional } from '../../../shared/tipo-valor-frete-bid-frete-internacional'
import type { UnidadeFaixaValorFreteKgsBidFreteInternacional } from '../../../shared/tipo-valor-frete-bid-frete-internacional'
import { normalizarTipoValorFreteBidFreteInternacional } from '../../../shared/tipo-valor-frete-bid-frete-internacional'
import {
  formatarTotalMoedaBidFrete,
  parseValorLinhaTaxa,
} from './taxas-linha-proposta-bid-frete-internacional'

export interface LinhaFaixaValorFretePropostaFormBidFreteInternacional {
  id_linha_faixa_valor_frete_proposta: string
  limite_inferior_kg_faixa_valor_frete_proposta: string
  unidade_faixa_valor_frete_proposta: '' | UnidadeFaixaValorFreteKgsBidFreteInternacional
  tarifa_faixa_valor_frete_proposta: string
}

export function criarIdLinhaFaixaValorFreteProposta(): string {
  return `fxp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function criarLinhaFaixaValorFretePropostaVazia(): LinhaFaixaValorFretePropostaFormBidFreteInternacional {
  return {
    id_linha_faixa_valor_frete_proposta: criarIdLinhaFaixaValorFreteProposta(),
    limite_inferior_kg_faixa_valor_frete_proposta: '',
    unidade_faixa_valor_frete_proposta: '',
    tarifa_faixa_valor_frete_proposta: '',
  }
}

export function rotuloOrdemFaixaValorFreteProposta(ordem: number): string {
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

function tarifaValida(valor: string): boolean {
  const n = parseValorLinhaTaxa(valor)
  return Number.isFinite(n) && n > 0
}

export function linhaFaixaValorFretePropostaFormValida(
  linha: LinhaFaixaValorFretePropostaFormBidFreteInternacional,
): boolean {
  if (!limiteKgValido(linha.limite_inferior_kg_faixa_valor_frete_proposta)) return false
  if (linha.unidade_faixa_valor_frete_proposta !== 'KG' && linha.unidade_faixa_valor_frete_proposta !== 'M3') {
    return false
  }
  return tarifaValida(linha.tarifa_faixa_valor_frete_proposta)
}

export function faixasValorFretePropostaFormValidas(
  linhas: LinhaFaixaValorFretePropostaFormBidFreteInternacional[],
): boolean {
  return linhas.length > 0 && linhas.every(linhaFaixaValorFretePropostaFormValida)
}

export function faixasValorFretePropostaFormParaPayload(
  linhas: LinhaFaixaValorFretePropostaFormBidFreteInternacional[],
  moedaPadrao?: string,
): FaixaValorFreteKgsPropostaBidFreteInternacional[] {
  return linhas.map((linha, index) => ({
    ordem_faixa_valor_frete_kgs_proposta_bid_frete_internacional: index + 1,
    limite_inferior_kg_faixa_valor_frete_kgs_proposta_bid_frete_internacional: Number(
      linha.limite_inferior_kg_faixa_valor_frete_proposta.trim().replace(/^\+/, ''),
    ),
    unidade_faixa_valor_frete_kgs_proposta_bid_frete_internacional:
      linha.unidade_faixa_valor_frete_proposta as UnidadeFaixaValorFreteKgsBidFreteInternacional,
    valor_unitario_faixa_valor_frete_kgs_proposta_bid_frete_internacional: parseValorLinhaTaxa(
      linha.tarifa_faixa_valor_frete_proposta,
    ),
    moeda_faixa_valor_frete_kgs_proposta_bid_frete_internacional: moedaPadrao?.trim() || undefined,
  }))
}

export function menorTarifaFaixasValorFreteProposta(
  linhas: LinhaFaixaValorFretePropostaFormBidFreteInternacional[],
): number {
  const tarifas = linhas
    .map((l) => parseValorLinhaTaxa(l.tarifa_faixa_valor_frete_proposta))
    .filter((n) => Number.isFinite(n) && n > 0)
  return tarifas.length > 0 ? Math.min(...tarifas) : 0
}

export function formatLimiteExibicaoFaixaValorFreteProposta(valor: string): string {
  const bruto = valor.trim()
  if (bruto === '') return ''
  const n = Number(bruto.replace(/^\+/, ''))
  if (!Number.isFinite(n)) return bruto
  if (n > 0) return `+${n}`
  return String(n)
}

export function rotuloUnidadeFaixaValorFreteProposta(
  unidade: '' | UnidadeFaixaValorFreteKgsBidFreteInternacional,
): string {
  if (unidade === 'M3') return 'm³'
  if (unidade === 'KG') return 'kg'
  return 'kgs/m³'
}

export function sufixoTarifaUnitariaFaixaValorFreteProposta(
  unidade: '' | UnidadeFaixaValorFreteKgsBidFreteInternacional,
): string {
  if (unidade === 'M3') return '/m³'
  if (unidade === 'KG') return '/kg'
  return ''
}

export function linhasFaixaValorFretePropostaComTarifa(
  linhas: LinhaFaixaValorFretePropostaFormBidFreteInternacional[],
): LinhaFaixaValorFretePropostaFormBidFreteInternacional[] {
  return linhas.filter((linha) => parseValorLinhaTaxa(linha.tarifa_faixa_valor_frete_proposta) > 0)
}

export function rotuloFaixaFreteBaseResumo(
  linha: LinhaFaixaValorFretePropostaFormBidFreteInternacional,
): string {
  const limite = formatLimiteExibicaoFaixaValorFreteProposta(
    linha.limite_inferior_kg_faixa_valor_frete_proposta,
  )
  const unidade = rotuloUnidadeFaixaValorFreteProposta(linha.unidade_faixa_valor_frete_proposta)
  if (!limite) return unidade
  return `${limite} ${unidade}`
}

export function formatarTarifaUnitariaFaixaFreteBaseResumo(
  moedaFrete: string,
  linha: LinhaFaixaValorFretePropostaFormBidFreteInternacional,
): string {
  const moeda = moedaFrete.trim() || 'USD'
  const tarifa = parseValorLinhaTaxa(linha.tarifa_faixa_valor_frete_proposta)
  const sufixo = sufixoTarifaUnitariaFaixaValorFreteProposta(linha.unidade_faixa_valor_frete_proposta)
  return `${formatarTotalMoedaBidFrete(moeda, tarifa)}${sufixo}`
}

/** Valor de frete usado na composição/total quando o tipo é faixa (menor tarifa informada). */
export function valorFretePropostaRespostaParaComposicao(params: {
  tipo_valor_frete_proposta_bid_frete_internacional?: string | null
  valor_frete_proposta_bid_frete_internacional: string
  linhas_faixa_valor_frete_proposta: LinhaFaixaValorFretePropostaFormBidFreteInternacional[]
}): string {
  const tipo = params.tipo_valor_frete_proposta_bid_frete_internacional || 'TOTAL'
  if (tipo === 'FAIXA_PESO') {
    return String(menorTarifaFaixasValorFreteProposta(params.linhas_faixa_valor_frete_proposta))
  }
  return params.valor_frete_proposta_bid_frete_internacional
}

export function linhasFaixaValorFretePropostaFromJson(
  input: unknown,
): LinhaFaixaValorFretePropostaFormBidFreteInternacional[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [criarLinhaFaixaValorFretePropostaVazia()]
  }
  return input.map((item) => {
    const row = item as Record<string, unknown>
    return {
      id_linha_faixa_valor_frete_proposta: criarIdLinhaFaixaValorFreteProposta(),
      limite_inferior_kg_faixa_valor_frete_proposta: String(
        row.limite_inferior_kg_faixa_valor_frete_kgs_proposta_bid_frete_internacional ?? '',
      ),
      unidade_faixa_valor_frete_proposta:
        row.unidade_faixa_valor_frete_kgs_proposta_bid_frete_internacional === 'M3'
          ? 'M3'
          : row.unidade_faixa_valor_frete_kgs_proposta_bid_frete_internacional === 'KG'
            ? 'KG'
            : '',
      tarifa_faixa_valor_frete_proposta: String(
        row.valor_unitario_faixa_valor_frete_kgs_proposta_bid_frete_internacional ?? '',
      ),
    }
  })
}

function formatLimiteKgExibicaoFaixaFromCotacao(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  const bruto = String(valor).trim()
  if (bruto === '') return ''
  const n = Number(bruto.replace(/^\+/, ''))
  if (!Number.isFinite(n)) return bruto
  if (n > 0) return `+${n}`
  return String(n)
}

/** Pré-preenche faixas da proposta a partir da solicitação (cotação) — tarifa vazia para o fornecedor. */
export function linhasFaixaValorFretePropostaFromCotacaoJson(
  input: unknown,
): LinhaFaixaValorFretePropostaFormBidFreteInternacional[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [criarLinhaFaixaValorFretePropostaVazia()]
  }
  const ordenadas = [...input].sort((a, b) => {
    const rowA = a as Record<string, unknown>
    const rowB = b as Record<string, unknown>
    const ordemA = Number(rowA.ordem_faixa_valor_frete_kgs_cotacao_bid_frete_internacional ?? 0)
    const ordemB = Number(rowB.ordem_faixa_valor_frete_kgs_cotacao_bid_frete_internacional ?? 0)
    return ordemA - ordemB
  })
  return ordenadas.map((item) => {
    const row = item as Record<string, unknown>
    return {
      id_linha_faixa_valor_frete_proposta: criarIdLinhaFaixaValorFreteProposta(),
      limite_inferior_kg_faixa_valor_frete_proposta: formatLimiteKgExibicaoFaixaFromCotacao(
        row.limite_inferior_kg_faixa_valor_frete_kgs_cotacao_bid_frete_internacional,
      ),
      unidade_faixa_valor_frete_proposta:
        row.unidade_faixa_valor_frete_kgs_cotacao_bid_frete_internacional === 'M3'
          ? 'M3'
          : row.unidade_faixa_valor_frete_kgs_cotacao_bid_frete_internacional === 'KG'
            ? 'KG'
            : '',
      tarifa_faixa_valor_frete_proposta: '',
    }
  })
}

export function valorFreteRespostaFormularioValido(
  form: {
    valor_frete_proposta_bid_frete_internacional: string
    tipo_valor_frete_proposta_bid_frete_internacional?: string | null
    linhas_faixa_valor_frete_proposta: LinhaFaixaValorFretePropostaFormBidFreteInternacional[]
  },
  modal?: string | null,
): boolean {
  if (modal !== 'AEREO') {
    return !!form.valor_frete_proposta_bid_frete_internacional.trim()
  }
  const tipo = form.tipo_valor_frete_proposta_bid_frete_internacional || 'TOTAL'
  if (tipo === 'FAIXA_PESO') {
    return faixasValorFretePropostaFormValidas(form.linhas_faixa_valor_frete_proposta)
  }
  return !!form.valor_frete_proposta_bid_frete_internacional.trim()
}

export function estadoInicialFormularioRespostaFromCotacao(
  cotacao?: {
    modal_cotacao_bid_frete_internacional?: string
    tipo_valor_frete_cotacao_bid_frete_internacional?: string | null
    faixas_valor_frete_kgs_cotacao_bid_frete_internacional?: unknown
  } | null,
): {
  tipo_valor_frete_proposta_bid_frete_internacional: 'TOTAL' | 'FAIXA_PESO'
  linhas_faixa_valor_frete_proposta: LinhaFaixaValorFretePropostaFormBidFreteInternacional[]
} {
  if (cotacao?.modal_cotacao_bid_frete_internacional !== 'AEREO') {
    return {
      tipo_valor_frete_proposta_bid_frete_internacional: 'TOTAL',
      linhas_faixa_valor_frete_proposta: [criarLinhaFaixaValorFretePropostaVazia()],
    }
  }
  const tipo = normalizarTipoValorFreteBidFreteInternacional(
    cotacao.tipo_valor_frete_cotacao_bid_frete_internacional,
  ) ?? 'TOTAL'
  return {
    tipo_valor_frete_proposta_bid_frete_internacional: tipo,
    linhas_faixa_valor_frete_proposta:
      tipo === 'FAIXA_PESO'
        ? linhasFaixaValorFretePropostaFromCotacaoJson(
            cotacao.faixas_valor_frete_kgs_cotacao_bid_frete_internacional,
          )
        : [criarLinhaFaixaValorFretePropostaVazia()],
  }
}
