/**
 * Rótulo de exibição dos painéis da Lista Smart Read — separa nome salvo no banco do texto na UI.
 */
import type { ListaPainel } from './api'

const NOMES_PADRAO_SISTEMA = new Set(['principal', 'padrão', 'padrao', 'default'])

/** Nome genérico do sistema ou placeholder — não é um nome escolhido pelo usuário. */
export function ehNomePainelListaGenerico(nome: string): boolean {
  const t = nome.trim().toLowerCase()
  if (!t) return true
  if (NOMES_PADRAO_SISTEMA.has(t)) return true
  return /^painel\s*\d*$/i.test(t)
}

export function indiceOrdinalPainelLista(
  paineis: readonly Pick<ListaPainel, 'id' | 'ordem'>[],
  idPainel: string,
): number {
  const ordenados = [...paineis].sort((a, b) => a.ordem - b.ordem)
  const idx = ordenados.findIndex((p) => p.id === idPainel)
  return idx >= 0 ? idx + 1 : ordenados.length + 1
}

export interface RotuloExibicaoPainelLista {
  exibicao: string
  ehGenerico: boolean
  nomeSalvo: string
}

export function rotuloExibicaoPainelLista(
  painel: Pick<ListaPainel, 'id' | 'nome' | 'ordem'>,
  paineis: readonly Pick<ListaPainel, 'id' | 'nome' | 'ordem'>[],
  rotulos?: { padrao?: string; numerado?: (n: number) => string },
): RotuloExibicaoPainelLista {
  const nomeSalvo = painel.nome.trim()
  const ordinal = indiceOrdinalPainelLista(paineis, painel.id)
  const ehGenerico = ehNomePainelListaGenerico(nomeSalvo)

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

/** Input de rename — painéis genéricos começam vazios; placeholder = exibição. */
export function valorInputRenomearPainelLista(
  painel: Pick<ListaPainel, 'id' | 'nome' | 'ordem'>,
  paineis: readonly Pick<ListaPainel, 'id' | 'nome' | 'ordem'>[],
): string {
  const { ehGenerico } = rotuloExibicaoPainelLista(painel, paineis)
  return ehGenerico ? '' : painel.nome.trim()
}

export function deveSalvarRenomearPainelLista(nomeAtual: string, nomeDigitado: string): boolean {
  const trimmed = nomeDigitado.trim()
  if (!trimmed) return false
  return trimmed !== nomeAtual.trim()
}
