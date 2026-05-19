/**
 * lgpd.controller.ts
 *
 * Endpoint para exercício do Direito ao Esquecimento (LGPD Art. 18).
 *
 * Estratégia: anonimizar nome_ator_historico_log e ip_ator_historico_log de todos os logs
 * de um ator, preservando a trilha de auditoria e o hash_integridade_historico_log
 * (que não inclui esses campos).
 *
 * O sistema grava um novo log de ANONIMIZACAO documentando a solicitação —
 * conforme Barreira 3 (logs imutáveis: correções via novo log, nunca editando o original).
 *
 * Quem pode chamar:
 *   - SUPER_ADMIN / ADMIN (qualquer ator)
 *   - MASTER (apenas atores da própria organização)
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PrismaClient } from '../../../generated/index.js'
import { AppError } from '../lib/errors.js'
import { extrairUsuarioAutenticado } from '../lib/visibility.js'
import { AuditService } from '../services/audit.service.js'

// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
let _prisma: PrismaClient | undefined
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
  }
  return _prisma
}

const AnonymizeSchema = z.object({
  id_ator_historico_log: z.string().min(1),
  reason: z.string().min(10).max(500),
})

/**
 * POST /lgpd/anonymize
 *
 * Body: { id_ator_historico_log: string, reason: string }
 *
 * Substitui nome_ator_historico_log por "[Anonimizado - LGPD Art.18 - YYYY-MM-DD]"
 * e ip_ator_historico_log por null em todos os logs do ator.
 * O hash_integridade_historico_log é preservado (não inclui esses campos).
 */
export async function anonymizeActor(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const usuario = extrairUsuarioAutenticado(req)
    if (!usuario) throw AppError.unauthorized('Autenticação obrigatória')

    const isGravityAdmin = usuario.tipo_usuario === 'SUPER_ADMIN' || usuario.tipo_usuario === 'ADMIN'
    const isMaster = usuario.tipo_usuario === 'MASTER'

    if (!isGravityAdmin && !isMaster) {
      throw AppError.forbidden('Apenas SUPER_ADMIN, ADMIN ou MASTER podem anonimizar atores')
    }

    const parsed = AnonymizeSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const { id_ator_historico_log, reason } = parsed.data

    // MASTER só pode anonimizar atores da própria organização
    const orgFilter = isGravityAdmin ? {} : { id_organizacao }

    // Conta quantos logs serão afetados
    const count = await getPrisma().historicoLog.count({
      where: { id_ator_historico_log, ...orgFilter },
    })

    if (count === 0) {
      throw AppError.notFound('Nenhum log encontrado para este ator nesta organização')
    }

    const redactedName = `[Anonimizado - LGPD Art.18 - ${new Date().toISOString().slice(0, 10)}]`

    // Anonimiza em batch (apenas PII — não altera campos do hash_integridade_historico_log)
    await getPrisma().historicoLog.updateMany({
      where: { id_ator_historico_log, ...orgFilter },
      data: {
        nome_ator_historico_log: redactedName,
        ip_ator_historico_log: null,
      },
    })

    // Grava novo log documentando a anonimização (Barreira 3)
    await AuditService.log({
      id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: usuario.id_usuario,
      nome_ator_historico_log: usuario.nome_usuario, // o executor pode ser anonimizado posteriormente
      modulo_historico_log: 'compliance',
      tipo_recurso_historico_log: 'HistoryLog',
      id_recurso_historico_log: id_ator_historico_log,
      acao_historico_log: 'ANONIMIZAR',
      detalhe_acao_historico_log: `LGPD Art.18 — ${count} logs anonimizados para id_ator_historico_log ${id_ator_historico_log}. Motivo: ${reason}`,
      status_historico_log: 'SUCESSO',
    })

    res.json({
      anonymized: count,
      id_ator_historico_log,
      redacted_name: redactedName,
      fields_cleared: ['nome_ator_historico_log', 'ip_ator_historico_log'],
      note: 'hash_integridade_historico_log preservado — apenas campos de PII foram alterados',
    })
  } catch (error) {
    next(error)
  }
}
