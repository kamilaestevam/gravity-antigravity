import { montarMapaXpAulas, obterXpAula } from './pesos-academy-guia-gravity.js'
import { SLUGS_AULA_POR_PRODUTO_GUIA } from './slugs-aula-por-produto.js'

export const MINUTOS_RITMO_IDEAL_DIA = 15

export function calcularXpMaximoCatalogo(): number {
  let total = 0
  for (const [produto, slugs] of Object.entries(SLUGS_AULA_POR_PRODUTO_GUIA)) {
    const mapa = montarMapaXpAulas(produto, slugs.map(slug => ({ slug })))
    for (const slug of slugs) {
      total += mapa.get(slug) ?? obterXpAula(produto, slug)
    }
  }
  return total
}

export function calcularXpTotalConclusoes(
  conclusoes: ReadonlyArray<{ slug_aula_guia_gravity: string; xp_conquistado_aula_guia_gravity: number }>,
): number {
  return conclusoes.reduce((soma, c) => soma + Number(c.xp_conquistado_aula_guia_gravity), 0)
}

export function calcularXpPorProduto(
  conclusoes: ReadonlyArray<{ slug_aula_guia_gravity: string; slug_produto_guia_gravity: string; xp_conquistado_aula_guia_gravity: number }>,
): Record<string, number> {
  const mapa: Record<string, number> = {}
  for (const c of conclusoes) {
    mapa[c.slug_produto_guia_gravity] =
      (mapa[c.slug_produto_guia_gravity] ?? 0) + Number(c.xp_conquistado_aula_guia_gravity)
  }
  return mapa
}

function inicioDoDia(data: Date): Date {
  const d = new Date(data)
  d.setHours(0, 0, 0, 0)
  return d
}

function diasEntre(inicio: Date, fim: Date): number {
  const ms = inicioDoDia(fim).getTime() - inicioDoDia(inicio).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export function calcularRitmoGuiaGravity(opts: {
  xpTotal: number
  xpMaximo: number
  dataInicio: Date
  agora?: Date
}) {
  const { xpTotal, xpMaximo, dataInicio, agora = new Date() } = opts
  const diasDecorridos = diasEntre(dataInicio, agora)
  const diasPlanoTotal = xpMaximo > 0
    ? Math.max(1, Math.ceil(xpMaximo / MINUTOS_RITMO_IDEAL_DIA))
    : 1
  const xpEsperadoHoje = xpMaximo > 0
    ? Math.min(xpMaximo, diasDecorridos * MINUTOS_RITMO_IDEAL_DIA)
    : 0

  const pctReal = xpMaximo > 0 ? Math.min(100, Math.round((xpTotal / xpMaximo) * 100)) : 0
  const pctIdeal = xpMaximo > 0 ? Math.min(100, Math.round((xpEsperadoHoje / xpMaximo) * 100)) : 0
  const deltaDias = MINUTOS_RITMO_IDEAL_DIA > 0
    ? Math.round((xpTotal - xpEsperadoHoje) / MINUTOS_RITMO_IDEAL_DIA)
    : 0

  return {
    delta_dias: deltaDias,
    pct_real: pctReal,
    pct_ideal: pctIdeal,
    dias_decorridos: diasDecorridos,
    dias_plano_total: diasPlanoTotal,
  }
}
