/**
 * pedidos-config.ts — Configuração da GravityTable de Pedidos
 *
 * Endpoint base: /api/v1/pedidos/config
 * Protegido por: requireInternalKey + tenantIsolation
 *
 * Rotas:
 *   GET    /status                   Listar status do tenant
 *   POST   /status                   Criar status (max 20)
 *   PUT    /status/:id               Atualizar status
 *   DELETE /status/:id               Deletar status (rejeita is_sistema=true)
 *   PATCH  /status/reordenar         Reordenar por array de IDs
 *
 *   GET    /colunas                  Listar colunas customizadas
 *   POST   /colunas                  Criar coluna (max 30)
 *   PUT    /colunas/:id              Atualizar coluna
 *   DELETE /colunas/:id              Deletar coluna
 *
 *   GET    /preferencias/usuario     Preferências do usuário
 *   PUT    /preferencias/usuario     Salvar preferências do usuário
 *   GET    /preferencias/padrao      Preferências padrão do workspace
 *   PUT    /preferencias/padrao      Salvar preferências padrão do workspace
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'
import { AppError } from '../services/saldoEngine.js'

export const pedidosConfigRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const criarStatusSchema = z.object({
  nome: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e underscore'),
  rotulo: z.string().min(1).max(100),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hex válida (ex: #6366F1)'),
  icone: z.string().max(100).optional().nullable(),
  ordem: z.number().int().default(0),
  is_padrao: z.boolean().default(false),
})

const atualizarStatusSchema = criarStatusSchema.partial().omit({ nome: true })

const reordenarStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(20),
})

const criarColunaSchema = z.object({
  nome: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e underscore'),
  rotulo: z.string().min(1).max(100),
  tipo: z.enum(['texto', 'numero', 'data', 'select', 'booleano']),
  casas_decimais: z.number().int().min(0).max(10).default(2),
  opcoes: z.array(z.object({
    valor: z.string().min(1),
    rotulo: z.string().min(1),
  })).optional().nullable(),
  ordem: z.number().int().default(0),
  filtravel: z.boolean().default(true),
  exibida_padrao: z.boolean().default(false),
})

const atualizarColunaSchema = criarColunaSchema.partial().omit({ nome: true })

const preferenciasUsuarioSchema = z.object({
  colunas_visiveis: z.array(z.string()),
  colunas_largura: z.record(z.string(), z.number()).optional().nullable(),
})

const preferenciasPadraoSchema = z.object({
  colunas_visiveis: z.array(z.string()),
  colunas_largura: z.record(z.string(), z.number()).optional().nullable(),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCompanyId(req: Request): string | undefined {
  return req.headers['x-company-id'] as string | undefined
}

// ── ACL: PedidoStatus mappers (DDD ↔ contrato externo legacy) ─────────────────

interface PedidoStatusDB {
  id_pedido_status:                  string
  id_organizacao:                    string
  id_workspace:                      string | null
  nome_pedido_status:                string
  rotulo_pedido_status:              string
  cor_pedido_status:                 string
  icone_pedido_status:               string | null
  ordem_pedido_status:               number
  padrao_pedido_status:              boolean
  gerenciado_sistema_pedido_status:  boolean
  created_at:                        Date | string
  updated_at:                        Date | string
}

function mapStatus(s: PedidoStatusDB): Record<string, unknown> {
  return {
    id:         s.id_pedido_status,
    tenant_id:  s.id_organizacao,
    company_id: s.id_workspace,
    nome:       s.nome_pedido_status,
    rotulo:     s.rotulo_pedido_status,
    cor:        s.cor_pedido_status,
    icone:      s.icone_pedido_status,
    ordem:      s.ordem_pedido_status,
    is_padrao:  s.padrao_pedido_status,
    is_sistema: s.gerenciado_sistema_pedido_status,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }
}

function mapStatusPatch(patch: {
  rotulo?: string; cor?: string; icone?: string | null; ordem?: number; is_padrao?: boolean
}): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  if (patch.rotulo    !== undefined) data.rotulo_pedido_status = patch.rotulo
  if (patch.cor       !== undefined) data.cor_pedido_status    = patch.cor
  if (patch.icone     !== undefined) data.icone_pedido_status  = patch.icone
  if (patch.ordem     !== undefined) data.ordem_pedido_status  = patch.ordem
  if (patch.is_padrao !== undefined) data.padrao_pedido_status = patch.is_padrao
  return data
}

// ── STATUS ────────────────────────────────────────────────────────────────────

/** Status padrão criados automaticamente para novos tenants */
const STATUS_PADRAO = [
  { nome: 'rascunho',      rotulo: 'Rascunho',     cor: '#94a3b8', ordem: 0, is_padrao: false, is_sistema: false },
  { nome: 'aberto',        rotulo: 'Aberto',        cor: '#3b82f6', ordem: 1, is_padrao: true,  is_sistema: false },
  { nome: 'em_andamento',  rotulo: 'Em Andamento',  cor: '#f97316', ordem: 2, is_padrao: false, is_sistema: false },
  { nome: 'aprovado',      rotulo: 'Aprovado',      cor: '#facc15', ordem: 3, is_padrao: false, is_sistema: false },
  { nome: 'transferencia', rotulo: 'Transferido',   cor: '#2dd4bf', ordem: 4, is_padrao: false, is_sistema: true  },
  { nome: 'consolidado',   rotulo: 'Consolidado',   cor: '#a78bfa', ordem: 5, is_padrao: false, is_sistema: true  },
  { nome: 'cancelado',     rotulo: 'Cancelado',     cor: '#ef4444', ordem: 6, is_padrao: false, is_sistema: false },
]

