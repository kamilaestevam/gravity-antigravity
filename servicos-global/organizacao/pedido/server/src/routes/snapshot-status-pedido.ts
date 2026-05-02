/**
 * snapshot-status-pedido.ts — Status de snapshot por pedido (FASE 06E — Frente 3)
 *
 * Endpoint somente-leitura usado pelo frontend para exibir o banner retroativo
 * "Os dados de Empresa foram atualizados em ... com base em mudanças no
 * Cadastros" na view de detalhe do Pedido.
 *
 *   GET /api/v1/pedidos/:idPedido/snapshot-status
 *     → Retorna, por papel de snapshot, a última `congelado_em` registrada
 *       e os `motivo_congelamento` distintos encontrados.
 *
 * Papéis cobertos:
 *   - empresa  (pedido_snapshot_empresa — multi-papel: importador/exportador/...)
 *   - ope      (pedido_snapshot_ope)
 *   - ncm      (pedido_snapshot_ncm)
 *   - moeda    (pedido_snapshot_moeda)
 *   - unidade  (pedido_snapshot_unidade)
 *
 * REGRAS:
 *   - REGRA 03 DDD: variáveis TS internas → idOrganizacao / idPedido.
 *   - REGRA 06: contrato JSON validado por Zod (no frontend).
 *   - REGRA 02: nada de schema.prisma — somente leitura dos models existentes.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'

export const snapshotStatusPedidoRouter = Router()

type PapelSnapshot = 'empresa' | 'ope' | 'ncm' | 'moeda' | 'unidade'

interface PapelStatus {
  papel: PapelSnapshot
  congelado_em: string | null              // ISO8601 ou null se nunca houve snapshot
  motivos_congelamento: string[]           // distintos: 'emissao' | 'atualizacao_manual' | 'transicao_status'
  total_registros: number
}

interface SnapshotStatusResponse {
  id_pedido: string
  papeis: PapelStatus[]
}

snapshotStatusPedidoRouter.get('/:idPedido/snapshot-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
    const idOrganizacao = ctx?.idOrganizacao
    if (!idOrganizacao) {
      throw new AppError('Contexto de organizacao nao resolvido', 400, 'TENANT_NAO_RESOLVIDO')
    }

    const idPedido = req.params.idPedido
    if (!idPedido) {
      throw new AppError('idPedido obrigatorio', 400, 'VALIDATION_ERROR')
    }

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const tabelas: Array<{ papel: PapelSnapshot; accessor: string }> = [
        { papel: 'empresa', accessor: 'pedidoSnapshotEmpresa' },
        { papel: 'ope',     accessor: 'pedidoSnapshotOpe' },
        { papel: 'ncm',     accessor: 'pedidoSnapshotNcm' },
        { papel: 'moeda',   accessor: 'pedidoSnapshotMoeda' },
        { papel: 'unidade', accessor: 'pedidoSnapshotUnidade' },
      ]

      const papeis: PapelStatus[] = await Promise.all(
        tabelas.map(async ({ papel, accessor }) => {
          const registros = await db[accessor].findMany({
            where:  { id_organizacao: idOrganizacao, id_pedido: idPedido },
            select: { congelado_em: true, motivo_congelamento: true },
          }) as Array<{ congelado_em: Date; motivo_congelamento: string }>

          if (registros.length === 0) {
            return { papel, congelado_em: null, motivos_congelamento: [], total_registros: 0 }
          }

          const ultimaData = registros.reduce<Date>(
            (acc, r) => (r.congelado_em > acc ? r.congelado_em : acc),
            registros[0].congelado_em,
          )
          const motivos = Array.from(new Set(registros.map(r => r.motivo_congelamento))).filter(Boolean)

          return {
            papel,
            congelado_em: ultimaData.toISOString(),
            motivos_congelamento: motivos,
            total_registros: registros.length,
          }
        }),
      )

      const resp: SnapshotStatusResponse = { id_pedido: idPedido, papeis }
      res.json({ data: resp })
    })
  } catch (err) {
    next(err)
  }
})
