/**
 * Ritmo ideal da jornada — onde o usuário deveria estar vs. progresso real (+/− dias).
 */

import {
  MINUTOS_RITMO_IDEAL_DIA,
  montarMapaDuracaoPorSlug,
  parseDuracaoAcademy,
  somarDuracaoFases,
} from './duracao-academy-guia-gravity'
import { aulaGuiaEstaConcluida } from './certificado-guia-gravity'

export interface FaseComDuracao {
  slug?: string
  duracao: string
}

export interface TrilhaComDuracao {
  fases: FaseComDuracao[]
}

export interface MetricasRitmoJornada {
  /** Progresso real (0–100) — minutos concluídos / minutos totais. */
  pctRealMinutos: number
  /** Onde deveria estar hoje no plano (0–100). */
  pctIdeal: number
  /** Positivo = adiantado; negativo = atrasado. */
  deltaDias: number
  diasDecorridos: number
  diasPlanoTotal: number
  minutosTotais: number
  minutosConcluidos: number
  minutosEsperadosHoje: number
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

/**
 * Data de início da jornada — fonte: API (`jornada.data_inicio_jornada_guia_gravity`).
 * Fallback local apenas quando a API ainda não carregou.
 */
export function obterDataInicioJornadaGuia(
  minutosConcluidos = 0,
  dataInicioPersistida?: Date | string | null,
): Date {
  if (dataInicioPersistida) {
    const parsed = dataInicioPersistida instanceof Date
      ? dataInicioPersistida
      : new Date(dataInicioPersistida)
    if (!Number.isNaN(parsed.getTime())) return inicioDoDia(parsed)
  }
  const diasEstimados = minutosConcluidos > 0
    ? Math.max(1, Math.ceil(minutosConcluidos / MINUTOS_RITMO_IDEAL_DIA))
    : 0
  const inicio = inicioDoDia(new Date())
  if (diasEstimados > 0) inicio.setDate(inicio.getDate() - diasEstimados)
  return inicio
}

export function calcularMinutosConcluidosJornada(
  aulasConcluidas: Set<string>,
  mapaDuracao: Map<string, number>,
): number {
  let soma = 0
  for (const slug of aulasConcluidas) {
    soma += mapaDuracao.get(slug) ?? 0
  }
  return soma
}

export function montarMapaDuracaoProdutos(
  produtos: string[],
  trilhasPorProduto: Record<string, TrilhaComDuracao[] | undefined>,
): Map<string, number> {
  const todasFases = produtos.flatMap(slug => trilhasPorProduto[slug]?.flatMap(t => t.fases) ?? [])
  return montarMapaDuracaoPorSlug(todasFases)
}

export function calcularMinutosTotaisProdutos(
  produtos: string[],
  trilhasPorProduto: Record<string, TrilhaComDuracao[] | undefined>,
): number {
  return produtos.reduce((soma, slug) => {
    const trilhas = trilhasPorProduto[slug] ?? []
    return soma + trilhas.reduce((acc, tr) => acc + somarDuracaoFases(tr.fases), 0)
  }, 0)
}

export function calcularRitmoJornada(opts: {
  minutosTotais: number
  minutosConcluidos: number
  dataInicio: Date
  agora?: Date
}): MetricasRitmoJornada {
  const { minutosTotais, minutosConcluidos, dataInicio, agora = new Date() } = opts
  const diasDecorridos = diasEntre(dataInicio, agora)
  const diasPlanoTotal = minutosTotais > 0
    ? Math.max(1, Math.ceil(minutosTotais / MINUTOS_RITMO_IDEAL_DIA))
    : 1
  const minutosEsperadosHoje = minutosTotais > 0
    ? Math.min(minutosTotais, diasDecorridos * MINUTOS_RITMO_IDEAL_DIA)
    : 0

  const pctRealMinutos = minutosTotais > 0
    ? Math.min(100, Math.round((minutosConcluidos / minutosTotais) * 100))
    : 0
  const pctIdeal = minutosTotais > 0
    ? Math.min(100, Math.round((minutosEsperadosHoje / minutosTotais) * 100))
    : 0

  const deltaDias = MINUTOS_RITMO_IDEAL_DIA > 0
    ? Math.round((minutosConcluidos - minutosEsperadosHoje) / MINUTOS_RITMO_IDEAL_DIA)
    : 0

  return {
    pctRealMinutos,
    pctIdeal,
    deltaDias,
    diasDecorridos,
    diasPlanoTotal,
    minutosTotais,
    minutosConcluidos,
    minutosEsperadosHoje,
  }
}

/** Ritmo de um módulo na sequência contratada (ideal linear dentro da janela do produto). */
export function calcularRitmoModuloSequencial(opts: {
  produtosOrdenados: string[]
  trilhasPorProduto: Record<string, TrilhaComDuracao[] | undefined>
  slugModulo: string
  minutosConcluidosModulo: number
  dataInicio: Date
  agora?: Date
  /** Quando informado (ex.: capítulo Configurador), ritmo considera só estas aulas. */
  fasesEscopo?: FaseComDuracao[]
}): MetricasRitmoJornada {
  const {
    produtosOrdenados,
    trilhasPorProduto,
    slugModulo,
    minutosConcluidosModulo,
    dataInicio,
    agora,
    fasesEscopo,
  } = opts

  let diaCursor = 0
  let minutosModulo = 0
  let diasPlanoModulo = 1

  for (const slug of produtosOrdenados) {
    const trilhas = trilhasPorProduto[slug] ?? []
    const minutosProduto = trilhas.reduce((acc, tr) => acc + somarDuracaoFases(tr.fases), 0)
    const diasProduto = minutosProduto > 0
      ? Math.max(1, Math.ceil(minutosProduto / MINUTOS_RITMO_IDEAL_DIA))
      : 1

    if (slug === slugModulo) {
      minutosModulo = fasesEscopo
        ? somarDuracaoFases(fasesEscopo)
        : minutosProduto
      diasPlanoModulo = minutosModulo > 0
        ? Math.max(1, Math.ceil(minutosModulo / MINUTOS_RITMO_IDEAL_DIA))
        : 1
      break
    }
    diaCursor += diasProduto
  }

  const diasDecorridos = diasEntre(dataInicio, agora ?? new Date())
  const diasNoModulo = diasDecorridos - diaCursor
  const minutosEsperadosHoje = minutosModulo > 0
    ? Math.min(minutosModulo, Math.max(0, diasNoModulo) * MINUTOS_RITMO_IDEAL_DIA)
    : 0

  const pctRealMinutos = minutosModulo > 0
    ? Math.min(100, Math.round((minutosConcluidosModulo / minutosModulo) * 100))
    : 0
  const pctIdeal = minutosModulo > 0
    ? Math.min(100, Math.round((minutosEsperadosHoje / minutosModulo) * 100))
    : 0
  const deltaDias = MINUTOS_RITMO_IDEAL_DIA > 0
    ? Math.round((minutosConcluidosModulo - minutosEsperadosHoje) / MINUTOS_RITMO_IDEAL_DIA)
    : 0

  return {
    pctRealMinutos,
    pctIdeal,
    deltaDias,
    diasDecorridos,
    diasPlanoTotal: diasPlanoModulo,
    minutosTotais: minutosModulo,
    minutosConcluidos: minutosConcluidosModulo,
    minutosEsperadosHoje,
  }
}

/** Posição na linha do tempo (dia 0 = início · dia N = meta de conclusão do plano). */
export function calcularPosicoesTimelineRitmo(ritmo: MetricasRitmoJornada): {
  diaPlanoTotal: number
  diaProgresso: number
  diaMetaHoje: number
  pctProgresso: number
  pctMeta: number
} {
  const diaPlanoTotal = Math.max(1, ritmo.diasPlanoTotal)
  const diaProgresso = Math.min(
    diaPlanoTotal,
    Math.round((ritmo.minutosConcluidos / MINUTOS_RITMO_IDEAL_DIA) * 10) / 10,
  )
  const diaMetaHoje = Math.min(
    diaPlanoTotal,
    Math.round((ritmo.minutosEsperadosHoje / MINUTOS_RITMO_IDEAL_DIA) * 10) / 10,
  )
  const pctProgresso = Math.min(100, (diaProgresso / diaPlanoTotal) * 100)
  const pctMeta = Math.min(100, (diaMetaHoje / diaPlanoTotal) * 100)
  return { diaPlanoTotal, diaProgresso, diaMetaHoje, pctProgresso, pctMeta }
}

/** Resumo do pin — prazo total, dias decorridos da jornada e leitura restante no plano. */
export function calcularResumoPinTimelineRitmo(
  ritmo: MetricasRitmoJornada,
  timeline: ReturnType<typeof calcularPosicoesTimelineRitmo>,
): {
  prazoEstimadoDias: number
  diasJornada: number
  faltamDias: number
} {
  const faltamDias = Math.max(
    0,
    Math.round((timeline.diaPlanoTotal - timeline.diaProgresso) * 10) / 10,
  )
  return {
    prazoEstimadoDias: timeline.diaPlanoTotal,
    diasJornada: ritmo.diasDecorridos,
    faltamDias,
  }
}

/** Preview dev — `?demoRitmo=atrasado|adiantado` na URL (somente UI local). */
export function aplicarDemoRitmoGuiaGravity(
  ritmo: MetricasRitmoJornada,
  modo: 'atrasado' | 'adiantado' | null,
): MetricasRitmoJornada {
  if (!modo) return ritmo

  const diasPlano = Math.max(ritmo.diasPlanoTotal, 5)
  const minutosTotais = ritmo.minutosTotais > 0
    ? ritmo.minutosTotais
    : diasPlano * MINUTOS_RITMO_IDEAL_DIA
  const diaMeta = Math.min(diasPlano, 5)
  const minutosEsperadosHoje = Math.min(minutosTotais, diaMeta * MINUTOS_RITMO_IDEAL_DIA)
  const diasAtraso = 2
  const diasAdiantado = 2

  const minutosConcluidos = modo === 'atrasado'
    ? Math.max(0, minutosEsperadosHoje - diasAtraso * MINUTOS_RITMO_IDEAL_DIA)
    : Math.min(minutosTotais, minutosEsperadosHoje + diasAdiantado * MINUTOS_RITMO_IDEAL_DIA)

  const deltaDias = modo === 'atrasado' ? -diasAtraso : diasAdiantado

  return {
    ...ritmo,
    minutosTotais,
    minutosConcluidos,
    minutosEsperadosHoje,
    diasPlanoTotal: diasPlano,
    diasDecorridos: diaMeta,
    pctRealMinutos: Math.min(100, Math.round((minutosConcluidos / minutosTotais) * 100)),
    pctIdeal: Math.min(100, Math.round((minutosEsperadosHoje / minutosTotais) * 100)),
    deltaDias,
  }
}

export function minutosConcluidosModulo(
  fases: FaseComDuracao[],
  aulasConcluidas: Set<string>,
): number {
  return fases.reduce((soma, f) => {
    if (!f.slug || !aulaGuiaEstaConcluida(f.slug, aulasConcluidas)) return soma
    return soma + parseDuracaoAcademy(f.duracao)
  }, 0)
}

export type ClasseLegendaStatusRitmo = 'is-adiantado' | 'is-atrasado' | 'is-no-ritmo' | 'is-aguardando'

export interface LegendaStatusRitmo {
  texto: string
  classe: ClasseLegendaStatusRitmo
}

export function ritmoAguardandoModulosAnteriores(
  ritmo: MetricasRitmoJornada,
  demoModo: 'atrasado' | 'adiantado' | null,
): boolean {
  return Boolean(
    ritmo.minutosEsperadosHoje === 0
    && ritmo.pctIdeal === 0
    && ritmo.minutosTotais > 0
    && demoModo !== 'atrasado'
    && demoModo !== 'adiantado',
  )
}

export function calcularLegendaStatusRitmo(
  ritmo: MetricasRitmoJornada,
  aguardandoModulo: boolean,
  traduzir: (chave: string, params?: Record<string, unknown>) => string,
): LegendaStatusRitmo {
  if (aguardandoModulo) {
    return {
      texto: traduzir('university.dashboard.ritmo.delta_aguardando_anteriores'),
      classe: 'is-aguardando',
    }
  }
  if (ritmo.deltaDias > 0) {
    return {
      texto: traduzir('university.dashboard.ritmo.advanced', { dias: ritmo.deltaDias }),
      classe: 'is-adiantado',
    }
  }
  if (ritmo.deltaDias < 0) {
    return {
      texto: traduzir('university.dashboard.ritmo.behind', { dias: Math.abs(ritmo.deltaDias) }),
      classe: 'is-atrasado',
    }
  }
  return {
    texto: traduzir('university.dashboard.ritmo.on_track'),
    classe: 'is-no-ritmo',
  }
}

export function fmtDiaTimelineRitmo(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1)
}
