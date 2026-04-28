/**
 * dashboardData.ts — Dados para o dashboard interno do produto Pedido
 *
 * Rota base: /api/v1/pedidos/dashboard
 *
 * Endpoints:
 *   GET /api/v1/pedidos/dashboard/kpis          — KPIs agregados do período
 *   GET /api/v1/pedidos/dashboard/tendencia     — série temporal (mensal)
 *   GET /api/v1/pedidos/dashboard/distribuicao  — distribuição por status
 *   GET /api/v1/pedidos/dashboard/status-ncm    — itens com NCM inválido
 *
 * Autenticação: x-internal-key + x-tenant-id (via middleware global)
 *
 * Schema real (produto/pedido/server/prisma/schema.prisma):
 *   model Pedido     → db.pedido      → campos: status, valor_total_pedido,
 *                                               quantidade_total_pedido,
 *                                               data_emissao_pedido, deleted_at
 *   model PedidoItem → db.pedidoItem  → campos: quantidade_inicial_pedido,
 *                                               quantidade_atual_pedido,
 *                                               quantidade_transferida_pedido,
 *                                               quantidade_pronta_pedido,
 *                                               valor_total_item
 *
 * Status reais: 'draft' | 'aberto' | 'transferencia' | 'consolidado' | 'cancelado'
 *
 * Mapeamento para chaves do catálogo do dashboard:
 *   pedidos_abertos      ← status = 'aberto'
 *   pedidos_em_andamento ← status = 'transferencia'
 *   pedidos_atrasados    ← 0 (sem campo de prazo no schema)
 *   cobertura_pendente   ← 0 (sem campo correspondente no schema)
 */

import { Router, Request, Response } from 'express'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { generateInsights, normalizeRole, type KpiSnapshot } from '../services/gabiInsightsService.js'
import { getUserBehaviorScores } from '../services/behaviorTrackingService.js'
import { enhanceWithLlm } from '../services/gabiLlmInsightsService.js'

export const dashboardDataRouter = Router()

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL ?? 'http://localhost:8005'

/** Busca as taxas PTAX do configurador e retorna um mapa moeda → taxa de venda.
 *  Usa o boletim mais recente disponível. Falha silenciosa — retorna {} se offline. */
