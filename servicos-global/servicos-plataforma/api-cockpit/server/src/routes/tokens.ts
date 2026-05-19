/**
 * tokens.ts — Rotas CRUD para tokens de API (model ApiToken)
 *
 * Padrao S2S — chamado SOMENTE pelo proxy do Configurador via x-internal-key.
 * Configurador valida JWT do usuario e injeta id_organizacao no body/query.
 *
 * GET    /api/v1/cockpit/api-tokens                — listar (filtra por id_organizacao)
 * POST   /api/v1/cockpit/api-tokens                — criar (retorna valor em claro UMA vez)
 * DELETE /api/v1/cockpit/api-tokens/:id_api_token  — revogar (set revogado_api_token=true)
 *
 * NOMENCLATURA DDD:
 *   - id_organizacao, id_produto_gravity, id_usuario  FKs canonicas (REGRA 3/4)
 *   - hash_api_token, prefixo_api_token, escopo_api_token, validade_api_token
 *   - revogado_api_token (REGRA 5: sem prefixo is_)
 *   - data_expiracao_api_token, data_revogacao_api_token, data_criacao_api_token
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../../generated/index.js'
import { z } from 'zod'
import { gerarApiToken, hashToken, obterPrefixoApiToken } from '../crypto'
import { requireInternalKey } from '../middleware/requireInternalKey'

export const tokensRouter = Router()
const prisma = new PrismaClient()

// Todas as rotas exigem x-internal-key (chamada feita pelo Configurador)
tokensRouter.use(requireInternalKey)

// ─── Schemas Zod (Mandamento 06) ─────────────────────────────────────────

const escopoApiTokenSchema = z.enum(['LEITURA', 'ESCRITA', 'EXCLUSAO'])
const validadeApiTokenSchema = z.enum(['NUNCA', 'DIAS_30', 'DIAS_90', 'CUSTOMIZADO'])

const listarTokensQuerySchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao obrigatorio'),
})

const criarTokenSchema = z.object({
  id_organizacao:                      z.string().min(1, 'id_organizacao obrigatorio'),
  id_produto_gravity:                  z.string().optional(),
  id_usuario:                          z.string().optional(),
  nome_api_token:                      z.string().min(1).max(100),
  escopo_api_token:                    escopoApiTokenSchema.default('LEITURA'),
  validade_api_token:                  validadeApiTokenSchema.default('NUNCA'),
  data_expiracao_api_token:            z.string().datetime().optional(),
  limite_requisicoes_minuto_api_token: z.number().int().positive().default(60),
})

const revogarTokenParamsSchema = z.object({
  id_api_token: z.string().min(1),
})

const revogarTokenBodySchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao obrigatorio'),
})

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Calcula data_expiracao_api_token com base na validade escolhida. */
function calcularDataExpiracao(
  validade: z.infer<typeof validadeApiTokenSchema>,
  dataExplicita: string | undefined,
): Date | null {
  switch (validade) {
    case 'NUNCA':
      return null
    case 'DIAS_30':
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    case 'DIAS_90':
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    case 'CUSTOMIZADO':
      return dataExplicita ? new Date(dataExplicita) : null
  }
}

// ─── GET /api/v1/cockpit/api-tokens — listar tokens da organizacao ──────

tokensRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listarTokensQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Query invalida', issues: parsed.error.issues })
    }

    const tokens = await prisma.apiToken.findMany({
      where: {
        id_organizacao:     parsed.data.id_organizacao,
        revogado_api_token: false,
      },
      select: {
        id_api_token:                        true,
        id_organizacao:                      true,
        id_produto_gravity:                  true,
        id_usuario:                          true,
        nome_api_token:                      true,
        prefixo_api_token:                   true,
        escopo_api_token:                    true,
        validade_api_token:                  true,
        data_expiracao_api_token:            true,
        limite_requisicoes_minuto_api_token: true,
        data_criacao_api_token:              true,
        // hash_api_token e revogado_api_token nao retornam por seguranca/filtro
      },
      orderBy: { data_criacao_api_token: 'desc' },
    })

    res.json({ tokens })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/v1/cockpit/api-tokens — criar token (retorna valor 1x) ───

tokensRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = criarTokenSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: parsed.error.issues })
    }

    const prefixo = obterPrefixoApiToken()
    const { valor_api_token, hash_api_token } = gerarApiToken(prefixo)

    const dataExpiracao = calcularDataExpiracao(
      parsed.data.validade_api_token,
      parsed.data.data_expiracao_api_token,
    )

    const criado = await prisma.apiToken.create({
      data: {
        id_organizacao:                      parsed.data.id_organizacao,
        id_produto_gravity:                  parsed.data.id_produto_gravity || null,
        id_usuario:                          parsed.data.id_usuario || null,
        nome_api_token:                      parsed.data.nome_api_token,
        hash_api_token,
        prefixo_api_token:                   prefixo,
        escopo_api_token:                    parsed.data.escopo_api_token,
        validade_api_token:                  parsed.data.validade_api_token,
        data_expiracao_api_token:            dataExpiracao,
        limite_requisicoes_minuto_api_token: parsed.data.limite_requisicoes_minuto_api_token,
      },
    })

    // Retorna o valor em claro UMA UNICA vez (Mandamento Cripto: nao persistimos em claro).
    res.status(201).json({
      id_api_token:                        criado.id_api_token,
      id_organizacao:                      criado.id_organizacao,
      id_produto_gravity:                  criado.id_produto_gravity,
      id_usuario:                          criado.id_usuario,
      nome_api_token:                      criado.nome_api_token,
      prefixo_api_token:                   criado.prefixo_api_token,
      valor_api_token,                                     // <- SOMENTE NESTE PAYLOAD
      escopo_api_token:                    criado.escopo_api_token,
      validade_api_token:                  criado.validade_api_token,
      data_expiracao_api_token:            criado.data_expiracao_api_token,
      limite_requisicoes_minuto_api_token: criado.limite_requisicoes_minuto_api_token,
      data_criacao_api_token:              criado.data_criacao_api_token,
    })
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /api/v1/cockpit/api-tokens/:id_api_token — revogar token ────

tokensRouter.delete('/:id_api_token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = revogarTokenParamsSchema.safeParse(req.params)
    if (!params.success) {
      return res.status(400).json({ erro: 'Path invalido', issues: params.error.issues })
    }

    const body = revogarTokenBodySchema.safeParse(req.body)
    if (!body.success) {
      return res.status(400).json({ erro: 'Body invalido', issues: body.error.issues })
    }

    const token = await prisma.apiToken.findFirst({
      where: {
        id_api_token:   params.data.id_api_token,
        id_organizacao: body.data.id_organizacao,
      },
    })

    if (!token) {
      return res.status(404).json({ erro: 'Token nao encontrado' })
    }

    await prisma.apiToken.update({
      where: { id_api_token: params.data.id_api_token },
      data: {
        revogado_api_token:       true,
        data_revogacao_api_token: new Date(),
      },
    })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/v1/cockpit/api-tokens/validate — validar token S2S ───────
//
// Chamado pelos produtos (ex: pedido) via middleware requireApiToken.
// Recebe o Bearer token no header Authorization, faz SHA-256 e busca no banco.
// Retorna { valid, id_organizacao, scopes } ou { valid: false }.

tokensRouter.get('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, motivo: 'Bearer token ausente' })
    }

    const tokenValor = authHeader.slice(7)
    if (!tokenValor) {
      return res.status(401).json({ valid: false, motivo: 'Token vazio' })
    }

    const hash = hashToken(tokenValor)

    const token = await prisma.apiToken.findFirst({
      where: { hash_api_token: hash },
      select: {
        id_api_token:            true,
        id_organizacao:          true,
        escopo_api_token:        true,
        revogado_api_token:      true,
        data_expiracao_api_token: true,
      },
    })

    if (!token) {
      return res.status(401).json({ valid: false, motivo: 'Token nao encontrado' })
    }

    if (token.revogado_api_token) {
      return res.status(401).json({ valid: false, motivo: 'Token revogado' })
    }

    if (token.data_expiracao_api_token && token.data_expiracao_api_token < new Date()) {
      return res.status(401).json({ valid: false, motivo: 'Token expirado' })
    }

    res.json({
      valid: true,
      id_organizacao: token.id_organizacao,
      scopes: [token.escopo_api_token],
    })
  } catch (err) {
    next(err)
  }
})
