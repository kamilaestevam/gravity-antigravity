/**
 * gabi/server/routes/admin-limites.ts
 * CRUD S2S para LIMITES MONETARIOS da GABI no escopo ORGANIZACAO/MODELO.
 *
 * Limites GLOBAIS (cross-org) sao gerenciados pelo Configurador em
 * /api/v1/internal/gabi/limites-globais — nao por aqui.
 *
 * Auth: x-chave-interna-servico (S2S). Chamado pelo Configurador (proxy
 * para a tela admin do API Cockpit). Nunca exposto ao browser direto.
 *
 * Padrao schema-per-org igual ao admin.ts: SET LOCAL search_path em
 * $transaction, regex de validacao de schema name anti-SQL-injection.
 *
 * Apos cada mutacao (POST/PUT/DELETE), invalida cache do limite no Redis
 * (limiteMonetarioService.invalidarCacheLimites) — garante que o
 * hard-block pegue a mudanca em <= 60s mesmo sem esperar o TTL.
 */

import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { invalidarCacheLimites } from '../services/limiteMonetarioService.js'

export const adminLimitesRouter = Router()

const SCHEMA_NAME_REGEX = /^tenant_c[a-z0-9]{24}$/

const ID_ORGANIZACAO_REGEX = /^c[a-z0-9]{24}$/  // CUID

// ---------------------------------------------------------------------------
// Schemas Zod (contrato bilateral — Mandamento 09)
// ---------------------------------------------------------------------------

const idOrganizacaoSchema = z.string().regex(ID_ORGANIZACAO_REGEX, 'id_organizacao deve ser um CUID')

// USD em string (preserva precisao no transporte) — convertido pra Decimal
// no banco. Validamos ate 12 inteiros + 2 decimais (alinhado ao Decimal(12,2)).
const valorUsdSchema = z
  .string()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'valor USD invalido (ate 10 digitos inteiros + 2 decimais)')

const emailListSchema = z
  .array(z.string().email('e-mail invalido'))
  .min(1, 'pelo menos 1 destinatario')
  .max(20, 'maximo de 20 destinatarios')

const criarLimiteSchema = z.object({
  id_organizacao: idOrganizacaoSchema,
  modelo:         z.string().min(1).max(100).nullable().optional(),  // null/undefined = todos os modelos
  limite_aviso_usd:    valorUsdSchema,
  limite_bloqueio_usd: valorUsdSchema,
  destinatarios_email: emailListSchema,
  ativo: z.boolean().optional().default(true),
}).refine(
  (d) => Number(d.limite_aviso_usd) <= Number(d.limite_bloqueio_usd),
  { message: 'limite_aviso_usd deve ser <= limite_bloqueio_usd' },
)

const atualizarLimiteSchema = z.object({
  modelo:              z.string().min(1).max(100).nullable().optional(),
  limite_aviso_usd:    valorUsdSchema.optional(),
  limite_bloqueio_usd: valorUsdSchema.optional(),
  destinatarios_email: emailListSchema.optional(),
  ativo:               z.boolean().optional(),
})

const idLimiteSchema   = z.string().regex(/^c[a-z0-9]{24}$/, 'id_limite deve ser um CUID')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function schemaNameDe(idOrganizacao: string): string {
  const name = `tenant_${idOrganizacao}`
  if (!SCHEMA_NAME_REGEX.test(name)) {
    throw new Error(`Schema name invalido: ${name}`)
  }
  return name
}

interface LimiteLido {
  id_gabi_limite_monetario:                  string
  id_organizacao_gabi_limite_monetario:      string
  modelo_gabi_limite_monetario:              string | null
  limite_aviso_usd_gabi_limite_monetario:    string
  limite_bloqueio_usd_gabi_limite_monetario: string
  destinatarios_email_gabi_limite_monetario: string[]
  ativo_gabi_limite_monetario:               boolean
  data_criacao_gabi_limite_monetario:        Date
  data_atualizacao_gabi_limite_monetario:    Date
}

