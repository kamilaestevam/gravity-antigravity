/**
 * simulas-custo.ts — CRUD da SimulaCusto
 * Routes: /api/v1/simula-custo/simulas-custo
 * Protegido por validarChaveInterna + tenantIsolationMiddleware (id_organizacao via header).
 */
import { Router, Response, NextFunction } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import { AppError } from '../lib/erros.js'
import type { TenantRequest } from '../middleware/isolamento-tenant.js'
import {
  CriarSimulaCustoSchema,
  AtualizarSimulaCustoSchema,
  AtualizarStatusSimulaCustoSchema,
  ListarSimulasCustoQuerySchema,
  type CriarSimulaCustoInput,
} from '../schemas/simula-custo-schema.js'
import { selectListaSimulaCusto, serializarSimulaCusto } from '../shared/select-lista-simula-custo.js'
import { invalidarCacheDashboardSimulaCusto } from '../lib/cache-dashboard-simula-custo.js'
import { executarCalculoSimulaCusto } from '../lib/motor-calculo-simula-custo.js'
import { resolverAliquotaIcmsInternaUfSimulaCusto } from '../shared/aliquotas-icms-interna-uf.js'
import { obterPtaxVendaSimulaCusto } from '../lib/taxas-moeda-client.js'
import { camposImpostosDeResultado } from '../shared/persistir-impostos-simula-custo.js'
import { serializarAnexoDocumentoSimulaCusto } from '../shared/serializar-anexo-documento-simula-custo.js'

export const simulasCustoRouter = Router()

function exigirContexto(req: TenantRequest): { prisma: PrismaClient; tenantId: string; idWorkspace: string; idUsuario: string } {
  const { prisma, tenantId, idWorkspace, idUsuario } = req
  if (!prisma || !tenantId) throw new AppError('x-id-organizacao obrigatório', 401, 'UNAUTHORIZED')
  if (!idWorkspace) throw new AppError('x-id-workspace obrigatório', 400, 'WORKSPACE_REQUIRED')
  if (!idUsuario) throw new AppError('x-id-usuario obrigatório', 400, 'USUARIO_REQUIRED')
  return { prisma, tenantId, idWorkspace, idUsuario }
}

/** Gera EST-IMP-00001/26 por organização+usuário+ano (SequenciaSimulaCusto). */
async function gerarNumeroSimulaCusto(
  prisma: PrismaClient,
  tenantId: string,
  idUsuario: string,
  tipoOperacao: string
): Promise<string> {
  const ano = new Date().getFullYear()
  const prefixo = tipoOperacao === 'IMPORTACAO' ? 'IMP' : 'EXP'
  const seq = await prisma.sequenciaSimulaCusto.upsert({
    where: {
      id_organizacao_id_usuario_ano_sequencia_simula_custo: {
        id_organizacao: tenantId,
        id_usuario: idUsuario,
        ano_sequencia_simula_custo: ano,
      },
    },
    update: { ultimo_numero_sequencia_simula_custo: { increment: 1 } },
    create: {
      id_organizacao: tenantId,
      id_usuario: idUsuario,
      ano_sequencia_simula_custo: ano,
      ultimo_numero_sequencia_simula_custo: 1,
    },
  })
  return `EST-${prefixo}-${String(seq.ultimo_numero_sequencia_simula_custo).padStart(5, '0')}/${String(ano).slice(-2)}`
}

// Nota: a Prisma extension de tenant injeta id_organizacao apenas no create de
// nível superior — nested creates precisam do campo explícito.
function montarDadosTaxasOrigem(
  dados: CriarSimulaCustoInput,
  contexto: { tenantId: string; idWorkspace: string; idUsuario: string },
) {
  return dados.taxas_origem_simula_custo.map((t) => ({
    id_organizacao: contexto.tenantId,
    id_workspace: contexto.idWorkspace,
    id_usuario: contexto.idUsuario,
    id_taxa_origem_destino: t.id_taxa_origem_destino ?? null,
    nome_taxa_origem_simula_custo: t.nome_taxa_origem_simula_custo,
    moeda_taxa_origem_simula_custo: t.moeda_taxa_origem_simula_custo,
    tipo_cobranca_taxa_origem_simula_custo: t.tipo_cobranca_taxa_origem_simula_custo,
    valor_minimo_taxa_origem_simula_custo: t.valor_minimo_taxa_origem_simula_custo,
    valor_total_taxa_origem_simula_custo: t.valor_total_taxa_origem_simula_custo,
  }))
}

