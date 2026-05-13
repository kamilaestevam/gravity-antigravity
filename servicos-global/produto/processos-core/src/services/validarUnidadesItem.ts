/**
 * validarUnidadesItem.ts — Validação cruzada de unidades de item contra
 * cadastros.unidade (SSOT).
 *
 * Mandamentos 06 + 09: Zod aceita string genérica; aqui validamos em runtime
 * que a sigla EXISTE em cadastros.unidade e tem a categoria correta para o
 * campo do item. Falha alta (HTTP 400) — Mandamento 08, sem fallback.
 *
 * Categorias permitidas por campo (decisão UX 2026-05-12):
 *   peso_liquido_unidade_item    → ['peso']
 *   peso_bruto_unidade_item      → ['peso']
 *   cubagem_unidade_item         → ['comprimento', 'area', 'volume']
 *   unidade_comercializada_item  → [] (qualquer categoria)
 */
import { AppError } from './saldo-pedido.js'
import {
  buscarUnidadePorCodigo,
  type CadastrosRequestContext,
} from './cadastrosClient.js'

export const UNIDADES_CATEGORIAS_VALIDAS: Record<string, readonly string[]> = {
  peso_liquido_unidade_item:   ['peso'],
  peso_bruto_unidade_item:     ['peso'],
  cubagem_unidade_item:        ['comprimento', 'area', 'volume'],
  unidade_comercializada_item: [], // qualquer categoria
}

export async function validarUnidadesItem(
  payload: Record<string, unknown>,
  ctx: CadastrosRequestContext,
  /** Injetável para teste — default é buscarUnidadePorCodigo real. */
  buscador: typeof buscarUnidadePorCodigo = buscarUnidadePorCodigo,
): Promise<void> {
  for (const [campo, categoriasValidas] of Object.entries(UNIDADES_CATEGORIAS_VALIDAS)) {
    const valor = payload[campo]
    if (valor == null || typeof valor !== 'string' || valor === '') continue
    const unidade = await buscador(valor, ctx)
    if (!unidade) {
      throw new AppError(
        400,
        `Unidade "${valor}" nao existe em cadastros.unidade (campo ${campo}). [corr=${ctx.correlation_id}]`,
      )
    }
    if (categoriasValidas.length > 0 && !categoriasValidas.includes(unidade.tipo_unidade)) {
      throw new AppError(
        400,
        `Unidade "${valor}" tem categoria "${unidade.tipo_unidade}", mas ${campo} aceita ${categoriasValidas.join('|')}. [corr=${ctx.correlation_id}]`,
      )
    }
  }
}
