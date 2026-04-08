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

function getTenantId(req: Request): string {
  const tenant_id = req.headers['x-tenant-id'] as string | undefined
  if (!tenant_id) throw new AppError(400, 'Header x-tenant-id obrigatorio')
  return tenant_id
}

function getUserId(req: Request): string {
  const user_id = req.headers['x-user-id'] as string | undefined
  if (!user_id) throw new AppError(400, 'Header x-user-id obrigatorio')
  return user_id
}

function getCompanyId(req: Request): string | undefined {
  return req.headers['x-company-id'] as string | undefined
}

// ── STATUS ────────────────────────────────────────────────────────────────────

// GET /status
pedidosConfigRouter.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)

    const where: Record<string, unknown> = { tenant_id }
    if (company_id) where.company_id = company_id

    const status = await req.prisma.pedidoStatus.findMany({
      where,
      orderBy: { ordem: 'asc' },
    })

    res.json({ data: status })
  } catch (err) {
    next(err)
  }
})

// POST /status
pedidosConfigRouter.post('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = criarStatusSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)

    const where: Record<string, unknown> = { tenant_id }
    if (company_id) where.company_id = company_id

    const count = await req.prisma.pedidoStatus.count({ where })
    if (count >= 20) {
      throw new AppError(400, 'Limite de 20 status por tenant atingido')
    }

    const novoStatus = await req.prisma.pedidoStatus.create({
      data: {
        tenant_id,
        company_id: company_id ?? null,
        ...result.data,
        is_sistema: false,
      },
    })

    res.status(201).json(novoStatus)
  } catch (err) {
    next(err)
  }
})

// PUT /status/:id
pedidosConfigRouter.put('/status/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = atualizarStatusSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)

    const existente = await req.prisma.pedidoStatus.findFirst({
      where: { id: req.params.id, tenant_id },
    })

    if (!existente) {
      throw new AppError(404, 'Status nao encontrado')
    }

    const updated = await req.prisma.pedidoStatus.update({
      where: { id: req.params.id },
      data: result.data,
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /status/:id
pedidosConfigRouter.delete('/status/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)

    const existente = await req.prisma.pedidoStatus.findFirst({
      where: { id: req.params.id, tenant_id },
    })

    if (!existente) {
      throw new AppError(404, 'Status nao encontrado')
    }

    if (existente.is_sistema) {
      throw new AppError(400, 'Status do sistema nao pode ser deletado')
    }

    await req.prisma.pedidoStatus.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// PATCH /status/reordenar
pedidosConfigRouter.patch('/status/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = reordenarStatusSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)

    // Verificar que todos os IDs pertencem ao tenant
    const existentes = await req.prisma.pedidoStatus.findMany({
      where: { id: { in: result.data.ids }, tenant_id },
      select: { id: true },
    })

    const idsEncontrados = new Set(existentes.map((s) => s.id))
    const idsInvalidos = result.data.ids.filter((id) => !idsEncontrados.has(id))
    if (idsInvalidos.length > 0) {
      throw new AppError(400, `IDs nao encontrados ou nao pertencem ao tenant: ${idsInvalidos.join(', ')}`)
    }

    // Atualizar ordem em transação
    await req.prisma.$transaction(
      result.data.ids.map((id, index) =>
        req.prisma.pedidoStatus.update({
          where: { id },
          data: { ordem: index },
        })
      )
    )

    res.json({ sucesso: true })
  } catch (err) {
    next(err)
  }
})

// ── COLUNAS ───────────────────────────────────────────────────────────────────

// GET /colunas
pedidosConfigRouter.get('/colunas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)

    const where: Record<string, unknown> = { tenant_id }
    if (company_id) where.company_id = company_id

    const colunas = await req.prisma.pedidoColuna.findMany({
      where,
      orderBy: { ordem: 'asc' },
    })

    res.json({ data: colunas })
  } catch (err) {
    next(err)
  }
})

// POST /colunas
pedidosConfigRouter.post('/colunas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = criarColunaSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)

    const where: Record<string, unknown> = { tenant_id }
    if (company_id) where.company_id = company_id

    const count = await req.prisma.pedidoColuna.count({ where })
    if (count >= 30) {
      throw new AppError(400, 'Limite de 30 colunas customizadas por tenant atingido')
    }

    // Validar opcoes para tipo select
    if (result.data.tipo === 'select' && (!result.data.opcoes || result.data.opcoes.length === 0)) {
      throw new AppError(400, 'Colunas do tipo "select" devem ter ao menos uma opcao')
    }

    const novaColuna = await req.prisma.pedidoColuna.create({
      data: {
        tenant_id,
        company_id: company_id ?? null,
        ...result.data,
        opcoes: result.data.opcoes ?? null,
        index_criado: false,
      },
    })

    res.status(201).json(novaColuna)
  } catch (err) {
    next(err)
  }
})

