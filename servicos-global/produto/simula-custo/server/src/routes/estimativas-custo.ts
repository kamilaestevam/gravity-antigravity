/**
 * estimativas-custo.ts — CRUD da EstimativaCusto
 * Routes: /api/v1/simula-custo/estimativas-custo
 * Protegido por validarChaveInterna + tenantIsolationMiddleware (id_organizacao via header).
 */
import { Router, Response, NextFunction } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import { AppError } from '../lib/erros.js'
import type { TenantRequest } from '../middleware/isolamento-tenant.js'
import {
  CriarEstimativaCustoSchema,
  AtualizarEstimativaCustoSchema,
  AtualizarStatusEstimativaCustoSchema,
  ListarEstimativasCustoQuerySchema,
  type CriarEstimativaCustoInput,
} from '../schemas/estimativa-custo-schema.js'
import { selectListaEstimativaCusto, serializarEstimativaCusto } from '../shared/select-lista-estimativa-custo.js'
import { invalidarCacheDashboardEstimativaCusto } from '../lib/cache-dashboard-estimativa-custo.js'
import { executarCalculoEstimativaCusto } from '../lib/motor-calculo-estimativa-custo.js'
import { getLatestPtax } from '../connectors/bacen.js'

export const estimativasCustoRouter = Router()

function exigirContexto(req: TenantRequest): { prisma: PrismaClient; tenantId: string; idWorkspace: string; idUsuario: string } {
  const { prisma, tenantId, idWorkspace, idUsuario } = req
  if (!prisma || !tenantId) throw new AppError('x-id-organizacao obrigatório', 401, 'UNAUTHORIZED')
  if (!idWorkspace) throw new AppError('x-id-workspace obrigatório', 400, 'WORKSPACE_REQUIRED')
  if (!idUsuario) throw new AppError('x-id-usuario obrigatório', 400, 'USUARIO_REQUIRED')
  return { prisma, tenantId, idWorkspace, idUsuario }
}

/** Gera EST-IMP-00001/26 por organização+usuário+ano (SequenciaEstimativaCusto). */
async function gerarNumeroEstimativaCusto(
  prisma: PrismaClient,
  tenantId: string,
  idUsuario: string,
  tipoOperacao: string
): Promise<string> {
  const ano = new Date().getFullYear()
  const prefixo = tipoOperacao === 'IMPORTACAO' ? 'IMP' : 'EXP'
  const seq = await prisma.sequenciaEstimativaCusto.upsert({
    where: {
      id_organizacao_id_usuario_ano_sequencia_estimativa_custo: {
        id_organizacao: tenantId,
        id_usuario: idUsuario,
        ano_sequencia_estimativa_custo: ano,
      },
    },
    update: { ultimo_numero_sequencia_estimativa_custo: { increment: 1 } },
    create: {
      id_organizacao: tenantId,
      id_usuario: idUsuario,
      ano_sequencia_estimativa_custo: ano,
      ultimo_numero_sequencia_estimativa_custo: 1,
    },
  })
  return `EST-${prefixo}-${String(seq.ultimo_numero_sequencia_estimativa_custo).padStart(5, '0')}/${String(ano).slice(-2)}`
}

// Nota: a Prisma extension de tenant injeta id_organizacao apenas no create de
// nível superior — nested creates precisam do campo explícito.
function montarDadosTaxas(
  dados: CriarEstimativaCustoInput,
  contexto: { tenantId: string; idWorkspace: string; idUsuario: string },
  lado: 'origem' | 'destino'
) {
  const taxas = lado === 'origem' ? dados.taxas_origem : dados.taxas_destino
  return taxas.map((t) => ({
    id_organizacao: contexto.tenantId,
    id_workspace: contexto.idWorkspace,
    id_usuario: contexto.idUsuario,
    id_taxa_origem_destino: t.id_taxa_origem_destino ?? null,
    [`nome_taxa_${lado}_estimativa_custo`]: t.nome,
    [`moeda_taxa_${lado}_estimativa_custo`]: t.moeda,
    [`tipo_cobranca_taxa_${lado}_estimativa_custo`]: t.tipo_cobranca,
    [`valor_minimo_taxa_${lado}_estimativa_custo`]: t.valor_minimo,
    [`valor_total_taxa_${lado}_estimativa_custo`]: t.valor_total,
  }))
}