/** Serializa para resposta JSON: Decimal -> string, Date -> ISO. */
function paraResposta(l: LimiteLido) {
  return {
    id_gabi_limite_monetario:                  l.id_gabi_limite_monetario,
    id_organizacao_gabi_limite_monetario:      l.id_organizacao_gabi_limite_monetario,
    modelo_gabi_limite_monetario:              l.modelo_gabi_limite_monetario,
    limite_aviso_usd_gabi_limite_monetario:    l.limite_aviso_usd_gabi_limite_monetario,
    limite_bloqueio_usd_gabi_limite_monetario: l.limite_bloqueio_usd_gabi_limite_monetario,
    destinatarios_email_gabi_limite_monetario: l.destinatarios_email_gabi_limite_monetario,
    ativo_gabi_limite_monetario:               l.ativo_gabi_limite_monetario,
    data_criacao_gabi_limite_monetario:        l.data_criacao_gabi_limite_monetario.toISOString(),
    data_atualizacao_gabi_limite_monetario:    l.data_atualizacao_gabi_limite_monetario.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
// SAFETY NOTE (applies to all routes below):
// - SET LOCAL search_path uses schemaName which is validated by SCHEMA_NAME_REGEX
//   (/^tenant_c[a-z0-9]{24}$/) via schemaNameDe() — prevents SQL injection.
// - All data values are passed as positional parameters ($1, $2, ...) — never
//   interpolated into SQL strings.
// - Dynamic SET clauses in PUT use counter-based $N placeholders, not string concat.
// OWASP A01: whitelist validada — schema name via regex, dados via params posicionais
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/gabi/admin/limites
 * Lista limites por org. Query: ?id_organizacao=cxxxxx (obrigatorio).
 * Para listar todos cross-org, o consumidor itera /organizacoes + chama esta.
 */
adminLimitesRouter.get('/api/v1/gabi/admin/limites', async (req, res, next) => {
  try {
    const idOrgParse = idOrganizacaoSchema.safeParse(req.query.id_organizacao)
    if (!idOrgParse.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: idOrgParse.error.issues[0]?.message ?? 'id_organizacao obrigatorio' },
      })
    }
    const idOrganizacao = idOrgParse.data
    const schemaName    = schemaNameDe(idOrganizacao)

    const linhas = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      return tx.$queryRawUnsafe<LimiteLido[]>(
        `SELECT
           id_gabi_limite_monetario,
           id_organizacao_gabi_limite_monetario,
           modelo_gabi_limite_monetario,
           limite_aviso_usd_gabi_limite_monetario::text    AS "limite_aviso_usd_gabi_limite_monetario",
           limite_bloqueio_usd_gabi_limite_monetario::text AS "limite_bloqueio_usd_gabi_limite_monetario",
           destinatarios_email_gabi_limite_monetario,
           ativo_gabi_limite_monetario,
           data_criacao_gabi_limite_monetario,
           data_atualizacao_gabi_limite_monetario
         FROM gabi_limite_monetario
         ORDER BY data_criacao_gabi_limite_monetario ASC`,
      )
    })

    res.json({ limites: linhas.map(paraResposta) })
  } catch (err) {
    console.error('[gabi/admin/limites] GET erro', { mensagem: err instanceof Error ? err.message : String(err) })
    next(err)
  }
})

/**
 * POST /api/v1/gabi/admin/limites
 * Cria limite. Body validado pelo Zod (criarLimiteSchema).
 * Constraint UNIQUE COALESCE(modelo,'__ALL__') no banco previne duplicacao.
 */
