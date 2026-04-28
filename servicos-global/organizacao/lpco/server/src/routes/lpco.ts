/**
 * lpco.ts — Rotas CRUD de LPCOs
 * Todas as queries filtram por id_organizacao + company_id (zero-trust)
 * Status muda apenas via lpcoStatusEngine
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError, transitarStatus } from '../services/lpcoStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import {
  LpcoCreateSchema,
  LpcoUpdateSchema,
  LpcoRegistroSchema,
  LpcoCancelarSchema,
  LpcoAtualizarStatusSchema,
  LpcoListaQuerySchema,
  LpcoItemCreateSchema,
} from '../validators/lpco.js'

const router = Router()

function getTenantContext(req: Request) {
  const tenantId = (req as Record<string, unknown>).tenantId as string
  const userId = (req as Record<string, unknown>).userId as string
  const prisma = (req as Record<string, unknown>).prisma as import('@prisma/client').PrismaClient
  return { tenantId, userId, prisma }
}

// ── GET / — Listar LPCOs (paginado + filtrado) ──────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = getTenantContext(req)
    const query = LpcoListaQuerySchema.parse(req.query)

    const where: Record<string, unknown> = { id_organizacao: tenantId }
    if (query.status) where.status = query.status
    if (query.tipo_operacao) where.tipo_operacao = query.tipo_operacao
    if (query.tipo_lpco) where.tipo_lpco = query.tipo_lpco
    if (query.orgao_anuente) where.orgao_anuente = query.orgao_anuente
    if (query.canal_entrada) where.canal_entrada = query.canal_entrada
    if (query.busca) {
      where.OR = [
        { numero_portal: { contains: query.busca, mode: 'insensitive' } },
        { id: { contains: query.busca, mode: 'insensitive' } },
        { orgao_anuente: { contains: query.busca, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit

    const [data, total] = await Promise.all([
      prisma.lpco.findMany({
        where,
        orderBy: { [query.ordenar_por]: query.direcao },
        skip,
        take: query.limit,
        include: {
          _count: { select: { itens: true, exigencias: true, vinculos: true } },
        },
      }),
      prisma.lpco.count({ where }),
    ])

    res.json({ data, total, page: query.page, limit: query.limit })
  } catch (err) { next(err) }
})

// ── GET /stats — KPIs de compliance ──────────────────────────────────────────

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = getTenantContext(req)

    const counts = await prisma.lpco.groupBy({
      by: ['status'],
      where: { id_organizacao: tenantId },
      _count: { id: true },
    })

    const stats: Record<string, number> = { total: 0 }
    for (const row of counts) {
      stats[row.status] = row._count.id
      stats.total += row._count.id
    }

    res.json(stats)
  } catch (err) { next(err) }
})

// ── GET /prefill/pedido/:pedidoId — Auto-preenchimento do Pedido ─────────────

router.get('/prefill/pedido/:pedidoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = getTenantContext(req)

    const pedido = await prisma.pedido?.findFirst({
      where: { id: req.params.pedidoId, id_organizacao: tenantId },
      include: { itens: true },
    })

    if (!pedido) {
      throw new AppError('Pedido nao encontrado', 404, 'NOT_FOUND')
    }

    const prefill = {
      tipo_operacao: pedido.tipo_operacao,
      pais_procedencia: pedido.pais_exportador ?? '',
      importacao_exportador_id: pedido.importacao_exportador_id ?? null,
      exportacao_importador_id: pedido.exportacao_importador_id ?? null,
      pedido_origem_id: pedido.id,
      canal_entrada: 'PEDIDO',
      itens: (pedido.itens ?? []).map((item: Record<string, unknown>) => ({
        ncm: item.ncm,
        descricao_produto: item.descricao,
        fabricante: item.fabricante,
        quantidade_estatistica: item.quantidade_inicial_item_pedido,
        peso_liquido: item.peso_liquido,
        vmle: Number(item.valor_unitario ?? 0) * Number(item.quantidade_inicial_item_pedido ?? 0),
        moeda: pedido.moeda_negociada,
        condicao_venda: pedido.incoterm,
      })),
    }

    res.json(prefill)
  } catch (err) { next(err) }
})

// ── GET /:id_lpco — Detalhar LPCO ───────────────────────────────────────────

router.get('/:id_lpco', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = getTenantContext(req)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id_lpco, id_organizacao: tenantId },
      include: {
        itens: true,
        exigencias: { orderBy: { numero_exigencia: 'asc' } },
        vinculos: true,
        documentos: { orderBy: { created_at: 'desc' } },
        historico: { orderBy: { created_at: 'desc' }, take: 50 },
      },
    })

    if (!lpco) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    res.json(lpco)
  } catch (err) { next(err) }
})

// ── POST / — Criar LPCO (rascunho) ──────────────────────────────────────────

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = getTenantContext(req)
    const body = LpcoCreateSchema.parse(req.body)

    // Gerar ID corporativo
    const count = await prisma.lpco.count({ where: { id_organizacao: tenantId } })
    const id = gerarId(PREFIXOS.LPCO, count + 1)

    const lpco = await prisma.$transaction(async (tx) => {
      const created = await tx.lpco.create({
        data: {
          id,
          id_organizacao: tenantId,
          company_id: req.body.company_id ?? tenantId,
          product_id: 'lpco',
          tipo_operacao: body.tipo_operacao,
          tipo_lpco: body.tipo_lpco,
          orgao_anuente: body.orgao_anuente,
          modelo_lpco: body.modelo_lpco,
          pais_procedencia: body.pais_procedencia,
          unidade_entrada: body.unidade_entrada,
          recinto_armazenamento: body.recinto_armazenamento,
          fundamento_legal: body.fundamento_legal,
          condicao_mercadoria: body.condicao_mercadoria,
          importacao_exportador_id: body.importacao_exportador_id,
          exportacao_importador_id: body.exportacao_importador_id,
          canal_entrada: body.canal_entrada,
          pedido_origem_id: body.pedido_origem_id,
          lpco_origem_id: body.lpco_origem_id,
          status: 'rascunho',
          user_id: userId,
          created_by: userId,
        },
      })

      // Criar itens se fornecidos
      if (body.itens?.length) {
        const itemCount = await tx.lpcoItens.count({ where: { id_organizacao: tenantId } })
        for (let i = 0; i < body.itens.length; i++) {
          const item = body.itens[i]
          await tx.lpcoItens.create({
            data: {
              id: gerarId(PREFIXOS.ITEM, itemCount + i + 1),
              id_organizacao: tenantId,
              company_id: req.body.company_id ?? tenantId,
              product_id: 'lpco',
              user_id: userId,
              lpco_id: id,
              ncm: item.ncm,
              catalogo_produto_id: item.catalogo_produto_id,
              descricao_produto: item.descricao_produto,
              fabricante: item.fabricante,
              exportador: item.exportador,
              quantidade_estatistica: item.quantidade_estatistica,
              unidade_medida: item.unidade_medida,
              quantidade_comercial: item.quantidade_comercial,
              unidade_medida_comercial: item.unidade_medida_comercial,
              peso_liquido: item.peso_liquido,
              vmle: item.vmle,
              moeda: item.moeda,
              condicao_venda: item.condicao_venda,
              atributos: item.atributos ?? undefined,
            },
          })
        }
      }

      // Historico de criacao
      await tx.lpcoHistorico.create({
        data: {
          id_organizacao: tenantId,
          company_id: req.body.company_id ?? tenantId,
          product_id: 'lpco',
          user_id: userId,
          lpco_id: id,
          evento: 'criacao',
          status_novo: 'rascunho',
          descricao: `LPCO criado via ${body.canal_entrada}`,
        },
      })

      return created
    })

    res.status(201).json(lpco)
  } catch (err) { next(err) }
})

// ── PUT /:id_lpco — Atualizar LPCO (apenas rascunho) ────────────────────────

router.put('/:id_lpco', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = getTenantContext(req)
    const body = LpcoUpdateSchema.parse(req.body)

    const existing = await prisma.lpco.findFirst({
      where: { id: req.params.id_lpco, id_organizacao: tenantId },
    })

    if (!existing) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    if (existing.status !== 'rascunho') {
      throw new AppError('Apenas LPCOs em rascunho podem ser editados', 422, 'NOT_RASCUNHO')
    }

    const lpco = await prisma.lpco.update({
      where: { id: req.params.id_lpco },
      data: { ...body, updated_by: userId },
    })

    res.json(lpco)
  } catch (err) { next(err) }
})

// ── POST /:id/registrar — Registrar (rascunho → para_analise) ───────────────

router.post('/:id/registrar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = getTenantContext(req)

    // Buscar LPCO completo para validar
    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, id_organizacao: tenantId },
      include: { itens: true },
    })

    if (!lpco) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    // Validar campos obrigatorios para registro
    LpcoRegistroSchema.parse({
      tipo_operacao: lpco.tipo_operacao,
      tipo_lpco: lpco.tipo_lpco,
      orgao_anuente: lpco.orgao_anuente,
      modelo_lpco: lpco.modelo_lpco,
      pais_procedencia: lpco.pais_procedencia,
      fundamento_legal: lpco.fundamento_legal,
      itens: lpco.itens.map(i => ({
        ncm: i.ncm,
        descricao_produto: i.descricao_produto,
        quantidade_estatistica: Number(i.quantidade_estatistica),
        unidade_medida: i.unidade_medida,
        peso_liquido: Number(i.peso_liquido),
        vmle: Number(i.vmle),
        moeda: i.moeda,
      })),
    })

    const result = await transitarStatus({
      prisma,
      lpcoId: req.params.id,
      tenantId,
      companyId: lpco.company_id,
      statusNovo: 'para_analise',
      userId,
      descricao: 'LPCO registrado para analise',
    })

    const updated = await prisma.lpco.findFirst({ where: { id: req.params.id } })
    res.json(updated)
  } catch (err) { next(err) }
})

// ── POST /:id_lpco/cancelar — Cancelar LPCO ─────────────────────────────────

router.post('/:id_lpco/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = getTenantContext(req)
    const { motivo } = LpcoCancelarSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id_lpco, id_organizacao: tenantId },
    })

    if (!lpco) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    await transitarStatus({
      prisma,
      lpcoId: req.params.id_lpco,
      tenantId,
      companyId: lpco.company_id,
      statusNovo: 'cancelada',
      userId,
      descricao: `Cancelamento manual: ${motivo}`,
    })

    const updated = await prisma.lpco.findFirst({ where: { id: req.params.id_lpco } })
    res.json(updated)
  } catch (err) { next(err) }
})

// ── POST /:id_lpco/atualizar-status — Sync manual ───────────────────────────

router.post('/:id_lpco/atualizar-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = getTenantContext(req)
    const { status } = LpcoAtualizarStatusSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id_lpco, id_organizacao: tenantId },
    })

    if (!lpco) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    await transitarStatus({
      prisma,
      lpcoId: req.params.id_lpco,
      tenantId,
      companyId: lpco.company_id,
      statusNovo: status,
      userId,
      descricao: 'Atualizacao manual de status (sync)',
    })

    const updated = await prisma.lpco.findFirst({ where: { id: req.params.id_lpco } })
    res.json(updated)
  } catch (err) { next(err) }
})

// ── POST /:id/duplicar — Duplicar como novo rascunho ────────────────────────

router.post('/:id/duplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = getTenantContext(req)

    const original = await prisma.lpco.findFirst({
      where: { id: req.params.id, id_organizacao: tenantId },
      include: { itens: true },
    })

    if (!original) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    const count = await prisma.lpco.count({ where: { id_organizacao: tenantId } })
    const novoId = gerarId(PREFIXOS.LPCO, count + 1)

    const novo = await prisma.$transaction(async (tx) => {
      const created = await tx.lpco.create({
        data: {
          id: novoId,
          id_organizacao: tenantId,
          company_id: original.company_id,
          product_id: 'lpco',
          tipo_operacao: original.tipo_operacao,
          tipo_lpco: original.tipo_lpco,
          orgao_anuente: original.orgao_anuente,
          modelo_lpco: original.modelo_lpco,
          pais_procedencia: original.pais_procedencia,
          unidade_entrada: original.unidade_entrada,
          recinto_armazenamento: original.recinto_armazenamento,
          fundamento_legal: original.fundamento_legal,
          condicao_mercadoria: original.condicao_mercadoria,
          importacao_exportador_id: original.importacao_exportador_id,
          exportacao_importador_id: original.exportacao_importador_id,
          canal_entrada: 'DUPLICAR',
          lpco_origem_id: original.id,
          status: 'rascunho',
          user_id: userId,
          created_by: userId,
        },
      })

      // Duplicar itens
      const itemCount = await tx.lpcoItens.count({ where: { id_organizacao: tenantId } })
      for (let i = 0; i < original.itens.length; i++) {
        const item = original.itens[i]
        await tx.lpcoItens.create({
          data: {
            id: gerarId(PREFIXOS.ITEM, itemCount + i + 1),
            id_organizacao: tenantId,
            company_id: original.company_id,
            product_id: 'lpco',
            user_id: userId,
            lpco_id: novoId,
            ncm: item.ncm,
            catalogo_produto_id: item.catalogo_produto_id,
            descricao_produto: item.descricao_produto,
            fabricante: item.fabricante,
            exportador: item.exportador,
            quantidade_estatistica: item.quantidade_estatistica,
            unidade_medida: item.unidade_medida,
            quantidade_comercial: item.quantidade_comercial,
            unidade_medida_comercial: item.unidade_medida_comercial,
            peso_liquido: item.peso_liquido,
            vmle: item.vmle,
            moeda: item.moeda,
            condicao_venda: item.condicao_venda,
            atributos: item.atributos ?? undefined,
          },
        })
      }

      await tx.lpcoHistorico.create({
        data: {
          id_organizacao: tenantId,
          company_id: original.company_id,
          product_id: 'lpco',
          user_id: userId,
          lpco_id: novoId,
          evento: 'duplicacao',
          status_novo: 'rascunho',
          descricao: `Duplicado a partir de ${original.id}`,
          dados_extras: { lpco_origem_id: original.id },
        },
      })

      return created
    })

    res.status(201).json(novo)
  } catch (err) { next(err) }
})

export { router as lpcoRouter }