function montarDadosTaxasDestino(
  dados: CriarSimulaCustoInput,
  contexto: { tenantId: string; idWorkspace: string; idUsuario: string },
) {
  return dados.taxas_destino_simula_custo.map((t) => ({
    id_organizacao: contexto.tenantId,
    id_workspace: contexto.idWorkspace,
    id_usuario: contexto.idUsuario,
    id_taxa_origem_destino: t.id_taxa_origem_destino ?? null,
    nome_taxa_destino_simula_custo: t.nome_taxa_destino_simula_custo,
    moeda_taxa_destino_simula_custo: t.moeda_taxa_destino_simula_custo,
    tipo_cobranca_taxa_destino_simula_custo: t.tipo_cobranca_taxa_destino_simula_custo,
    valor_minimo_taxa_destino_simula_custo: t.valor_minimo_taxa_destino_simula_custo,
    valor_total_taxa_destino_simula_custo: t.valor_total_taxa_destino_simula_custo,
  }))
}

/**
 * Recalcula e persiste o resultado fiscal da simula (Gravity Cloud Engine).
 * Grava base e valor por imposto nas colunas de simula_custo.
 */
async function recalcularEPersistirSimulaCusto(
  prisma: PrismaClient,
  _contexto: { tenantId: string; idWorkspace: string; idUsuario: string },
  idSimulaCusto: string
): Promise<void> {
  const e = await prisma.simulaCusto.findFirst({
    where: { id_simula_custo: idSimulaCusto },
    include: { taxas_origem_simula_custo: true, taxas_destino_simula_custo: true },
  })
  if (!e) return

  const ptaxVenda = await obterPtaxVendaSimulaCusto(e.moeda_produto_simula_custo)

  const resultado = executarCalculoSimulaCusto({
    ncm_simula_custo: e.ncm_simula_custo,
    valor_produto_simula_custo: Number(e.valor_produto_simula_custo),
    moeda_produto_simula_custo: e.moeda_produto_simula_custo,
    ptax_venda: ptaxVenda,
    valor_frete_simula_custo: Number(e.valor_frete_simula_custo),
    moeda_frete_simula_custo: e.moeda_frete_simula_custo,
    valor_seguro_simula_custo: Number(e.valor_seguro_simula_custo),
    moeda_seguro_simula_custo: e.moeda_seguro_simula_custo,
    taxas_origem_simula_custo: e.taxas_origem_simula_custo.map(t => ({
      nome_taxa_origem_simula_custo: t.nome_taxa_origem_simula_custo,
      valor_total_taxa_origem_simula_custo: Number(t.valor_total_taxa_origem_simula_custo),
      moeda_taxa_origem_simula_custo: t.moeda_taxa_origem_simula_custo,
    })),
    taxas_destino_simula_custo: e.taxas_destino_simula_custo.map(t => ({
      nome_taxa_destino_simula_custo: t.nome_taxa_destino_simula_custo,
      valor_total_taxa_destino_simula_custo: Number(t.valor_total_taxa_destino_simula_custo),
      moeda_taxa_destino_simula_custo: t.moeda_taxa_destino_simula_custo,
    })),
    uf_desembaraco_simula_custo: e.uf_desembaraco_simula_custo,
    aliquota_ii_simula_custo: Number(e.aliquota_ii_simula_custo),
    aliquota_ipi_simula_custo: Number(e.aliquota_ipi_simula_custo),
    aliquota_pis_simula_custo: Number(e.aliquota_pis_simula_custo),
    aliquota_cofins_simula_custo: Number(e.aliquota_cofins_simula_custo),
    aliquota_icms_simula_custo: Number(e.aliquota_icms_simula_custo),
    aliquota_icms_interna_uf_simula_custo:
      resolverAliquotaIcmsInternaUfSimulaCusto(e.uf_desembaraco_simula_custo)
      ?? Number(e.aliquota_icms_simula_custo),
    modalidade_recolhimento_icms_simula_custo: e.modalidade_recolhimento_icms_simula_custo,
    reducao_ii_simula_custo: Number(e.reducao_ii_simula_custo),
  })

  await prisma.simulaCusto.update({
    where: { id_simula_custo: idSimulaCusto },
    data: {
      ptax_utilizada_simula_custo: ptaxVenda,
      valor_aduaneiro_simula_custo: resultado.valor_aduaneiro_brl,
      total_tributos_simula_custo: resultado.total_tributos_brl,
      custo_nacionalizado_brl_simula_custo: resultado.custo_nacionalizado_brl,
      fonte_calculo_simula_custo: 'gravity-engine',
      ...camposImpostosDeResultado(resultado),
    },
  })
}

