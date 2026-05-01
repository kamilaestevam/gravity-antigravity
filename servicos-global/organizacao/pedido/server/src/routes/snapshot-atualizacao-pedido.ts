/**
 * snapshot-atualizacao-pedido.ts — Política de atualização de snapshot do Pedido
 *
 * Endereça a tabela `pedido_snapshot_atualizacao` (model PedidoSnapshotAtualizacao).
 * Define, por workspace, quais papéis de Empresa/OPE devem ter o snapshot do
 * Pedido re-sincronizado quando o registro-base do Cadastros muda, e em quais
 * transições de status do Pedido o re-snapshot é disparado.
 *
 *   GET  /api/v1/pedidos/config/snapshot-atualizacao-pedido
 *     → Retorna a policy do workspace ou null (frontend usa default).
 *
 *   PUT  /api/v1/pedidos/config/snapshot-atualizacao-pedido
 *     → Upsert da policy (chaves curtas no contrato JSON; ACL converte para
 *       colunas Prisma DDD com sufixo _pedido_snapshot_atualizacao).
 *
 * REGRA 03 DDD: variáveis TS internas → idOrganizacao / idWorkspace.
 * REGRA 06: validação Zod em toda mutação.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'

export const snapshotAtualizacaoPedidoRouter = Router()

// ── Schema Zod (contrato externo — chaves curtas) ────────────────────────────

const PolicySchema = z.object({
  atualiza_importador:    z.boolean(),
  atualiza_exportador:    z.boolean(),
  atualiza_fabricante:    z.boolean(),
  atualiza_agente:        z.boolean(),
  atualiza_despachante:   z.boolean(),
  atualiza_armador:       z.boolean(),
  atualiza_ope:           z.boolean(),
  gatilho_emissao:        z.boolean(),
  gatilho_embarque:       z.boolean(),
  gatilho_desembaraco:    z.boolean(),
})

type PolicyExterno = z.infer<typeof PolicySchema>

// ── ACL: contrato JSON ↔ colunas Prisma DDD ──────────────────────────────────

interface PolicyPrisma {
  atualiza_importador_pedido_snapshot_atualizacao:  boolean
  atualiza_exportador_pedido_snapshot_atualizacao:  boolean
  atualiza_fabricante_pedido_snapshot_atualizacao:  boolean
  atualiza_agente_pedido_snapshot_atualizacao:      boolean
  atualiza_despachante_pedido_snapshot_atualizacao: boolean
  atualiza_armador_pedido_snapshot_atualizacao:     boolean
  atualiza_ope_pedido_snapshot_atualizacao:         boolean
  gatilho_emissao_pedido_snapshot_atualizacao:      boolean
  gatilho_embarque_pedido_snapshot_atualizacao:     boolean
  gatilho_desembaraco_pedido_snapshot_atualizacao:  boolean
}

function externoParaPrisma(p: PolicyExterno): PolicyPrisma {
  return {
    atualiza_importador_pedido_snapshot_atualizacao:  p.atualiza_importador,
    atualiza_exportador_pedido_snapshot_atualizacao:  p.atualiza_exportador,
    atualiza_fabricante_pedido_snapshot_atualizacao:  p.atualiza_fabricante,
    atualiza_agente_pedido_snapshot_atualizacao:      p.atualiza_agente,
    atualiza_despachante_pedido_snapshot_atualizacao: p.atualiza_despachante,
    atualiza_armador_pedido_snapshot_atualizacao:     p.atualiza_armador,
    atualiza_ope_pedido_snapshot_atualizacao:         p.atualiza_ope,
    gatilho_emissao_pedido_snapshot_atualizacao:      p.gatilho_emissao,
    gatilho_embarque_pedido_snapshot_atualizacao:     p.gatilho_embarque,
    gatilho_desembaraco_pedido_snapshot_atualizacao:  p.gatilho_desembaraco,
  }
}

function prismaParaExterno(r: PolicyPrisma): PolicyExterno {
  return {
    atualiza_importador:  r.atualiza_importador_pedido_snapshot_atualizacao,
    atualiza_exportador:  r.atualiza_exportador_pedido_snapshot_atualizacao,
    atualiza_fabricante:  r.atualiza_fabricante_pedido_snapshot_atualizacao,
    atualiza_agente:      r.atualiza_agente_pedido_snapshot_atualizacao,
    atualiza_despachante: r.atualiza_despachante_pedido_snapshot_atualizacao,
    atualiza_armador:     r.atualiza_armador_pedido_snapshot_atualizacao,
    atualiza_ope:         r.atualiza_ope_pedido_snapshot_atualizacao,
    gatilho_emissao:      r.gatilho_emissao_pedido_snapshot_atualizacao,
    gatilho_embarque:     r.gatilho_embarque_pedido_snapshot_atualizacao,
    gatilho_desembaraco:  r.gatilho_desembaraco_pedido_snapshot_atualizacao,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function obterContexto(req: Request): { idOrganizacao: string; idWorkspace: string } {
  const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
  const idOrganizacao = ctx?.idOrganizacao
  const idWorkspace   = (ctx as unknown as { idWorkspace?: string })?.idWorkspace
                     ?? (req.headers['x-workspace-id'] as string | undefined)
                     ?? ''
  if (!idOrganizacao) {
    throw new AppError('Contexto de organizacao nao resolvido', 400, 'TENANT_NAO_RESOLVIDO')
  }
  if (!idWorkspace) {
    throw new AppError('Contexto de workspace ausente', 400, 'WORKSPACE_AUSENTE')
  }
  return { idOrganizacao, idWorkspace }
}

// ── GET ─────────────────────────────────────────────────────────────────────

snapshotAtualizacaoPedidoRouter.get('/snapshot-atualizacao-pedido', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrganizacao, idWorkspace } = obterContexto(req)
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const registro = await db.pedidoSnapshotAtualizacao.findUnique({
        where: { id_organizacao_id_workspace: { id_organizacao: idOrganizacao, id_workspace: idWorkspace } },
      })
      res.json({ data: registro ? prismaParaExterno(registro as PolicyPrisma) : null })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT ─────────────────────────────────────────────────────────────────────

snapshotAtualizacaoPedidoRouter.put('/snapshot-atualizacao-pedido', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = PolicySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload invalido', 400, 'VALIDATION_ERROR')
    }
    const { idOrganizacao, idWorkspace } = obterContexto(req)
    const dados = externoParaPrisma(parsed.data)

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const registro = await db.pedidoSnapshotAtualizacao.upsert({
        where:  { id_organizacao_id_workspace: { id_organizacao: idOrganizacao, id_workspace: idWorkspace } },
        create: { id_organizacao: idOrganizacao, id_workspace: idWorkspace, ...dados },
        update: dados,
      })
      res.json({ data: prismaParaExterno(registro as PolicyPrisma) })
    })
  } catch (err) {
    next(err)
  }
})
