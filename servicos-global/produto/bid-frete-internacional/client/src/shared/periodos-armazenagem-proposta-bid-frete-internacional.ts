/**
 * Períodos de armazenagem na proposta do fornecedor (Marítimo LCL + incluir armazenagem).
 * Cada período: X dias — R$ fixo OU % sobre mercadoria — mínimo R$.
 */
import { z } from 'zod'
import { formatarMoedaBidFrete } from './exibir-taxas-proposta-bid-frete-internacional'
import { parseValorLinhaTaxa } from './taxas-linha-proposta-bid-frete-internacional'

export type TipoTarifaPeriodoArmazenagemProposta =
  | 'REAIS'
  | 'PERCENTUAL_MERCADORIA'

export interface PeriodoArmazenagemPropostaBidFreteInternacional {
  ordem_periodo_armazenagem_proposta_bid_frete_internacional: number
  dias_periodo_armazenagem_proposta_bid_frete_internacional: number
  tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: TipoTarifaPeriodoArmazenagemProposta
  valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: number
  minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: number
}

export interface LinhaPeriodoArmazenagemFormBidFreteInternacional {
  id_linha_periodo_armazenagem: string
  dias_periodo_armazenagem: string
  tipo_tarifa_periodo_armazenagem: '' | TipoTarifaPeriodoArmazenagemProposta
  valor_tarifa_periodo_armazenagem: string
  minimo_reais_periodo_armazenagem: string
}

