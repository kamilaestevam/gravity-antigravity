/**
 * duplicarExcluirService.ts — Lógica de negócio de duplicação e exclusão de pedidos
 *
 * Regras:
 *   - Duplicar: clona pedido + itens respeitando configs do tenant
 *   - Excluir: hard delete com audit trail OBRIGATÓRIO antes de deleteMany
 *   - tenant_id em todas as queries
 *   - $transaction para atomicidade
 */

import { Prisma, PrismaClient } from '@prisma/client'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'

// Workaround: Prisma.TransactionClient (Omit em classe genérica) perde os model delegates
// no Prisma 5.22 — usamos Omit literal para preservar tx.pedido, tx.pedidoItem, etc.
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// ── Erro local (padrão project) ───────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ConfigDuplicar {
  duplicar_numero_auto: boolean
  duplicar_copiar_datas: boolean
  duplicar_status_inicial: string
}

export interface ConfigExcluir {
  excluir_status_permitidos: string[]
  excluir_pedido_sem_item_permitido: boolean
}

export interface DuplicarPayload {
  ids: string[]
  numeros?: Record<string, string>
}

export interface DuplicarItemPayload {
  pedido_id: string
  item_ids: string[]
}

export interface DuplicarResultado {
  criados: { original_id: string; novo_id: string; numero_pedido: string }[]
  erros: { id: string; motivo: string }[]
}

export interface ExcluirPreview {
  permitidos: { id: string; numero_pedido: string; total_itens: number }[]
  bloqueados: { id: string; numero_pedido: string; status: string; motivo: string }[]
}

export interface ExcluirResultado {
  excluidos: number
  itens_excluidos: number
  pedidos_excluidos_por_sem_item: number
}

// ── Defaults de configuração ──────────────────────────────────────────────────

const CONFIG_DUPLICAR_DEFAULT: ConfigDuplicar = {
  duplicar_numero_auto: false,
  duplicar_copiar_datas: false,
  duplicar_status_inicial: 'copiar',
}

