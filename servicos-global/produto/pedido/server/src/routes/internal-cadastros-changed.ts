/**
 * internal-cadastros-changed.ts — Receiver do webhook Cadastros → Pedido
 * (FASE 06E, frente 2).
 *
 * Endpoint: POST /api/v1/internal/cadastros-changed
 *
 * Fluxo:
 *   1. Valida payload com Zod (REGRA 06).
 *   2. Lê idOrganizacao do header `x-id-organizacao` (opcional para
 *      catálogo global).
 *   3. Responde 202 imediatamente — fire-and-forget. Re-snapshot roda
 *      em background.
 *   4. Delega para `reSnapshotService.processarMudancaCadastros(...)`
 *      que decide, com base na policy, se algum pedido precisa ser
 *      re-snapshotado.
 *
 * Auth: este router fica atrás de `requireInternalKey` (montado em index.ts).
 *
 * REGRA 03 DDD: variáveis TS em camelCase (idOrganizacao, etc.).
 * REGRA 06 Zod: payload validado antes de qualquer side-effect.
 * REGRA 08: não silencia falha de payload — devolve 400 com mensagem clara.
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { reSnapshotService } from '../services/reSnapshotService.js'

export const internalCadastrosChangedRouter = Router()

const PayloadSchema = z.object({
  tipo_entidade: z.enum(['empresa', 'ope', 'ncm', 'moeda', 'unidade']),
  identificador: z.string().min(1, 'identificador nao pode ser vazio'),
})

internalCadastrosChangedRouter.post(
  '/cadastros-changed',
  (req: Request, res: Response) => {
    const parsed = PayloadSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        error: 'Payload invalido',
        code: 'INVALID_PAYLOAD',
        details: parsed.error.errors[0]?.message ?? 'desconhecido',
      })
      return
    }

    const idOrganizacaoHeader = req.headers['x-id-organizacao']
    const idOrganizacao =
      typeof idOrganizacaoHeader === 'string' ? idOrganizacaoHeader : ''

    // Empresa/OPE são por organização — sem idOrganizacao não há como
    // processar. Log + 400.
    const tipo = parsed.data.tipo_entidade
    const requerOrg = tipo === 'empresa' || tipo === 'ope'
    if (requerOrg && idOrganizacao.length === 0) {
      res.status(400).json({
        error: 'header x-id-organizacao ausente para entidade por organização',
        code: 'ORGANIZACAO_AUSENTE',
      })
      return
    }

    // Fire-and-forget no servidor: responde 202 e processa em background.
    res.status(202).json({ aceito: true })

    void reSnapshotService.processarMudancaCadastros({
      tipoEntidade:  parsed.data.tipo_entidade,
      identificador: parsed.data.identificador,
      idOrganizacao: idOrganizacao || null,
    })
  },
)