// ─── POST /simulas-custo ────────────────────────────────────────────────────
simulasCustoRouter.post('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarSimulaCustoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados inválidos: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }
    const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
    const dados = parsed.data

    const numero = dados.numero_manual_simula_custo?.trim()
      || await gerarNumeroSimulaCusto(prisma, tenantId, idUsuario, dados.tipo_operacao_simula_custo)

    const simula = await prisma.simulaCusto.create({
      data: {
        // id_organizacao também é injetado pelo withTenantIsolation; explícito
        // aqui para satisfazer o tipo CreateInput do Prisma.
        id_organizacao: tenantId,
        id_workspace: idWorkspace,
        id_usuario: idUsuario,
        numero_simula_custo: numero,
        referencia_simula_custo: dados.referencia_simula_custo ?? null,
        tipo_operacao_simula_custo: dados.tipo_operacao_simula_custo,
        detalhe_operacao_simula_custo: dados.detalhe_operacao_simula_custo,
        status_simula_custo: 'EM_CRIACAO',
        ncm_simula_custo: dados.ncm_simula_custo,
        descricao_ncm_simula_custo: dados.descricao_ncm_simula_custo ?? null,
        incoterm_simula_custo: dados.incoterm_simula_custo,
        quantidade_simula_custo: dados.quantidade_simula_custo,
        moeda_produto_simula_custo: dados.moeda_produto_simula_custo,
        valor_produto_simula_custo: dados.valor_produto_simula_custo,
        moeda_frete_simula_custo: dados.moeda_frete_simula_custo,
        valor_frete_simula_custo: dados.valor_frete_simula_custo,
        enviar_solicitacao_cotacao_frete_simula_custo: dados.enviar_solicitacao_cotacao_frete_simula_custo,
        moeda_seguro_simula_custo: dados.moeda_seguro_simula_custo,
        valor_seguro_simula_custo: dados.valor_seguro_simula_custo,
        uf_desembaraco_simula_custo: dados.uf_desembaraco_simula_custo,
        modalidade_recolhimento_icms_simula_custo: dados.modalidade_recolhimento_icms_simula_custo,
        aliquota_icms_simula_custo: dados.aliquota_icms_simula_custo,
        usa_beneficio_simula_custo: dados.modalidade_recolhimento_icms_simula_custo === 'ISENTO'
          || dados.usa_beneficio_simula_custo,
        aliquota_ii_simula_custo: dados.aliquota_ii_simula_custo,
        aliquota_ipi_simula_custo: dados.aliquota_ipi_simula_custo,
        aliquota_pis_simula_custo: dados.aliquota_pis_simula_custo,
        aliquota_cofins_simula_custo: dados.aliquota_cofins_simula_custo,
        reducao_ii_simula_custo: dados.reducao_ii_simula_custo,
        taxas_origem_simula_custo: { create: montarDadosTaxasOrigem(dados, { tenantId, idWorkspace, idUsuario }) as never },
        taxas_destino_simula_custo: { create: montarDadosTaxasDestino(dados, { tenantId, idWorkspace, idUsuario }) as never },
        documentos_simula_custo: {
          create: dados.documentos_simula_custo.map((d) => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            tipo_documento_simula_custo: d.tipo_documento_simula_custo,
            numero_documento_simula_custo: d.numero_documento_simula_custo,
          })),
        },
        prazos_pagamento_simula_custo: {
          create: dados.prazos_pagamento_simula_custo.map((p, ordem) => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            valor_prazo_pagamento_simula_custo: p.valor_prazo_pagamento_simula_custo,
            tipo_valor_prazo_pagamento_simula_custo: p.tipo_valor_prazo_pagamento_simula_custo,
            momento_prazo_pagamento_simula_custo: p.momento_prazo_pagamento_simula_custo,
            dias_prazo_pagamento_simula_custo: p.dias_prazo_pagamento_simula_custo,
            fato_gerador_prazo_pagamento_simula_custo: p.fato_gerador_prazo_pagamento_simula_custo,
            ordem_prazo_pagamento_simula_custo: ordem,
          })),
        },
      },
      select: selectListaSimulaCusto,
    })

    await recalcularEPersistirSimulaCusto(prisma, { tenantId, idWorkspace, idUsuario }, simula.id_simula_custo)
    const calculada = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: simula.id_simula_custo },
      select: selectListaSimulaCusto,
    })

    invalidarCacheDashboardSimulaCusto(tenantId)
    res.status(201).json({
      simula_custo: serializarSimulaCusto(calculada ?? simula),
    })
  } catch (err) { next(err) }
})

