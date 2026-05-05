// server/routes/organizacao.ts
// Gestão de organizações.
// POST   /api/v1/organizacoes        — criar organização (onboarding, público)
// GET    /api/v1/organizacoes/me     — dados da organização atual
// PATCH  /api/v1/organizacoes/me     — atualizar organização
//
// Workspaces foram relocados para meRouter (/api/v1/me/workspaces) em 2026-05-03 —
// pertencem semanticamente ao "self do usuário autenticado".
//
// Contrato em DDD puro (PT-BR): respostas usam chave raiz `organizacao` e campos
// espelham o schema Prisma (`id_organizacao`, etc.).

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { organizacaoService } from '../services/organizacao-service.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

export const organizacoesRouter = Router()

// ─── Schemas de validação ───────────────────────────────────────────────────

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const isoPaisRegex = /^[A-Z]{2}$/

export const CreateOrganizacaoSchema = z
  .object({
    nome_organizacao: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    subdominio_organizacao: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, 'Slug deve ser lowercase alfanumérico com hifens'),
    clerkUserId: z.string(),
    owner: z.object({
      email: z.string().email(),
      name: z.string().min(1),
    }),
    cnpj_organizacao: z
      .string()
      .regex(cnpjRegex, 'CNPJ precisa estar no formato XX.XXX.XXX/XXXX-XX')
      .optional(),
    pais: z
      .string()
      .regex(isoPaisRegex, 'País precisa ser código ISO-2 (ex: BR, US, CN)')
      .default('BR'),
  })
  .superRefine((data, ctx) => {
    if (data.pais === 'BR' && !data.cnpj_organizacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj_organizacao'],
        message: 'CNPJ é obrigatório quando país = BR',
      })
    }
    if (data.pais !== 'BR' && data.cnpj_organizacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj_organizacao'],
        message: 'CNPJ só pode ser preenchido quando país = BR',
      })
    }
  })

const UpdateOrganizacaoSchema = z.object({
  nome_organizacao: z.string().min(2).optional(),
  // CNPJ é opcional, mas se preenchido precisa respeitar o formato canonical
  // (XX.XXX.XXX/XXXX-XX). String vazia permitida para limpar o campo.
  cnpj_organizacao: z.union([
    z.string().regex(cnpjRegex, 'CNPJ precisa estar no formato XX.XXX.XXX/XXXX-XX'),
    z.literal(''),
  ]).optional(),
  estado_organizacao: z.string().optional(),
  cidade_organizacao: z.string().optional(),
  segmento_organizacao: z.string().optional(),
  tipo_organizacao: z.string().optional(),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/organizacoes
 * Cria uma nova organização + usuário owner durante o onboarding.
 * Público — chamado logo após o checkout do provider de billing.
 */
organizacoesRouter.post('/', async (req, res, next) => {
  try {
    const parsed = CreateOrganizacaoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const organizacao = await organizacaoService.createOrganizacao({
      ...parsed.data,
      correlationId: req.correlationId,
    })
    return res.status(201).json({ organizacao })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/organizacoes/me
 * Retorna dados da organização do usuário autenticado.
 */
organizacoesRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const organizacao = await organizacaoService.getOrganizacaoById(req.auth.id_organizacao)
    if (!organizacao) {
      throw new AppError('Organização não encontrada', 404, 'NOT_FOUND')
    }
    res.json({ organizacao })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/organizacoes/me
 * Atualiza dados cadastrais da organização autenticada.
 */
organizacoesRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const parsed = UpdateOrganizacaoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }
    const before = await organizacaoService.getOrganizacaoById(req.auth.id_organizacao)
    const organizacao = await organizacaoService.updateOrganizacao(req.auth.id_organizacao, parsed.data)

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.nome_usuario,
      modulo_historico_log: 'configuracao',
      tipo_recurso_historico_log: 'Organização',
      id_recurso_historico_log: req.auth.id_organizacao,
      acao_historico_log: 'UPDATE',
      detalhe_acao_historico_log: `Atualizou dados da organização: ${Object.keys(parsed.data).join(', ')}`,
      estado_anterior_historico_log: before ?? undefined,
      estado_posterior_historico_log: organizacao,
    }).catch(() => {})

    res.json({ organizacao })
  } catch (err) {
    next(err)
  }
})

