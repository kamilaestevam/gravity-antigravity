/**
 * duplicarExcluirService.ts — Lógica de negócio de duplicação e exclusão de pedidos
 *
 * Regras:
 *   - Duplicar: clona pedido + itens respeitando configs da organização
 *   - Excluir: hard delete com audit trail OBRIGATÓRIO antes de deleteMany
 *   - id_organizacao (e id_workspace quando aplicável) em todas as queries
 *   - $transaction para atomicidade
 */

import { Prisma } from '@prisma/client'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'

// Nota: NÃO importamos PrismaClient aqui. As funções recebem `db` que JÁ é
// um Prisma.TransactionClient aberto pelo @gravity/resolver-organizacao. Tentar
// abrir nova `db.$transaction(...)` aqui dispara "TypeError: db.$transaction
// is not a function" — TransactionClient não expõe esse método.

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
  excluir_status_permitidos: ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'],
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
  id_organizacao: string,
): Promise<{ duplicar: ConfigDuplicar; excluir: ConfigExcluir }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = await (db as any).configuracaoPedido.findFirst({
      where: { id_organizacao: id_organizacao },
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
    id_organizacao: string,
    ids: string[],
  ): Promise<{
    config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
    pedidos: { id: string; numero_pedido: string; total_itens: number }[]
  }> {
    const { duplicar: config } = await buscarConfig(db, id_organizacao)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: ids }, id_organizacao: id_organizacao },
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
    id_organizacao: string,
    id_workspace: string | undefined,
    id_usuario: string,
    nome_usuario: string,
    payload: DuplicarPayload,
  ): Promise<DuplicarResultado> {
    const { duplicar: config } = await buscarConfig(db, id_organizacao)

    // id_workspace é conditional: aplica só se o header veio. Caso contrário, o
    // filtro fica apenas em id_organizacao (pattern do GET /pedidos). Forçar a
    // coluna sempre causava 404 quando o pedido tinha workspace NULL ou diverso.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: {
        id_pedido: { in: payload.ids },
        id_organizacao: id_organizacao,
        ...(id_workspace ? { id_workspace } : {}),
      },
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

    // IMPORTANTE: NÃO abrir $transaction aninhado.
    // `db` (vindo de withOrganizacao) JÁ É um Prisma.TransactionClient — o resolver-organizacao
    // abriu prisma.$transaction(...) e nos entregou o tx aqui. TransactionClient não expõe
    // o método $transaction → aninhar causa "TypeError: db.$transaction is not a function"
    // ANTES do for-loop rodar, então NADA é gravado e o frontend pode mascarar como sucesso.
    // Mesma armadilha já documentada em processos-core/src/routes/pedidos.ts:994-999.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = db as any
    const criados: DuplicarResultado['criados'] = []
    const erros: DuplicarResultado['erros'] = []

    for (const pedidoRaw of pedidos) {
      const pedido = pedidoRaw as Record<string, unknown>
      try {
        // Definir número do pedido duplicado
        let numeroPedido: string
        if (config.duplicar_numero_auto) {
          const total = await tx.pedido.count({ where: { id_organizacao: id_organizacao } })
          numeroPedido = gerarNumeroPedido(total + 1)
        } else {
          numeroPedido = payload.numeros![pedido.id_pedido as string]
        }

        // Verificar se número já existe
        const numeroExistente = await tx.pedido.findFirst({
          where: { numero_pedido: numeroPedido, id_organizacao: id_organizacao },
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

        // Débito 2B — resolver FK do status (StatusPedido) na organização
        const statusFK = await tx.statusPedido.findFirst({
          where: { id_organizacao: id_organizacao, nome_pedido_status: status },
          select: { id_pedido_status: true },
        })
        if (!statusFK) {
          console.warn(
            `[duplicarPedidos] StatusPedido '${status}' nao encontrado na organizacao=${id_organizacao}; ` +
            `pedido duplicado sera criado sem vinculo id_status_pedido.`,
          )
        }

        // Definir datas (data_emissao_pedido é DateTime, não string)
        const datas = config.duplicar_copiar_datas
          ? { data_emissao_pedido: pedido.data_emissao_pedido as Date }
          : { data_emissao_pedido: new Date() }

        // Extrair campos a copiar (sem id, timestamps, pedidos_origem, histórico de transferências)
        // IMPORTANTE: a relação Prisma chama-se `itens_pedido` (schema.prisma:156).
        // Destructurar `itens` (nome legado) NÃO removia o array do spread → camposBase
        // herdava `itens_pedido: [PedidoItem[]]` e o create do Prisma falhava com
        // PrismaClientValidationError (era um dos bugs do hotfix).
        const {
          id_pedido: _id,
          data_criacao_pedido: _ca,
          data_atualizacao_pedido: _ua,
          ids_origem_consolidacao_pedido: _po,
          data_consolidacao_pedido: _dcp,
          data_transferencia_saldo_pedido: _dtsp,
          itens_pedido: _itens,
          ...camposBase
        } = pedido

        // Workspace do duplicado: usa o do header se veio; senão herda do original
        // (fallback para id_organizacao quando o original também não tem).
        const id_workspace_alvo =
          id_workspace ?? (pedido.id_workspace as string | undefined) ?? id_organizacao

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
            id_organizacao: id_organizacao,
            id_workspace: id_workspace_alvo,
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
            id_organizacao: id_organizacao,
            id_workspace: id_workspace_alvo,
            numero_pedido: numeroPedido,
            status_pedido: status,
            id_status_pedido: statusFK?.id_pedido_status ?? null,
            itens_pedido: { create: itensClonados },
          } as unknown as Prisma.PedidoUncheckedCreateInput,
        })

        // Audit trail via historico-global (fire-and-forget)
        auditLog({
          id_organizacao:               id_organizacao,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        id_usuario,
          nome_ator_historico_log:      nome_usuario,
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
  }

  async duplicarItens(
    db: Record<string, unknown>,
    id_organizacao: string,
    id_workspace: string | undefined,
    payload: DuplicarItemPayload,
  ): Promise<DuplicarResultado> {
    // id_workspace conditional (mesma justificativa de confirmar()).
    // Verificar que o pedido pertence à organização (workspace só se header veio)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedido = await (db as any).pedido.findFirst({
      where: {
        id_pedido: payload.pedido_id,
        id_organizacao: id_organizacao,
        ...(id_workspace ? { id_workspace } : {}),
      },
    })
    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
    }

    // Workspace alvo dos itens novos: header > workspace do pedido pai > id_organizacao
    const id_workspace_alvo =
      id_workspace ?? (pedido.id_workspace as string | undefined) ?? id_organizacao

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itens = await (db as any).pedidoItem.findMany({
      where: {
        id_item: { in: payload.item_ids },
        id_pedido: payload.pedido_id,
        id_organizacao: id_organizacao,
        ...(id_workspace ? { id_workspace } : {}),
      },
    })

    if (itens.length !== payload.item_ids.length) {
      throw new AppError('Um ou mais itens não encontrados', 404, 'NOT_FOUND')
    }

    // REGRA DE ORDENAÇÃO (aprovada pelo Coordenador + Líder Técnico, 2026-05-11):
    // Item duplicado fica IMEDIATAMENTE ABAIXO do original, não no final.
    //
    // Estratégia "renumerar limpo": carrega ordem atual de todos os itens do pedido
    // pai, monta a ordem final (cada original seguido da sua cópia, quando aplicável)
    // e renumera 1..N. Mesma estratégia já usada em consolidacoes-pedido.ts:269-270.
    //
    // Vantagens vs. SHIFT por UPDATE em massa: lógica óbvia, sem risco de duplicatas
    // temporárias mid-update, atômico via tx aberta pelo withOrganizacao.
    // Custo: N updates sequenciais — aceitável dado que pedidos com >100 itens são raros.
    //
    // Sem $transaction aninhado — `db` já é TransactionClient (ver confirmar()).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = db as any

    // 1. Carregar ordem atual do pedido pai (já ordenada)
    const todosItens = await tx.pedidoItem.findMany({
      where: {
        id_pedido: payload.pedido_id,
        id_organizacao: id_organizacao,
        ...(id_workspace ? { id_workspace } : {}),
      },
      select: { id_item: true, sequencia_item_pedido: true },
      orderBy: { sequencia_item_pedido: 'asc' },
    })

    // 2. Criar os novos itens (sequência temporária = null; será reescrita no passo 4)
    const itensASerDuplicados = new Set(payload.item_ids)
    const criados: DuplicarResultado['criados'] = []
    const novoPorOriginal = new Map<string, string>() // originalId -> novoId

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

      // Zera as 3 quantidades de execução para evitar saldo fantasma —
      // copiar valores reais de pronta/transferida/cancelada criaria registros
      // sem correspondência em transferências/processos de embarque reais.
      const novoItem = await tx.pedidoItem.create({
        data: {
          ...itemBase,
          id_item: gerarId('pite'),
          id_organizacao: id_organizacao,
          id_workspace: id_workspace_alvo,
          id_pedido: payload.pedido_id,
          sequencia_item_pedido: null, // será reescrita no passo 4
          quantidade_atual_item: item.quantidade_inicial_item as number,
          quantidade_pronta_item: 0,
          quantidade_transferida_item: 0,
          quantidade_cancelada_item: 0,
        } as unknown as Prisma.PedidoItemUncheckedCreateInput,
      })

      novoPorOriginal.set(item.id_item as string, novoItem.id_item)
      criados.push({
        original_id: item.id_item as string,
        novo_id: novoItem.id_item,
        numero_pedido: pedido.numero_pedido as string,
      })
    }

    // 3. Construir ordem final: cada original seguido da sua cópia (se duplicado)
    const ordemFinal: string[] = []
    for (const item of todosItens as Array<{ id_item: string; sequencia_item_pedido: number | null }>) {
      ordemFinal.push(item.id_item)
      if (itensASerDuplicados.has(item.id_item)) {
        const novoId = novoPorOriginal.get(item.id_item)
        if (novoId) ordemFinal.push(novoId)
      }
    }

    // 4. Renumerar tudo em 1..N na ordem final
    for (let i = 0; i < ordemFinal.length; i++) {
      await tx.pedidoItem.update({
        where: { id_item: ordemFinal[i] },
        data: { sequencia_item_pedido: i + 1 },
      })
    }

    // 5. Tocar o pedido pai para disparar @updatedAt → frontend detecta via
    //    `itemVersion(p) = p.updated_at` no useGTExpandir e recarrega os filhos
    //    expandidos automaticamente. Sem isso, o cache de filhos fica stale e
    //    o item duplicado não aparece na linha expandida (Bug 2 reportado).
    await tx.pedido.update({
      where: { id_pedido: payload.pedido_id },
      data: { data_atualizacao_pedido: new Date() },
    })

    return { criados, erros: [] }
  }
}

