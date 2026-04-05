/**
 * importacao.ts — Rotas de importacao de pedidos via arquivo
 *
 * Endpoint base: /api/v1/pedidos/importar
 * Protegido por: requireInternalKey + tenantIsolation
 *
 * Rotas:
 *   POST /importar          Upload + parse + preview
 *   POST /importar/confirmar  Confirmar e criar pedidos em batch
 *   POST /exportar           Exportar pedidos filtrados
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { importEngine } from '../services/importEngine.js'
import type { PedidoImportado } from '../services/importEngine.js'
import { AppError } from '../services/saldoEngine.js'

export const importacaoRouter = Router()

// ── POST /importar — Upload + parse + preview ─────────────────────────────────

importacaoRouter.post('/importar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // O arquivo chega como raw buffer via middleware de upload (multer)
    // ou como base64 no body para simplificar o MVP
    const { arquivo_base64, nome_arquivo } = req.body

    if (!arquivo_base64 || !nome_arquivo) {
      throw new AppError(400, 'Campos arquivo_base64 e nome_arquivo sao obrigatorios')
    }

    const buffer = Buffer.from(arquivo_base64, 'base64')
    const pedidos = await importEngine.processarArquivo(buffer, nome_arquivo)

    res.json({
      preview: pedidos,
      total: pedidos.length,
      total_itens: pedidos.reduce((acc, p) => acc + p.itens.length, 0),
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /importar/confirmar — Criar pedidos em batch ─────────────────────────

const confirmarSchema = z.object({
  pedidos: z.array(z.object({
    numero_pedido: z.string().min(1),
    tipo_operacao: z.enum(['importacao', 'exportacao']),
    exportador: z.string().optional(),
    fabricante: z.string().optional(),
    incoterm: z.string().optional(),
    moeda_pedido: z.string().optional().default('USD'),
    referencia_importador: z.string().optional(),
    referencia_exportador: z.string().optional(),
    referencia_fabricante: z.string().optional(),
    numero_proforma: z.string().optional(),
    numero_invoice: z.string().optional(),
    data_emissao_pedido: z.string().optional(),
    itens: z.array(z.object({
      part_number: z.string().min(1),
      ncm: z.string().min(1),
      descricao_item: z.string().min(1),
      quantidade_inicial_pedido: z.number().positive(),
      unidade_comercializada_item: z.string().optional(),
      valor_por_unidade_item: z.number().optional(),
      valor_total_item: z.number().optional(),
    })).min(1),
  })).min(1),
})

importacaoRouter.post('/importar/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = confirmarSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const criados = await req.prisma.$transaction(async (tx) => {
      const pedidosCriados: string[] = []

      for (const pedidoData of result.data.pedidos) {
        const pedidoId = gerarId('pedi')
        const valorTotal = pedidoData.itens.reduce((acc, item) => {
          return acc + (item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * item.quantidade_inicial_pedido)
        }, 0)
        const qtdTotal = pedidoData.itens.reduce((acc, item) => acc + item.quantidade_inicial_pedido, 0)

        await tx.pedido.create({
          data: {
            id: pedidoId,
            tenant_id,
            company_id,
            tipo_operacao: pedidoData.tipo_operacao,
            numero_pedido: pedidoData.numero_pedido,
            status: 'draft',
            incoterm: pedidoData.incoterm ?? null,
            moeda_pedido: pedidoData.moeda_pedido ?? 'USD',
            valor_total_pedido: valorTotal || null,
            quantidade_total_pedido: qtdTotal || null,
            cobertura_cambial: 'com_cobertura',
            condicao_pagamento: null,
            detalhes_operacionais: {
              exportador_nome: pedidoData.exportador,
              fabricante_nome: pedidoData.fabricante,
              referencia_importador: pedidoData.referencia_importador,
              referencia_exportador: pedidoData.referencia_exportador,
              referencia_fabricante: pedidoData.referencia_fabricante,
              numero_proforma: pedidoData.numero_proforma,
              numero_invoice: pedidoData.numero_invoice,
            },
            itens: {
              create: pedidoData.itens.map((item, index) => ({
                id: gerarId('pite'),
                tenant_id,
                company_id,
                sequencia_item: (index + 1) * 10,
                part_number: item.part_number,
                ncm: item.ncm,
                descricao_item: item.descricao_item,
                quantidade_inicial_pedido: item.quantidade_inicial_pedido,
                quantidade_atual_pedido: item.quantidade_inicial_pedido,
                quantidade_pronta_pedido: 0,
                quantidade_transferida_pedido: 0,
                quantidade_cancelada_pedido: 0,
                casas_decimais_quantidade_item: 2,
                unidade_comercializada_item: item.unidade_comercializada_item ?? 'UN',
                moeda_item: pedidoData.moeda_pedido ?? 'USD',
                valor_por_unidade_item: item.valor_por_unidade_item ?? null,
                valor_total_item: item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * item.quantidade_inicial_pedido,
                casas_decimais_total_item: 2,
              })),
            },
          },
        })

        pedidosCriados.push(pedidoId)
      }

      return pedidosCriados
    })

    res.status(201).json({
      criados: criados.length,
      ids: criados,
      status: 'draft',
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /exportar — Exportar pedidos filtrados ───────────────────────────────

importacaoRouter.post('/exportar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formato = 'csv', filtros } = req.body
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const where: Record<string, unknown> = { tenant_id, company_id }
    if (filtros?.status) where.status = filtros.status
    if (filtros?.tipo_operacao) where.tipo_operacao = filtros.tipo_operacao

    const pedidos = await req.prisma.pedido.findMany({
      where,
      include: { itens: true },
      orderBy: { data_emissao_pedido: 'desc' },
    })

    if (formato === 'csv') {
      const headers = [
        'numero_pedido', 'tipo_operacao', 'status', 'incoterm', 'moeda',
        'valor_total', 'quantidade_total', 'data_emissao',
        'item_part_number', 'item_ncm', 'item_descricao',
        'item_qtd_inicial', 'item_qtd_atual', 'item_qtd_transferida',
        'item_unidade', 'item_valor',
      ]

      const rows = pedidos.flatMap((p) =>
        p.itens.map((item) =>
          [
            p.numero_pedido, p.tipo_operacao, p.status, p.incoterm ?? '', p.moeda_pedido,
            p.valor_total_pedido ?? '', p.quantidade_total_pedido ?? '', p.data_emissao_pedido,
            item.part_number, item.ncm, item.descricao_item,
            item.quantidade_inicial_pedido, item.quantidade_atual_pedido, item.quantidade_transferida_pedido,
            item.unidade_comercializada_item ?? '', item.valor_total_item ?? '',
          ].map((v) => `"${String(v).replace(/"/g, '""')}"`)
           .join(',')
        )
      )

      const csv = [headers.join(','), ...rows].join('\n')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="pedidos.csv"')
      res.send(csv)
    } else {
      res.json({ data: pedidos, total: pedidos.length })
    }
  } catch (err) {
    next(err)
  }
})

// ── Helper ────────────────────────────────────────────────────────────────────

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
}