/**
 * Recalcula e persiste o resultado fiscal da estimativa (Gravity Cloud Engine).
 * Substitui os tributos gravados e atualiza os campos de resultado.
 */
async function recalcularEPersistirEstimativaCusto(
  prisma: PrismaClient,
  contexto: { tenantId: string; idWorkspace: string; idUsuario: string },
  idEstimativaCusto: string
): Promise<void> {
  const e = await prisma.estimativaCusto.findFirst({
    where: { id_estimativa_custo: idEstimativaCusto },
    include: { taxas_origem: true, taxas_destino: true },
  })
  if (!e) return

  const ptaxVenda = (await getLatestPtax(e.moeda_produto_estimativa_custo)).venda

  const resultado = executarCalculoEstimativaCusto({
    ncm_estimativa_custo: e.ncm_estimativa_custo,
    valor_produto_estimativa_custo: Number(e.valor_produto_estimativa_custo),
    moeda_produto_estimativa_custo: e.moeda_produto_estimativa_custo,
    ptax_venda: ptaxVenda,
    valor_frete_estimativa_custo: Number(e.valor_frete_estimativa_custo),
    moeda_frete_estimativa_custo: e.moeda_frete_estimativa_custo,
    valor_seguro_estimativa_custo: Number(e.valor_seguro_estimativa_custo),
    moeda_seguro_estimativa_custo: e.moeda_seguro_estimativa_custo,
    taxas_origem: e.taxas_origem.map(t => ({
      nome: t.nome_taxa_origem_estimativa_custo,
      valor: Number(t.valor_total_taxa_origem_estimativa_custo),
      moeda: t.moeda_taxa_origem_estimativa_custo,
    })),
    taxas_destino: e.taxas_destino.map(t => ({
      nome: t.nome_taxa_destino_estimativa_custo,
      valor: Number(t.valor_total_taxa_destino_estimativa_custo),
      moeda: t.moeda_taxa_destino_estimativa_custo,
    })),
    uf_desembaraco_estimativa_custo: e.uf_desembaraco_estimativa_custo,
    aliquota_ii_estimativa_custo: Number(e.aliquota_ii_estimativa_custo),
    aliquota_ipi_estimativa_custo: Number(e.aliquota_ipi_estimativa_custo),
    aliquota_pis_estimativa_custo: Number(e.aliquota_pis_estimativa_custo),
    aliquota_cofins_estimativa_custo: Number(e.aliquota_cofins_estimativa_custo),
    aliquota_icms_estimativa_custo: Number(e.aliquota_icms_estimativa_custo),
    reducao_ii_estimativa_custo: Number(e.reducao_ii_estimativa_custo),
  })

  const tiposTributo = ['ii', 'ipi', 'pis', 'cofins', 'icms'] as const

  await prisma.estimativaCusto.update({
    where: { id_estimativa_custo: idEstimativaCusto },
    data: {
      ptax_utilizada_estimativa_custo: ptaxVenda,
      valor_aduaneiro_estimativa_custo: resultado.valor_aduaneiro_brl,
      total_tributos_estimativa_custo: resultado.total_tributos_brl,
      custo_nacionalizado_brl_estimativa_custo: resultado.custo_nacionalizado_brl,
      fonte_calculo_estimativa_custo: 'gravity-engine',
      tributos: {
        deleteMany: {},
        create: tiposTributo.map((tipo) => ({
          id_organizacao: contexto.tenantId,
          id_workspace: contexto.idWorkspace,
          id_usuario: contexto.idUsuario,
          tipo_tributo_estimativa_custo: tipo.toUpperCase(),
          aliquota_tributo_estimativa_custo: resultado.tributos[tipo].aliquota,
          base_calculo_tributo_estimativa_custo: resultado.tributos[tipo].base_calculo,
          valor_tributo_estimativa_custo: resultado.tributos[tipo].valor,
        })) as never,
      },
    },
  })
}