// ── Serviço de Excluir ────────────────────────────────────────────────────────

export class ExcluirService {
  async preview(
    db: Record<string, unknown>,
    id_organizacao: string,
    ids: string[],
  ): Promise<ExcluirPreview> {
    const { excluir: config } = await buscarConfig(db, id_organizacao)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: ids }, id_organizacao: id_organizacao },
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
    id_organizacao: string,
    id_usuario: string,
    nome_usuario: string,
    ids: string[],
  ): Promise<ExcluirResultado> {
    const { excluir: config } = await buscarConfig(db, id_organizacao)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos = await (db as any).pedido.findMany({
      where: { id_pedido: { in: ids }, id_organizacao: id_organizacao },
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

    // Sem $transaction aninhado — `db` já é TransactionClient (ver confirmar() de DuplicarService).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = db as any
    // AUDIT TRAIL ANTES de excluir (obrigatório — dados serão perdidos)
    for (const pedidoRaw of pedidos) {
      const pedido = pedidoRaw as Record<string, unknown>
      auditLog({
        id_organizacao:               id_organizacao,
        tipo_ator_historico_log:      'USUARIO',
        id_ator_historico_log:        id_usuario,
        nome_ator_historico_log:      nome_usuario,
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
      where: { id_pedido: { in: ids }, id_organizacao: id_organizacao },
    })

    await tx.pedido.deleteMany({
      where: { id_pedido: { in: ids }, id_organizacao: id_organizacao },
    })

    return {
      excluidos: pedidos.length,
      itens_excluidos: totalItens,
      pedidos_excluidos_por_sem_item: 0,
    }
  }

  async excluirItens(
    db: Record<string, unknown>,
    id_organizacao: string,
    id_usuario: string,
    nome_usuario: string,
    pedidoId: string,
    itemIds: string[],
  ): Promise<ExcluirResultado> {
    const { excluir: config } = await buscarConfig(db, id_organizacao)

    // Verificar que o pedido pertence ao tenant e está em status permitido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedido = await (db as any).pedido.findFirst({
      where: { id_pedido: pedidoId, id_organizacao: id_organizacao },
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
      where: { id_item: { in: itemIds }, id_pedido: pedidoId, id_organizacao: id_organizacao },
    })
    if (itens.length !== itemIds.length) {
      throw new AppError('Um ou mais itens não encontrados', 404, 'NOT_FOUND')
    }

    let pedidosExcluidosPorSemItem = 0

    // Sem $transaction aninhado — `db` já é TransactionClient (ver confirmar() de DuplicarService).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = db as any
    // Audit trail ANTES da exclusão (via historico-global, fire-and-forget)
    auditLog({
      id_organizacao:               id_organizacao,
      tipo_ator_historico_log:      'USUARIO',
      id_ator_historico_log:        id_usuario,
      nome_ator_historico_log:      nome_usuario,
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
      where: { id_item: { in: itemIds }, id_pedido: pedidoId, id_organizacao: id_organizacao },
    })

    // Verificar itens restantes no pedido
    const itensRestantes = await tx.pedidoItem.count({
      where: { id_pedido: pedidoId, id_organizacao: id_organizacao },
    })

    if (itensRestantes === 0 && !config.excluir_pedido_sem_item_permitido) {
      // Audit trail do pedido pai antes de excluir (via historico-global)
      auditLog({
        id_organizacao:               id_organizacao,
        tipo_ator_historico_log:      'USUARIO',
        id_ator_historico_log:        id_usuario,
        nome_ator_historico_log:      nome_usuario,
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

    return {
      excluidos: pedidosExcluidosPorSemItem,
      itens_excluidos: itemIds.length,
      pedidos_excluidos_por_sem_item: pedidosExcluidosPorSemItem,
    }
  }
}
