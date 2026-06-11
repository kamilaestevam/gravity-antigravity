/**
 * useUnidadesPedido.ts — Helper que envelopa `useUnidades()` do nucleo-global
 * filtrando por categorias e formatando como `SIGLA — Nome` (decisão de UX
 * do dono em 2026-05-12).
 *
 * SSOT: a lista vem de `cadastros.unidade` via /api/v1/cadastros/unidades.
 * Conversão peso → KG: `fator_para_kg_unidade` do banco.
 */
import { useMemo } from 'react'
import {
  useUnidades,
  type Unidade,
  type TipoUnidade,
} from '@nucleo/modal-tabela-unidades'

export interface GTUnidadeOpcao {
  sigla: string
  rotulo: string
}

export function formatarRotuloUnidade(u: Unidade): string {
  return `${u.codigo_unidade} — ${u.nome_unidade}`
}

/** Badge de unidade na célula da lista — siglas em maiúsculas (alinha ao modal). */
export function formatarBadgeUnidadeCelula(codigo: string | null | undefined): string {
  const u = (codigo ?? '').trim().toUpperCase()
  if (!u) return '—'
  if (u === 'M3') return 'M³'
  return u
}

export function filtrarUnidadesPorCategorias(
  unidades: Unidade[],
  categorias: readonly TipoUnidade[],
): GTUnidadeOpcao[] {
  return unidades
    .filter((u) => categorias.includes(u.tipo_unidade))
    .map((u) => ({ sigla: u.codigo_unidade, rotulo: formatarRotuloUnidade(u) }))
}

export function buildMapaFatorParaKg(unidades: Unidade[]): Record<string, number> {
  const mapa: Record<string, number> = {}
  for (const u of unidades) {
    if (u.tipo_unidade === 'peso' && u.fator_para_kg_unidade != null) {
      mapa[u.codigo_unidade] = u.fator_para_kg_unidade
    }
  }
  return mapa
}

export function kgParaQuantidadeExibicao(
  kg: number,
  unit: string,
  mapa: Record<string, number>,
): number {
  const fator = mapa[unit]
  if (fator == null || fator === 0) {
    console.warn('[useUnidadesPedido] fator_para_kg_unidade ausente para', unit)
    return kg
  }
  return kg / fator
}

export function quantidadeExibicaoParaKg(
  qty: number,
  unit: string,
  mapa: Record<string, number>,
): number {
  const fator = mapa[unit]
  if (fator == null) {
    console.warn('[useUnidadesPedido] fator_para_kg_unidade ausente para', unit)
    return qty
  }
  return qty * fator
}

export interface UnidadesPedidoSet {
  unidadesComercializadas: GTUnidadeOpcao[]
  unidadesPeso: GTUnidadeOpcao[]
  unidadesCubagem: GTUnidadeOpcao[]
  mapaFatorParaKg: Record<string, number>
  loading: boolean
  erro: string | null
}

export function useUnidadesPedido(): UnidadesPedidoSet {
  const { unidades, loading, erro } = useUnidades()

  return useMemo(
    () => ({
      unidadesComercializadas: unidades.map((u) => ({
        sigla: u.codigo_unidade,
        rotulo: formatarRotuloUnidade(u),
      })),
      unidadesPeso: filtrarUnidadesPorCategorias(unidades, ['peso']),
      unidadesCubagem: filtrarUnidadesPorCategorias(unidades, ['comprimento', 'area', 'volume']),
      mapaFatorParaKg: buildMapaFatorParaKg(unidades),
      loading,
      erro,
    }),
    [unidades, loading, erro],
  )
}