// ─── POST /estimativas-custo ────────────────────────────────────────────────────
estimativasCustoRouter.post('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarEstimativaCustoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados inválidos: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }
    const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
    const dados = parsed.data

    const numero = dados.numero_manual_estimativa_custo?.trim()
      || await gerarNumeroEstimativaCusto(prisma, tenantId, idUsuario, dados.tipo_operacao_estimativa_custo)

    const estimativa = await prisma.estimativaCusto.create({
      data: {
        // id_organizacao também é injetado pelo withTenantIsolation; explícito
        // aqui para satisfazer o tipo CreateInput do Prisma.
        id_organizacao: tenantId,
        id_workspace: idWorkspace,
        id_usuario: idUsuario,
        numero_estimativa_custo: numero,
        referencia_estimativa_custo: dados.referencia_estimativa_custo ?? null,
        tipo_operacao_estimativa_custo: dados.tipo_operacao_estimativa_custo,
        detalhe_operacao_estimativa_custo: dados.detalhe_operacao_estimativa_custo,
        status_estimativa_custo: 'EM_CRIACAO',
        ncm_estimativa_custo: dados.ncm_estimativa_custo,
        descricao_ncm_estimativa_custo: dados.descricao_ncm_estimativa_custo ?? null,
        incoterm_estimativa_custo: dados.incoterm_estimativa_custo,
        quantidade_estimativa_custo: dados.quantidade_estimativa_custo,
        moeda_produto_estimativa_custo: dados.moeda_produto_estimativa_custo,
        valor_produto_estimativa_custo: dados.valor_produto_estimativa_custo,
        moeda_frete_estimativa_custo: dados.moeda_frete_estimativa_custo,
        valor_frete_estimativa_custo: dados.valor_frete_estimativa_custo,
        moeda_seguro_estimativa_custo: dados.moeda_seguro_estimativa_custo,
        valor_seguro_estimativa_custo: dados.valor_seguro_estimativa_custo,
        uf_desembaraco_estimativa_custo: dados.uf_desembaraco_estimativa_custo,
        aliquota_icms_estimativa_custo: dados.aliquota_icms_estimativa_custo,
        usa_beneficio_estimativa_custo: dados.usa_beneficio_estimativa_custo,
        aliquota_ii_estimativa_custo: dados.aliquota_ii_estimativa_custo,
        aliquota_ipi_estimativa_custo: dados.aliquota_ipi_estimativa_custo,
        aliquota_pis_estimativa_custo: dados.aliquota_pis_estimativa_custo,
        aliquota_cofins_estimativa_custo: dados.aliquota_cofins_estimativa_custo,
        reducao_ii_estimativa_custo: dados.reducao_ii_estimativa_custo,
        taxas_origem: { create: montarDadosTaxas(dados, { tenantId, idWorkspace, idUsuario }, 'origem') as never },
        taxas_destino: { create: montarDadosTaxas(dados, { tenantId, idWorkspace, idUsuario }, 'destino') as never },
        documentos: {
          create: dados.documentos.map((d) => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            tipo_documento_estimativa_custo: d.tipo_documento_estimativa_custo,
            numero_documento_estimativa_custo: d.numero_documento_estimativa_custo,
          })),
        },
      },
      select: selectListaEstimativaCusto,
    })

    await recalcularEPersistirEstimativaCusto(prisma, { tenantId, idWorkspace, idUsuario }, estimativa.id_estimativa_custo)
    const calculada = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: estimativa.id_estimativa_custo },
      select: selectListaEstimativaCusto,
    })

    invalidarCacheDashboardEstimativaCusto(tenantId)
    res.status(201).json({ estimativa_custo: serializarEstimativaCusto(calculada ?? estimativa) })
  } catch (err) { next(err) }
})

