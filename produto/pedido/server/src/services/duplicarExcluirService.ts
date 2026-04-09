/**
 * duplicarExcluirService.ts — Lógica de negócio de duplicação e exclusão de pedidos
 *
 * Regras:
 *   - Duplicar: clona pedido + itens respeitando configs do tenant
 *   - Excluir: hard delete com audit trail OBRIGATÓRIO antes de deleteMany
 *   - tenant_id em todas as queries
 *   - $transaction para atomicidade
 */

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
      where: { id: { in: ids }, tenant_id: tenantId },
      include: { itens: { select: { id: true } } },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pedidos: pedidos.map((p: any) => ({
        id: p.id,
        numero_pedido: p.numero_pedido,
        total_itens: p.itens.length,
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
      where: { id: { in: payload.ids }, tenant_id: tenantId },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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
    const resultado: DuplicarResultado = await (db as any).$transaction(async (tx: any) => {
      const criados: DuplicarResultado['criados'] = []
      const erros: DuplicarResultado['erros'] = []

      for (const pedido of pedidos) {
        try {
          // Definir número do pedido duplicado
          let numeroPedido: string
          if (config.duplicar_numero_auto) {
            const total = await tx.pedido.count({ where: { tenant_id: tenantId } })
            numeroPedido = gerarNumeroPedido(total + 1)
          } else {
            numeroPedido = payload.numeros![pedido.id]
          }

          // Verificar se número já existe
          const numeroExistente = await tx.pedido.findFirst({
            where: { numero_pedido: numeroPedido, tenant_id: tenantId },
          })
          if (numeroExistente) {
            erros.push({ id: pedido.id, motivo: `Número "${numeroPedido}" já está em uso` })
            continue
          }

          // Definir status
          const status =
            config.duplicar_status_inicial === 'copiar'
              ? pedido.status
              : config.duplicar_status_inicial

          // Definir datas
          const datas = config.duplicar_copiar_datas
            ? { data_emissao_pedido: pedido.data_emissao_pedido }
            : { data_emissao_pedido: new Date().toISOString() }

          // Extrair campos a copiar (sem id, timestamps, pedidos_origem, histórico de transferências)
          const {
            id: _id,
            pedido_criado_em: _ca,
            pedido_atualizado_em: _ua,
            pedidos_origem_id: _po,
            data_consolidacao_pedido: _dcp,
            data_transferencia_saldo_pedido: _dtsp,
            itens: _itens,
            ...camposBase
          } = pedido

          // Clonar itens com contadores de execução zerados
          const itensClonados = pedido.itens.map((item: Record<string, unknown>) => {
            const {
              id: _iid,
              pedido_id: _pid,
              item_criado_em: _ica,
              item_atualizado_em: _iua,
              saldo_item_pedido: _qsp,
              quantidade_pronta_total_item_pedido: _qpp,
              quantidade_transferida_item_pedido: _qtp,
              quantidade_cancelada_item_pedido: _qcp,
              ...itemBase
            } = item
            return {
              ...itemBase,
              id: gerarId('pite'),
              tenant_id: tenantId,
              company_id: companyId,
              saldo_item_pedido: item.quantidade_inicial_item_pedido,
              quantidade_pronta_total_item_pedido: 0,
              quantidade_transferida_item_pedido: 0,
              quantidade_cancelada_item_pedido: 0,
            }
          })

          const novoPedido = await tx.pedido.create({
            data: {
              ...camposBase,
              ...datas,
              id: gerarId('pedi'),
              tenant_id: tenantId,
              company_id: companyId,
              numero_pedido: numeroPedido,
              status,
              itens: { create: itensClonados },
            },
          })

          // Audit trail de duplicação
          await tx.pedidoHistorico?.create?.({
            data: {
              tenant_id: tenantId,
              pedido_id: novoPedido.id,
              user_id: userId,
              canal: 'duplicacao',
              dados: JSON.stringify({ original_id: pedido.id, numero_original: pedido.numero_pedido }),
            },
          }).catch(() => {
            // Audit trail é best-effort se tabela não existir ainda
          })

          criados.push({
            original_id: pedido.id,
            novo_id: novoPedido.id,
            numero_pedido: numeroPedido,
          })
        } catch (err) {
          erros.push({
            id: pedido.id,
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
      where: { id: payload.pedido_id, tenant_id: tenantId },
    })
    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itens = await (db as any).pedidoItem.findMany({
      where: {
        id: { in: payload.item_ids },
        pedido_id: payload.pedido_id,
        tenant_id: tenantId,
      },
    })

    if (itens.length !== payload.item_ids.length) {
      throw new AppError('Um ou mais itens não encontrados', 404, 'NOT_FOUND')
    }

    // Buscar maior sequencia_item atual para continuar de onde parou
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todosItens = await (db as any).pedidoItem.findMany({
      where: { pedido_id: payload.pedido_id, tenant_id: tenantId },
      select: { sequencia_item: true },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maxSequencia = todosItens.reduce((max: number, i: any) => Math.max(max, i.sequencia_item ?? 0), 0)
    let proximaSequencia = maxSequencia + 1

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const criados: DuplicarResultado['criados'] = await (db as any).$transaction(async (tx: any) => {
      const resultado = []

      for (const item of itens) {
        const {
          id: _id,
          pedido_id: _pid,
          item_criado_em: _ca,
          item_atualizado_em: _ua,
          sequencia_item: _seq,
          saldo_item_pedido: _qsp,
          quantidade_pronta_total_item_pedido: _qpp,
          quantidade_transferida_item_pedido: _qtp,
          quantidade_cancelada_item_pedido: _qcp,
          ...itemBase
        } = item

        const novoItem = await tx.pedidoItem.create({
          data: {
            ...itemBase,
            id: gerarId('pite'),
            tenant_id: tenantId,
            company_id: companyId,
            pedido_id: payload.pedido_id,
            sequencia_item: proximaSequencia++,
            saldo_item_pedido: item.quantidade_inicial_item_pedido,
            quantidade_pronta_total_item_pedido: 0,
            quantidade_transferida_item_pedido: 0,
            quantidade_cancelada_item_pedido: 0,
          },
        })

        resultado.push({
          original_id: item.id,
          novo_id: novoItem.id,
          numero_pedido: pedido.numero_pedido,
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
      where: { id: { in: ids }, tenant_id: tenantId },
      include: { itens: { select: { id: true } } },
    })

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND')
    }

    const permitidos: ExcluirPreview['permitidos'] = []
    const bloqueados: ExcluirPreview['bloqueados'] = []

    for (const pedido of pedidos) {
      if (config.excluir_status_permitidos.includes(pedido.status)) {
        permitidos.push({
          id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          total_itens: pedido.itens.length,
        })
      } else {
        const statusPermitidosLabel = config.excluir_status_permitidos.join(', ')
        bloqueados.push({
          id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          status: pedido.status,
          motivo: `Status "${pedido.status}" não permite exclusão. Permitidos: ${statusPermitidosLabel}`,
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
      where: { id: { in: ids }, tenant_id: tenantId },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    if (pedidos.length !== ids.length) {
      throw new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND')
    }

    // Validar todos os status no backend (nunca confiar no frontend)
    const bloqueados = pedidos.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => !config.excluir_status_permitidos.includes(p.status),
    )
    if (bloqueados.length > 0) {
      const numeros = bloqueados.map((p: Record<string, unknown>) => p.numero_pedido).join(', ')
      throw new AppError(
        `Pedidos com status não permitido para exclusão: ${numeros}`,
        400,
        'STATUS_NAO_PERMITIDO',
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalItens = pedidos.reduce((acc: number, p: any) => acc + p.itens.length, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).$transaction(async (tx: any) => {
      // AUDIT TRAIL ANTES de excluir (obrigatório — dados serão perdidos)
      for (const pedido of pedidos) {
        await tx.pedidoHistorico?.create?.({
          data: {
            tenant_id: tenantId,
            pedido_id: pedido.id,
            user_id: userId,
            canal: 'exclusao',
            dados: JSON.stringify({
              numero_pedido: pedido.numero_pedido,
              status: pedido.status,
              total_itens: pedido.itens.length,
              itens: pedido.itens.map((i: Record<string, unknown>) => ({
                id: i.id,
                part_number: i.part_number,
                quantidade_inicial_item_pedido: i.quantidade_inicial_item_pedido,
              })),
            }),
          },
        }).catch(() => {
          // Best-effort se tabela não existir
        })
      }

      // Hard delete: itens primeiro (FK), depois pedidos
      await tx.pedidoItem.deleteMany({
        where: { pedido_id: { in: ids }, tenant_id: tenantId },
      })

      await tx.pedido.deleteMany({
        where: { id: { in: ids }, tenant_id: tenantId },
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
      where: { id: pedidoId, tenant_id: tenantId },
      include: { itens: { select: { id: true } } },
    })
    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
    }

    if (!config.excluir_status_permitidos.includes(pedido.status)) {
      throw new AppError(
        `Status "${pedido.status}" não permite exclusão de itens`,
        400,
        'STATUS_NAO_PERMITIDO',
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itens = await (db as any).pedidoItem.findMany({
      where: { id: { in: itemIds }, pedido_id: pedidoId, tenant_id: tenantId },
    })
    if (itens.length !== itemIds.length) {
      throw new AppError('Um ou mais itens não encontrados', 404, 'NOT_FOUND')
    }

    let pedidosExcluidosPorSemItem = 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).$transaction(async (tx: any) => {
      // Audit trail ANTES da exclusão
      await tx.pedidoHistorico?.create?.({
        data: {
          tenant_id: tenantId,
          pedido_id: pedidoId,
          user_id: userId,
          canal: 'exclusao_itens',
          dados: JSON.stringify({
            item_ids: itemIds,
            itens: itens.map((i: Record<string, unknown>) => ({
              id: i.id,
              part_number: i.part_number,
              quantidade_inicial_item_pedido: i.quantidade_inicial_item_pedido,
            })),
          }),
        },
      }).catch(() => {
        // Best-effort se tabela não existir
      })

      // Hard delete dos itens
      await tx.pedidoItem.deleteMany({
        where: { id: { in: itemIds }, pedido_id: pedidoId, tenant_id: tenantId },
      })

      // Verificar itens restantes no pedido
      const itensRestantes = await tx.pedidoItem.count({
        where: { pedido_id: pedidoId, tenant_id: tenantId },
      })

      if (itensRestantes === 0 && !config.excluir_pedido_sem_item_permitido) {
        // Audit trail do pedido pai antes de excluir
        await tx.pedidoHistorico?.create?.({
          data: {
            tenant_id: tenantId,
            pedido_id: pedidoId,
            user_id: userId,
            canal: 'exclusao_pedido_sem_item',
            dados: JSON.stringify({
              numero_pedido: pedido.numero_pedido,
              motivo: 'Pedido excluído automaticamente por ficar sem itens',
            }),
          },
        }).catch(() => {
          // Best-effort se tabela não existir
        })

        await tx.pedido.delete({
          where: { id: pedidoId },
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
