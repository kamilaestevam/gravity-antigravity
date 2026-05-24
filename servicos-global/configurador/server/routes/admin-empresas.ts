// server/routes/admin-empresas.ts
//
// Proxy admin para listagem CROSS-ORGANIZAÇÃO de empresas/parceiros.
//
// Pipeline:
//   1. requireAuth         — valida JWT Clerk e popula req.auth
//   2. requireGravityAdmin — bloqueia se tipo_usuario ∉ {SUPER_ADMIN, ADMIN}
//   3. valida req.query    — Zod (Mand. 06) — REJEITA com 422 se inválido
//   4. fetch Cadastros     — chama /api/v1/admin/fornecedores com x-internal-key
//   5. valida resposta     — Zod (Mand. 06 + 09) — listaEmpresasAdminSchema
//                            REJEITA com 502 CADASTROS_CONTRATO_QUEBRADO se quebrar
//   6. enriquecer          — UMA query batch IN(...) em Configurador.Organizacao
//      para mapear id_organizacao → nome_organizacao. Proibido N+1.
//   7. audit log           — grava em AuditLogAdmin (fire-and-forget — decisão
//                            arquitetural Opção A: alerta operacional ao passar
//                            threshold em vez de bloquear admin durante incident)
//   8. resposta            — devolve ao frontend já enriquecida
//
// Decisão arquitetural:
// - Bancos separados (Configurador 8005 ≠ Cadastros 8031). Sem FK cross-DB.
// - Enriquecimento em memória via batch — referência: Líder Técnico marcou
//   N+1 como risco crítico no review do plano.
// - Audit log persiste em tabela `audit_log_admin` (Coordenador autorizou
//   schema.prisma — ver REGRA 02: migration controlada, não pelo agente).
// - Banner UI + modal volume>500 são responsabilidade do frontend.
//
// Skill: skills/produtos-gravity/configurador/admin/SKILL.md
// Doc:   documentos-tecnicos/arquitetura/admin-cross-org-pattern.md

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { listaEmpresasAdminSchema } from '@cadastros/shared/schemas'

export const adminEmpresasRouter = Router()

adminEmpresasRouter.use(requireAuth, requireGravityAdmin)

const FETCH_TIMEOUT_MS = 10_000

// Lazy getters — evita ESM top-level read antes de dotenv/--env-file (Mand. 08)
function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}
function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) console.warn('[admin-empresas] CHAVE_INTERNA_SERVICO ausente — chamadas ao Cadastros falharão')
  return chave ?? ''
}

// ---------------------------------------------------------------------------
// Mand. 06 — Zod no req.query do proxy.
// ---------------------------------------------------------------------------
const TIPOS_PARCEIRO_VALIDOS = [
  'importador', 'exportador', 'fabricante', 'agente', 'despachante',
  'armador', 'cia_aerea', 'transportadora_rodoviaria_nacional',
  'transportadora_rodoviaria_internacional', 'armazem_alfandegado',
  'armazem_nacional', 'banco', 'seguradora_internacional',
  'seguradora_corretora_cambio',
] as const

const queryAdminEmpresasSchema = z.object({
  id_organizacao: z.string().min(1).max(80).optional(),
  tipo_parceiro:  z.enum(TIPOS_PARCEIRO_VALIDOS).optional(),
  pais:           z.string().regex(/^[A-Za-z]{2}$/, 'pais precisa ser ISO-2 (ex: BR, US)').optional(),
  busca:          z.string().min(1).max(100).optional(),
  pagina:         z.coerce.number().int().positive().optional(),
  // por_pagina é clampeado silenciosamente para [1, 200] no proxy + Cadastros
  // (defesa em profundidade). Decisão arquitetural: clamp em vez de rejeitar
  // para preservar UX caso frontend mande valor inesperado.
  por_pagina:     z.coerce.number().int().positive().optional(),
})

/** Clampa por_pagina para [1, 200] — defesa em profundidade. */
function clampPorPagina(valor: number | undefined): number | undefined {
  if (valor === undefined) return undefined
  return Math.min(200, Math.max(1, valor))
}

/**
 * Extrai IP real do cliente para audit log forense.
 *
 * Em produção (Railway), `req.ip` retorna o IP do load balancer. O IP
 * original do cliente vem em `X-Forwarded-For` (formato: `cliente, proxy1, proxy2`).
 * Lemos o primeiro IP da cadeia.
 *
 * Pré-requisito: `app.set('trust proxy', true)` em configurador/server/index.ts.
 *
 * Líder Técnico marcou como BLOQUEANTE de produção — sem isso, audit log
 * grava IP do LB e fica inútil para rastreamento forense.
 */
function extrairIpCliente(req: Request): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    const primeiro = xff.split(',')[0]?.trim()
    if (primeiro) return primeiro
  }
  return req.ip ?? 'unknown'
}

