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
import { withOrganizacao, withOrganizacaoContext, type ContextoOrganizacao, type BancoOrganizacao } from '@gravity/resolver-organizacao'

export const casasDecimaisRouter = Router()

// ── Schema Zod ────────────────────────────────────────────────────────────────

// Formatos de data válidos — lista fechada, nunca vem de input livre
const FORMATOS_DATA_VALIDOS = ['DD/MM/AAAA', 'MM/DD/AAAA', 'AAAA-MM-DD', 'DD.MM.AAAA', 'DD/MM/AA'] as const
export type FormatoData = typeof FORMATOS_DATA_VALIDOS[number]

const CasasDecimaisSchema = z.object({
  valor_total_pedido:              z.number().int().min(0).max(6),
  valor_por_unidade_item:             z.number().int().min(0).max(6),
  quantidade_total_pedido: z.number().int().min(0).max(6),
  quantidade_pronta_pedido_total:  z.number().int().min(0).max(6),
  saldo_itens_do_pedido:           z.number().int().min(0).max(6),
  quantidade_transferida_total:    z.number().int().min(0).max(6),
  quantidade_cancelada_total_pedido: z.number().int().min(0).max(6),
  peso_liquido_total_pedido:       z.number().int().min(0).max(6),
  peso_bruto_total_pedido:         z.number().int().min(0).max(6),
  cubagem_total_pedido:            z.number().int().min(0).max(6),
  formato_data:                    z.enum(FORMATOS_DATA_VALIDOS).optional(),
  // Se true, dispara a migração em background após salvar
  confirmar: z.boolean().optional(),
})

export type CasasDecimaisConfig = Omit<z.infer<typeof CasasDecimaisSchema>, 'confirmar'>

// Defaults alinhados com os defaults do schema Prisma
const DEFAULTS: CasasDecimaisConfig = {
  valor_total_pedido:              2,
  valor_por_unidade_item:             2,
  quantidade_total_pedido: 2,
  quantidade_pronta_pedido_total:  2,
  saldo_itens_do_pedido:           2,
  quantidade_transferida_total:    2,
  quantidade_cancelada_total_pedido: 2,
  peso_liquido_total_pedido:       3,
  peso_bruto_total_pedido:         3,
  cubagem_total_pedido:            3,
  formato_data:                    'DD/MM/AAAA',
}

// ── Mapeamento campo config → campos no banco ─────────────────────────────────
// Relaciona cada campo da config com os campos correspondentes em Pedido e PedidoItem

const MAP_CONFIG_PEDIDO: Record<keyof CasasDecimaisConfig, string | null> = {
  valor_total_pedido:              'casas_decimais_valor_pedido',
  valor_por_unidade_item:             null,
  quantidade_total_pedido: 'casas_decimais_quantidade_pedido',
  quantidade_pronta_pedido_total:  null, // virtual — calculado em mapPedido
  saldo_itens_do_pedido:           null, // virtual — calculado em mapPedido
  quantidade_transferida_total:    null, // virtual — calculado em mapPedido
  quantidade_cancelada_total_pedido: null, // virtual — calculado em mapPedido
  peso_liquido_total_pedido:       'casas_decimais_peso_pedido',
  peso_bruto_total_pedido:         'casas_decimais_peso_pedido',
  cubagem_total_pedido:            'casas_decimais_cubagem_pedido',
  formato_data:                    null, // preferência de exibição — não persiste em coluna numérica
}

const MAP_CONFIG_ITEM: Record<keyof CasasDecimaisConfig, string | null> = {
  valor_total_pedido:              'casas_decimais_valor_item',
  valor_por_unidade_item:             null, // display usa getCasas() direto — sem metadata separado
  quantidade_total_pedido: 'casas_decimais_quantidade_item',
  quantidade_pronta_pedido_total:  null,
  saldo_itens_do_pedido:           null,
  quantidade_transferida_total:    null,
  quantidade_cancelada_total_pedido: null,
  peso_liquido_total_pedido:       'casas_decimais_peso_item',
  peso_bruto_total_pedido:         'casas_decimais_peso_item',
  cubagem_total_pedido:            'casas_decimais_cubagem_item',
  formato_data:                    null,
}

