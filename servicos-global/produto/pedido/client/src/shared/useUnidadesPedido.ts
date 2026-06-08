/**
 * useUnidadesPedido.ts — Helper que envelopa `useUnidades()` do nucleo-global
 * filtrando por categorias e formatando como `SIGLA — Nome` (decisão de UX
 * do dono em 2026-05-12).
 *
 * SSOT: a lista vem de `cadastros.unidade` via /api/v1/cadastros/unidades.
 * Substitui o arquivo (deletado) `unidadesPesoColuna.ts` que duplicava o
 * subset de peso hardcoded.
 *
 * Conversão peso → KG: `fator_para_kg_unidade` do banco (multiplicador da
 * quantidade digitada para obter KG canônico no Pedido).
 *
 * Categorias por uso no produto Pedido:
 *   - unidadesComercializadas → todas (UN, KG, LT, M, etc.)
 *   - unidadesPeso            → categoria='peso' (KG, G, TON)
 *   - unidadesCubagem         → categorias=comprimento|area|volume
 *                               (CM, M, CM2, M2, ML, LT, M3)
 *
 * Mandamento 06+09: Zod do useUnidades garante o contrato bilateral com
 * Cadastros. Aqui só transformamos a saída em `GTUnidadeOpcao`.
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

/** Exibe só o nome quando o rotulo segue o padrão `SIGLA — Nome` (volumes, unidades). */
export function rotuloExibicaoUnidadeOpcao(
  codigo: string | null | undefined,
  opcoes: readonly GTUnidadeOpcao[],
): string {
  if (!codigo) return '—'
  const op = opcoes.find(o => o.sigla === codigo)
  if (!op) return codigo
  const sep = op.rotulo.indexOf(' — ')
  return sep >= 0 ? op.rotulo.slice(sep + 3).trim() : op.rotulo
}

/** Formata `SIGLA — Nome` (decisão UX 2026-05-12). Exportado para teste. */
export function formatarRotuloUnidade(u: Unidade): string {
  return `${u.codigo_unidade} — ${u.nome_unidade}`
}

/** Filtra `Unidade[]` por categorias e formata como `GTUnidadeOpcao[]`. Exportado para teste. */
export function filtrarUnidadesPorCategorias(
  unidades: Unidade[],
  categorias: readonly TipoUnidade[],
): GTUnidadeOpcao[] {
  return unidades
    .filter((u) => categorias.includes(u.tipo_unidade))
    .map((u) => ({ sigla: u.codigo_unidade, rotulo: formatarRotuloUnidade(u) }))
}

/**
 * Mapa codigo_unidade → fator_para_kg_unidade (SSOT cadastros.unidade).
 * Exportado para teste.
 */
export function buildMapaFatorParaKg(unidades: Unidade[]): Record<string, number> {
  const mapa: Record<string, number> = {}
  for (const u of unidades) {
    if (u.tipo_unidade === 'peso' && u.fator_para_kg_unidade != null) {
      mapa[u.codigo_unidade] = u.fator_para_kg_unidade
    }
  }
  return mapa
}

/** Converte KG armazenado → quantidade na unidade de exibição. */
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

/** Converte quantidade digitada na unidade de exibição → KG para persistência. */
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
  /** Todas as unidades (qualquer categoria) — para `unidade_comercializada_item`. */
  unidadesComercializadas: GTUnidadeOpcao[]
  /** Apenas categoria='peso' — para peso_liquido / peso_bruto. */
  unidadesPeso: GTUnidadeOpcao[]
  /** Categorias comprimento|area|volume — para cubagem (decisão UX 2026-05-12). */
  unidadesCubagem: GTUnidadeOpcao[]
  /** SSOT cadastros.unidade — conversão qty exibição ↔ KG. */
  mapaFatorParaKg: Record<string, number>
  /** True enquanto o fetch do Cadastros não terminou. */
  loading: boolean
  /** Mensagem se o Cadastros falhou (rede/zod). */
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