// ---------------------------------------------------------------------------
// GET /api/v1/admin/fornecedores
// ---------------------------------------------------------------------------
adminEmpresasRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!getChaveInterna()) {
      throw new AppError(
        'CHAVE_INTERNA_SERVICO ausente no Configurador — proxy admin desabilitado',
        500,
        'CONFIG_ERROR',
      )
    }

    // ─── Mand. 06 — valida query com AppError explícito (não vaza ZodError).
    // Garante 400 + code 'QUERY_INVALIDA' independente do error handler.
    const parsedQuery = queryAdminEmpresasSchema.safeParse(req.query)
    if (!parsedQuery.success) {
      const detalhes = parsedQuery.error.issues
        .map((i) => `${i.path.join('.') || '<raiz>'}: ${i.message}`)
        .join('; ')
      throw new AppError(`Query inválida: ${detalhes}`, 400, 'QUERY_INVALIDA')
    }
    const filtros = parsedQuery.data

    // Monta query string apenas com campos validados
    const qsParams = new URLSearchParams()
    if (filtros.id_organizacao) qsParams.set('id_organizacao', filtros.id_organizacao)
    if (filtros.tipo_parceiro)  qsParams.set('tipo_parceiro',  filtros.tipo_parceiro)
    if (filtros.pais)           qsParams.set('pais',           filtros.pais.toUpperCase())
    if (filtros.busca)          qsParams.set('busca',          filtros.busca)
    if (filtros.pagina)         qsParams.set('pagina',         String(filtros.pagina))
    const porPaginaClampado = clampPorPagina(filtros.por_pagina)
    if (porPaginaClampado !== undefined) qsParams.set('por_pagina', String(porPaginaClampado))
    const qs = qsParams.toString()
    const url = `${getCadastrosUrl()}/api/v1/admin/fornecedores${qs ? `?${qs}` : ''}`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': getChaveInterna(),
          'x-correlation-id': (req.headers['x-correlation-id'] as string) ?? '',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }) as unknown as Response
    } catch {
      throw new AppError(
        'Serviço Cadastros indisponível (rede/timeout)',
        503,
        'CADASTROS_UNAVAILABLE',
      )
    }

    if (!response.ok) {
      // Falha alta (Mand. 08) — repassa status e body do Cadastros.
      const corpo = await response.json().catch(() => ({}))
      res.status(response.status).json(corpo)
      return
    }

    // ─── Mand. 06 + 09 — valida payload do Cadastros com schema bilateral.
    // Quebra de contrato vira 502 explícito (não engole o problema).
    const raw = await response.json()
    const parsed = listaEmpresasAdminSchema.safeParse(raw)
    if (!parsed.success) {
      console.error(
        '[admin-empresas] resposta do Cadastros fora do contrato',
        { issues: parsed.error.issues, correlation_id: req.headers['x-correlation-id'] },
      )
      throw new AppError(
        'Resposta do Cadastros não bate com listaEmpresasAdminSchema',
        502,
        'CADASTROS_CONTRATO_QUEBRADO',
      )
    }
    const payload = parsed.data

    // -------------------------------------------------------------------
    // Enrichment batch (proibido N+1) — Líder Técnico
    // Coleta IDs únicos, consulta UMA vez em Configurador.Organizacao,
    // monta Map e mapeia sobre os itens.
    // -------------------------------------------------------------------
    const idsUnicos = Array.from(
      new Set(payload.itens.map((e) => e.id_organizacao)),
    )

    const organizacoes = idsUnicos.length > 0
      ? await prisma.organizacao.findMany({
          where: { id_organizacao: { in: idsUnicos } },
          select: { id_organizacao: true, nome_organizacao: true },
        })
      : []

    const mapa = new Map(
      organizacoes.map((o) => [o.id_organizacao, o.nome_organizacao]),
    )

    const itensEnriquecidos = payload.itens.map((e) => ({
      ...e,
      // Falha alta (Mand. 08): se a Organizacao foi deletada do Configurador
      // mas a empresa ainda existe no Cadastros, o nome volta como
      // '⟨organização removida⟩' — visível mas não silencioso.
      nome_organizacao: mapa.get(e.id_organizacao) ?? '⟨organização removida⟩',
    }))

    // -------------------------------------------------------------------
    // Audit log — fire-and-forget (decisão Opção A do plano de QA).
    // Falha do DB do Configurador NÃO derruba o admin durante incident
    // response. Compensação: alerta operacional ao passar threshold de
    // falhas (configurado fora deste módulo, em
    // skills/governanca/convencao-tecnica/observabilidade-minima).
    // -------------------------------------------------------------------
    void prisma.auditLogAdmin
      .create({
        data: {
          id_usuario_audit_log_admin:     req.auth.id_usuario,
          tipo_usuario_audit_log_admin:   req.auth.tipo_usuario,
          acao_audit_log_admin:           'admin.empresas.list',
          recurso_audit_log_admin:        'empresa',
          filtros_audit_log_admin:        filtros, // Já validado por Zod
          qtd_resultados_audit_log_admin: payload.total,
          ip_origem_audit_log_admin:      extrairIpCliente(req),
          correlation_id_audit_log_admin: (req.headers['x-correlation-id'] as string) ?? '',
        },
      })
      .catch((err: unknown) => {
        console.error('[admin-empresas] falha ao gravar audit log', err)
      })

    res.status(200).json({
      itens: itensEnriquecidos,
      total: payload.total,
      pagina: payload.pagina,
      por_pagina: payload.por_pagina,
      alerta_volume: payload.alerta_volume === true,
    })
  } catch (err) {
    next(err)
  }
})
