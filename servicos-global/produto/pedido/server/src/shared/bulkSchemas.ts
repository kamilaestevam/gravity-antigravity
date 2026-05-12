/**
 * bulkSchemas.ts — Validações Zod reutilizáveis para operações bulk de Pedido
 *
 * Exporta:
 *   - BulkIdsInput          — tipo base {ids, id_organizacao} para qualquer rota bulk
 *   - assertTiposHomogeneos — refinement assíncrono: garante que todos os pedidos
 *                             selecionados são do mesmo tipo_operacao_pedido
 *   - detectarTiposMistos   — função síncrona para preview client-side sem 422
 *
 * Uso (Onda C — dentro de cada rota bulk):
 *
 *   const schema = z.object({ ids: z.array(z.string().min(1)).min(2) })
 *     .superRefine(async (data, ctx) => {
 *       await assertTiposHomogeneos(data.ids, db, idOrganizacao, ctx)
 *     })
 *
 * HTTP 422 é retornado para mistura de tipos, pois os dados são sintaticamente
 * válidos mas logicamente inviáveis (Unprocessable Entity — RFC 9110 §15.5.21).
 *
 * Skill: code-standards (Validação — Zod em toda rota)
 * Skill: isolamento-organizacao (id_organizacao em toda query)
 */

import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../errors/AppError.js'

// ── Tipos públicos ────────────────────────────────────────────────────────────

/**
 * Tipo base reutilizável para o corpo de qualquer endpoint bulk que opera
 * sobre uma lista de pedidos pertencentes a uma única organização.
 */
export type BulkIdsInput = {
  ids: string[]
  id_organizacao: string
}

// ── Funções exportadas ────────────────────────────────────────────────────────

/**
 * detectarTiposMistos — verifica sincronamente se uma lista de
 * tipo_operacao_pedido contém mais de um valor distinto.
 *
 * Útil para preview responses no frontend: o servidor pode incluir
 * `tipos_mistos: detectarTiposMistos(tipos)` na resposta de /preview sem
 * precisar lançar 422, permitindo que a UI mostre um aviso ao usuário antes
 * de ele tentar confirmar a operação.
 *
 * @param tipos  Array de valores de tipo_operacao_pedido já carregados do banco.
 * @returns      true se houver mistura de tipos, false se todos forem iguais.
 */
export function detectarTiposMistos(tipos: string[]): boolean {
  if (tipos.length === 0) return false
  return new Set(tipos).size > 1
}

/**
 * assertTiposHomogeneos — refinement assíncrono para z.superRefine().
 *
 * Busca o tipo_operacao_pedido de todos os pedidos informados (select mínimo,
 * sempre filtrado por id_organizacao) e registra um ZodIssue customizado caso
 * haja mistura de 'importacao' e 'exportacao'. O chamador deve mapear ZodError
 * para HTTP 422.
 *
 * Garante isolamento de organização: nenhum registro de outra organização é lido.
 * Garante select mínimo: apenas {id_pedido, tipo_operacao_pedido}.
 *
 * @param ids             IDs dos pedidos selecionados pelo usuário.
 * @param prisma          Instância do PrismaClient já scoped à organização pelo middleware.
 * @param idOrganizacao   ID da organização extraído do JWT/header pelo middleware.
 *                        Incluído explicitamente na query para defesa em profundidade.
 * @param ctx             RefinementCtx fornecido pelo z.superRefine() do schema pai.
 */
export async function assertTiposHomogeneos(
  ids: string[],
  prisma: PrismaClient,
  idOrganizacao: string,
  ctx: z.RefinementCtx,
): Promise<void> {
  if (ids.length === 0) return

  // Select mínimo — nunca expor dados além do necessário
  const registros = await (prisma as unknown as {
    pedido: {
      findMany: (args: {
        where: { id_pedido: { in: string[] }; id_organizacao: string }
        select: { id_pedido: boolean; tipo_operacao_pedido: boolean }
      }) => Promise<Array<{ id_pedido: string; tipo_operacao_pedido: string | null }>>
    }
  }).pedido.findMany({
    where: {
      id_pedido:      { in: ids },
      id_organizacao: idOrganizacao,
    },
    select: {
      id_pedido:            true,
      tipo_operacao_pedido: true,
    },
  })

  // Pedidos não encontrados são tratados como erro de integridade — não de tipo
  if (registros.length === 0) return

  const tipos = registros
    .map((r) => r.tipo_operacao_pedido)
    .filter((t): t is string => t !== null && t !== undefined)

  if (detectarTiposMistos(tipos)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Não é possível operar pedidos de importação e exportação juntos. ' +
        'Selecione apenas pedidos do mesmo tipo de operação.',
    })
  }
}

// ── Re-exporta AppError para conveniência das rotas bulk (Onda C) ─────────────
// Permite que a Onda C importe tudo de um único ponto:
//   import { assertTiposHomogeneos, BulkIdsInput, AppError } from '../shared/bulkSchemas.js'
export { AppError }