// ─── GET /estimativas-custo ─────────────────────────────────────────────────────
estimativasCustoRouter.get('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirContexto(req)
    const query = ListarEstimativasCustoQuerySchema.parse(req.query)

    const where: Prisma.EstimativaCustoWhereInput = {}
    if (query.busca) {
      where.OR = [
        { numero_estimativa_custo: { contains: query.busca, mode: 'insensitive' } },
        { referencia_estimativa_custo: { contains: query.busca, mode: 'insensitive' } },
        { ncm_estimativa_custo: { contains: query.busca } },
        { descricao_ncm_estimativa_custo: { contains: query.busca, mode: 'insensitive' } },
      ]
    }
    if (query.status) where.status_estimativa_custo = query.status

    const skip = (query.pagina - 1) * query.limite
    const [linhas, total] = await Promise.all([
      prisma.estimativaCusto.findMany({
        where,
        orderBy: { [query.ordenar_por]: query.direcao },
        skip,
        take: query.limite,
        select: selectListaEstimativaCusto,
      }),
      prisma.estimativaCusto.count({ where }),
    ])

    res.json({
      estimativas_custo: linhas.map(serializarEstimativaCusto),
      paginacao: { pagina: query.pagina, limite: query.limite, total, paginas: Math.ceil(total / query.limite) },
    })
  } catch (err) { next(err) }
})

// ─── GET /estimativas-custo/kpis ────────────────────────────────────────────────
estimativasCustoRouter.get('/kpis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirContexto(req)
    const [total, emCriacao, criadas, arquivadas, aggCusto, aggTributos] = await Promise.all([
      prisma.estimativaCusto.count(),
      prisma.estimativaCusto.count({ where: { status_estimativa_custo: 'EM_CRIACAO' } }),
      prisma.estimativaCusto.count({ where: { status_estimativa_custo: 'CRIADA' } }),
      prisma.estimativaCusto.count({ where: { status_estimativa_custo: 'ARQUIVADA' } }),
      prisma.estimativaCusto.aggregate({ _avg: { custo_nacionalizado_brl_estimativa_custo: true } }),
      prisma.estimativaCusto.aggregate({ _sum: { total_tributos_estimativa_custo: true } }),
    ])
    res.json({
      total,
      em_criacao: emCriacao,
      criadas,
      arquivadas,
      custo_nacionalizado_medio_brl: aggCusto._avg.custo_nacionalizado_brl_estimativa_custo
        ? Number(aggCusto._avg.custo_nacionalizado_brl_estimativa_custo) : 0,
      total_tributos_acumulado_brl: aggTributos._sum.total_tributos_estimativa_custo
        ? Number(aggTributos._sum.total_tributos_estimativa_custo) : 0,
    })
  } catch (err) { next(err) }
})