async function buscarTaxasVenda(): Promise<Record<string, number>> {
  try {
    const r = await fetch(`${CONFIGURADOR_URL}/api/v1/taxa-cambio`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return {}
    const json = await r.json() as { por_moeda?: Record<string, Array<{ venda: string | number }>> }
    const taxas: Record<string, number> = { BRL: 1 }
    for (const [moeda, boletins] of Object.entries(json.por_moeda ?? {})) {
      if (!boletins.length) continue
      // Último boletim do dia (Fechamento ou o mais recente)
      const ultimo = boletins[boletins.length - 1]
      if (ultimo?.venda) taxas[moeda] = Number(ultimo.venda)
    }
    return taxas
  } catch {
    return { BRL: 1 }
  }
}

function periodToDateRange(period: string): { from: Date; to: Date } {
  // Período personalizado: custom:YYYY-MM-DD:YYYY-MM-DD
  if (period.startsWith('custom:')) {
    const [, startStr, endStr] = period.split(':')
    if (startStr && endStr) {
      return { from: new Date(`${startStr}T00:00:00.000Z`), to: new Date(`${endStr}T23:59:59.999Z`) }
    }
  }
  const to = new Date()
  const from = new Date()
  switch (period) {
    case '7d':           from.setDate(to.getDate() - 7);              break
    case '30d':          from.setDate(to.getDate() - 30);             break
    case '90d':          from.setDate(to.getDate() - 90);             break
    case '6m':           from.setMonth(to.getMonth() - 6);            break
    case '12m':          from.setFullYear(to.getFullYear() - 1);      break
    case 'ytd':          from.setMonth(0, 1); from.setHours(0,0,0,0); break
    case 'current_month':from.setDate(1);     from.setHours(0,0,0,0); break
    case 'current_year': from.setMonth(0, 1); from.setHours(0,0,0,0); break
    default:             from.setDate(to.getDate() - 30)
  }
  return { from, to }
}

// ── KPIs agregados ─────────────────────────────────────────────────────────────
dashboardDataRouter.get('/kpis', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const fromParam = req.query.from as string | undefined
  const toParam   = req.query.to   as string | undefined
  const { from, to } = (fromParam && toParam)
    ? { from: new Date(fromParam), to: new Date(toParam) }
    : periodToDateRange(period)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const [pedidosRaw, itensRaw, taxasVenda] = await Promise.all([
        db.pedido.findMany({
          where: {
            data_emissao_pedido: { gte: from, lte: to },
            deleted_at: null,
          },
          select: {
            status: true,
            valor_total_pedido: true,
            quantidade_total_pedido: true,
            moeda_pedido: true,
            importacao_exportador_id: true,
            tipo_operacao: true,
            incoterm: true,
            fabricante_id: true,
            numero_proforma: true,
            numero_invoice: true,
            referencia_importador: true,
            referencia_exportador: true,
            peso_bruto_total_pedido: true,
            cubagem_total_pedido: true,
          },
        }),
        db.pedidoItem.findMany({
          where: {
            pedido_item: {
              data_emissao_pedido: { gte: from, lte: to },
              deleted_at: null,
            },
          },
          select: {
            quantidade_inicial_item: true,
            quantidade_atual_item: true,
            quantidade_transferida_item: true,
            quantidade_pronta_item: true,
            valor_total_item: true,
            cobertura_cambial_item: true,
            quantidade_cancelada_item: true,
            peso_bruto_unitario_item: true,
            cubagem_unitaria_item: true,
          },
        }),
        buscarTaxasVenda(),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = pedidosRaw as any[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itens = itensRaw as any[]

      // ── Contagens por status ───────────────────────────────────────────────────
      const total_pedidos        = pedidos.length
      const pedidos_abertos      = pedidos.filter((p) => p.status === 'aberto').length
      const pedidos_em_andamento = pedidos.filter((p) => p.status === 'transferencia').length
      const pedidos_consolidados = pedidos.filter((p) => p.status === 'consolidado').length
      const pedidos_cancelados      = pedidos.filter((p) => p.status === 'cancelado').length
      const pedidos_draft           = pedidos.filter((p) => p.status === 'draft').length
      const pedidos_sem_exportador  = pedidos.filter((p) => !p.importacao_exportador_id).length
      const pedidos_importacao      = pedidos.filter((p) => p.tipo_operacao === 'importacao').length
      const pedidos_exportacao      = pedidos.filter((p) => p.tipo_operacao === 'exportacao').length

      // Sem campo de prazo no schema — retorna 0 para não quebrar derivadas
      const pedidos_atrasados = 0

      // ── Completude documental ─────────────────────────────────────────────────
      const pedidos_sem_incoterm   = pedidos.filter((p) => !p.incoterm || p.incoterm.trim() === '').length
      const pedidos_sem_fabricante = pedidos.filter((p) => !p.fabricante_id).length
      const pedidos_sem_proforma   = pedidos.filter((p) => !p.numero_proforma || p.numero_proforma.trim() === '').length
      const pedidos_sem_invoice    = pedidos.filter((p) => !p.numero_invoice || p.numero_invoice.trim() === '').length
      const pedidos_sem_ref_imp    = pedidos.filter((p) => !p.referencia_importador || p.referencia_importador.trim() === '').length

      // ── Moedas distintas ──────────────────────────────────────────────────────
      const moedas_set = new Set(pedidos.map((p) => p.moeda_pedido ?? 'USD'))
      const moedas_distintas = moedas_set.size

      // ── Logística ─────────────────────────────────────────────────────────────
      const peso_bruto_total  = pedidos.reduce((s, p) => s + Number(p.peso_bruto_total_pedido ?? 0), 0)
      const cubagem_total     = pedidos.reduce((s, p) => s + Number(p.cubagem_total_pedido ?? 0), 0)

      // ── Itens — cobertura cambial e cancelamentos ────────────────────────────
      const itens_sem_cobertura   = itens.filter((i) => i.cobertura_cambial_item === 'sem_cobertura').length
      const qtd_cancelada_total   = itens.reduce((s, i) => s + Number(i.quantidade_cancelada_item ?? 0), 0)

      // ── Financeiro ────────────────────────────────────────────────────────────
      const valor_total        = pedidos.reduce((s, p) => s + Number(p.valor_total_pedido ?? 0), 0)
      const qtd_total          = pedidos.reduce((s, p) => s + Number(p.quantidade_total_pedido ?? 0), 0)

      // Sem campo cobertura_pendente no schema — retorna 0
      const cobertura_pendente = 0

      // ── Valor Total em BRL — converte cada pedido pela taxa PTAX de venda ─────
      const moedas_sem_taxa: string[] = []
      let valor_total_brl = 0
      for (const p of pedidos as any[]) {
        const moeda = (p.moeda_pedido ?? 'USD') as string
        const valor = Number(p.valor_total_pedido ?? 0)
        const taxa  = taxasVenda[moeda]
        if (taxa != null) {
          valor_total_brl += valor * taxa
        } else {
          // Sem taxa disponível: inclui sem conversão e registra a moeda
          valor_total_brl += valor
          if (!moedas_sem_taxa.includes(moeda)) moedas_sem_taxa.push(moeda)
        }
      }

      // ── Itens ─────────────────────────────────────────────────────────────────
      const qtd_inicial_total     = itens.reduce((s, i) => s + Number(i.quantidade_inicial_item ?? 0), 0)
      const qtd_atual_total       = itens.reduce((s, i) => s + Number(i.quantidade_atual_item ?? 0), 0)
      const qtd_transferida_total = itens.reduce((s, i) => s + Number(i.quantidade_transferida_item ?? 0), 0)
      const itens_prontos         = itens.reduce((s, i) => s + Number(i.quantidade_pronta_item ?? 0), 0)
      const valor_itens_total     = itens.reduce((s, i) => s + Number(i.valor_total_item ?? 0), 0)

      res.json({
        period,
        // Contagens
        total_pedidos,
        pedidos_abertos,
        pedidos_em_andamento,
        pedidos_consolidados,
        pedidos_cancelados,
        pedidos_draft,
        pedidos_atrasados,
        pedidos_sem_exportador,
        pedidos_importacao,
        pedidos_exportacao,
        // Financeiro
        valor_total,
        valor_total_brl,
        moedas_sem_taxa,
        cobertura_pendente,
        qtd_total,
        ticket_medio: total_pedidos > 0 ? valor_total / total_pedidos : 0,
        // Itens
        itens_prontos,
        qtd_inicial_total,
        qtd_atual_total,
        qtd_transferida_total,
        valor_itens_total,
        // Derivadas pré-computadas
        taxa_atraso:          0,
        taxa_conclusao_itens: qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : 0,
        exposicao_financeira: 0,
        taxa_transferencia:   qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : 0,
        // Completude documental
        pedidos_sem_incoterm,
        pedidos_sem_fabricante,
        pedidos_sem_proforma,
        pedidos_sem_invoice,
        pedidos_sem_ref_imp,
        // Moedas e logística
        moedas_distintas,
        peso_bruto_total,
        cubagem_total,
        // Itens
        itens_sem_cobertura,
        qtd_cancelada_total,
      })
    })
  } catch (err) {
    console.error('[DashboardData/kpis]', err)
    res.status(500).json({ error: 'Erro ao agregar KPIs' })
  }
})

