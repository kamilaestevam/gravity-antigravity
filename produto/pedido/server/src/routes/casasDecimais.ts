/**
 * casasDecimais.ts — Configuração de Casas Decimais por Workspace
 *
 * GET  /api/v1/pedidos/configuracoes/casas-decimais
 *   → Retorna a config atual do tenant (ou defaults se ainda não configurado)
 *
 * PUT  /api/v1/pedidos/configuracoes/casas-decimais
 *   → Salva config e retorna auditoria de quantos registros serão afetados
 *   → Se body.confirmar === true: dispara job de migração em background
 *
 * Regra fundamental (spec mapas_pedido.pdf):
 *   Casas decimais é restrição de ARMAZENAMENTO, não de exibição.
 *   Os valores gravados no banco devem ter exatamente X casas decimais.
 *   Os itens herdam automaticamente as casas do pedido pai.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'

export const casasDecimaisRouter = Router()

// ── Schema Zod ────────────────────────────────────────────────────────────────

const CasasDecimaisSchema = z.object({
  valor_total_pedido:              z.number().int().min(0).max(6),
  quantidade_total_inicial_pedido: z.number().int().min(0).max(6),
  quantidade_pronta_pedido_total:  z.number().int().min(0).max(6),
  saldo_itens_do_pedido:           z.number().int().min(0).max(6),
  quantidade_transferida_total:    z.number().int().min(0).max(6),
  quantidade_cancelada_total_pedido: z.number().int().min(0).max(6),
  peso_liquido_total_pedido:       z.number().int().min(0).max(6),
  peso_bruto_total_pedido:         z.number().int().min(0).max(6),
  cubagem_total_pedido:            z.number().int().min(0).max(6),
  // Se true, dispara a migração em background após salvar
  confirmar: z.boolean().optional(),
})

export type CasasDecimaisConfig = Omit<z.infer<typeof CasasDecimaisSchema>, 'confirmar'>

// Defaults alinhados com os defaults do schema Prisma
const DEFAULTS: CasasDecimaisConfig = {
  valor_total_pedido:              2,
  quantidade_total_inicial_pedido: 2,
  quantidade_pronta_pedido_total:  2,
  saldo_itens_do_pedido:           2,
  quantidade_transferida_total:    2,
  quantidade_cancelada_total_pedido: 2,
  peso_liquido_total_pedido:       3,
  peso_bruto_total_pedido:         3,
  cubagem_total_pedido:            3,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTenantId(req: Request): string {
  const id = req.headers['x-tenant-id'] as string | undefined
  if (!id) throw new AppError('Header x-tenant-id obrigatório', 400, 'BAD_REQUEST')
  return id
}

// ── Mapeamento campo config → campos no banco ─────────────────────────────────
// Relaciona cada campo da config com os campos correspondentes em Pedido e PedidoItem

const MAP_CONFIG_PEDIDO: Record<keyof CasasDecimaisConfig, string | null> = {
  valor_total_pedido:              'casas_decimais_valor_pedido',
  quantidade_total_inicial_pedido: 'casas_decimais_quantidade_pedido',
  quantidade_pronta_pedido_total:  null, // virtual — calculado em mapPedido
  saldo_itens_do_pedido:           null, // virtual — calculado em mapPedido
  quantidade_transferida_total:    null, // virtual — calculado em mapPedido
  quantidade_cancelada_total_pedido: null, // virtual — calculado em mapPedido
  peso_liquido_total_pedido:       'casas_decimais_peso_pedido',
  peso_bruto_total_pedido:         'casas_decimais_peso_pedido',
  cubagem_total_pedido:            'casas_decimais_cubagem_pedido',
}

const MAP_CONFIG_ITEM: Record<keyof CasasDecimaisConfig, string | null> = {
  valor_total_pedido:              'casas_decimais_valor_item',
  quantidade_total_inicial_pedido: 'casas_decimais_quantidade_item',
  quantidade_pronta_pedido_total:  null,
  saldo_itens_do_pedido:           null,
  quantidade_transferida_total:    null,
  quantidade_cancelada_total_pedido: null,
  peso_liquido_total_pedido:       'casas_decimais_peso_item',
  peso_bruto_total_pedido:         'casas_decimais_peso_item',
  cubagem_total_pedido:            'casas_decimais_cubagem_item',
}

// ── Mapeamento campo config → colunas de valor real ──────────────────────────
// Colunas cujos valores devem ser arredondados no banco quando a config muda.
// Nomes de colunas são hardcoded (nunca vêm de input do usuário).

const ARREDONDAR_PEDIDO: Array<{ config: keyof CasasDecimaisConfig; coluna: string }> = [
  { config: 'valor_total_pedido',              coluna: 'valor_total_pedido' },
  { config: 'quantidade_total_inicial_pedido', coluna: 'quantidade_total_inicial_pedido' },
  { config: 'peso_liquido_total_pedido',       coluna: 'peso_liquido_total_pedido' },
  { config: 'peso_bruto_total_pedido',         coluna: 'peso_bruto_total_pedido' },
  { config: 'cubagem_total_pedido',            coluna: 'cubagem_total_pedido' },
  // saldo, pronta, transferida, cancelada são virtuais — não persistidos no Pedido
]

const ARREDONDAR_ITEM: Array<{ config: keyof CasasDecimaisConfig; coluna: string }> = [
  { config: 'valor_total_pedido',                coluna: 'valor_total_itens' },
  { config: 'quantidade_total_inicial_pedido',   coluna: 'quantidade_inicial_item_pedido' },
  { config: 'quantidade_pronta_pedido_total',    coluna: 'quantidade_pronta_total_item_pedido' },
  { config: 'quantidade_transferida_total',      coluna: 'quantidade_transferida_item_pedido' },
  { config: 'quantidade_cancelada_total_pedido', coluna: 'quantidade_cancelada_item_pedido' },
  { config: 'peso_liquido_total_pedido',         coluna: 'peso_liquido_unitario_item' },
  { config: 'peso_bruto_total_pedido',           coluna: 'peso_bruto_unitario_item' },
  { config: 'cubagem_total_pedido',              coluna: 'cubagem_unitaria_item' },
]

// ── Job de migração em background ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executarMigracaoCasasDecimais(db: Record<string, any>, tenant_id: string, config: CasasDecimaisConfig): Promise<void> {
  console.log(`[CasasDecimais] Iniciando migração para tenant ${tenant_id}`)

  // 1. Atualizar metadados casas_decimais_* nos pedidos e itens
  const updatePedidoMeta: Record<string, number> = {}
  for (const [cfgKey, dbField] of Object.entries(MAP_CONFIG_PEDIDO)) {
    if (dbField) updatePedidoMeta[dbField] = config[cfgKey as keyof CasasDecimaisConfig]
  }
  const updateItemMeta: Record<string, number> = {}
  for (const [cfgKey, dbField] of Object.entries(MAP_CONFIG_ITEM)) {
    if (dbField) updateItemMeta[dbField] = config[cfgKey as keyof CasasDecimaisConfig]
  }

  await Promise.all([
    db.pedido.updateMany({ where: { tenant_id, deleted_at: null }, data: updatePedidoMeta }),
    db.pedidoItem.updateMany({ where: { tenant_id }, data: updateItemMeta }),
  ])

  // 2. Arredondar valores reais no banco (ROUND SQL) — seguro: nomes de colunas são hardcoded
  const roundOps: Promise<unknown>[] = []

  for (const { config: cfgKey, coluna } of ARREDONDAR_PEDIDO) {
    const casas = config[cfgKey]
    roundOps.push(
      db.$executeRawUnsafe(
        `UPDATE pedido SET "${coluna}" = ROUND("${coluna}"::numeric, ${casas}) WHERE tenant_id = $1 AND deleted_at IS NULL AND "${coluna}" IS NOT NULL`,
        tenant_id,
      ),
    )
  }

  for (const { config: cfgKey, coluna } of ARREDONDAR_ITEM) {
    const casas = config[cfgKey]
    roundOps.push(
      db.$executeRawUnsafe(
        `UPDATE pedido_item SET "${coluna}" = ROUND("${coluna}"::numeric, ${casas}) WHERE tenant_id = $1 AND "${coluna}" IS NOT NULL`,
        tenant_id,
      ),
    )
  }

  await Promise.all(roundOps)

  console.log(`[CasasDecimais] Migração concluída para tenant ${tenant_id}`)
}

// ── GET /configuracoes/casas-decimais ─────────────────────────────────────────

casasDecimaisRouter.get('/casas-decimais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (req as any).prisma as Record<string, any>

    const registro = await db.pedidoCasasDecimaisConfig.findUnique({
      where: { tenant_id },
    })

    res.json({ data: registro ?? { ...DEFAULTS } })
  } catch (err) {
    next(err)
  }
})

// ── PUT /configuracoes/casas-decimais ─────────────────────────────────────────

casasDecimaisRouter.put('/casas-decimais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)

    const parsed = CasasDecimaisSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    const { confirmar, ...configData } = parsed.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (req as any).prisma as Record<string, any>

    // Salva (ou cria) a configuração do tenant
    const registro = await db.pedidoCasasDecimaisConfig.upsert({
      where:  { tenant_id },
      create: { tenant_id, ...configData },
      update: { ...configData },
    })

    // Auditoria: conta pedidos e itens que serão afetados
    const [totalPedidos, totalItens] = await Promise.all([
      db.pedido.count({ where: { tenant_id, deleted_at: null } }),
      db.pedidoItem.count({ where: { tenant_id } }),
    ])

    // Se confirmar === true, dispara migração sem bloquear a resposta
    if (confirmar === true) {
      setImmediate(() => {
        executarMigracaoCasasDecimais(db, tenant_id, configData).catch(err => {
          console.error(`[CasasDecimais] Erro na migração tenant=${tenant_id}:`, err)
        })
      })
    }

    res.json({
      data: registro,
      auditoria: {
        total_pedidos: totalPedidos,
        total_itens:   totalItens,
        migracao_iniciada: confirmar === true,
      },
    })
  } catch (err) {
    next(err)
  }
})