export function criarIdLinhaPeriodoArmazenagem(): string {
  return `arm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function criarLinhaPeriodoArmazenagemVazia(): LinhaPeriodoArmazenagemFormBidFreteInternacional {
  return {
    id_linha_periodo_armazenagem: criarIdLinhaPeriodoArmazenagem(),
    dias_periodo_armazenagem: '',
    tipo_tarifa_periodo_armazenagem: '',
    valor_tarifa_periodo_armazenagem: '',
    minimo_reais_periodo_armazenagem: '',
  }
}

export function rotuloOrdemPeriodoArmazenagem(ordem: number): string {
  return `${ordem}º período`
}

function diasInteiroPositivo(valor: string): boolean {
  const v = valor.trim()
  if (v === '') return false
  const n = Number(v)
  return Number.isInteger(n) && n > 0
}

function valorTarifaValido(
  valor: string,
  tipo: TipoTarifaPeriodoArmazenagemProposta,
): boolean {
  const v = valor.trim()
  if (v === '') return false
  const n = parseValorLinhaTaxa(v)
  if (!Number.isFinite(n) || n <= 0) return false
  if (tipo === 'PERCENTUAL_MERCADORIA' && n > 100) return false
  return true
}

function minimoReaisValido(valor: string): boolean {
  const v = valor.trim()
  if (v === '') return true
  const n = parseValorLinhaTaxa(v)
  return Number.isFinite(n) && n >= 0
}

export function linhaPeriodoArmazenagemFormValida(
  linha: LinhaPeriodoArmazenagemFormBidFreteInternacional,
): boolean {
  if (!diasInteiroPositivo(linha.dias_periodo_armazenagem)) return false
  if (
    linha.tipo_tarifa_periodo_armazenagem !== 'REAIS'
    && linha.tipo_tarifa_periodo_armazenagem !== 'PERCENTUAL_MERCADORIA'
  ) {
    return false
  }
  if (!valorTarifaValido(linha.valor_tarifa_periodo_armazenagem, linha.tipo_tarifa_periodo_armazenagem)) {
    return false
  }
  return minimoReaisValido(linha.minimo_reais_periodo_armazenagem)
}

export function periodosArmazenagemFormularioValidos(
  linhas: LinhaPeriodoArmazenagemFormBidFreteInternacional[],
): boolean {
  return linhas.length > 0 && linhas.every(linhaPeriodoArmazenagemFormValida)
}

export function linhasPeriodoArmazenagemParaPayload(
  linhas: LinhaPeriodoArmazenagemFormBidFreteInternacional[],
): PeriodoArmazenagemPropostaBidFreteInternacional[] {
  return linhas.map((linha, index) => ({
    ordem_periodo_armazenagem_proposta_bid_frete_internacional: index + 1,
    dias_periodo_armazenagem_proposta_bid_frete_internacional: parseInt(
      linha.dias_periodo_armazenagem.trim(),
      10,
    ),
    tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional:
      linha.tipo_tarifa_periodo_armazenagem as TipoTarifaPeriodoArmazenagemProposta,
    valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: parseValorLinhaTaxa(
      linha.valor_tarifa_periodo_armazenagem,
    ),
    minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: parseValorLinhaTaxa(
      linha.minimo_reais_periodo_armazenagem,
    ),
  }))
}

export function linhasPeriodoArmazenagemFromProposta(
  periodos: PeriodoArmazenagemPropostaBidFreteInternacional[] | null | undefined,
  legado?: {
    dias_periodo_armazenagem_proposta_bid_frete_internacional?: number | null
    valor_armazenagem_reais_proposta_bid_frete_internacional?: number | null
  } | null,
): LinhaPeriodoArmazenagemFormBidFreteInternacional[] {
  if (periodos?.length) {
    return [...periodos]
      .sort(
        (a, b) =>
          a.ordem_periodo_armazenagem_proposta_bid_frete_internacional
          - b.ordem_periodo_armazenagem_proposta_bid_frete_internacional,
      )
      .map((p) => ({
        id_linha_periodo_armazenagem: criarIdLinhaPeriodoArmazenagem(),
        dias_periodo_armazenagem: String(p.dias_periodo_armazenagem_proposta_bid_frete_internacional),
        tipo_tarifa_periodo_armazenagem: p.tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional,
        valor_tarifa_periodo_armazenagem: String(p.valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional),
        minimo_reais_periodo_armazenagem: String(p.minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional),
      }))
  }

  const diasLegado = legado?.dias_periodo_armazenagem_proposta_bid_frete_internacional
  const valorLegado = legado?.valor_armazenagem_reais_proposta_bid_frete_internacional
  if (diasLegado != null && valorLegado != null) {
    return [{
      id_linha_periodo_armazenagem: criarIdLinhaPeriodoArmazenagem(),
      dias_periodo_armazenagem: String(diasLegado),
      tipo_tarifa_periodo_armazenagem: 'REAIS',
      valor_tarifa_periodo_armazenagem: String(valorLegado),
      minimo_reais_periodo_armazenagem: String(valorLegado),
    }]
  }

  return [criarLinhaPeriodoArmazenagemVazia()]
}

export const OPCOES_TIPO_TARIFA_PERIODO_ARMAZENAGEM = [
  { valor: 'REAIS', rotulo: 'R$ fixo' },
  { valor: 'PERCENTUAL_MERCADORIA', rotulo: '% sobre mercadoria' },
] as const

const periodoArmazenagemPropostaSchema = z.object({
  ordem_periodo_armazenagem_proposta_bid_frete_internacional: z.number().int().positive(),
  dias_periodo_armazenagem_proposta_bid_frete_internacional: z.number().int().positive(),
  tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: z.enum([
    'REAIS',
    'PERCENTUAL_MERCADORIA',
  ]),
  valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: z.number().positive(),
  minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: z.number().min(0),
})

const periodosArmazenagemPropostaSchema = z.array(periodoArmazenagemPropostaSchema)

/** Valida períodos vindos da API (JSON Prisma). */
export function parsePeriodosArmazenagemPropostaFromServer(
  raw: unknown,
): PeriodoArmazenagemPropostaBidFreteInternacional[] | null {
  if (raw == null) return null
  const parsed = periodosArmazenagemPropostaSchema.safeParse(raw)
  if (!parsed.success) {
    console.warn(
      '[parsePeriodosArmazenagemPropostaFromServer] payload inválido',
      parsed.error.issues,
    )
    return null
  }
  return parsed.data
}

export function rotuloTipoTarifaPeriodoArmazenagem(
  tipo: TipoTarifaPeriodoArmazenagemProposta,
): string {
  return OPCOES_TIPO_TARIFA_PERIODO_ARMAZENAGEM.find((o) => o.valor === tipo)?.rotulo ?? tipo
}

export function formatarValorTarifaPeriodoArmazenagem(
  periodo: PeriodoArmazenagemPropostaBidFreteInternacional,
): string {
  if (periodo.tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional === 'PERCENTUAL_MERCADORIA') {
    const pct = periodo.valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional
    return `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}%`
  }
  return formatarMoedaBidFrete(
    periodo.valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional,
    'BRL',
  )
}

export function formatarMinimoReaisPeriodoArmazenagem(
  periodo: PeriodoArmazenagemPropostaBidFreteInternacional,
): string | null {
  const minimo = periodo.minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional
  if (!Number.isFinite(minimo) || minimo <= 0) return null
  return formatarMoedaBidFrete(minimo, 'BRL')
}

/** Períodos ordenados para exibição read-only (JSON atual ou campos legados). */
export function periodosArmazenagemExibicaoFromProposta(
  proposta: {
    periodos_armazenagem_proposta_bid_frete_internacional?: PeriodoArmazenagemPropostaBidFreteInternacional[] | null
    dias_periodo_armazenagem_proposta_bid_frete_internacional?: number | null
    valor_armazenagem_reais_proposta_bid_frete_internacional?: number | null
  },
): PeriodoArmazenagemPropostaBidFreteInternacional[] {
  if (proposta.periodos_armazenagem_proposta_bid_frete_internacional?.length) {
    return [...proposta.periodos_armazenagem_proposta_bid_frete_internacional].sort(
      (a, b) =>
        a.ordem_periodo_armazenagem_proposta_bid_frete_internacional
        - b.ordem_periodo_armazenagem_proposta_bid_frete_internacional,
    )
  }

  const diasLegado = proposta.dias_periodo_armazenagem_proposta_bid_frete_internacional
  const valorLegado = proposta.valor_armazenagem_reais_proposta_bid_frete_internacional
  if (diasLegado != null && valorLegado != null && diasLegado > 0 && valorLegado > 0) {
    return [{
      ordem_periodo_armazenagem_proposta_bid_frete_internacional: 1,
      dias_periodo_armazenagem_proposta_bid_frete_internacional: diasLegado,
      tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: 'REAIS',
      valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: valorLegado,
      minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: valorLegado,
    }]
  }

  return []
}