// ─── GET /simulas-custo ─────────────────────────────────────────────────────
simulasCustoRouter.get('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirContexto(req)
    const query = ListarSimulasCustoQuerySchema.parse(req.query)

    const where: Prisma.SimulaCustoWhereInput = {}
    if (query.busca) {
      where.OR = [
        { numero_simula_custo: { contains: query.busca, mode: 'insensitive' } },
        { referencia_simula_custo: { contains: query.busca, mode: 'insensitive' } },
        { ncm_simula_custo: { contains: query.busca } },
        { descricao_ncm_simula_custo: { contains: query.busca, mode: 'insensitive' } },
      ]
    }
    if (query.status) where.status_simula_custo = query.status

    const skip = (query.pagina - 1) * query.limite
    const [linhas, total] = await Promise.all([
      prisma.simulaCusto.findMany({
        where,
        orderBy: { [query.ordenar_por]: query.direcao },
        skip,
        take: query.limite,
        select: selectListaSimulaCusto,
      }),
      prisma.simulaCusto.count({ where }),
    ])

    res.json({
      simulas_custo: linhas.map(serializarSimulaCusto),
      paginacao: { pagina: query.pagina, limite: query.limite, total, paginas: Math.ceil(total / query.limite) },
    })
  } catch (err) { next(err) }
})

// ─── GET /simulas-custo/kpis ────────────────────────────────────────────────
simulasCustoRouter.get('/kpis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirContexto(req)
    const [total, emCriacao, criadas, arquivadas, aggCusto, aggTributos] = await Promise.all([
      prisma.simulaCusto.count(),
      prisma.simulaCusto.count({ where: { status_simula_custo: 'EM_CRIACAO' } }),
      prisma.simulaCusto.count({ where: { status_simula_custo: 'CRIADA' } }),
      prisma.simulaCusto.count({ where: { status_simula_custo: 'ARQUIVADA' } }),
      prisma.simulaCusto.aggregate({ _avg: { custo_nacionalizado_brl_simula_custo: true } }),
      prisma.simulaCusto.aggregate({ _sum: { total_tributos_simula_custo: true } }),
    ])
    res.json({
      total,
      em_criacao: emCriacao,
      criadas,
      arquivadas,
      custo_nacionalizado_medio_brl: aggCusto._avg.custo_nacionalizado_brl_simula_custo
        ? Number(aggCusto._avg.custo_nacionalizado_brl_simula_custo) : 0,
      total_tributos_acumulado_brl: aggTributos._sum.total_tributos_simula_custo
        ? Number(aggTributos._sum.total_tributos_simula_custo) : 0,
    })
  } catch (err) { next(err) }
})