adminLimitesRouter.post('/api/v1/gabi/admin/limites', async (req, res, next) => {
  try {
    const parse = criarLimiteSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: parse.error.issues[0]?.message ?? 'invalido' },
      })
    }
    const dados = parse.data
    const schemaName = schemaNameDe(dados.id_organizacao)

    const linha = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      const rows = await tx.$queryRawUnsafe<LimiteLido[]>(
        `INSERT INTO gabi_limite_monetario (
           id_gabi_limite_monetario,
           id_organizacao_gabi_limite_monetario,
           modelo_gabi_limite_monetario,
           limite_aviso_usd_gabi_limite_monetario,
           limite_bloqueio_usd_gabi_limite_monetario,
           destinatarios_email_gabi_limite_monetario,
           ativo_gabi_limite_monetario,
           data_atualizacao_gabi_limite_monetario
         ) VALUES (
           'c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
           $1, $2, $3::numeric, $4::numeric, $5::text[], $6, NOW()
         )
         RETURNING
           id_gabi_limite_monetario,
           id_organizacao_gabi_limite_monetario,
           modelo_gabi_limite_monetario,
           limite_aviso_usd_gabi_limite_monetario::text    AS "limite_aviso_usd_gabi_limite_monetario",
           limite_bloqueio_usd_gabi_limite_monetario::text AS "limite_bloqueio_usd_gabi_limite_monetario",
           destinatarios_email_gabi_limite_monetario,
           ativo_gabi_limite_monetario,
           data_criacao_gabi_limite_monetario,
           data_atualizacao_gabi_limite_monetario`,
        dados.id_organizacao,
        dados.modelo ?? null,
        dados.limite_aviso_usd,
        dados.limite_bloqueio_usd,
        dados.destinatarios_email,
        dados.ativo,
      )
      return rows[0]
    })

    await invalidarCacheLimites(dados.id_organizacao)
    res.status(201).json({ limite: paraResposta(linha) })
  } catch (err) {
    // Conflito de unicidade -> 409
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('glm_unq_org_modelo') || msg.includes('duplicate key')) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Ja existe limite para esse (organizacao, modelo)' },
      })
    }
    console.error('[gabi/admin/limites] POST erro', { mensagem: msg })
    next(err)
  }
})

/**
 * PUT /api/v1/gabi/admin/limites/:id_limite
 * Body: campos parciais. Sempre exige id_organizacao na query (multi-tenant).
 */