const CONFIG_EXCLUIR_DEFAULT: ConfigExcluir = {
  excluir_status_permitidos: ['draft', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'],
  excluir_pedido_sem_item_permitido: true,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}-${ano}`
}

function gerarNumeroPedido(sequencial: number): string {
  const ano = new Date().getFullYear().toString().slice(-2)
  return `pedi_id_${String(sequencial).padStart(7, '0')}/${ano}`
}

async function buscarConfig(
  db: Record<string, unknown>,
  tenantId: string,
): Promise<{ duplicar: ConfigDuplicar; excluir: ConfigExcluir }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = await (db as any).configuracaoPedido.findFirst({
      where: { tenant_id: tenantId },
    })
    if (!config) return { duplicar: CONFIG_DUPLICAR_DEFAULT, excluir: CONFIG_EXCLUIR_DEFAULT }

    return {
      duplicar: {
        duplicar_numero_auto: config.duplicar_numero_auto ?? CONFIG_DUPLICAR_DEFAULT.duplicar_numero_auto,
        duplicar_copiar_datas: config.duplicar_copiar_datas ?? CONFIG_DUPLICAR_DEFAULT.duplicar_copiar_datas,
        duplicar_status_inicial: config.duplicar_status_inicial ?? CONFIG_DUPLICAR_DEFAULT.duplicar_status_inicial,
      },
      excluir: {
        excluir_status_permitidos: config.excluir_status_permitidos ?? CONFIG_EXCLUIR_DEFAULT.excluir_status_permitidos,
        excluir_pedido_sem_item_permitido: config.excluir_pedido_sem_item_permitido ?? CONFIG_EXCLUIR_DEFAULT.excluir_pedido_sem_item_permitido,
      },
    }
  } catch {
    // Se a tabela de config não existir ainda, usar defaults
    return { duplicar: CONFIG_DUPLICAR_DEFAULT, excluir: CONFIG_EXCLUIR_DEFAULT }
  }
}

// ── Serviço de Duplicar ───────────────────────────────────────────────────────

export class DuplicarService {
  async preview(
    db: Record<string, unknown>,
    tenantId: string,
    ids: string[],
  ): Promise<{
    config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
    pedidos: { id: string; numero_pedido: string; total_itens: number }[]
  }> {
    const { duplicar: config } = await buscarConfig(db, tenantId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: ids }, id_organizacao: tenantId },
      include: { itens_pedido: { select: { id_item: true } } },
    })

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND')
    }

    return {
      config: {
        numero_auto: config.duplicar_numero_auto,
        copiar_datas: config.duplicar_copiar_datas,
        status_inicial: config.duplicar_status_inicial,
      },
      pedidos: pedidos.map((p: Record<string, unknown>) => ({
        id: p.id_pedido as string,
        numero_pedido: p.numero_pedido as string,
        total_itens: (p.itens_pedido as unknown[]).length,
      })),
    }
  }

  async confirmar(
    db: Record<string, unknown>,
    tenantId: string,
    companyId: string,
    userId: string,
    payload: DuplicarPayload,
  ): Promise<DuplicarResultado> {
    const { duplicar: config } = await buscarConfig(db, tenantId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: payload.ids }, id_organizacao: tenantId },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    if (pedidos.length !== payload.ids.length) {
      throw new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND')
    }

    // Validar números fornecidos pelo usuário quando não é auto
    if (!config.duplicar_numero_auto) {
      for (const id of payload.ids) {
        if (!payload.numeros?.[id]) {
          throw new AppError(
            `Número do pedido não fornecido para o pedido ${id}`,
            400,
            'VALIDATION_ERROR',
          )
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultado: DuplicarResultado = await (db as any).$transaction(async (tx0: unknown) => {
      const tx = tx0 as Tx
      const criados: DuplicarResultado['criados'] = []
      const erros: DuplicarResultado['erros'] = []

      for (const pedidoRaw of pedidos) {
        const pedido = pedidoRaw as Record<string, unknown>
        try {
          // Definir número do pedido duplicado
          let numeroPedido: string
          if (config.duplicar_numero_auto) {
            const total = await tx.pedido.count({ where: { id_organizacao: tenantId } })
            numeroPedido = gerarNumeroPedido(total + 1)
          } else {
            numeroPedido = payload.numeros![pedido.id_pedido as string]
          }

          // Verificar se número já existe
          const numeroExistente = await tx.pedido.findFirst({
            where: { numero_pedido: numeroPedido, id_organizacao: tenantId },
          })
          if (numeroExistente) {
            erros.push({ id: pedido.id_pedido as string, motivo: `Número "${numeroPedido}" já está em uso` })
            continue
          }

          // Definir status
          const status =
            config.duplicar_status_inicial === 'copiar'
              ? (pedido.status_pedido as string)
              : config.duplicar_status_inicial

          // Definir datas (data_emissao_pedido é DateTime, não string)
          const datas = config.duplicar_copiar_datas
            ? { data_emissao_pedido: pedido.data_emissao_pedido as Date }
            : { data_emissao_pedido: new Date() }

          // Extrair campos a copiar (sem id, timestamps, pedidos_origem, histórico de transferências)
          const {
            id_pedido: _id,
            data_criacao_pedido: _ca,
            data_atualizacao_pedido: _ua,
            ids_origem_consolidacao_pedido: _po,
            data_consolidacao_pedido: _dcp,
            data_transferencia_saldo_pedido: _dtsp,
            itens: _itens,
            ...camposBase
          } = pedido

          // Clonar itens com contadores de execução zerados
          const itensClonados = (pedido.itens_pedido as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => {
            const {
              id_item: _iid,
              id_pedido: _pid,
              data_criacao_item: _ica,
              data_atualizacao_item: _iua,
              quantidade_atual_item: _qsp,
              quantidade_pronta_item: _qpp,
              quantidade_transferida_item: _qtp,
              quantidade_cancelada_item: _qcp,
              ...itemBase
            } = item
            return {
              ...itemBase,
              id_item: gerarId('pite'),
              id_organizacao: tenantId,
              id_workspace: companyId,
              quantidade_atual_item: item.quantidade_inicial_item,
              quantidade_pronta_item: 0,
              quantidade_transferida_item: 0,
              quantidade_cancelada_item: 0,
            }
          })

          const novoPedido = await tx.pedido.create({
            data: {
              ...camposBase,
              ...datas,
              id_pedido: gerarId('pedi'),
              id_organizacao: tenantId,
              id_workspace: companyId,
              numero_pedido: numeroPedido,
              status_pedido: status,
              itens: { create: itensClonados },
            } as unknown as Prisma.PedidoUncheckedCreateInput,
          })

          // Audit trail via historico-global (fire-and-forget)
          auditLog({
            id_organizacao:               tenantId,
            tipo_ator_historico_log:      'USUARIO',
            id_ator_historico_log:        userId,
            nome_ator_historico_log:      userId,
            modulo_historico_log:         'pedido',
            tipo_recurso_historico_log:   'Pedido',
            id_recurso_historico_log:     novoPedido.id_pedido,
            acao_historico_log:           'DUPLICAR',
            detalhe_acao_historico_log:   `Pedido ${pedido.numero_pedido} duplicado para ${numeroPedido}`,
            estado_posterior_historico_log: { original_id: pedido.id_pedido, numero_original: pedido.numero_pedido },
          })

          criados.push({
            original_id: pedido.id_pedido as string,
            novo_id: novoPedido.id_pedido,
            numero_pedido: numeroPedido,
          })
        } catch (err) {
          erros.push({
            id: pedido.id_pedido as string,
            motivo: err instanceof Error ? err.message : 'Erro desconhecido',
          })
        }
      }

      return { criados, erros }
    })

    return resultado
  }

  async duplicarItens(
    db: Record<string, unknown>,
    tenantId: string,
    companyId: string,
    payload: DuplicarItemPayload,
  ): Promise<DuplicarResultado> {
    // Verificar que o pedido pertence ao tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedido = await (db as any).pedido.findFirst({
      where: { id_pedido: payload.pedido_id, id_organizacao: tenantId },
    })
    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itens = await (db as any).pedidoItem.findMany({
      where: {
        id_item: { in: payload.item_ids },
        id_pedido: payload.pedido_id,
        id_organizacao: tenantId,
      },
    })

    if (itens.length !== payload.item_ids.length) {
      throw new AppError('Um ou mais itens não encontrados', 404, 'NOT_FOUND')
    }

    // Buscar maior sequencia_item atual para continuar de onde parou
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todosItens = await (db as any).pedidoItem.findMany({
      where: { id_pedido: payload.pedido_id, id_organizacao: tenantId },
      select: { sequencia_item_pedido: true },
    })
    const maxSequencia = todosItens.reduce((max: number, i: Record<string, unknown>) => Math.max(max, (i.sequencia_item_pedido as number | undefined) ?? 0), 0)
    let proximaSequencia = maxSequencia + 1

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const criados: DuplicarResultado['criados'] = await (db as any).$transaction(async (tx0: unknown) => {
      const tx = tx0 as Tx
      const resultado = []

      for (const itemRaw of itens) {
        const item = itemRaw as Record<string, unknown>
        const {
          id_item: _id,
          id_pedido: _pid,
          data_criacao_item: _ca,
          data_atualizacao_item: _ua,
          sequencia_item_pedido: _seq,
          quantidade_atual_item: _qsp,
          quantidade_pronta_item: _qpp,
          quantidade_transferida_item: _qtp,
          quantidade_cancelada_item: _qcp,
          ...itemBase
        } = item

        const novoItem = await tx.pedidoItem.create({
          data: {
            ...itemBase,
            id_item: gerarId('pite'),
            id_organizacao: tenantId,
            id_workspace: companyId,
            id_pedido: payload.pedido_id,
            sequencia_item_pedido: proximaSequencia++,
            quantidade_atual_item: item.quantidade_inicial_item as number,
            quantidade_pronta_item: 0,
            quantidade_transferida_item: 0,
            quantidade_cancelada_item: 0,
          } as unknown as Prisma.PedidoItemUncheckedCreateInput,
        })

        resultado.push({
          original_id: item.id_item as string,
          novo_id: novoItem.id_item,
          numero_pedido: pedido.numero_pedido as string,
        })
      }

      return resultado
    })

    return { criados, erros: [] }
  }
}

// ── Serviço de Excluir ────────────────────────────────────────────────────────

export class ExcluirService {
  async preview(
    db: Record<string, unknown>,
    tenantId: string,
    ids: string[],
  ): Promise<ExcluirPreview> {
    const { excluir: config } = await buscarConfig(db, tenantId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: ids }, id_organizacao: tenantId },
      include: { itens_pedido: { select: { id_item: true } } },
    })

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND')
    }

    const permitidos: ExcluirPreview['permitidos'] = []
    const bloqueados: ExcluirPreview['bloqueados'] = []

    for (const pedidoRaw of pedidos) {
      const pedido = pedidoRaw as Record<string, unknown>
      const statusPed = pedido.status_pedido as string
      if (config.excluir_status_permitidos.includes(statusPed)) {
        permitidos.push({
          id: pedido.id_pedido as string,
          numero_pedido: pedido.numero_pedido as string,
          total_itens: (pedido.itens_pedido as unknown[]).length,
        })
      } else {
        const statusPermitidosLabel = config.excluir_status_permitidos.join(', ')
        bloqueados.push({
          id: pedido.id_pedido as string,
          numero_pedido: pedido.numero_pedido as string,
          status: statusPed,
          motivo: `Status "${statusPed}" não permite exclusão. Permitidos: ${statusPermitidosLabel}`,
        })
      }
    }

    return { permitidos, bloqueados }
  }

  async confirmar(
    db: Record<string, unknown>,
    tenantId: string,
    userId: string,
    ids: string[],
  ): Promise<ExcluirResultado> {
    const { excluir: config } = await buscarConfig(db, tenantId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: ids }, id_organizacao: tenantId },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND')
    }

    // Validar todos os status no backend (nunca confiar no frontend)
    const bloqueados = pedidos.filter(
      (p: Record<string, unknown>) => !config.excluir_status_permitidos.includes(p.status_pedido as string),
    )
    if (bloqueados.length > 0) {
      const numeros = bloqueados.map((p: Record<string, unknown>) => p.numero_pedido).join(', ')
      throw new AppError(
        `Pedidos com status não permitido para exclusão: ${numeros}`,
        400,
        'STATUS_NAO_PERMITIDO',
      )
    }

    const totalItens = pedidos.reduce((acc: number, p: Record<string, unknown>) => acc + ((p.itens_pedido as unknown[] | undefined)?.length ?? 0), 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).$transaction(async (tx0: unknown) => {
      const tx = tx0 as Tx
      // AUDIT TRAIL ANTES de excluir (obrigatório — dados serão perdidos)
      for (const pedidoRaw of pedidos) {
        const pedido = pedidoRaw as Record<string, unknown>
        auditLog({
          id_organizacao:               tenantId,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        userId,
          nome_ator_historico_log:      userId,
          modulo_historico_log:         'pedido',
          tipo_recurso_historico_log:   'Pedido',
          id_recurso_historico_log:     pedido.id_pedido as string,
          acao_historico_log:           'EXCLUIR',
          detalhe_acao_historico_log:   `Pedido ${pedido.numero_pedido} excluido (hard delete)`,
          estado_anterior_historico_log: {
            numero_pedido: pedido.numero_pedido,
            status:        pedido.status_pedido,
            total_itens:   (pedido.itens_pedido as unknown[]).length,
            itens: (pedido.itens_pedido as Array<Record<string, unknown>>).map((i) => ({
              id:                        i.id_item,
              part_number:               i.part_number_item,
              quantidade_inicial_pedido: i.quantidade_inicial_item,
            })),
          },
        })
      }

      // Hard delete: itens primeiro (FK), depois pedidos
      await tx.pedidoItem.deleteMany({
        where: { id_pedido: { in: ids }, id_organizacao: tenantId },
      })

      await tx.pedido.deleteMany({
        where: { id_pedido: { in: ids }, id_organizacao: tenantId },
      })
    })

    return {
      excluidos: pedidos.length,
      itens_excluidos: totalItens,
      pedidos_excluidos_por_sem_item: 0,
    }
  }

  async excluirItens(
    db: Record<string, unknown>,
    tenantId: string,
    userId: string,
    pedidoId: string,
    itemIds: string[],
  ): Promise<ExcluirResultado> {
    const { excluir: config } = await buscarConfig(db, tenantId)

    // Verificar que o pedido pertence ao tenant e está em status permitido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedido = await (db as any).pedido.findFirst({
      where: { id_pedido: pedidoId, id_organizacao: tenantId },
      include: { itens_pedido: { select: { id_item: true } } },
    })
    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
    }

    if (!config.excluir_status_permitidos.includes(pedido.status_pedido)) {
      throw new AppError(
        `Status "${pedido.status_pedido}" não permite exclusão de itens`,
        400,
        'STATUS_NAO_PERMITIDO',
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itens = await (db as any).pedidoItem.findMany({
      where: { id_item: { in: itemIds }, id_pedido: pedidoId, id_organizacao: tenantId },
    })
    if (itens.length !== itemIds.length) {
      throw new AppError('Um ou mais itens não encontrados', 404, 'NOT_FOUND')
    }

    let pedidosExcluidosPorSemItem = 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).$transaction(async (tx0: unknown) => {
      const tx = tx0 as Tx
      // Audit trail ANTES da exclusão (via historico-global, fire-and-forget)
      auditLog({
        id_organizacao:               tenantId,
        tipo_ator_historico_log:      'USUARIO',
        id_ator_historico_log:        userId,
        nome_ator_historico_log:      userId,
        modulo_historico_log:         'pedido',
        tipo_recurso_historico_log:   'PedidoItem',
        id_recurso_historico_log:     pedidoId,
        acao_historico_log:           'EXCLUIR_ITENS',
        detalhe_acao_historico_log:   `${itemIds.length} item(ns) excluido(s) do pedido`,
        estado_anterior_historico_log: {
          item_ids: itemIds,
          itens: itens.map((i: Record<string, unknown>) => ({
            id:                        i.id_item,
            part_number:               i.part_number_item,
            quantidade_inicial_pedido: i.quantidade_inicial_item,
          })),
        },
      })

      // Hard delete dos itens
      await tx.pedidoItem.deleteMany({
        where: { id_item: { in: itemIds }, id_pedido: pedidoId, id_organizacao: tenantId },
      })

      // Verificar itens restantes no pedido
      const itensRestantes = await tx.pedidoItem.count({
        where: { id_pedido: pedidoId, id_organizacao: tenantId },
      })

      if (itensRestantes === 0 && !config.excluir_pedido_sem_item_permitido) {
        // Audit trail do pedido pai antes de excluir (via historico-global)
        auditLog({
          id_organizacao:               tenantId,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        userId,
          nome_ator_historico_log:      userId,
          modulo_historico_log:         'pedido',
          tipo_recurso_historico_log:   'Pedido',
          id_recurso_historico_log:     pedidoId,
          acao_historico_log:           'EXCLUIR_AUTOMATICAMENTE',
          detalhe_acao_historico_log:   'Pedido excluido automaticamente por ficar sem itens',
          estado_anterior_historico_log: { numero_pedido: pedido.numero_pedido },
        })

        await tx.pedido.delete({
          where: { id_pedido: pedidoId },
        })

        pedidosExcluidosPorSemItem = 1
      }
    })

    return {
      excluidos: pedidosExcluidosPorSemItem,
      itens_excluidos: itemIds.length,
      pedidos_excluidos_por_sem_item: pedidosExcluidosPorSemItem,
    }
  }
}