// GET /status
pedidosConfigRouter.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)

      const where: Record<string, unknown> = { id_organizacao: tenant_id }
      if (company_id) where.id_workspace = company_id

      const status = await db.pedidoStatus.findMany({
        where,
        orderBy: { ordem_pedido_status: 'asc' },
      })

      // Auto-seed: se o tenant não tem nenhum status configurado, criar os padrões
      if (status.length === 0) {
        await Promise.all(
          STATUS_PADRAO.map(s =>
            db.pedidoStatus.create({
              data: {
                id_organizacao:                   tenant_id,
                id_workspace:                     company_id ?? null,
                nome_pedido_status:               s.nome,
                rotulo_pedido_status:             s.rotulo,
                cor_pedido_status:                s.cor,
                ordem_pedido_status:              s.ordem,
                padrao_pedido_status:             s.is_padrao,
                gerenciado_sistema_pedido_status: s.is_sistema,
              },
            })
          )
        )
        const seeded = await db.pedidoStatus.findMany({
          where,
          orderBy: { ordem_pedido_status: 'asc' },
        })
        return res.json({ data: (seeded as PedidoStatusDB[]).map(mapStatus) })
      }

      res.json({ data: (status as PedidoStatusDB[]).map(mapStatus) })
    })
  } catch (err) {
    next(err)
  }
})

// POST /status
pedidosConfigRouter.post('/status', async (req: Request, res: Response, next: NextFunction) => {
  const result = criarStatusSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)

      const where: Record<string, unknown> = { id_organizacao: tenant_id }
      if (company_id) where.id_workspace = company_id

      const count = await db.pedidoStatus.count({ where })
      if (count >= 20) {
        throw new AppError(400, 'Limite de 20 status por tenant atingido')
      }

      const novoStatus = await db.pedidoStatus.create({
        data: {
          id_organizacao:                   tenant_id,
          id_workspace:                     company_id ?? null,
          nome_pedido_status:               result.data.nome,
          rotulo_pedido_status:             result.data.rotulo,
          cor_pedido_status:                result.data.cor,
          icone_pedido_status:              result.data.icone ?? null,
          ordem_pedido_status:              result.data.ordem,
          padrao_pedido_status:             result.data.is_padrao,
          gerenciado_sistema_pedido_status: false,
        },
      })

      res.status(201).json(mapStatus(novoStatus as PedidoStatusDB))
    })
  } catch (err) {
    next(err)
  }
})

