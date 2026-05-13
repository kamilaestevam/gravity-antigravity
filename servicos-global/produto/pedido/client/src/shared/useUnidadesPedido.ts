/**
 * useUnidadesPedido.ts — Helper que envelopa `useUnidades()` do nucleo-global
 * filtrando por categorias e formatando como `SIGLA — Nome` (decisão de UX
 * do dono em 2026-05-12).
 *
 * SSOT: a lista vem de `cadastros.unidade` via /api/v1/cadastros/unidades.
 * Substitui o arquivo (deletado) `unidadesPesoColuna.ts` que duplicava o
 * subset de peso hardcoded.
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

export interface UnidadesPedidoSet {
  /** Todas as unidades (qualquer categoria) — para `unidade_comercializada_item`. */
  unidadesComercializadas: GTUnidadeOpcao[]
  /** Apenas categoria='peso' — para peso_liquido / peso_bruto. */
  unidadesPeso: GTUnidadeOpcao[]
  /** Categorias comprimento|area|volume — para cubagem (decisão UX 2026-05-12). */
  unidadesCubagem: GTUnidadeOpcao[]
  /** True enquanto o fetch do Cadastros não terminou. Dropdowns ficam vazios. */
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
      loading,
      erro,
    }),
    [unidades, loading, erro],
  )
}