// ─── GET /simulas-custo/:id_simula_custo ────────────────────────────────
simulasCustoRouter.get('/:id_simula_custo', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirContexto(req)
    const simula = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: req.params.id_simula_custo },
      include: {
        taxas_origem_simula_custo: true,
        taxas_destino_simula_custo: true,
        documentos_simula_custo: { include: { anexos_documento_simula_custo: true } },
        prazos_pagamento_simula_custo: true,
      },
    })
    if (!simula) throw new AppError('Simula não encontrada', 404, 'NOT_FOUND')

    const { taxas_origem_simula_custo, taxas_destino_simula_custo, documentos_simula_custo, prazos_pagamento_simula_custo, ...linha } = simula
    res.json({
      simula_custo: {
        ...serializarSimulaCusto(linha),
        taxas_origem_simula_custo: taxas_origem_simula_custo.map(t => ({
          id_taxa_origem_simula_custo: t.id_taxa_origem_simula_custo,
          id_taxa_origem_destino: t.id_taxa_origem_destino,
          nome_taxa_origem_simula_custo: t.nome_taxa_origem_simula_custo,
          moeda_taxa_origem_simula_custo: t.moeda_taxa_origem_simula_custo,
          tipo_cobranca_taxa_origem_simula_custo: t.tipo_cobranca_taxa_origem_simula_custo,
          valor_minimo_taxa_origem_simula_custo: Number(t.valor_minimo_taxa_origem_simula_custo),
          valor_total_taxa_origem_simula_custo: Number(t.valor_total_taxa_origem_simula_custo),
        })),
        taxas_destino_simula_custo: taxas_destino_simula_custo.map(t => ({
          id_taxa_destino_simula_custo: t.id_taxa_destino_simula_custo,
          id_taxa_origem_destino: t.id_taxa_origem_destino,
          nome_taxa_destino_simula_custo: t.nome_taxa_destino_simula_custo,
          moeda_taxa_destino_simula_custo: t.moeda_taxa_destino_simula_custo,
          tipo_cobranca_taxa_destino_simula_custo: t.tipo_cobranca_taxa_destino_simula_custo,
          valor_minimo_taxa_destino_simula_custo: Number(t.valor_minimo_taxa_destino_simula_custo),
          valor_total_taxa_destino_simula_custo: Number(t.valor_total_taxa_destino_simula_custo),
        })),
        documentos_simula_custo: documentos_simula_custo.map(d => ({
          id_documento_simula_custo: d.id_documento_simula_custo,
          tipo_documento_simula_custo: d.tipo_documento_simula_custo,
          numero_documento_simula_custo: d.numero_documento_simula_custo,
          anexos_documento_simula_custo: ('anexos_documento_simula_custo' in d && Array.isArray(d.anexos_documento_simula_custo))
            ? d.anexos_documento_simula_custo.map(serializarAnexoDocumentoSimulaCusto)
            : [],
        })),
        prazos_pagamento_simula_custo: prazos_pagamento_simula_custo
          .slice()
          .sort((a, b) => a.ordem_prazo_pagamento_simula_custo - b.ordem_prazo_pagamento_simula_custo)
          .map((p) => ({
            id_prazo_pagamento_simula_custo: p.id_prazo_pagamento_simula_custo,
            valor_prazo_pagamento_simula_custo: Number(p.valor_prazo_pagamento_simula_custo),
            tipo_valor_prazo_pagamento_simula_custo: p.tipo_valor_prazo_pagamento_simula_custo,
            momento_prazo_pagamento_simula_custo: p.momento_prazo_pagamento_simula_custo,
            dias_prazo_pagamento_simula_custo: p.dias_prazo_pagamento_simula_custo,
            fato_gerador_prazo_pagamento_simula_custo: p.fato_gerador_prazo_pagamento_simula_custo,
            ordem_prazo_pagamento_simula_custo: p.ordem_prazo_pagamento_simula_custo,
          })),
      },
    })
  } catch (err) { next(err) }
})