// PUT /status/sync — Sincroniza a lista completa de status do tenant
// IMPORTANTE: deve ficar ANTES de PUT /status/:id para não ser capturado como :id='sync'
// Faz upsert de cada item pelo `nome` e remove do banco os que não estão na lista
// (exceto is_sistema = true, que nunca são deletados pelo sync)
const syncStatusSchema = z.object({
  status: z.array(z.object({
    nome:       z.string().min(1).max(100).regex(/^[a-z0-9_]+$/),
    rotulo:     z.string().min(1).max(100),
    cor:        z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    ordem:      z.number().int(),
    is_padrao:  z.boolean().optional(),
    is_sistema: z.boolean().optional(),
  })).min(1).max(20),
})

pedidosConfigRouter.put('/status/sync', async (req: Request, res: Response, next: NextFunction) => {
  const result = syncStatusSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)
      const where: Record<string, unknown> = { id_organizacao: tenant_id }
      if (company_id) where.id_workspace = company_id

      const nomesNovos = new Set(result.data.status.map(s => s.nome))

      // Buscar todos os status atuais do tenant para saber quais deletar
      const atuais = await db.pedidoStatus.findMany({
        where,
        select: {
          id_pedido_status:                 true,
          nome_pedido_status:               true,
          gerenciado_sistema_pedido_status: true,
        },
      })

      // Upserts por nome (chave única id_organizacao + nome_pedido_status)
      const ops = result.data.status.map(s =>
        db.pedidoStatus.upsert({
          where: { id_organizacao_nome_pedido_status: { id_organizacao: tenant_id, nome_pedido_status: s.nome } },
          update: {
            rotulo_pedido_status: s.rotulo,
            cor_pedido_status:    s.cor,
            ordem_pedido_status:  s.ordem,
            padrao_pedido_status: s.is_padrao ?? false,
          },
          create: {
            id_organizacao:                   tenant_id,
            id_workspace:                     company_id ?? null,
            nome_pedido_status:               s.nome,
            rotulo_pedido_status:             s.rotulo,
            cor_pedido_status:                s.cor,
            ordem_pedido_status:              s.ordem,
            padrao_pedido_status:             s.is_padrao ?? false,
            gerenciado_sistema_pedido_status: s.is_sistema ?? false,
          },
        })
      )

      // Deletar os que não estão na nova lista (apenas não-sistema)
      const idsParaDeletar = (atuais as Array<{ id_pedido_status: string; nome_pedido_status: string; gerenciado_sistema_pedido_status: boolean }>)
        .filter(a => !nomesNovos.has(a.nome_pedido_status) && !a.gerenciado_sistema_pedido_status)
        .map(a => a.id_pedido_status)

      const deleteOp = idsParaDeletar.length > 0
        ? [db.pedidoStatus.deleteMany({ where: { id_pedido_status: { in: idsParaDeletar }, id_organizacao: tenant_id } })]
        : []

      await Promise.all([...ops, ...deleteOp])

      const synced = await db.pedidoStatus.findMany({ where, orderBy: { ordem_pedido_status: 'asc' } })
      res.json({ data: (synced as PedidoStatusDB[]).map(mapStatus) })
    })
  } catch (err) {
    next(err)
  }
})

