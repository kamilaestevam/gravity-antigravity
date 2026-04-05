/**
 * edicaoEmMassaService.ts — Serviço de edição em massa de pedidos
 *
 * Responsabilidades:
 *   - Validar campos bloqueados (calculados — nunca editáveis)
 *   - Calcular preview sem alterar banco
 *   - Aplicar edições em $transaction com recálculo de agregados
 *   - Registrar audit trail
 *
 * Regras:
 *   - tenant_id obrigatório em todas as queries
 *   - Campos em CAMPOS_BLOQUEADOS_* são rejeitados com AppError 400
 *   - Operações: substituir / somar / subtrair / percentual / avancar_dias / recuar_dias
 */

// ── Campos calculados — nunca editáveis em massa ──────────────────────────────

const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  'valor_total_pedido',
  'quantidade_total_inicial_pedido',
  'quantidade_transferida_total',
  'status',
  'id',
  'tenant_id',
  'product_id',
  'created_at',
  'updated_at',
  'deleted_at',
])

const CAMPOS_BLOQUEADOS_ITEM = new Set([
  'valor_total_item',
  'saldo_item_pedido',
  'id',
  'tenant_id',
  'pedido_id',
  'created_at',
  'updated_at',
])

// ── Campos de quantidade — disparam recálculo de agregados ────────────────────

const CAMPOS_QUANTIDADE_ITEM = new Set([
  'quantidade_inicial_item_pedido',
  'quantidade_transferida_item',
  'quantidade_pronta_total',
  'quantidade_cancelada_item_pedido',
])

// ── Tipos internos ────────────────────────────────────────────────────────────

type TipoCampoEdicao = 'texto' | 'numero' | 'data' | 'select' | 'usuario'
type OperacaoCampo = 'substituir' | 'somar' | 'subtrair' | 'percentual' | 'avancar_dias' | 'recuar_dias'

interface CampoEdicaoMassa {
  campo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string | number
}

interface EdicaoMassaPayload {
  pedido_ids: string[]
  campos: CampoEdicaoMassa[]
  nivel: 'pedido' | 'item' | 'combinado'
}

interface EdicaoMassaPreview {
  pedidos_afetados: number
  itens_afetados: number
  campos: {
    campo: string
    nivel: 'pedido' | 'item'
    operacao: OperacaoCampo
    valor: string | number
    multiplos_valores: boolean
    valores_distintos?: string[]
    alertas: string[]
  }[]
  alertas_globais: string[]
}

interface EdicaoMassaResultado {
  pedidos_atualizados: number
  itens_atualizados: number
  campos_alterados: string[]
  erros: { pedido_id: string; motivo: string }[]
}

// ── Classe de erro — exportada para que o router use a mesma instância ────────

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

// ── Serviço ───────────────────────────────────────────────────────────────────

export class EdicaoEmMassaService {

  /** Preview — retorna impacto sem alterar o banco */
  async preview(
    tenantId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db: any,
    payload: EdicaoMassaPayload,
  ): Promise<EdicaoMassaPreview> {
    this.validarCamposEditaveis(payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { tenant_id: tenantId, id: { in: payload.pedido_ids } },
      include: { itens: true },
    })

    const itensAfetados = pedidos.reduce(
      (acc: number, p: Record<string, unknown[]>) => acc + ((p.itens as unknown[])?.length ?? 0),
      0,
    )

    const camposPreview = payload.campos.map(c => {
      const valores: string[] = []

      if (c.nivel === 'pedido') {
        pedidos.forEach((p: Record<string, unknown>) => {
          valores.push(String(p[c.campo] ?? ''))
        })
      } else {
        pedidos.forEach((p: Record<string, unknown>) => {
          const itens = (p.itens as Record<string, unknown>[]) ?? []
          itens.forEach(item => {
            valores.push(String(item[c.campo] ?? ''))
          })
        })
      }

      const distintos = [...new Set(valores)]
      const alertas: string[] = []

      if (distintos.length > 1) {
        alertas.push(`${distintos.length} valores distintos encontrados`)
      }

      return {
        campo: c.campo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.valor,
        multiplos_valores: distintos.length > 1,
        valores_distintos: distintos,
        alertas,
      }
    })