// ─── GET /estimativas-custo/:id_estimativa_custo ────────────────────────────────
estimativasCustoRouter.get('/:id_estimativa_custo', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirContexto(req)
    const estimativa = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      include: { taxas_origem: true, taxas_destino: true, tributos: true, documentos: true },
    })
    if (!estimativa) throw new AppError('Estimativa não encontrada', 404, 'NOT_FOUND')

    const { taxas_origem, taxas_destino, tributos, documentos, ...linha } = estimativa
    res.json({
      estimativa_custo: {
        ...serializarEstimativaCusto(linha),
        aliquota_ii_estimativa_custo: Number(estimativa.aliquota_ii_estimativa_custo),
        aliquota_ipi_estimativa_custo: Number(estimativa.aliquota_ipi_estimativa_custo),
        aliquota_pis_estimativa_custo: Number(estimativa.aliquota_pis_estimativa_custo),
        aliquota_cofins_estimativa_custo: Number(estimativa.aliquota_cofins_estimativa_custo),
        aliquota_icms_estimativa_custo: Number(estimativa.aliquota_icms_estimativa_custo),
        reducao_ii_estimativa_custo: Number(estimativa.reducao_ii_estimativa_custo),
        usa_beneficio_estimativa_custo: estimativa.usa_beneficio_estimativa_custo,
        taxas_origem: taxas_origem.map(t => ({
          id_taxa_origem_estimativa_custo: t.id_taxa_origem_estimativa_custo,
          id_taxa_origem_destino: t.id_taxa_origem_destino,
          nome_taxa_origem_estimativa_custo: t.nome_taxa_origem_estimativa_custo,
          moeda_taxa_origem_estimativa_custo: t.moeda_taxa_origem_estimativa_custo,
          tipo_cobranca_taxa_origem_estimativa_custo: t.tipo_cobranca_taxa_origem_estimativa_custo,
          valor_minimo_taxa_origem_estimativa_custo: Number(t.valor_minimo_taxa_origem_estimativa_custo),
          valor_total_taxa_origem_estimativa_custo: Number(t.valor_total_taxa_origem_estimativa_custo),
        })),
        taxas_destino: taxas_destino.map(t => ({
          id_taxa_destino_estimativa_custo: t.id_taxa_destino_estimativa_custo,
          id_taxa_origem_destino: t.id_taxa_origem_destino,
          nome_taxa_destino_estimativa_custo: t.nome_taxa_destino_estimativa_custo,
          moeda_taxa_destino_estimativa_custo: t.moeda_taxa_destino_estimativa_custo,
          tipo_cobranca_taxa_destino_estimativa_custo: t.tipo_cobranca_taxa_destino_estimativa_custo,
          valor_minimo_taxa_destino_estimativa_custo: Number(t.valor_minimo_taxa_destino_estimativa_custo),
          valor_total_taxa_destino_estimativa_custo: Number(t.valor_total_taxa_destino_estimativa_custo),
        })),
        tributos: tributos.map(t => ({
          id_tributo_estimativa_custo: t.id_tributo_estimativa_custo,
          tipo_tributo_estimativa_custo: t.tipo_tributo_estimativa_custo,
          aliquota_tributo_estimativa_custo: Number(t.aliquota_tributo_estimativa_custo),
          base_calculo_tributo_estimativa_custo: Number(t.base_calculo_tributo_estimativa_custo),
          valor_tributo_estimativa_custo: Number(t.valor_tributo_estimativa_custo),
          reducao_tributo_estimativa_custo: t.reducao_tributo_estimativa_custo ? Number(t.reducao_tributo_estimativa_custo) : null,
          acordo_tributo_estimativa_custo: t.acordo_tributo_estimativa_custo,
        })),
        documentos: documentos.map(d => ({
          id_documento_estimativa_custo: d.id_documento_estimativa_custo,
          tipo_documento_estimativa_custo: d.tipo_documento_estimativa_custo,
          numero_documento_estimativa_custo: d.numero_documento_estimativa_custo,
        })),
      },
    })
  } catch (err) { next(err) }
})