// PUT /status/:id
pedidosConfigRouter.put('/status/:id', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarStatusSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const existente = await db.pedidoStatus.findFirst({
        where: { id_pedido_status: req.params.id, id_organizacao: tenant_id },
      })

      if (!existente) {
        throw new AppError(404, 'Status nao encontrado')
      }

      // Inclui id_organizacao no where para garantir isolamento atômico
      const updated = await db.pedidoStatus.update({
        where: { id_pedido_status: req.params.id, id_organizacao: tenant_id },
        data: mapStatusPatch(result.data),
      })

      res.json(mapStatus(updated as PedidoStatusDB))
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /status/:id
pedidosConfigRouter.delete('/status/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const existente = await db.pedidoStatus.findFirst({
        where: { id_pedido_status: req.params.id, id_organizacao: tenant_id },
      })

      if (!existente) {
        throw new AppError(404, 'Status nao encontrado')
      }

      if (existente.gerenciado_sistema_pedido_status) {
        throw new AppError(400, 'Status do sistema nao pode ser deletado')
      }

      // Inclui id_organizacao no where para garantir isolamento atômico
      await db.pedidoStatus.delete({ where: { id_pedido_status: req.params.id, id_organizacao: tenant_id } })
      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /status/reordenar
pedidosConfigRouter.patch('/status/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  const result = reordenarStatusSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      // Verificar que todos os IDs pertencem ao tenant
      const existentes = await db.pedidoStatus.findMany({
        where: { id_pedido_status: { in: result.data.ids }, id_organizacao: tenant_id },
        select: { id_pedido_status: true },
      })

      const idsEncontrados = new Set((existentes as Array<{ id_pedido_status: string }>).map(s => s.id_pedido_status))
      const idsInvalidos = result.data.ids.filter(id => !idsEncontrados.has(id))
      if (idsInvalidos.length > 0) {
        throw new AppError(400, `IDs nao encontrados ou nao pertencem ao tenant: ${idsInvalidos.join(', ')}`)
      }

      // Atualizar ordem em paralelo (withTenant já garante atomicidade)
      await Promise.all(
        result.data.ids.map((id, index) =>
          db.pedidoStatus.update({
            where: { id_pedido_status: id },
            data: { ordem_pedido_status: index },
          })
        )
      )

      res.json({ sucesso: true })
    })
  } catch (err) {
    next(err)
  }
})

// ── COLUNAS ───────────────────────────────────────────────────────────────────

// GET /colunas
pedidosConfigRouter.get('/colunas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)

      const where: Record<string, unknown> = { tenant_id }
      if (company_id) where.company_id = company_id

      const colunas = await db.pedidoColuna.findMany({
        where,
        orderBy: { ordem: 'asc' },
      })

      res.json({ data: colunas })
    })
  } catch (err) {
    next(err)
  }
})

// POST /colunas
pedidosConfigRouter.post('/colunas', async (req: Request, res: Response, next: NextFunction) => {
  const result = criarColunaSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)

      const where: Record<string, unknown> = { tenant_id }
      if (company_id) where.company_id = company_id

      const count = await db.pedidoColuna.count({ where })
      if (count >= 30) {
        throw new AppError(400, 'Limite de 30 colunas customizadas por tenant atingido')
      }

      // Validar opcoes para tipo select
      if (result.data.tipo === 'select' && (!result.data.opcoes || result.data.opcoes.length === 0)) {
        throw new AppError(400, 'Colunas do tipo "select" devem ter ao menos uma opcao')
      }

      const novaColuna = await db.pedidoColuna.create({
        data: {
          tenant_id,
          company_id: company_id ?? null,
          ...result.data,
          opcoes: result.data.opcoes ?? null,
          index_criado: false,
        },
      })

      res.status(201).json(novaColuna)
    })
  } catch (err) {
    next(err)
  }
})

