/**
 * admin-taxas-moeda-agendamento.ts — CRUD de agendamento PTAX / Focus
 *
 * GET  /api/v1/admin/taxas-moeda/agendamento/:tipo   — ptax | focus
 * PUT  /api/v1/admin/taxas-moeda/agendamento/:tipo
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'
import {
  TIPOS_AGENDAMENTO_TAXA_MOEDA,
  lerAgendamentoTaxaMoeda,
  montarRespostaAgendamento,
  salvarAgendamentoTaxaMoeda,
  saveTaxaMoedaAgendamentoSchema,
  type TipoAgendamentoTaxaMoeda,
} from '../lib/taxas-moeda-agendamento-store.js'

export const adminTaxasMoedaAgendamentoRouter = Router()

adminTaxasMoedaAgendamentoRouter.use(requireAuth, requireGravityAdmin)

const tipoParamSchema = z.object({
  tipo: z.enum(TIPOS_AGENDAMENTO_TAXA_MOEDA),
})

function parseTipo(req: Request): TipoAgendamentoTaxaMoeda {
  const parsed = tipoParamSchema.safeParse(req.params)
  if (!parsed.success) {
    throw new AppError('Tipo inválido — use ptax ou focus', 400, 'VALIDATION_ERROR')
  }
  return parsed.data.tipo
}

function isPrismaTabelaAgendamentoAusente(err: unknown): boolean {
  return (
    err != null &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code: string }).code === 'P2021'
  )
}

adminTaxasMoedaAgendamentoRouter.get('/:tipo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tipo = parseTipo(req)
    const config = await lerAgendamentoTaxaMoeda(tipo)
    res.json(montarRespostaAgendamento(tipo, config))
  } catch (err) {
    if (isPrismaTabelaAgendamentoAusente(err)) {
      next(new AppError(
        'Tabela taxa_moeda_sync_agendamento ausente no banco — rode migrate Configurador ou SQL manual de produção',
        503,
        'SCHEMA_NOT_READY',
      ))
      return
    }
    next(err)
  }
})

adminTaxasMoedaAgendamentoRouter.put('/:tipo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode editar agendamento', 403, 'FORBIDDEN')
    }

    const tipo = parseTipo(req)
    const parsed = saveTaxaMoedaAgendamentoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const config = await salvarAgendamentoTaxaMoeda(tipo, parsed.data)
    const resposta = montarRespostaAgendamento(tipo, config)

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.nome_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'TaxaMoedaAgendamento',
      acao_historico_log: tipo === 'ptax' ? 'AGENDAR_SINCRONIZACAO_PTAX' : 'AGENDAR_SINCRONIZACAO_FOCUS',
      detalhe_acao_historico_log:
        `Agendamento ${tipo} ${parsed.data.ativo ? 'ativado' : 'desativado'} — ` +
        `${parsed.data.frequencia} ${String(parsed.data.hora).padStart(2, '0')}:${String(parsed.data.minuto).padStart(2, '0')} BRT`,
      estado_posterior_historico_log: resposta as unknown as Record<string, unknown>,
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json(resposta)
  } catch (err) {
    if (isPrismaTabelaAgendamentoAusente(err)) {
      next(new AppError(
        'Tabela taxa_moeda_sync_agendamento ausente no banco — rode migrate Configurador ou SQL manual de produção',
        503,
        'SCHEMA_NOT_READY',
      ))
      return
    }
    next(err)
  }
})