    return {
      pedidos_afetados: pedidos.length,
      itens_afetados: itensAfetados,
      campos: camposPreview,
      alertas_globais: [],
    }
  }

  /** Confirmar — executa a edição em massa em $transaction */
  async confirmar(
    tenantId: string,
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db: any,
    payload: EdicaoMassaPayload,
  ): Promise<EdicaoMassaResultado> {
    this.validarCamposEditaveis(payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { tenant_id: tenantId, id: { in: payload.pedido_ids } },
      include: { itens: true },
    })

    if (pedidos.length === 0) {
      throw new AppError('Nenhum pedido encontrado para edição', 404, 'NOT_FOUND')
    }

    const camposPedido = payload.campos.filter(c => c.nivel === 'pedido')
    const camposItem = payload.campos.filter(c => c.nivel === 'item')
    const erros: { pedido_id: string; motivo: string }[] = []
    let pedidosAtualizados = 0
    let itensAtualizados = 0

    const precisaRecalcularAgregados = camposItem.some(c => CAMPOS_QUANTIDADE_ITEM.has(c.campo))

    await db.$transaction(async (tx: Record<string, unknown>) => {
      for (const pedido of pedidos as Record<string, unknown>[]) {
        const pedidoId = pedido.id as string

        try {
          // Aplicar campos de nível pedido
          if (camposPedido.length > 0) {
            const dadosPedido: Record<string, unknown> = {}
            for (const c of camposPedido) {
              dadosPedido[c.campo] = this.aplicarOperacao(pedido[c.campo], c.operacao, c.valor)
            }
            await (tx as Record<string, Record<string, unknown>>).pedido.update({
              where: { id: pedidoId },
              data: dadosPedido,
            })
          }

          // Aplicar campos de nível item
          if (camposItem.length > 0) {
            const itens = (pedido.itens as Record<string, unknown>[]) ?? []
            for (const item of itens) {
              const dadosItem: Record<string, unknown> = {}
              for (const c of camposItem) {
                dadosItem[c.campo] = this.aplicarOperacao(item[c.campo], c.operacao, c.valor)
              }
              await (tx as Record<string, Record<string, unknown>>).pedidoItem.update({
                where: { id: item.id as string },
                data: dadosItem,
              })
              itensAtualizados++
            }
          }

          // Recalcular agregados se campos de quantidade foram alterados
          if (precisaRecalcularAgregados) {
            await this.recalcularAgregados(tenantId, pedidoId, tx)
          }

          pedidosAtualizados++
        } catch (err: unknown) {
          erros.push({
            pedido_id: pedidoId,
            motivo: err instanceof Error ? err.message : 'Erro desconhecido',
          })
        }
      }

      // Registrar audit trail (não bloqueia se tabela não existir)
      try {
        const camposAlterados = payload.campos.map(c => c.campo)
        await (tx as Record<string, Record<string, unknown>>).pedidoHistorico.createMany({
          data: pedidos.map((p: Record<string, unknown>) => ({
            tenant_id: tenantId,
            pedido_id: p.id as string,
            acao: 'EDICAO_EM_MASSA',
            descricao: `Edição em massa: ${camposAlterados.join(', ')}`,
            usuario_id: userId,
            metadata: JSON.stringify({
              campos: payload.campos,
              nivel: payload.nivel,
            }),
          })),
        })
      } catch {
        // Tabela de histórico pode não existir ainda — não bloquear a operação
        console.warn('[EdicaoEmMassa] Tabela pedidoHistorico não disponível, pulando audit trail')
      }
    })

    return {
      pedidos_atualizados: pedidosAtualizados,
      itens_atualizados: itensAtualizados,
      campos_alterados: payload.campos.map(c => c.campo),
      erros,
    }
  }

  /** Aplica a operação a um valor atual, retornando o novo valor */
  private aplicarOperacao(
    valorAtual: unknown,
    operacao: OperacaoCampo,
    valor: string | number,
  ): unknown {
    switch (operacao) {
      case 'substituir':
        return valor

      case 'somar':
        return Number(valorAtual ?? 0) + Number(valor)

      case 'subtrair':
        return Number(valorAtual ?? 0) - Number(valor)

      case 'percentual':
        return Number(valorAtual ?? 0) * (1 + Number(valor) / 100)

      case 'avancar_dias': {
        const base = valorAtual ? new Date(String(valorAtual)) : new Date()
        base.setDate(base.getDate() + Number(valor))
        return base.toISOString()
      }

      case 'recuar_dias': {
        const base = valorAtual ? new Date(String(valorAtual)) : new Date()
        base.setDate(base.getDate() - Number(valor))
        return base.toISOString()
      }

      default:
        return valorAtual
    }
  }

  /** Recalcula campos agregados do pedido após edição de quantidades */
  private async recalcularAgregados(
    tenantId: string,
    pedidoId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
  ): Promise<void> {
    const itens = await tx.pedidoItem.findMany({
      where: { tenant_id: tenantId, pedido_id: pedidoId },
      select: {
        quantidade_inicial_item_pedido: true,
        quantidade_transferida_item: true,
        valor_por_unidade_item: true,
        saldo_item_pedido: true,
      },
    })

    const quantidadeInicialTotal = itens.reduce(
      (acc: number, i: { quantidade_inicial_item_pedido: number }) => acc + (i.quantidade_inicial_item_pedido ?? 0),
      0,
    )
    const quantidadeTransferidaTotal = itens.reduce(
      (acc: number, i: { quantidade_transferida_item: number }) => acc + (i.quantidade_transferida_item ?? 0),
      0,
    )
    const valorTotal = itens.reduce(
      (acc: number, i: { valor_por_unidade_item: number | null; saldo_item_pedido: number }) =>
        acc + ((i.valor_por_unidade_item ?? 0) * (i.saldo_item_pedido ?? 0)),
      0,
    )

    await tx.pedido.update({
      where: { id: pedidoId },
      data: {
        quantidade_total_inicial_pedido: quantidadeInicialTotal,
        quantidade_transferida_total: quantidadeTransferidaTotal,
        valor_total_pedido: valorTotal,
      },
    })
  }

  /** Valida que nenhum campo bloqueado está na lista — rejeita server-side */
  private validarCamposEditaveis(campos: CampoEdicaoMassa[]): void {
    for (const c of campos) {
      if (c.nivel === 'pedido' && CAMPOS_BLOQUEADOS_PEDIDO.has(c.campo)) {
        throw new AppError(
          `Campo "${c.campo}" é calculado e não pode ser editado em massa`,
          400,
          'CAMPO_BLOQUEADO',
        )
      }
      if (c.nivel === 'item' && CAMPOS_BLOQUEADOS_ITEM.has(c.campo)) {
        throw new AppError(
          `Campo "${c.campo}" é calculado e não pode ser editado em massa`,
          400,
          'CAMPO_BLOQUEADO',
        )
      }
    }
  }
}
