/**
 * validarIncotermPedidoItem.ts — Validação cruzada de Incoterm de Pedido/Item
 * contra cadastros.incoterm (SSOT).
 *
 * Mandamentos 06 + 09: Zod aceita string genérica; aqui validamos em runtime
 * que a sigla EXISTE em cadastros.incoterm. Falha alta (HTTP 400) — Mandamento
 * 08, sem fallback silencioso.
 *
 * Campos validados (no payload de PUT/POST):
 *   - incoterm        (em PedidoItem)
 *   - incoterm_pedido (em Pedido pai)
 *
 * Não restringe por modal_transporte aqui — é decisão de UX da camada UI
 * (algumas operações de exportação podem aceitar qualquer modal, outras só
 * marítimo). Quando precisar, adicionar filtro contextual.
 */
import { AppError } from './saldo-pedido.js'
import {
  buscarIncotermPorCodigo,
  type CadastrosRequestContext,
} from './cadastrosClient.js'

/** Campos do payload que carregam sigla de Incoterm. */
export const CAMPOS_INCOTERM: readonly string[] = [
  'incoterm',         // PedidoItem
  'incoterm_pedido',  // Pedido
]

export async function validarIncotermPedidoItem(
  payload: Record<string, unknown>,
  ctx: CadastrosRequestContext,
  /** Injetável para teste — default é buscarIncotermPorCodigo real. */
  buscador: typeof buscarIncotermPorCodigo = buscarIncotermPorCodigo,
): Promise<void> {
  for (const campo of CAMPOS_INCOTERM) {
    const valor = payload[campo]
    if (valor == null || typeof valor !== 'string' || valor === '') continue
    const incoterm = await buscador(valor, ctx)
    if (!incoterm) {
      throw new AppError(
        400,
        `Incoterm "${valor}" nao existe em cadastros.incoterm (campo ${campo}). [corr=${ctx.correlation_id}]`,
      )
    }
    if (!incoterm.ativo_incoterm) {
      throw new AppError(
        400,
        `Incoterm "${valor}" esta inativo em cadastros.incoterm (campo ${campo}). [corr=${ctx.correlation_id}]`,
      )
    }
  }
}
