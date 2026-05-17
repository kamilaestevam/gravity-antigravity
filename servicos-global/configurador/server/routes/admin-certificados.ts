/**
 * admin-certificados.ts — Proxy admin para certificados digitais Siscomex.
 *
 * Encaminha chamadas do frontend Configurador → Cadastros (porta 8031).
 * Valida JWT + role gravity_admin antes de repassar via x-internal-key.
 *
 * Montado em /api/v1/admin/certificados pelo index.ts
 *
 * POST   /             — upload de certificado .pfx/.p12
 * GET    /             — listar certificados (metadata)
 * GET    /ativo        — certificado ativo
 * GET    /:id          — obter por id
 * DELETE /:id          — remover certificado
 * POST   /:id/ativar   — ativar certificado
 * POST   /:id/validar  — testar auth no Portal Único
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

export const adminCertificadosRouter = Router()

adminCertificadosRouter.use(requireAuth, requireGravityAdmin)

const FETCH_TIMEOUT_MS = 30_000

function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}

function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO ?? process.env.INTERNAL_SERVICE_KEY
  if (!chave) console.warn('[admin-certificados] CHAVE_INTERNA_SERVICO ausente')
  return chave ?? ''
}

async function chamarCadastros(
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE',
  caminho: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  let response: globalThis.Response
  try {
    response = await fetch(`${getCadastrosUrl()}${caminho}`, {
      method:  metodo,
      headers: {
        'Content-Type':   'application/json',
        'x-internal-key': getChaveInterna(),
      },
      body:   body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch {
    throw new AppError('Serviço Cadastros indisponível (rede/timeout)', 503, 'CADASTROS_UNAVAILABLE')
  }

  const data = await response.json().catch(() => ({}))
  return { status: response.status, data }
}

function repassar(res: Response, resultado: { status: number; data: unknown }): void {
  const d = resultado.data as Record<string, unknown> | null

  // Traduz formato Cadastros (erro.mensagem) → formato frontend (error.message)
  if (resultado.status >= 400 && d?.erro) {
    const erro = d.erro as Record<string, unknown>
    res.status(resultado.status).json({
      error: {
        code: erro.codigo ?? 'UNKNOWN',
        message: erro.mensagem ?? 'Erro desconhecido do serviço Cadastros',
        details: erro.detalhes,
      },
    })
    return
  }

  res.status(resultado.status).json(resultado.data)
}

// ─── POST / — Upload ─────────────────────────────────────────────────────────

adminCertificadosRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await chamarCadastros('POST', '/api/v1/cadastros/admin/certificados', req.body)

    if (resultado.status >= 200 && resultado.status < 300) {
      AuditService.log({
        id_organizacao:                 req.auth.id_organizacao,
        tipo_ator_historico_log:        'USUARIO',
        id_ator_historico_log:          req.auth.id_usuario,
        nome_ator_historico_log:        req.auth.nome_usuario,
        ip_ator_historico_log:          req.ip,
        modulo_historico_log:           'admin',
        tipo_recurso_historico_log:     'CertificadoDigitalSiscomex',
        acao_historico_log:             'UPLOAD_CERTIFICADO',
        detalhe_acao_historico_log:     `Certificado "${(req.body as Record<string, unknown>).nome}" enviado`,
        estado_posterior_historico_log: resultado.data as Record<string, unknown>,
        status_historico_log:           'SUCESSO',
      }).catch(() => {})
    }

    repassar(res, resultado)
  } catch (err) { next(err) }
})

// ─── GET / — Listar ──────────────────────────────────────────────────────────

adminCertificadosRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    repassar(res, await chamarCadastros('GET', '/api/v1/cadastros/admin/certificados'))
  } catch (err) { next(err) }
})

// ─── GET /ativo — Certificado ativo ──────────────────────────────────────────

adminCertificadosRouter.get('/ativo', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    repassar(res, await chamarCadastros('GET', '/api/v1/cadastros/admin/certificados/ativo'))
  } catch (err) { next(err) }
})

// ─── GET /:id — Obter por ID ─────────────────────────────────────────────────

adminCertificadosRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    repassar(res, await chamarCadastros('GET', `/api/v1/cadastros/admin/certificados/${req.params.id}`))
  } catch (err) { next(err) }
})

// ─── DELETE /:id — Remover ───────────────────────────────────────────────────

adminCertificadosRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await chamarCadastros('DELETE', `/api/v1/cadastros/admin/certificados/${req.params.id}`)

    if (resultado.status >= 200 && resultado.status < 300) {
      AuditService.log({
        id_organizacao:                 req.auth.id_organizacao,
        tipo_ator_historico_log:        'USUARIO',
        id_ator_historico_log:          req.auth.id_usuario,
        nome_ator_historico_log:        req.auth.nome_usuario,
        ip_ator_historico_log:          req.ip,
        modulo_historico_log:           'admin',
        tipo_recurso_historico_log:     'CertificadoDigitalSiscomex',
        acao_historico_log:             'REMOVER_CERTIFICADO',
        detalhe_acao_historico_log:     `Certificado ${req.params.id} removido`,
        estado_posterior_historico_log: resultado.data as Record<string, unknown>,
        status_historico_log:           'SUCESSO',
      }).catch(() => {})
    }

    repassar(res, resultado)
  } catch (err) { next(err) }
})

// ─── POST /:id/ativar — Ativar ───────────────────────────────────────────────

adminCertificadosRouter.post('/:id/ativar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await chamarCadastros('POST', `/api/v1/cadastros/admin/certificados/${req.params.id}/ativar`)

    if (resultado.status >= 200 && resultado.status < 300) {
      AuditService.log({
        id_organizacao:                 req.auth.id_organizacao,
        tipo_ator_historico_log:        'USUARIO',
        id_ator_historico_log:          req.auth.id_usuario,
        nome_ator_historico_log:        req.auth.nome_usuario,
        ip_ator_historico_log:          req.ip,
        modulo_historico_log:           'admin',
        tipo_recurso_historico_log:     'CertificadoDigitalSiscomex',
        acao_historico_log:             'ATIVAR_CERTIFICADO',
        detalhe_acao_historico_log:     `Certificado ${req.params.id} ativado`,
        estado_posterior_historico_log: resultado.data as Record<string, unknown>,
        status_historico_log:           'SUCESSO',
      }).catch(() => {})
    }

    repassar(res, resultado)
  } catch (err) { next(err) }
})

// ─── POST /:id/validar — Testar auth ────────────────────────────────────────

adminCertificadosRouter.post('/:id/validar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await chamarCadastros('POST', `/api/v1/cadastros/admin/certificados/${req.params.id}/validar`)
    repassar(res, resultado)
  } catch (err) { next(err) }
})