// ── Mapeamento campo config → colunas de valor real ──────────────────────────
// Colunas cujos valores devem ser arredondados no banco quando a config muda.
// Nomes de colunas são hardcoded (nunca vêm de input do usuário).

const ARREDONDAR_PEDIDO: Array<{ config: keyof CasasDecimaisConfig; coluna: string }> = [
  { config: 'valor_total_pedido',              coluna: 'valor_total_pedido' },
  { config: 'quantidade_total_pedido', coluna: 'quantidade_total_pedido' },
  { config: 'peso_liquido_total_pedido',       coluna: 'peso_liquido_total_pedido' },
  { config: 'peso_bruto_total_pedido',         coluna: 'peso_bruto_total_pedido' },
  { config: 'cubagem_total_pedido',            coluna: 'cubagem_total_pedido' },
  // saldo, pronta, transferida, cancelada são virtuais — não persistidos no Pedido
]

const ARREDONDAR_ITEM: Array<{ config: keyof CasasDecimaisConfig; coluna: string }> = [
  { config: 'valor_total_pedido',                coluna: 'valor_total_item' },
  { config: 'valor_por_unidade_item',               coluna: 'valor_por_unidade_item' },
  { config: 'quantidade_total_pedido',   coluna: 'quantidade_inicial_item' },
  { config: 'quantidade_pronta_pedido_total',    coluna: 'quantidade_pronta_item' },
  { config: 'quantidade_transferida_total',      coluna: 'quantidade_transferida_item' },
  { config: 'quantidade_cancelada_total_pedido', coluna: 'quantidade_cancelada_item' },
  { config: 'peso_liquido_total_pedido',         coluna: 'peso_liquido_unitario_item' },
  { config: 'peso_bruto_total_pedido',           coluna: 'peso_bruto_unitario_item' },
  { config: 'cubagem_total_pedido',              coluna: 'cubagem_unitaria_item' },
]

// ── ACL: Zod (API contract) ↔ Prisma (DB columns) ────────────────────────────
// Mapeia cada campo do Zod para a coluna correspondente no Prisma.
// Frontend continua usando os nomes legados do Zod — esta camada absorve.

const ZOD_TO_PRISMA: Record<keyof CasasDecimaisConfig, string> = {
  valor_total_pedido:                'valor_total_pedido_casas_decimais',
  valor_por_unidade_item:            'valor_unitario_item_casas_decimais',
  quantidade_total_pedido:           'quantidade_total_inicial_pedido_casas_decimais',
  quantidade_pronta_pedido_total:    'quantidade_pronta_pedido_total_casas_decimais',
  saldo_itens_do_pedido:             'saldo_itens_do_pedido_casas_decimais',
  quantidade_transferida_total:      'quantidade_transferida_total_pedido_casas_decimais',
  quantidade_cancelada_total_pedido: 'quantidade_cancelada_total_pedido_casas_decimais',
  peso_liquido_total_pedido:         'peso_liquido_total_pedido_casas_decimais',
  peso_bruto_total_pedido:           'peso_bruto_total_pedido_casas_decimais',
  cubagem_total_pedido:              'cubagem_total_pedido_casas_decimais',
  formato_data:                      'formato_data_pedido',
}

function mapZodParaPrisma(configZod: CasasDecimaisConfig): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [zodKey, prismaCol] of Object.entries(ZOD_TO_PRISMA)) {
    const v = configZod[zodKey as keyof CasasDecimaisConfig]
    if (v !== undefined) out[prismaCol] = v
  }
  return out
}

function mapPrismaParaZod(registroPrisma: Record<string, unknown> | null): CasasDecimaisConfig {
  if (!registroPrisma) return { ...DEFAULTS }
  const out = { ...DEFAULTS } as Record<string, unknown>
  for (const [zodKey, prismaCol] of Object.entries(ZOD_TO_PRISMA)) {
    if (registroPrisma[prismaCol] !== undefined && registroPrisma[prismaCol] !== null) {
      out[zodKey] = registroPrisma[prismaCol]
    }
  }
  return out as CasasDecimaisConfig
}

// ── Job de migração em background ─────────────────────────────────────────────

