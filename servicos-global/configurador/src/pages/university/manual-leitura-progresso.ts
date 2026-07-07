import type { DocFluxo, DocPassoVisual, DocSecao } from './manual-configurador-conteudo'
import { achatarPassosVisuais, encontrarPassoPorNum } from './manual-configurador-conteudo'

export type ManualEstadoLeitura = 'nao_lido' | 'parcial' | 'lido'

const STORAGE_PREFIX = 'gravity-university-manual-leitura:'

export function idSecaoManual(num: number): string {
  return `doc-sec-${num}`
}

export function idPassoManual(ancoraPrefix: string, passoNum: number): string {
  return `manual-passo-${ancoraPrefix}-${passoNum}`
}

export function idsPassosFluxo(fluxo: DocFluxo): string[] {
  if (!fluxo.ancoraPassosPrefix || !(fluxo.passosVisuais?.length ?? 0)) return []
  return achatarPassosVisuais(fluxo.passosVisuais).map(p =>
    idPassoManual(fluxo.ancoraPassosPrefix!, p.num),
  )
}

/** Abre acordeões pais antes do passo alvo (navegação pelo sumário ou hash). */
export function abrirCadeiaPassoManual(
  prefix: string,
  passos: DocPassoVisual[],
  num: number,
  abrir: (prefix: string, num: number) => void,
): void {
  const passo = encontrarPassoPorNum(passos, num)
  if (!passo) return
  if (passo.numPai != null) {
    abrirCadeiaPassoManual(prefix, passos, passo.numPai, abrir)
  }
  abrir(prefix, num)
}

export function extrairSlugManualDaRota(pathname: string): string | null {
  const match = pathname.match(/\/university-gravity\/docs\/([^/?#]+)/)
  return match?.[1] ?? null
}

function chaveStorage(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`
}

export function carregarLidosManual(slug: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(chaveStorage(slug))
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function salvarLidosManual(slug: string, lidos: Set<string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(chaveStorage(slug), JSON.stringify([...lidos]))
  } catch {
    // quota ou modo privado — ignora
  }
}

export function calcularEstadoLeitura(
  lidos: Set<string>,
  ids: string[],
): ManualEstadoLeitura {
  if (ids.length === 0) return 'nao_lido'
  const lidosCount = ids.filter(id => lidos.has(id)).length
  if (lidosCount === 0) return 'nao_lido'
  if (lidosCount === ids.length) return 'lido'
  return 'parcial'
}

export function calcularEstadoCapitulo(
  lidos: Set<string>,
  secaoNum: number,
  fluxo?: DocFluxo,
): ManualEstadoLeitura {
  const filhos = fluxo ? idsPassosFluxo(fluxo) : []
  if (filhos.length > 0) return calcularEstadoLeitura(lidos, filhos)
  return lidos.has(idSecaoManual(secaoNum)) ? 'lido' : 'nao_lido'
}

/** Itens rastreáveis (capítulos sem filhos + subcapítulos). */
export function montarIdsRastreaveisLeituraManual(secao: DocSecao): string[] {
  const ids: string[] = [idSecaoManual(1)]
  secao.fluxos?.forEach((fluxo, i) => {
    const filhos = idsPassosFluxo(fluxo)
    if (filhos.length > 0) ids.push(...filhos)
    else ids.push(idSecaoManual(i + 2))
  })
  return ids
}

export function contarLidosManual(lidos: Set<string>, idsRastreaveis: string[]): number {
  return idsRastreaveis.filter(id => lidos.has(id)).length
}

export function percentualLeituraManual(lidos: Set<string>, idsRastreaveis: string[]): number {
  if (idsRastreaveis.length === 0) return 0
  return Math.round((contarLidosManual(lidos, idsRastreaveis) / idsRastreaveis.length) * 100)
}
