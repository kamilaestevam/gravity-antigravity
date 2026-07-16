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

export function minutosConcluidosModulo(
  fases: FaseComDuracao[],
  aulasConcluidas: Set<string>,
): number {
  return fases.reduce((soma, f) => {
    if (!f.slug || !aulaGuiaEstaConcluida(f.slug, aulasConcluidas)) return soma
    return soma + parseDuracaoAcademy(f.duracao)
  }, 0)
}