async function executarMigracaoCasasDecimais(db: BancoOrganizacao, idOrganizacao: string, config: CasasDecimaisConfig): Promise<void> {
  console.log(`[CasasDecimais] Iniciando migração para organizacao ${idOrganizacao}`)

  // 1. Atualizar metadados casas_decimais_* nos pedidos e itens
  const updatePedidoMeta: Record<string, number> = {}
  for (const [cfgKey, dbField] of Object.entries(MAP_CONFIG_PEDIDO)) {
    if (dbField) updatePedidoMeta[dbField] = config[cfgKey as keyof CasasDecimaisConfig] as number
  }
  const updateItemMeta: Record<string, number> = {}
  for (const [cfgKey, dbField] of Object.entries(MAP_CONFIG_ITEM)) {
    if (dbField) updateItemMeta[dbField] = config[cfgKey as keyof CasasDecimaisConfig] as number
  }

  await Promise.all([
    db.pedido.updateMany({ where: { id_organizacao: idOrganizacao }, data: updatePedidoMeta }),
    db.pedidoItem.updateMany({ where: { id_organizacao: idOrganizacao }, data: updateItemMeta }),
  ])

  // 2. Arredondar valores reais no banco (ROUND SQL) — seguro: nomes de colunas são hardcoded
  const roundOps: Promise<unknown>[] = []

  for (const { config: cfgKey, coluna } of ARREDONDAR_PEDIDO) {
    const casas = config[cfgKey]
    roundOps.push(
      db.$executeRawUnsafe(
        `UPDATE pedido SET "${coluna}" = ROUND("${coluna}"::numeric, ${casas}) WHERE id_organizacao = $1 AND deleted_at IS NULL AND "${coluna}" IS NOT NULL`,
        idOrganizacao,
      ),
    )
  }

  for (const { config: cfgKey, coluna } of ARREDONDAR_ITEM) {
    const casas = config[cfgKey]
    roundOps.push(
      db.$executeRawUnsafe(
        `UPDATE pedido_item SET "${coluna}" = ROUND("${coluna}"::numeric, ${casas}) WHERE id_organizacao = $1 AND "${coluna}" IS NOT NULL`,
        idOrganizacao,
      ),
    )
  }

  await Promise.all(roundOps)

  console.log(`[CasasDecimais] Migração concluída para organizacao ${idOrganizacao}`)
}

// ── GET /configuracoes/casas-decimais ─────────────────────────────────────────

casasDecimaisRouter.get('/casas-decimais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const idOrganizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao
      const registro = await db.pedidoCasasDecimais.findUnique({
        where: { id_organizacao: idOrganizacao },
      })
      res.json({ data: mapPrismaParaZod(registro) })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /configuracoes/casas-decimais ─────────────────────────────────────────

casasDecimaisRouter.put('/casas-decimais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CasasDecimaisSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }
    const { confirmar, ...configData } = parsed.data
    const idOrganizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao
    const dadosPrisma = mapZodParaPrisma(configData)

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const registro = await db.pedidoCasasDecimais.upsert({
        where:  { id_organizacao: idOrganizacao },
        create: { id_organizacao: idOrganizacao, ...dadosPrisma },
        update: { ...dadosPrisma },
      })

      const [totalPedidos, totalItens] = await Promise.all([
        db.pedido.count({ where: { id_organizacao: idOrganizacao } }),
        db.pedidoItem.count({ where: { id_organizacao: idOrganizacao } }),
      ])

      res.json({
        data: mapPrismaParaZod(registro),
        auditoria: {
          total_pedidos: totalPedidos,
          total_itens:   totalItens,
          migracao_iniciada: confirmar === true,
        },
      })
    })

    // Dispara migração APÓS a transação principal commitar
    if (confirmar === true) {
      setImmediate(() => {
        withOrganizacaoContext(idOrganizacao, async (ctx, rawDb) => {
          await executarMigracaoCasasDecimais(rawDb, ctx.idOrganizacao, configData)
        }).catch(err => {
          console.error(`[CasasDecimais] Erro na migração organizacao=${idOrganizacao}:`, err)
        })
      })
    }
  } catch (err) {
    next(err)
  }
})
