/**
 * lpcoPortal.ts — Rotas de integracao com Portal Unico Siscomex
 *
 * POST   /:id/portal/registrar    — Registrar LPCO no Portal Unico
 * GET    /:id/portal/sincronizar  — Sincronizar status do Portal → Gravity
 * POST   /:id/portal/retificar    — Retificar LPCO no Portal
 * POST   /:id/portal/cancelar     — Cancelar LPCO no Portal
 * POST   /:id/portal/exigencia/:exId/responder — Responder exigencia no Portal
 * POST   /:id/portal/anexar       — Anexar documento no Portal
 * POST   /portal/webhook          — Receber eventos do Portal Unico (webhooks)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { PortalUnicoAdapter } from '../connectors/portalUnicoAdapter.js'
import type { RegistrarLpcoPayload } from '../connectors/portalUnicoAdapter.js'
import { AppError, transitarStatus } from '../services/lpcoStatusEngine.js'
import { z } from 'zod'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    userId: (req as Record<string, unknown>).userId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

function getAdapter(prisma: PrismaClient): PortalUnicoAdapter {
  return new PortalUnicoAdapter(prisma)
}

// ── POST /:id/portal/registrar — Registrar LPCO no Portal Unico ─────────────

router.post('/:id/portal/registrar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const adapter = getAdapter(prisma)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
      include: { itens: true },
    })

    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')

    if (lpco.status !== 'para_analise') {
      throw new AppError(
        'LPCO deve estar com status para_analise para registrar no Portal',
        422,
        'STATUS_INVALIDO'
      )
    }

    // Montar payload no formato do Portal Unico
    const payload: RegistrarLpcoPayload = {
      tipoOperacao: lpco.tipo_operacao as 'IMPORTACAO' | 'EXPORTACAO',
      tipoLpco: lpco.tipo_lpco,
      orgaoAnuente: lpco.orgao_anuente,
      modeloLpco: lpco.modelo_lpco,
      paisProcedencia: lpco.pais_procedencia,
      fundamentoLegal: lpco.fundamento_legal,
      unidadeEntrada: lpco.unidade_entrada ?? undefined,
      recintoArmazenamento: lpco.recinto_armazenamento ?? undefined,
      condicaoMercadoria: lpco.condicao_mercadoria ?? undefined,
      importacaoExportadorId: lpco.importacao_exportador_id ?? undefined,
      exportacaoImportadorId: lpco.exportacao_importador_id ?? undefined,
      itens: lpco.itens.map(item => ({
        ncm: item.ncm,
        catalogoProdutoId: item.catalogo_produto_id ?? undefined,
        descricaoProduto: item.descricao_produto,
        fabricante: item.fabricante ?? undefined,
        quantidadeEstatistica: Number(item.quantidade_estatistica),
        unidadeMedida: item.unidade_medida,
        pesoLiquido: Number(item.peso_liquido),
        vmle: Number(item.vmle),
        moeda: item.moeda,
        condicaoVenda: item.condicao_venda ?? undefined,
        atributos: item.atributos
          ? (item.atributos as Array<{ codigo: string; valor: string | number | boolean }>)
          : undefined,
      })),
    }

    // Chamar Portal Unico
    const resultado = await adapter.registrar(
      tenantId,
      lpco.company_id,
      lpco.tipo_operacao,
      payload
    )

    // Atualizar LPCO com numero do Portal
    await prisma.lpco.update({
      where: { id: req.params.id },
      data: {
        numero_portal: resultado.numero,
        data_registro: new Date(resultado.dataCriacao),
        updated_by: userId,
      },
    })

    // Registrar no historico
    await prisma.lpcoHistorico.create({
      data: {
        tenant_id: tenantId,
        company_id: lpco.company_id,
        product_id: 'lpco',
        user_id: userId,
        lpco_id: req.params.id,
        evento: 'registro_portal_unico',
        descricao: `LPCO registrado no Portal Unico com numero ${resultado.numero}`,
        dados_extras: { numero_portal: resultado.numero, situacao: resultado.situacao },
      },
    })

    const updated = await prisma.lpco.findFirst({
      where: { id: req.params.id },
      include: { itens: true },
    })

    res.json({ lpco: updated, portal: resultado })
  } catch (err) { next(err) }
})

// ── GET /:id/portal/sincronizar — Sincronizar status do Portal → Gravity ────

router.get('/:id/portal/sincronizar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const adapter = getAdapter(prisma)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })

    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    if (!lpco.numero_portal) {
      throw new AppError('LPCO nao possui numero do Portal Unico', 422, 'SEM_NUMERO_PORTAL')
    }

    // Consultar Portal Unico
    const portalData = await adapter.consultar(
      tenantId,
      lpco.company_id,
      lpco.tipo_operacao,
      lpco.numero_portal
    )

    // Mapear situacao do Portal → status Gravity
    const statusMap: Record<string, string> = {
      REGISTRADA: 'para_analise',
      EM_ANALISE: 'em_analise',
      EM_EXIGENCIA: 'em_exigencia',
      DEFERIDA: 'deferida',
      INDEFERIDA: 'indeferida',
      CANCELADA: 'cancelada',
    }

    const novoStatus = statusMap[portalData.situacao]
    const mudouStatus = novoStatus && novoStatus !== lpco.status

    // Atualizar dados de vigencia e saldo se deferida
    const updateData: Record<string, unknown> = { updated_by: userId }

    if (portalData.dataDeferimento) {
      updateData.data_deferimento = new Date(portalData.dataDeferimento)
    }
    if (portalData.dataVigenciaInicio) {
      updateData.data_vigencia_inicio = new Date(portalData.dataVigenciaInicio)
    }
    if (portalData.dataVigenciaFim) {
      updateData.data_vigencia_fim = new Date(portalData.dataVigenciaFim)
    }
    if (portalData.quantidadeDeferida != null) {
      updateData.quantidade_deferida = portalData.quantidadeDeferida
    }
    if (portalData.unidadeMedida) {
      updateData.unidade_medida_saldo = portalData.unidadeMedida
    }

    await prisma.lpco.update({
      where: { id: req.params.id },
      data: updateData,
    })

    // Transitar status se mudou
    if (mudouStatus) {
      await transitarStatus({
        prisma,
        lpcoId: req.params.id,
        tenantId,
        companyId: lpco.company_id,
        statusNovo: novoStatus as 'em_analise' | 'deferida' | 'indeferida' | 'cancelada' | 'em_exigencia',
        userId: 'sistema',
        userNome: 'Portal Unico (Sync)',
        descricao: `Status sincronizado do Portal Unico: ${portalData.situacao}`,
        dadosExtras: { situacao_portal: portalData.situacao },
      })
    }

    // Sincronizar exigencias recebidas do Portal
    if (portalData.exigencias?.length > 0) {
      for (const exPortal of portalData.exigencias) {
        const existente = await prisma.lpcoExigencia.findFirst({
          where: {
            lpco_id: req.params.id,
            tenant_id: tenantId,
            numero_exigencia: exPortal.numero,
          },
        })

        if (!existente) {
          const count = await prisma.lpcoExigencia.count({ where: { tenant_id: tenantId } })
          const { gerarId, PREFIXOS } = await import('../lib/idGenerator.js')

          await prisma.lpcoExigencia.create({
            data: {
              id: gerarId(PREFIXOS.EXIGENCIA, count + 1),
              tenant_id: tenantId,
              company_id: lpco.company_id,
              product_id: 'lpco',
              user_id: 'sistema',
              lpco_id: req.params.id,
              numero_exigencia: exPortal.numero,
              descricao_exigencia: exPortal.descricao,
              data_exigencia: new Date(exPortal.dataExigencia),
              prazo_resposta: exPortal.prazoResposta ? new Date(exPortal.prazoResposta) : null,
              status: 'pendente',
            },
          })
        }
      }
    }

    const updated = await prisma.lpco.findFirst({
      where: { id: req.params.id },
      include: { itens: true, exigencias: true, vinculos: true },
    })

    res.json({
      lpco: updated,
      portal: portalData,
      sincronizado: true,
      status_alterado: mudouStatus,
    })
  } catch (err) { next(err) }
})

// ── POST /:id/portal/retificar — Retificar LPCO no Portal ───────────────────

router.post('/:id/portal/retificar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const adapter = getAdapter(prisma)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
      include: { itens: true },
    })

    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    if (!lpco.numero_portal) throw new AppError('LPCO sem numero do Portal', 422, 'SEM_NUMERO_PORTAL')

    const resultado = await adapter.retificar(
      tenantId,
      lpco.company_id,
      lpco.tipo_operacao,
      lpco.numero_portal,
      req.body
    )

    await prisma.lpcoHistorico.create({
      data: {
        tenant_id: tenantId,
        company_id: lpco.company_id,
        product_id: 'lpco',
        user_id: userId,
        lpco_id: req.params.id,
        evento: 'retificacao_portal',
        descricao: `LPCO retificado no Portal Unico`,
        dados_extras: { resultado },
      },
    })

    res.json({ sucesso: true, portal: resultado })
  } catch (err) { next(err) }
})

// ── POST /:id/portal/cancelar — Cancelar LPCO no Portal ─────────────────────

router.post('/:id/portal/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const adapter = getAdapter(prisma)

    const motivoSchema = z.object({ motivo: z.string().min(1).max(1000) })
    const { motivo } = motivoSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })

    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    if (!lpco.numero_portal) throw new AppError('LPCO sem numero do Portal', 422, 'SEM_NUMERO_PORTAL')

    await adapter.cancelar(tenantId, lpco.company_id, lpco.tipo_operacao, lpco.numero_portal, motivo)

    // Transitar status localmente tambem
    await transitarStatus({
      prisma,
      lpcoId: req.params.id,
      tenantId,
      companyId: lpco.company_id,
      statusNovo: 'cancelada',
      userId,
      descricao: `Cancelamento via Portal Unico: ${motivo}`,
    })

    const updated = await prisma.lpco.findFirst({ where: { id: req.params.id } })
    res.json({ sucesso: true, lpco: updated })
  } catch (err) { next(err) }
})

// ── POST /:id/portal/exigencia/:exId/responder — Responder exigencia no Portal

router.post('/:id/portal/exigencia/:exId/responder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const adapter = getAdapter(prisma)

    const respostaSchema = z.object({ resposta: z.string().min(1).max(5000) })
    const { resposta } = respostaSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    if (!lpco.numero_portal) throw new AppError('LPCO sem numero do Portal', 422, 'SEM_NUMERO_PORTAL')

    const exigencia = await prisma.lpcoExigencia.findFirst({
      where: { id: req.params.exId, lpco_id: req.params.id, tenant_id: tenantId },
    })
    if (!exigencia) throw new AppError('Exigencia nao encontrada', 404, 'NOT_FOUND')

    // Enviar resposta ao Portal Unico
    await adapter.responderExigencia(
      tenantId,
      lpco.company_id,
      lpco.tipo_operacao,
      lpco.numero_portal,
      String(exigencia.numero_exigencia),
      resposta
    )

    // Atualizar localmente
    await prisma.lpcoExigencia.update({
      where: { id: req.params.exId },
      data: {
        resposta,
        data_resposta: new Date(),
        respondido_por: userId,
        status: 'respondida',
      },
    })

    // Verificar se todas foram respondidas
    const pendentes = await prisma.lpcoExigencia.count({
      where: { lpco_id: req.params.id, tenant_id: tenantId, status: 'pendente' },
    })

    if (pendentes === 0 && lpco.status === 'em_exigencia') {
      await transitarStatus({
        prisma,
        lpcoId: req.params.id,
        tenantId,
        companyId: lpco.company_id,
        statusNovo: 'resposta_exigencia',
        userId,
        descricao: 'Todas as exigencias respondidas via Portal Unico',
      })
    }

    res.json({ sucesso: true })
  } catch (err) { next(err) }
})

// ── POST /portal/webhook — Receber eventos do Portal Unico (webhooks) ────────

const WebhookPayloadSchema = z.object({
  evento: z.string(),
  numero: z.string(),
  tipoOperacao: z.string(),
  situacao: z.string().optional(),
  dados: z.record(z.unknown()).optional(),
})

router.post('/portal/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const payload = WebhookPayloadSchema.parse(req.body)

    // Buscar LPCO pelo numero do Portal
    const lpco = await prisma.lpco.findFirst({
      where: { numero_portal: payload.numero, tenant_id: tenantId },
    })

    if (!lpco) {
      // LPCO nao encontrado — logar mas nao falhar (webhook nao deve retornar erro)
      console.error(`[Webhook] LPCO nao encontrado para numero ${payload.numero}`)
      res.json({ recebido: true, processado: false, motivo: 'LPCO nao encontrado' })
      return
    }

    // Mapear evento do Portal para acao no Gravity
    const eventMap: Record<string, string> = {
      'talp-registro-lpco': 'para_analise',
      'talp-inicio-analise': 'em_analise',
      'talp-deferimento': 'deferida',
      'talp-indeferimento': 'indeferida',
      'talp-exigencia': 'em_exigencia',
      'talp-resposta-exig': 'resposta_exigencia',
      'talp-cancelamento': 'cancelada',
    }

    const novoStatus = eventMap[payload.evento] ?? payload.situacao?.toLowerCase()
    let statusAlterado = false

    if (novoStatus && novoStatus !== lpco.status) {
      try {
        await transitarStatus({
          prisma,
          lpcoId: lpco.id,
          tenantId,
          companyId: lpco.company_id,
          statusNovo: novoStatus as Parameters<typeof transitarStatus>[0]['statusNovo'],
          userId: 'portal-webhook',
          userNome: 'Portal Unico (Webhook)',
          descricao: `Evento ${payload.evento} recebido do Portal Unico`,
          dadosExtras: payload.dados,
        })
        statusAlterado = true
      } catch (err) {
        console.error(`[Webhook] Falha ao transitar status: ${err instanceof Error ? err.message : err}`)
      }
    }

    // Registrar evento no historico (independente de transicao)
    await prisma.lpcoHistorico.create({
      data: {
        tenant_id: tenantId,
        company_id: lpco.company_id,
        product_id: 'lpco',
        user_id: 'portal-webhook',
        lpco_id: lpco.id,
        evento: `webhook_${payload.evento}`,
        status_anterior: lpco.status,
        status_novo: novoStatus ?? lpco.status,
        descricao: `Webhook recebido: ${payload.evento}`,
        dados_extras: payload.dados ?? { numero: payload.numero },
      },
    })

    res.json({ recebido: true, processado: true, status_alterado: statusAlterado })
  } catch (err) { next(err) }
})

export { router as lpcoPortalRouter }