// PUT /colunas/:id
pedidosConfigRouter.put('/colunas/:id', async (req: Request, res: Response, next: NextFunction) => {
  const result = atualizarColunaSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const existente = await db.pedidoColuna.findFirst({
        where: { id: req.params.id, tenant_id },
      })

      if (!existente) {
        throw new AppError(404, 'Coluna nao encontrada')
      }

      // Se mudando tipo para select, validar opcoes
      const tipoFinal  = result.data.tipo ?? existente.tipo
      const opcoesFinal = result.data.opcoes !== undefined ? result.data.opcoes : existente.opcoes
      if (tipoFinal === 'select' && (!opcoesFinal || (Array.isArray(opcoesFinal) && opcoesFinal.length === 0))) {
        throw new AppError(400, 'Colunas do tipo "select" devem ter ao menos uma opcao')
      }

      // Inclui tenant_id no where para garantir isolamento atômico
      const updated = await db.pedidoColuna.update({
        where: { id: req.params.id, tenant_id },
        data: {
          ...result.data,
          opcoes: result.data.opcoes !== undefined ? (result.data.opcoes ?? null) : undefined,
        },
      })

      res.json(updated)
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /colunas/:id
pedidosConfigRouter.delete('/colunas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const existente = await db.pedidoColuna.findFirst({
        where: { id: req.params.id, tenant_id },
      })

      if (!existente) {
        throw new AppError(404, 'Coluna nao encontrada')
      }

      // Inclui tenant_id no where para garantir isolamento atômico
      await db.pedidoColuna.delete({ where: { id: req.params.id, tenant_id } })
      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})

// ── PREFERÊNCIAS DO USUÁRIO ───────────────────────────────────────────────────

// GET /preferencias/usuario
pedidosConfigRouter.get('/preferencias/usuario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId
      if (!user_id) throw new AppError(400, 'User ID obrigatorio')

      // Busca preferências do usuário e do workspace em paralelo (evita 2 queries sequenciais)
      const [preferencia, padrao] = await Promise.all([
        db.pedidoPreferenciaUsuario.findFirst({ where: { id_organizacao: tenant_id, id_usuario: user_id } }),
        db.pedidoPreferenciaPadrao.findFirst({ where: { id_organizacao: tenant_id } }),
      ])

      const preferenciaContract = preferencia ? {
        ...preferencia,
        colunas_visiveis: preferencia.colunas_visiveis_pedido_preferencia_usuario,
        colunas_largura:  preferencia.colunas_largura_pedido_preferencia_usuario,
      } : null

      const padraoContract = padrao ? {
        ...padrao,
        colunas_visiveis: padrao.colunas_visiveis_pedido_preferencia_padrao,
        colunas_largura:  padrao.colunas_largura_pedido_preferencia_padrao,
      } : null

      res.json(preferenciaContract ?? padraoContract ?? null)
    })
  } catch (err) {
    next(err)
  }
})

// PUT /preferencias/usuario
pedidosConfigRouter.put('/preferencias/usuario', async (req: Request, res: Response, next: NextFunction) => {
  const result = preferenciasUsuarioSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const ctx        = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id  = ctx.tenantId
      const user_id    = ctx.userId
      if (!user_id) throw new AppError(400, 'User ID obrigatorio')
      const company_id = getCompanyId(req)

      const preferencia = await db.pedidoPreferenciaUsuario.upsert({
        where: { id_organizacao_id_usuario: { id_organizacao: tenant_id, id_usuario: user_id } },
        update: {
          colunas_visiveis_pedido_preferencia_usuario: result.data.colunas_visiveis,
          colunas_largura_pedido_preferencia_usuario:  result.data.colunas_largura ?? undefined,
        },
        create: {
          id_organizacao: tenant_id,
          id_usuario:     user_id,
          id_workspace:   company_id ?? null,
          colunas_visiveis_pedido_preferencia_usuario: result.data.colunas_visiveis,
          colunas_largura_pedido_preferencia_usuario:  result.data.colunas_largura ?? undefined,
        },
      })

      res.json({
        ...preferencia,
        colunas_visiveis: preferencia.colunas_visiveis_pedido_preferencia_usuario,
        colunas_largura:  preferencia.colunas_largura_pedido_preferencia_usuario,
      })
    })
  } catch (err) {
    next(err)
  }
})