// PUT /colunas/:id
pedidosConfigRouter.put('/colunas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = atualizarColunaSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)

    const existente = await req.prisma.pedidoColuna.findFirst({
      where: { id: req.params.id, tenant_id },
    })

    if (!existente) {
      throw new AppError(404, 'Coluna nao encontrada')
    }

    // Se mudando tipo para select, validar opcoes
    const tipoFinal = result.data.tipo ?? existente.tipo
    const opcoesFinal = result.data.opcoes !== undefined ? result.data.opcoes : existente.opcoes
    if (tipoFinal === 'select' && (!opcoesFinal || (Array.isArray(opcoesFinal) && opcoesFinal.length === 0))) {
      throw new AppError(400, 'Colunas do tipo "select" devem ter ao menos uma opcao')
    }

    const updated = await req.prisma.pedidoColuna.update({
      where: { id: req.params.id },
      data: {
        ...result.data,
        opcoes: result.data.opcoes !== undefined ? (result.data.opcoes ?? null) : undefined,
      },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE /colunas/:id
pedidosConfigRouter.delete('/colunas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)

    const existente = await req.prisma.pedidoColuna.findFirst({
      where: { id: req.params.id, tenant_id },
    })

    if (!existente) {
      throw new AppError(404, 'Coluna nao encontrada')
    }

    await req.prisma.pedidoColuna.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ── PREFERÊNCIAS DO USUÁRIO ───────────────────────────────────────────────────

// GET /preferencias/usuario
pedidosConfigRouter.get('/preferencias/usuario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id = getUserId(req)

    // Busca preferências do usuário e do workspace em paralelo (evita 2 queries sequenciais)
    const [preferencia, padrao] = await Promise.all([
      req.prisma.pedidoPreferenciaUsuario.findFirst({ where: { tenant_id, user_id } }),
      req.prisma.pedidoPreferenciaPadrao.findFirst({ where: { tenant_id } }),
    ])

    res.json(preferencia ?? padrao ?? null)
  } catch (err) {
    next(err)
  }
})

// PUT /preferencias/usuario
pedidosConfigRouter.put('/preferencias/usuario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = preferenciasUsuarioSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const user_id = getUserId(req)
    const company_id = getCompanyId(req)

    const preferencia = await req.prisma.pedidoPreferenciaUsuario.upsert({
      where: { tenant_id_user_id: { tenant_id, user_id } },
      update: {
        colunas_visiveis: result.data.colunas_visiveis,
        colunas_largura: result.data.colunas_largura ?? undefined,
      },
      create: {
        tenant_id,
        user_id,
        company_id: company_id ?? null,
        colunas_visiveis: result.data.colunas_visiveis,
        colunas_largura: result.data.colunas_largura ?? undefined,
      },
    })

    res.json(preferencia)
  } catch (err) {
    next(err)
  }
})

// GET /preferencias/padrao
pedidosConfigRouter.get('/preferencias/padrao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)

    const padrao = await req.prisma.pedidoPreferenciaPadrao.findFirst({
      where: { tenant_id },
    })

    res.json({ data: padrao ?? null })
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
    const tenant_id = getTenantId(req)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = await (req as any).prisma.configuracaoPedido.findFirst({
      where: { tenant_id },
    }).catch(() => null)

    res.json(config ?? REGRAS_DEFAULT)
  } catch (err) {
    next(err)
  }
})

// PUT /regras
pedidosConfigRouter.put('/regras', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = regrasConfigSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = await (req as any).prisma.configuracaoPedido.upsert({
      where: { tenant_id },
      update: { ...result.data },
      create: {
        tenant_id,
        company_id: company_id ?? null,
        ...REGRAS_DEFAULT,
        ...result.data,
      },
    })

    res.json(config)
  } catch (err) {
    next(err)
  }
})

// PUT /preferencias/padrao
pedidosConfigRouter.put('/preferencias/padrao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = preferenciasPadraoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)

    const padrao = await req.prisma.pedidoPreferenciaPadrao.upsert({
      where: { tenant_id },
      update: {
        colunas_visiveis: result.data.colunas_visiveis,
        colunas_largura: result.data.colunas_largura ?? undefined,
      },
      create: {
        tenant_id,
        company_id: company_id ?? null,
        colunas_visiveis: result.data.colunas_visiveis,
        colunas_largura: result.data.colunas_largura ?? undefined,
      },
    })

    res.json(padrao)
  } catch (err) {
    next(err)
  }
})