// ─── PUT /simulas-custo/:id_simula_custo ────────────────────────────────
simulasCustoRouter.put('/:id_simula_custo', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarSimulaCustoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados inválidos: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }
    const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
    const dados = parsed.data

    const existente = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: req.params.id_simula_custo },
      select: { id_simula_custo: true },
    })
    if (!existente) throw new AppError('Simula não encontrada', 404, 'NOT_FOUND')

    const dataUpdate: Prisma.SimulaCustoUpdateInput = {}
    const camposEscalares = [
      'referencia_simula_custo', 'tipo_operacao_simula_custo', 'detalhe_operacao_simula_custo',
      'ncm_simula_custo', 'descricao_ncm_simula_custo', 'incoterm_simula_custo',
      'quantidade_simula_custo', 'moeda_produto_simula_custo', 'valor_produto_simula_custo',
      'moeda_frete_simula_custo', 'valor_frete_simula_custo',
      'enviar_solicitacao_cotacao_frete_simula_custo',
      'moeda_seguro_simula_custo', 'valor_seguro_simula_custo',
      'uf_desembaraco_simula_custo', 'modalidade_recolhimento_icms_simula_custo',
      'aliquota_icms_simula_custo', 'usa_beneficio_simula_custo',
      'aliquota_ii_simula_custo', 'aliquota_ipi_simula_custo',
      'aliquota_pis_simula_custo', 'aliquota_cofins_simula_custo', 'reducao_ii_simula_custo',
    ] as const
    for (const campo of camposEscalares) {
      if (dados[campo] !== undefined) (dataUpdate as Record<string, unknown>)[campo] = dados[campo]
    }

    // Taxas: substituição completa quando enviadas (padrão replace-all do formulário)
    if (dados.taxas_origem_simula_custo !== undefined) {
      dataUpdate.taxas_origem_simula_custo = {
        deleteMany: {},
        create: montarDadosTaxasOrigem(dados as CriarSimulaCustoInput, { tenantId, idWorkspace, idUsuario }) as never,
      }
    }
    if (dados.taxas_destino_simula_custo !== undefined) {
      dataUpdate.taxas_destino_simula_custo = {
        deleteMany: {},
        create: montarDadosTaxasDestino(dados as CriarSimulaCustoInput, { tenantId, idWorkspace, idUsuario }) as never,
      }
    }
    if (dados.documentos_simula_custo !== undefined) {
      dataUpdate.documentos_simula_custo = {
        deleteMany: {},
        create: dados.documentos_simula_custo.map((d) => ({
          id_organizacao: tenantId,
          id_workspace: idWorkspace,
          id_usuario: idUsuario,
          tipo_documento_simula_custo: d.tipo_documento_simula_custo,
          numero_documento_simula_custo: d.numero_documento_simula_custo,
        })),
      }
    }
    if (dados.prazos_pagamento_simula_custo !== undefined) {
      dataUpdate.prazos_pagamento_simula_custo = {
        deleteMany: {},
        create: dados.prazos_pagamento_simula_custo.map((p, ordem) => ({
          id_organizacao: tenantId,
          id_workspace: idWorkspace,
          id_usuario: idUsuario,
          valor_prazo_pagamento_simula_custo: p.valor_prazo_pagamento_simula_custo,
          tipo_valor_prazo_pagamento_simula_custo: p.tipo_valor_prazo_pagamento_simula_custo,
          momento_prazo_pagamento_simula_custo: p.momento_prazo_pagamento_simula_custo,
          dias_prazo_pagamento_simula_custo: p.dias_prazo_pagamento_simula_custo,
          fato_gerador_prazo_pagamento_simula_custo: p.fato_gerador_prazo_pagamento_simula_custo,
          ordem_prazo_pagamento_simula_custo: ordem,
        })),
      }
    }

    const atualizada = await prisma.simulaCusto.update({
      where: { id_simula_custo: req.params.id_simula_custo },
      data: dataUpdate,
      select: selectListaSimulaCusto,
    })

    await recalcularEPersistirSimulaCusto(prisma, { tenantId, idWorkspace, idUsuario }, atualizada.id_simula_custo)
    const recalculada = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: atualizada.id_simula_custo },
      select: selectListaSimulaCusto,
    })

    invalidarCacheDashboardSimulaCusto(tenantId)
    res.json({ simula_custo: serializarSimulaCusto(recalculada ?? atualizada) })
  } catch (err) { next(err) }
})

