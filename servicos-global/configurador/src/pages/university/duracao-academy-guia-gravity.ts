/**
 * Duração de leitura — Guia Gravity Academy.
 * SSOT alinhado a MANUAL-GRAVITY-ONBOARDING.md §10, calibrado para conteúdo
 * rico em screenshots (scan visual, não leitura linear passo a passo).
 */

/** Tetos por tipo de aula (minutos) — scan visual de screenshots (rodada 3). */
export const TETO_DURACAO_AULA_MIN = {
  intro: 1,
  padrao: 3,
  longo: 5,
  muitoLongo: 6,
} as const

export type TipoAulaDuracao = keyof typeof TETO_DURACAO_AULA_MIN

/** Base introdutória antes dos passos visuais. */
const BASE_INTRO_MIN = 1

/**
 * Cada passo com screenshot/galeria — tempo de scan, não de execução.
 * Academy é majoritariamente imagem + texto curto.
 */
const MINUTOS_POR_PASSO_VISUAL_IMAGEM = 0.25

const MINUTOS_POR_CALLOUT_EXTRA = 0.2

/** Redução global vs. heurística “texto denso”. */
const FATOR_CALIBRACAO_LEITURA = 0.4

/** Minutos de leitura recomendados por dia útil no onboarding. */
export const MINUTOS_RITMO_IDEAL_DIA = 15

export function parseDuracaoAcademy(valor: string): number {
  const normalizado = valor.trim().toLowerCase()
  const matchHoras = normalizado.match(/^(\d+)\s*h(?:\s*(\d+)\s*m?)?$/)
  if (matchHoras) {
    const horas = Number(matchHoras[1])
    const mins = matchHoras[2] ? Number(matchHoras[2]) : 0
    return horas * 60 + mins
  }
  const matchMin = normalizado.match(/^(\d+)\s*m$/)
  if (matchMin) return Number(matchMin[1])
  return 0
}

export function formatarDuracaoAcademy(minutos: number): string {
  if (minutos >= 60) {
    const h = Math.floor(minutos / 60)
    const m = minutos % 60
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }
  return `${Math.max(1, minutos)}m`
}

/**
 * Heurística imagem-heavy: base + passos visuais × 0,35 min + callouts × 0,25, ×0,5, teto por tipo.
 */
export function estimarDuracaoLeituraAula(
  passosVisuais: number,
  calloutsExtras = 0,
  tipo: TipoAulaDuracao = 'padrao',
): number {
  const bruto =
    BASE_INTRO_MIN
    + passosVisuais * MINUTOS_POR_PASSO_VISUAL_IMAGEM
    + calloutsExtras * MINUTOS_POR_CALLOUT_EXTRA
  const calibrado = bruto * FATOR_CALIBRACAO_LEITURA
  const arredondado = Math.max(1, Math.round(calibrado))
  return Math.min(arredondado, TETO_DURACAO_AULA_MIN[tipo])
}

export function somarDuracaoFases(fases: { duracao: string }[]): number {
  return fases.reduce((soma, f) => soma + parseDuracaoAcademy(f.duracao), 0)
}

export function montarMapaDuracaoPorSlug(
  fases: { slug?: string; duracao: string }[],
): Map<string, number> {
  const mapa = new Map<string, number>()
  for (const fase of fases) {
    if (fase.slug) mapa.set(fase.slug, parseDuracaoAcademy(fase.duracao))
  }
  return mapa
}