// ── Série temporal ────────────────────────────────────────────────────────────
dashboardDataRouter.get('/tendencia', async (req: Request, res: Response) => {
  const period      = (req.query.period as string)      ?? '12m'
  const granularity = (req.query.granularity as string) ?? 'month'
  const { from, to } = periodToDateRange(period)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const pedidos = await db.pedido.findMany({
        where: {
          data_emissao_pedido: { gte: from, lte: to },
          deleted_at: null,
        },
        select: {
          data_emissao_pedido: true,
          valor_total_pedido: true,
        },
        orderBy: { data_emissao_pedido: 'asc' },
      })

      // Agrupa por período — retorna todos os campos usáveis pelo catálogo
      const buckets: Record<string, {
        month: string
        label: string
        total_pedidos: number
        valor_total: number
        cobertura_pendente: number
        valor_itens_total: number
      }> = {}

      for (const p of pedidos as any[]) {
        const d = new Date(p.data_emissao_pedido)
        let key: string
        let label: string

        if (granularity === 'month') {
          key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          label = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
        } else if (granularity === 'week') {
          const startOfWeek = new Date(d)
          startOfWeek.setDate(d.getDate() - d.getDay())
          key   = startOfWeek.toISOString().slice(0, 10)
          label = `Sem ${key}`
        } else {
          key   = d.toISOString().slice(0, 10)
          label = key
        }

        if (!buckets[key]) {
          buckets[key] = { month: key, label, total_pedidos: 0, valor_total: 0, cobertura_pendente: 0, valor_itens_total: 0 }
        }
        buckets[key].total_pedidos++
        buckets[key].valor_total += Number(p.valor_total_pedido ?? 0)
      }

      res.json({
        period,
        granularity,
        value: Object.values(buckets),
      })
    })
  } catch (err) {
    console.error('[DashboardData/trend]', err)
    res.status(500).json({ error: 'Erro ao calcular série temporal' })
  }
})