// ─── PATCH /simulas-custo/:id_simula_custo/status ──────────────────────
simulasCustoRouter.patch('/:id_simula_custo/status', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarStatusSimulaCustoSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Status inválido', 400, 'VALIDATION_ERROR')
    const { prisma, tenantId } = exigirContexto(req)

    const existente = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: req.params.id_simula_custo },
      select: { id_simula_custo: true },
    })
    if (!existente) throw new AppError('Simula não encontrada', 404, 'NOT_FOUND')

    const atualizada = await prisma.simulaCusto.update({
      where: { id_simula_custo: req.params.id_simula_custo },
      data: { status_simula_custo: parsed.data.status_simula_custo },
      select: selectListaSimulaCusto,
    })

    invalidarCacheDashboardSimulaCusto(tenantId)
    res.json({ simula_custo: serializarSimulaCusto(atualizada) })
  } catch (err) { next(err) }
})

// ─── POST /simulas-custo/:id_simula_custo/duplicar ─────────────────────
simulasCustoRouter.post('/:id_simula_custo/duplicar', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
    const original = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: req.params.id_simula_custo },
      include: {
        taxas_origem_simula_custo: true,
        taxas_destino_simula_custo: true,
        documentos_simula_custo: { include: { anexos_documento_simula_custo: true } },
        prazos_pagamento_simula_custo: true,
      },
    })
    if (!original) throw new AppError('Simula original não encontrada', 404, 'NOT_FOUND')

    const numero = await gerarNumeroSimulaCusto(prisma, tenantId, idUsuario, original.tipo_operacao_simula_custo)

    const copia = await prisma.simulaCusto.create({
      data: {
        id_organizacao: tenantId,
        id_workspace: idWorkspace,
        id_usuario: idUsuario,
        numero_simula_custo: numero,
        referencia_simula_custo: original.referencia_simula_custo
          ? `${original.referencia_simula_custo} (cópia)` : null,
        tipo_operacao_simula_custo: original.tipo_operacao_simula_custo,
        detalhe_operacao_simula_custo: original.detalhe_operacao_simula_custo,
        status_simula_custo: 'EM_CRIACAO',
        ncm_simula_custo: original.ncm_simula_custo,
        descricao_ncm_simula_custo: original.descricao_ncm_simula_custo,
        incoterm_simula_custo: original.incoterm_simula_custo,
        quantidade_simula_custo: original.quantidade_simula_custo,
        moeda_produto_simula_custo: original.moeda_produto_simula_custo,
        valor_produto_simula_custo: original.valor_produto_simula_custo,
        moeda_frete_simula_custo: original.moeda_frete_simula_custo,
        valor_frete_simula_custo: original.valor_frete_simula_custo,
        enviar_solicitacao_cotacao_frete_simula_custo: original.enviar_solicitacao_cotacao_frete_simula_custo,
        moeda_seguro_simula_custo: original.moeda_seguro_simula_custo,
        valor_seguro_simula_custo: original.valor_seguro_simula_custo,
        uf_desembaraco_simula_custo: original.uf_desembaraco_simula_custo,
        modalidade_recolhimento_icms_simula_custo: original.modalidade_recolhimento_icms_simula_custo,
        aliquota_icms_simula_custo: original.aliquota_icms_simula_custo,
        usa_beneficio_simula_custo: original.usa_beneficio_simula_custo,
        aliquota_ii_simula_custo: original.aliquota_ii_simula_custo,
        aliquota_ipi_simula_custo: original.aliquota_ipi_simula_custo,
        aliquota_pis_simula_custo: original.aliquota_pis_simula_custo,
        aliquota_cofins_simula_custo: original.aliquota_cofins_simula_custo,
        reducao_ii_simula_custo: original.reducao_ii_simula_custo,
        taxas_origem_simula_custo: {
          create: original.taxas_origem_simula_custo.map(t => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            id_taxa_origem_destino: t.id_taxa_origem_destino,
            nome_taxa_origem_simula_custo: t.nome_taxa_origem_simula_custo,
            moeda_taxa_origem_simula_custo: t.moeda_taxa_origem_simula_custo,
            tipo_cobranca_taxa_origem_simula_custo: t.tipo_cobranca_taxa_origem_simula_custo,
            valor_minimo_taxa_origem_simula_custo: t.valor_minimo_taxa_origem_simula_custo,
            valor_total_taxa_origem_simula_custo: t.valor_total_taxa_origem_simula_custo,
          })),
        },
        taxas_destino_simula_custo: {
          create: original.taxas_destino_simula_custo.map(t => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            id_taxa_origem_destino: t.id_taxa_origem_destino,
            nome_taxa_destino_simula_custo: t.nome_taxa_destino_simula_custo,
            moeda_taxa_destino_simula_custo: t.moeda_taxa_destino_simula_custo,
            tipo_cobranca_taxa_destino_simula_custo: t.tipo_cobranca_taxa_destino_simula_custo,
            valor_minimo_taxa_destino_simula_custo: t.valor_minimo_taxa_destino_simula_custo,
            valor_total_taxa_destino_simula_custo: t.valor_total_taxa_destino_simula_custo,
          })),
        },
        documentos_simula_custo: {
          create: original.documentos_simula_custo.map(d => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            tipo_documento_simula_custo: d.tipo_documento_simula_custo,
            numero_documento_simula_custo: d.numero_documento_simula_custo,
          })),
        },
        prazos_pagamento_simula_custo: {
          create: original.prazos_pagamento_simula_custo.map((p) => ({
            id_organizacao: tenantId,
            id_workspace: idWorkspace,
            id_usuario: idUsuario,
            valor_prazo_pagamento_simula_custo: p.valor_prazo_pagamento_simula_custo,
            tipo_valor_prazo_pagamento_simula_custo: p.tipo_valor_prazo_pagamento_simula_custo,
            momento_prazo_pagamento_simula_custo: p.momento_prazo_pagamento_simula_custo,
            dias_prazo_pagamento_simula_custo: p.dias_prazo_pagamento_simula_custo,
            fato_gerador_prazo_pagamento_simula_custo: p.fato_gerador_prazo_pagamento_simula_custo,
            ordem_prazo_pagamento_simula_custo: p.ordem_prazo_pagamento_simula_custo,
          })),
        },
      },
      select: selectListaSimulaCusto,
    })

    await recalcularEPersistirSimulaCusto(prisma, { tenantId, idWorkspace, idUsuario }, copia.id_simula_custo)
    const calculada = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: copia.id_simula_custo },
      select: selectListaSimulaCusto,
    })

    invalidarCacheDashboardSimulaCusto(tenantId)
    res.status(201).json({ simula_custo: serializarSimulaCusto(calculada ?? copia) })
  } catch (err) { next(err) }
})

// ─── DELETE /simulas-custo/:id_simula_custo ─────────────────────────────
simulasCustoRouter.delete('/:id_simula_custo', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId } = exigirContexto(req)
    const existente = await prisma.simulaCusto.findFirst({
      where: { id_simula_custo: req.params.id_simula_custo },
      select: { id_simula_custo: true },
    })
    if (!existente) throw new AppError('Simula não encontrada', 404, 'NOT_FOUND')

    await prisma.simulaCusto.delete({ where: { id_simula_custo: req.params.id_simula_custo } })
    invalidarCacheDashboardSimulaCusto(tenantId)
    res.json({ excluida: true })
  } catch (err) { next(err) }
})
