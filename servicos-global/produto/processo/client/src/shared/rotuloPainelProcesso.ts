/**
 * Rótulo de exibição dos painéis do Dashboard Processo.
 */
import type { ProcessoDashboardPainel } from './processoDashboardPainelLocal'

const NOMES_PADRAO_SISTEMA = new Set(['principal', 'padrão', 'padrao', 'default'])

export function ehNomePainelProcessoGenerico(nome: string): boolean {
  const t = nome.trim().toLowerCase()
  if (!t) return true
  if (NOMES_PADRAO_SISTEMA.has(t)) return true
  return /^painel\s*\d*$/i.test(t)
}

export function indiceOrdinalPainelProcesso(
  paineis: readonly Pick<ProcessoDashboardPainel, 'id' | 'ordem'>[],
  idPainel: string,
): number {
  const ordenados = [...paineis].sort((a, b) => a.ordem - b.ordem)
  const idx = ordenados.findIndex(p => p.id === idPainel)
  return idx >= 0 ? idx + 1 : ordenados.length + 1
}

export interface RotuloExibicaoPainelProcesso {
  exibicao: string
  ehGenerico: boolean
  nomeSalvo: string
}

export function rotuloExibicaoPainelProcesso(
  painel: Pick<ProcessoDashboardPainel, 'id' | 'nome' | 'ordem'>,
  paineis: readonly Pick<ProcessoDashboardPainel, 'id' | 'nome' | 'ordem'>[],
  rotulos?: { padrao?: string; numerado?: (n: number) => string },
): RotuloExibicaoPainelProcesso {
  const nomeSalvo = painel.nome.trim()
  const ordinal = indiceOrdinalPainelProcesso(paineis, painel.id)
  const ehGenerico = ehNomePainelProcessoGenerico(nomeSalvo)

  if (!ehGenerico) {
    return { exibicao: nomeSalvo, ehGenerico: false, nomeSalvo }
  }

  if (nomeSalvo.toLowerCase() === 'principal' && ordinal === 1) {
    return {
      exibicao: rotulos?.padrao ?? 'Padrão',
      ehGenerico: true,
      nomeSalvo,
    }
  }

  return {
    exibicao: rotulos?.numerado?.(ordinal) ?? `Painel ${ordinal}`,
    ehGenerico: true,
    nomeSalvo,
  }
}
