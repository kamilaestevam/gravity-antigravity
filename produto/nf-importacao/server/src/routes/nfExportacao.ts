/**
 * nfExportacao.ts — Rotas de exportacao de NF (gerar arquivo, preview)
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError, transitarStatus, type NfStatus } from '../services/nfStatusEngine.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-company-id'] as string || '',
  }
}

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const ExportarSchema = z.object({
  formato: z.enum(['TOTVS_PROTHEUS', 'SAP', 'SENIOR', 'CSV', 'XML', 'JSON', 'CUSTOM']),
  layout_id: z.string().optional(),
})

// ── Helpers ─────────────────────────────────────────────────────────────────

async function findNfForExport(prisma: PrismaClient, nfId: string, tenantId: string, companyId: string) {
  const where: Record<string, unknown> = { id: nfId, tenant_id: tenantId }
  if (companyId) where.company_id = companyId

  const nf = await prisma.nfImportacao.findFirst({
    where,
    include: {
      itens: { orderBy: { numero_item: 'asc' } },
      despesas: {
        orderBy: { created_at: 'asc' },
        include: { rateios: true },
      },
    },
  })

  if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

  if (nf.status !== 'pronta' && nf.status !== 'exportada') {
    throw new AppError(
      `NF deve estar com status "pronta" ou "exportada" para exportar (atual: ${nf.status})`,
      422,
      'NOT_READY'
    )
  }

  return nf
}

/**
 * Gera conteudo do arquivo de exportacao baseado no formato
 * Placeholder: sera expandido com layouts customizados
 */
function gerarConteudoExportacao(
  nf: Record<string, unknown>,
  formato: string,
  _layout?: Record<string, unknown> | null
): { conteudo: string; mime_type: string; extensao: string } {
  switch (formato) {
    case 'CSV': {
      const itens = (nf.itens as Array<Record<string, unknown>>) || []
      const headers = ['numero_item', 'ncm', 'descricao', 'cfop', 'quantidade', 'valor_fob', 'valor_cif', 'valor_ii', 'valor_ipi', 'valor_pis', 'valor_cofins', 'valor_icms']
      const rows = itens.map(item =>
        headers.map(h => String(item[h] ?? '')).join(';')
      )
      const conteudo = [headers.join(';'), ...rows].join('\n')
      return { conteudo, mime_type: 'text/csv', extensao: 'csv' }
    }
    case 'JSON': {
      const conteudo = JSON.stringify(nf, null, 2)
      return { conteudo, mime_type: 'application/json', extensao: 'json' }
    }
    case 'XML': {
      // Placeholder XML basico
      const conteudo = `<?xml version="1.0" encoding="UTF-8"?>\n<nf_importacao id="${nf.id}">\n  <status>${nf.status}</status>\n  <itens_count>${((nf.itens as Array<unknown>) || []).length}</itens_count>\n</nf_importacao>`
      return { conteudo, mime_type: 'application/xml', extensao: 'xml' }
    }
    default: {
      // Formatos ERP (TOTVS, SAP, SENIOR, CUSTOM) — placeholder
      const conteudo = JSON.stringify({
        formato,
        nf_id: nf.id,
        message: `Formato ${formato} sera implementado com layout customizado`,
        data: nf,
      }, null, 2)
      return { conteudo, mime_type: 'application/json', extensao: 'json' }
    }
  }
}

// ── POST /:id/exportar — Gerar arquivo de exportacao ────────────────────────

router.post('/:id/exportar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = ExportarSchema.parse(req.body)

    const nf = await findNfForExport(prisma, req.params.id, tenantId, companyId)

    // Buscar layout customizado se informado
    let layout: Record<string, unknown> | null = null
    if (body.layout_id) {
      const layoutDb = await prisma.nfExportLayout.findFirst({
        where: { id: body.layout_id, tenant_id: tenantId },
        include: { campos: true },
      })
      if (!layoutDb) throw new AppError('Layout nao encontrado', 404, 'NOT_FOUND')
      layout = layoutDb as unknown as Record<string, unknown>
    }

    const { conteudo, mime_type, extensao } = gerarConteudoExportacao(
      nf as unknown as Record<string, unknown>,
      body.formato,
      layout
    )

    // Transitar para exportada se pronta
    if (nf.status === 'pronta') {
      await transitarStatus({
        prisma,
        nfId: req.params.id,
        tenantId,
        companyId: nf.company_id,
        statusNovo: 'exportada' as NfStatus,
        userId,
        descricao: `NF exportada no formato ${body.formato}`,
        dadosExtras: { formato: body.formato, layout_id: body.layout_id ?? null },
      })
    }

    // Registrar historico de exportacao
    await prisma.nfImportacaoHistorico.create({
      data: {
        tenant_id: tenantId,
        company_id: nf.company_id,
        product_id: 'nf-importacao',
        user_id: userId,
        nf_importacao_id: req.params.id,
        evento: 'exportacao',
        status_novo: 'exportada',
        descricao: `Arquivo ${body.formato} gerado`,
        dados_extras: { formato: body.formato, layout_id: body.layout_id ?? null },
      },
    })

    res.json({
      nf_importacao_id: req.params.id,
      formato: body.formato,
      extensao,
      mime_type,
      conteudo,
      tamanho_bytes: Buffer.byteLength(conteudo, 'utf8'),
      gerado_em: new Date().toISOString(),
    })
  } catch (err) { next(err) }
})

// ── GET /:id/exportar/preview — Preview do conteudo exportado ───────────────

router.get('/:id/exportar/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nfImportacao.findFirst({
      where,
      include: {
        itens: { orderBy: { numero_item: 'asc' } },
        despesas: {
          orderBy: { created_at: 'asc' },
          include: { rateios: true },
        },
      },
    })

    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    // Preview sempre em JSON para visualizacao
    const { conteudo } = gerarConteudoExportacao(
      nf as unknown as Record<string, unknown>,
      'JSON'
    )

    res.json({
      nf_importacao_id: req.params.id,
      status: nf.status,
      preview: JSON.parse(conteudo),
      exportavel: nf.status === 'pronta' || nf.status === 'exportada',
    })
  } catch (err) { next(err) }
})

export { router as nfExportacaoRouter }