adminLimitesRouter.put('/api/v1/gabi/admin/limites/:id_limite', async (req, res, next) => {
  try {
    const idOrgParse   = idOrganizacaoSchema.safeParse(req.query.id_organizacao)
    const idLimiteParse = idLimiteSchema.safeParse(req.params.id_limite)
    if (!idOrgParse.success || !idLimiteParse.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'id_organizacao e id_limite obrigatorios e validos' },
      })
    }
    const parse = atualizarLimiteSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: parse.error.issues[0]?.message ?? 'invalido' },
      })
    }

    const dados = parse.data
    if (
      dados.limite_aviso_usd !== undefined &&
      dados.limite_bloqueio_usd !== undefined &&
      Number(dados.limite_aviso_usd) > Number(dados.limite_bloqueio_usd)
    ) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'limite_aviso_usd deve ser <= limite_bloqueio_usd' },
      })
    }

    const idOrganizacao = idOrgParse.data
    const idLimite      = idLimiteParse.data
    const schemaName    = schemaNameDe(idOrganizacao)

    // Construimos SET dinamico com placeholders posicionais.
    const sets: string[] = []
    const valores: unknown[] = []
    let pos = 1
    if (dados.modelo !== undefined) {
      sets.push(`modelo_gabi_limite_monetario = $${pos++}`)
      valores.push(dados.modelo)
    }
    if (dados.limite_aviso_usd !== undefined) {
      sets.push(`limite_aviso_usd_gabi_limite_monetario = $${pos++}::numeric`)
      valores.push(dados.limite_aviso_usd)
    }
    if (dados.limite_bloqueio_usd !== undefined) {
      sets.push(`limite_bloqueio_usd_gabi_limite_monetario = $${pos++}::numeric`)
      valores.push(dados.limite_bloqueio_usd)
    }
    if (dados.destinatarios_email !== undefined) {
      sets.push(`destinatarios_email_gabi_limite_monetario = $${pos++}::text[]`)
      valores.push(dados.destinatarios_email)
    }
    if (dados.ativo !== undefined) {
      sets.push(`ativo_gabi_limite_monetario = $${pos++}`)
      valores.push(dados.ativo)
    }
    sets.push(`data_atualizacao_gabi_limite_monetario = NOW()`)

    if (sets.length === 1) {
      // so o NOW() — nada pra atualizar
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'nenhum campo fornecido' } })
    }

    valores.push(idLimite)
    valores.push(idOrganizacao)

    const linha = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      const rows = await tx.$queryRawUnsafe<LimiteLido[]>(
        `UPDATE gabi_limite_monetario
            SET ${sets.join(', ')}
          WHERE id_gabi_limite_monetario = $${pos++}
            AND id_organizacao_gabi_limite_monetario = $${pos++}
        RETURNING
           id_gabi_limite_monetario,
           id_organizacao_gabi_limite_monetario,
           modelo_gabi_limite_monetario,
           limite_aviso_usd_gabi_limite_monetario::text    AS "limite_aviso_usd_gabi_limite_monetario",
           limite_bloqueio_usd_gabi_limite_monetario::text AS "limite_bloqueio_usd_gabi_limite_monetario",
           destinatarios_email_gabi_limite_monetario,
           ativo_gabi_limite_monetario,
           data_criacao_gabi_limite_monetario,
           data_atualizacao_gabi_limite_monetario`,
        ...valores,
      )
      return rows[0]
    })

    if (!linha) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'limite nao encontrado' } })
    }
    await invalidarCacheLimites(idOrganizacao)
    res.json({ limite: paraResposta(linha) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('glm_unq_org_modelo') || msg.includes('duplicate key')) {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'conflito de (organizacao, modelo)' } })
    }
    console.error('[gabi/admin/limites] PUT erro', { mensagem: msg })
    next(err)
  }
})

/**
 * DELETE /api/v1/gabi/admin/limites/:id_limite
 * Exige id_organizacao na query.
 */
adminLimitesRouter.delete('/api/v1/gabi/admin/limites/:id_limite', async (req, res, next) => {
  try {
    const idOrgParse    = idOrganizacaoSchema.safeParse(req.query.id_organizacao)
    const idLimiteParse = idLimiteSchema.safeParse(req.params.id_limite)
    if (!idOrgParse.success || !idLimiteParse.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'id_organizacao e id_limite obrigatorios e validos' },
      })
    }
    const idOrganizacao = idOrgParse.data
    const idLimite      = idLimiteParse.data
    const schemaName    = schemaNameDe(idOrganizacao)

    const apagados = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schemaName}", public`)
      // Apaga dependentes primeiro (alertas) — FK e logico, nao Prisma @relation.
      await tx.$executeRawUnsafe(
        `DELETE FROM gabi_alerta_emitido WHERE id_limite_gabi_alerta_emitido = $1`,
        idLimite,
      )
      const rows = await tx.$queryRawUnsafe<{ id: string }[]>(
        `DELETE FROM gabi_limite_monetario
          WHERE id_gabi_limite_monetario = $1
            AND id_organizacao_gabi_limite_monetario = $2
        RETURNING id_gabi_limite_monetario AS id`,
        idLimite,
        idOrganizacao,
      )
      return rows.length
    })

    if (apagados === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'limite nao encontrado' } })
    }
    await invalidarCacheLimites(idOrganizacao)
    res.status(204).end()
  } catch (err) {
    console.error('[gabi/admin/limites] DELETE erro', { mensagem: err instanceof Error ? err.message : String(err) })
    next(err)
  }
})