// ─── PUT /estimativas-custo/:id_estimativa_custo ────────────────────────────────
estimativasCustoRouter.put('/:id_estimativa_custo', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarEstimativaCustoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados inválidos: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }
    const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
    const dados = parsed.data

    const existente = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      select: { id_estimativa_custo: true },
    })
    if (!existente) throw new AppError('Estimativa não encontrada', 404, 'NOT_FOUND')

    const dataUpdate: Prisma.EstimativaCustoUpdateInput = {}
    const camposEscalares = [
      'referencia_estimativa_custo', 'tipo_operacao_estimativa_custo', 'detalhe_operacao_estimativa_custo',
      'ncm_estimativa_custo', 'descricao_ncm_estimativa_custo', 'incoterm_estimativa_custo',
      'quantidade_estimativa_custo', 'moeda_produto_estimativa_custo', 'valor_produto_estimativa_custo',
      'moeda_frete_estimativa_custo', 'valor_frete_estimativa_custo',
      'moeda_seguro_estimativa_custo', 'valor_seguro_estimativa_custo',
      'uf_desembaraco_estimativa_custo', 'aliquota_icms_estimativa_custo', 'usa_beneficio_estimativa_custo',
      'aliquota_ii_estimativa_custo', 'aliquota_ipi_estimativa_custo',
      'aliquota_pis_estimativa_custo', 'aliquota_cofins_estimativa_custo', 'reducao_ii_estimativa_custo',
    ] as const
    for (const campo of camposEscalares) {
      if (dados[campo] !== undefined) (dataUpdate as Record<string, unknown>)[campo] = dados[campo]
    }

    // Taxas: substituição completa quando enviadas (padrão replace-all do formulário)
    if (dados.taxas_origem !== undefined) {
      dataUpdate.taxas_origem = {
        deleteMany: {},
        create: montarDadosTaxas(dados as CriarEstimativaCustoInput, { tenantId, idWorkspace, idUsuario }, 'origem') as never,
      }
    }
    if (dados.taxas_destino !== undefined) {
      dataUpdate.taxas_destino = {
        deleteMany: {},
        create: montarDadosTaxas(dados as CriarEstimativaCustoInput, { tenantId, idWorkspace, idUsuario }, 'destino') as never,
      }
    }
    if (dados.documentos !== undefined) {
      dataUpdate.documentos = {
        deleteMany: {},
        create: dados.documentos.map((d) => ({
          id_organizacao: tenantId,
          id_workspace: idWorkspace,
          id_usuario: idUsuario,
          tipo_documento_estimativa_custo: d.tipo_documento_estimativa_custo,
          numero_documento_estimativa_custo: d.numero_documento_estimativa_custo,
        })),
      }
    }

    const atualizada = await prisma.estimativaCusto.update({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      data: dataUpdate,
      select: selectListaEstimativaCusto,
    })

    await recalcularEPersistirEstimativaCusto(prisma, { tenantId, idWorkspace, idUsuario }, atualizada.id_estimativa_custo)
    const recalculada = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: atualizada.id_estimativa_custo },
      select: selectListaEstimativaCusto,
    })

    invalidarCacheDashboardEstimativaCusto(tenantId)
    res.json({ estimativa_custo: serializarEstimativaCusto(recalculada ?? atualizada) })
  } catch (err) { next(err) }
})

// ─── PATCH /estimativas-custo/:id_estimativa_custo/status ──────────────────────
estimativasCustoRouter.patch('/:id_estimativa_custo/status', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarStatusEstimativaCustoSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Status inválido', 400, 'VALIDATION_ERROR')
    const { prisma, tenantId } = exigirContexto(req)

    const existente = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      select: { id_estimativa_custo: true },
    })
    if (!existente) throw new AppError('Estimativa não encontrada', 404, 'NOT_FOUND')

    const atualizada = await prisma.estimativaCusto.update({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      data: { status_estimativa_custo: parsed.data.status_estimativa_custo },
      select: selectListaEstimativaCusto,
    })

    invalidarCacheDashboardEstimativaCusto(tenantId)
    res.json({ estimativa_custo: serializarEstimativaCusto(atualizada) })
  } catch (err) { next(err) }
})