// GET /preferencias/padrao
pedidosConfigRouter.get('/preferencias/padrao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const padrao = await db.pedidoPreferenciaPadrao.findFirst({
        where: { id_organizacao: tenant_id },
      })

      const padraoContract = padrao ? {
        ...padrao,
        colunas_visiveis: padrao.colunas_visiveis_pedido_preferencia_padrao,
        colunas_largura:  padrao.colunas_largura_pedido_preferencia_padrao,
      } : null

      res.json({ data: padraoContract })
    })
  } catch (err) {
    next(err)
  }
})

// ── REGRAS DE NEGÓCIO ─────────────────────────────────────────────────────────

const regrasConfigSchema = z.object({
  duplicar_numero_auto: z.boolean().optional(),
  duplicar_copiar_datas: z.boolean().optional(),
  duplicar_status_inicial: z.string().optional(),
  excluir_status_permitidos: z.array(z.string()).optional(),
  excluir_pedido_sem_item_permitido: z.boolean().optional(),
  excluir_confirmar_com_preview: z.boolean().optional(),
  alerta_numero_duplicado: z.boolean().optional(),
  alerta_valor_total_divergente: z.boolean().optional(),
  alerta_quantidade_total_divergente: z.boolean().optional(),
  alerta_quantidade_pronta_divergente: z.boolean().optional(),
  alerta_peso_liquido_divergente: z.boolean().optional(),
  alerta_peso_bruto_divergente: z.boolean().optional(),
  alerta_cubagem_divergente: z.boolean().optional(),
})

const REGRAS_DEFAULT = {
  duplicar_numero_auto: false,
  duplicar_copiar_datas: false,
  duplicar_status_inicial: 'copiar',
  excluir_status_permitidos: ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'],
  excluir_pedido_sem_item_permitido: true,
  excluir_confirmar_com_preview: true,
  alerta_numero_duplicado: true,
  alerta_valor_total_divergente: true,
  alerta_quantidade_total_divergente: true,
  alerta_quantidade_pronta_divergente: true,
  alerta_peso_liquido_divergente: true,
  alerta_peso_bruto_divergente: true,
  alerta_cubagem_divergente: true,
}

// GET /regras
pedidosConfigRouter.get('/regras', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const config = await db.configuracaoPedido?.findFirst({
        where: { tenant_id },
      }) ?? null

      res.json(config ?? REGRAS_DEFAULT)
    })
  } catch (err) {
    next(err)
  }
})

// PUT /regras
pedidosConfigRouter.put('/regras', async (req: Request, res: Response, next: NextFunction) => {
  const result = regrasConfigSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)

      const config = await db.configuracaoPedido?.upsert({
        where: { tenant_id },
        update: { ...result.data },
        create: {
          tenant_id,
          company_id: company_id ?? null,
          ...REGRAS_DEFAULT,
          ...result.data,
        },
      }) ?? { ...REGRAS_DEFAULT, ...result.data }

      res.json(config)
    })
  } catch (err) {
    next(err)
  }
})

// PUT /preferencias/padrao
pedidosConfigRouter.put('/preferencias/padrao', async (req: Request, res: Response, next: NextFunction) => {
  const result = preferenciasPadraoSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db         = rawDb as any
      const tenant_id  = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const company_id = getCompanyId(req)

      const padrao = await db.pedidoPreferenciaPadrao.upsert({
        where: { id_organizacao: tenant_id },
        update: {
          colunas_visiveis_pedido_preferencia_padrao: result.data.colunas_visiveis,
          colunas_largura_pedido_preferencia_padrao: result.data.colunas_largura ?? undefined,
        },
        create: {
          id_organizacao: tenant_id,
          id_workspace: company_id ?? null,
          colunas_visiveis_pedido_preferencia_padrao: result.data.colunas_visiveis,
          colunas_largura_pedido_preferencia_padrao: result.data.colunas_largura ?? undefined,
        },
      })

      const padraoContract = {
        ...padrao,
        colunas_visiveis: padrao.colunas_visiveis_pedido_preferencia_padrao,
        colunas_largura:  padrao.colunas_largura_pedido_preferencia_padrao,
      }

      res.json(padraoContract)
    })
  } catch (err) {
    next(err)
  }
})