// ── Insights personalizados da Gabi ───────────────────────────────────────────
// GET /api/v1/pedidos/dashboard/insights
// Retorna insights ranqueados por role (Fase 1) + comportamento (Fase 2) + LLM (Fase 3)
dashboardDataRouter.get('/insights', async (req: Request, res: Response) => {
  const period   = (req.query.period   as string) ?? '30d'
  const rawRole  = (req.headers['x-user-role'] as string | undefined) ?? (req.query.role as string | undefined)
  const role     = normalizeRole(rawRole)
  const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
  const tenantId = ctx.idOrganizacao
  const userId   = ctx.idUsuario ?? 'anonymous'

  const fromParam = req.query.from as string | undefined
  const toParam   = req.query.to   as string | undefined
  const { from, to } = (fromParam && toParam)
    ? { from: new Date(fromParam), to: new Date(toParam) }
    : periodToDateRange(period)

  try {
    let kpis!: KpiSnapshot
    let behaviorScores: Awaited<ReturnType<typeof getUserBehaviorScores>>

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      // ── 1. Buscar KPIs do período ──────────────────────────────────────────────
      const [pedidosRaw2, itensRaw2] = await Promise.all([
        db.pedido.findMany({
          where: { data_emissao_pedido: { gte: from, lte: to }, deleted_at: null },
          select: {
            status: true,
            valor_total_pedido: true,
            moeda_pedido: true,
            importacao_exportador_id: true,
            tipo_operacao: true,
          },
        }),
        db.pedidoItem.findMany({
          where: { pedido_item: { data_emissao_pedido: { gte: from, lte: to }, deleted_at: null } },
          select: {
            quantidade_inicial_item: true,
            quantidade_atual_item: true,
            quantidade_transferida_item: true,
            quantidade_pronta_item: true,
            valor_total_item: true,
          },
        }),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = pedidosRaw2 as any[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itens = itensRaw2 as any[]

      const total_pedidos        = pedidos.length
      const pedidos_abertos      = pedidos.filter((p) => p.status === 'aberto').length
      const pedidos_em_andamento = pedidos.filter((p) => p.status === 'transferencia').length
      const pedidos_consolidados = pedidos.filter((p) => p.status === 'consolidado').length
      const pedidos_cancelados   = pedidos.filter((p) => p.status === 'cancelado').length
      const pedidos_atrasados    = 0  // sem campo prazo no schema atual
      const pedidos_sem_exportador = pedidos.filter((p) => !p.importacao_exportador_id).length
      const pedidos_importacao   = pedidos.filter((p) => p.tipo_operacao === 'importacao').length
      const pedidos_exportacao   = pedidos.filter((p) => p.tipo_operacao === 'exportacao').length

      const valor_total          = pedidos.reduce((s, p) => s + Number(p.valor_total_pedido ?? 0), 0)
      const qtd_inicial_total    = itens.reduce((s, i) => s + Number(i.quantidade_inicial_item ?? 0), 0)
      const qtd_transferida_total = itens.reduce((s, i) => s + Number(i.quantidade_transferida_item ?? 0), 0)
      const qtd_pronta_total     = itens.reduce((s, i) => s + Number(i.quantidade_pronta_item ?? 0), 0)
      const qtd_saldo_total      = itens.reduce((s, i) => s + Number(i.quantidade_atual_item ?? 0), 0)
      const valor_itens_total    = itens.reduce((s, i) => s + Number(i.valor_total_item ?? 0), 0)
      const ticket_medio         = total_pedidos > 0 ? valor_total / total_pedidos : 0
      const taxa_atraso          = 0
      const taxa_transferencia   = qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : 0

      kpis = {
        total_pedidos, pedidos_abertos, pedidos_em_andamento, pedidos_atrasados,
        pedidos_sem_exportador, pedidos_cancelados, pedidos_consolidados,
        pedidos_importacao, pedidos_exportacao, qtd_saldo_total, qtd_pronta_total,
        qtd_transferida_total, qtd_inicial_total, valor_total, valor_itens_total,
        ticket_medio, taxa_atraso, taxa_transferencia,
        valor_total_brl: 0,
        pedidos_sem_incoterm: 0,
        pedidos_sem_fabricante: 0,
        pedidos_sem_proforma: 0,
        pedidos_sem_invoice: 0,
        pedidos_sem_ref_imp: 0,
        moedas_distintas: 1,
        peso_bruto_total: 0,
        cubagem_total: 0,
        itens_sem_cobertura: 0,
        qtd_cancelada_total: 0,
      }

      // ── 2. Fase 2: scores de comportamento do usuário ──────────────────────────
      behaviorScores = await getUserBehaviorScores(db, tenantId, userId)
    })

    // ── 3. Fase 1+2: gerar insights ranqueados ─────────────────────────────────
    let insights = generateInsights(kpis, role, behaviorScores!)

    // ── 4. Fase 3: enriquecer texto via LLM (com fallback automático) ──────────
    insights = await enhanceWithLlm(insights, kpis, tenantId, userId, role)

    res.json({ period, role, insights })
  } catch (err) {
    console.error('[DashboardData/insights]', err)
    res.status(500).json({ error: 'Erro ao gerar insights' })
  }
})

// ── Status NCM — itens com NCM inválido ───────────────────────────────────────
// GET /api/v1/pedidos/dashboard/status-ncm
// Consulta o serviço NCM tenant para saber quais NCMs usados nos itens são inválidos.
// Falha silenciosa: se o serviço NCM estiver offline, retorna sem_sync=true.
dashboardDataRouter.get('/status-ncm', async (req: Request, res: Response) => {
  const tenantId  = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao
  const TENANT_SVC = process.env.TENANT_SERVICE_URL ?? 'http://localhost:3001'
  const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? ''

  try {
    // 1. Buscar todos os NCMs distintos usados em itens ativos deste tenant
    let itensNcm: Array<{ ncm_item: string | null }> = []

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      itensNcm = await db.pedidoItem.findMany({
        where:  { pedido_item: { data_exclusao_pedido: null } },
        select: { ncm_item: true },
      }) as Array<{ ncm_item: string | null }>

    })

    const codigosUsados = [...new Set(
      itensNcm
        .map(i => (i.ncm_item ?? '').replace(/\D/g, ''))
        .filter((c) => c.length === 8)
    )]

    if (codigosUsados.length === 0) {
      return res.json({ invalidos: [], total_invalidos: 0, total_verificados: 0, sem_sync: false, ultima_sync: null })
    }

    // 2. Perguntar ao serviço NCM quais são inválidos (via S2S)
    const params = new URLSearchParams({
      codigos: codigosUsados.slice(0, 200).join(','),
      limite: '200',
    })

    const ncmRes = await fetch(
      `${TENANT_SVC}/api/v1/ncm/invalidos?${params}`,
      {
        headers: {
          'x-tenant-id':   tenantId,
          'x-internal-key': INTERNAL_KEY,
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!ncmRes.ok) {
      return res.json({ invalidos: [], total_invalidos: 0, total_verificados: codigosUsados.length, sem_sync: true, ultima_sync: null })
    }

    const ncmData = await ncmRes.json() as {
      invalidos: string[]
      total_invalidos: number
      total_verificados: number
      ultima_sync: string | null
    }

    // 3. Contar itens com NCM inválido (não apenas NCMs únicos)
    const invalidSet = new Set(ncmData.invalidos)
    const itensInvalidos = itensNcm
      .filter(i => {
        const c = (i.ncm_item ?? '').replace(/\D/g, '')
        return c.length === 8 && invalidSet.has(c)
      }).length

    res.json({
      invalidos:         ncmData.invalidos,
      total_invalidos:   ncmData.total_invalidos,
      itens_invalidos:   itensInvalidos,
      total_verificados: codigosUsados.length,
      sem_sync:          !ncmData.ultima_sync,
      ultima_sync:       ncmData.ultima_sync,
    })
  } catch {
    // Serviço NCM offline — resposta silenciosa
    res.json({ invalidos: [], total_invalidos: 0, itens_invalidos: 0, total_verificados: 0, sem_sync: true, ultima_sync: null })
  }
})

// ── Distribuição por status ────────────────────────────────────────────────────
dashboardDataRouter.get('/distribuicao', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const { from, to } = periodToDateRange(period)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const pedidos = await db.pedido.findMany({
        where: {
          data_emissao_pedido: { gte: from, lte: to },
          deleted_at: null,
        },
        select: { status: true, valor_total_pedido: true },
      })

      const groups: Record<string, { status: string; count: number; valor_total: number }> = {}
      for (const p of pedidos as any[]) {
        if (!groups[p.status]) groups[p.status] = { status: p.status, count: 0, valor_total: 0 }
        groups[p.status].count++
        groups[p.status].valor_total += Number(p.valor_total_pedido ?? 0)
      }

      res.json({
        period,
        value: Object.values(groups),
      })
    })
  } catch (err) {
    console.error('[DashboardData/distribution]', err)
    res.status(500).json({ error: 'Erro ao calcular distribuição' })
  }
})