// ─── POST /estimativas-custo/:id_estimativa_custo/duplicar ─────────────────────
estimativasCustoRouter.post('/:id_estimativa_custo/duplicar', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
    const original = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      include: { taxas_origem: true, taxas_destino: true, documentos: true },
    })
    if (!original) throw new AppError('Estimativa original não encontrada', 404, 'NOT_FOUND')

    const numero = await gerarNumeroEstimativaCusto(prisma, tenantId, idUsuario, original.tipo_operacao_estimativa_custo)

    const copia = await prisma.estimativaCusto.create({
      data: {
        id_organizacao: tenantId,
        id_workspace: idWorkspace,
        id_usuario: idUsuario,
        numero_estimativa_custo: numero,
        referencia_estimativa_custo: original.referencia_estimativa_custo
          ? `${original.referencia_estimativa_custo} (cópia)` : null,
        tipo_operacao_estimativa_custo: original.tipo_operacao_estimativa_custo,
        detalhe_operacao_estimativa_custo: original.detalhe_operacao_estimativa_custo,
        status_estimativa_custo: 'EM_CRIACAO',
        ncm_estimativa_custo: original.ncm_estimativa_custo,
        descricao_ncm_estimativa_custo: original.descricao_ncm_estimativa_custo,
        incoterm_estimativa_custo: original.incoterm_estimativa_custo,
        quantidade_estimativa_custo: original.quantidade_estimativa_custo,
        moeda_produto_estimativa_custo: original.moeda_produto_estimativa_custo,
        valor_produto_estimativa_custo: original.valor_produto_estimativa_custo,
        moeda_frete_estimativa_custo: original.moeda_frete_estimativa_custo,
        valor_frete_estimativa_custo: original.valor_frete_estimativa_custo,
        moeda_seguro_estimativa_custo: original.moeda_seguro_estimativa_custo,
        valor_seguro_estimativa_custo: original.valor_seguro_estimativa_custo,
        uf_desembaraco_estimativa_custo: original.uf_desembaraco_estimativa_custo,
        aliquota_icms_estimativa_custo: original.aliquota_icms_estimativa_custo,
        usa_beneficio_estimativa_custo: original.usa_beneficio_estimativa_custo,
        aliquota_ii_estimativa_custo: original.aliquota_ii_estimativa_custo,
        aliquota_ipi_estimativa_custo: original.aliquota_ipi_estimativa_custo,
        aliquota_pis_estimativa_custo: original.aliquota_pis_estimativa_custo,
        aliquota_cofins_estimativa_custo: original.aliquota_cofins_estimativa_custo,
        reducao_ii_estimativa_custo: original.reducao_ii_estimativa_custo,
        taxas_origem: {
          create: original.taxas_origem.map(t => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            id_taxa_origem_destino: t.id_taxa_origem_destino,
            nome_taxa_origem_estimativa_custo: t.nome_taxa_origem_estimativa_custo,
            moeda_taxa_origem_estimativa_custo: t.moeda_taxa_origem_estimativa_custo,
            tipo_cobranca_taxa_origem_estimativa_custo: t.tipo_cobranca_taxa_origem_estimativa_custo,
            valor_minimo_taxa_origem_estimativa_custo: t.valor_minimo_taxa_origem_estimativa_custo,
            valor_total_taxa_origem_estimativa_custo: t.valor_total_taxa_origem_estimativa_custo,
          })),
        },
        taxas_destino: {
          create: original.taxas_destino.map(t => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            id_taxa_origem_destino: t.id_taxa_origem_destino,
            nome_taxa_destino_estimativa_custo: t.nome_taxa_destino_estimativa_custo,
            moeda_taxa_destino_estimativa_custo: t.moeda_taxa_destino_estimativa_custo,
            tipo_cobranca_taxa_destino_estimativa_custo: t.tipo_cobranca_taxa_destino_estimativa_custo,
            valor_minimo_taxa_destino_estimativa_custo: t.valor_minimo_taxa_destino_estimativa_custo,
            valor_total_taxa_destino_estimativa_custo: t.valor_total_taxa_destino_estimativa_custo,
          })),
        },
        documentos: {
          create: original.documentos.map(d => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            tipo_documento_estimativa_custo: d.tipo_documento_estimativa_custo,
            numero_documento_estimativa_custo: d.numero_documento_estimativa_custo,
          })),
        },
      },
      select: selectListaEstimativaCusto,
    })

    await recalcularEPersistirEstimativaCusto(prisma, { tenantId, idWorkspace, idUsuario }, copia.id_estimativa_custo)
    const calculada = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: copia.id_estimativa_custo },
      select: selectListaEstimativaCusto,
    })

    invalidarCacheDashboardEstimativaCusto(tenantId)
    res.status(201).json({ estimativa_custo: serializarEstimativaCusto(calculada ?? copia) })
  } catch (err) { next(err) }
})

// ─── DELETE /estimativas-custo/:id_estimativa_custo ─────────────────────────────
estimativasCustoRouter.delete('/:id_estimativa_custo', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId } = exigirContexto(req)
    const existente = await prisma.estimativaCusto.findFirst({
      where: { id_estimativa_custo: req.params.id_estimativa_custo },
      select: { id_estimativa_custo: true },
    })
    if (!existente) throw new AppError('Estimativa não encontrada', 404, 'NOT_FOUND')

    await prisma.estimativaCusto.delete({ where: { id_estimativa_custo: req.params.id_estimativa_custo } })
    invalidarCacheDashboardEstimativaCusto(tenantId)
    res.json({ excluida: true })
  } catch (err) { next(err) }
})
