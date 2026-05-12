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
 *   - id_organizacao obrigatório em todas as queries
 *   - Frontend envia nome exato da coluna do Prisma (DDD-puro, sem ACL)
 *   - Campos em CAMPOS_BLOQUEADOS_* são rejeitados com AppError 400
 *   - Campos em CAMPOS_DETALHES_OPERACIONAIS vivem como chaves no JSON
 *     `detalhes_operacionais_pedido` (não são colunas físicas do Pedido)
 *   - Operações: substituir / somar / subtrair / percentual / avancar_dias / recuar_dias
 */

// ── Campos calculados — nunca editáveis em massa ──────────────────────────────

import { PrismaClient, Prisma } from '@prisma/client'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'
import { recalcularAgregadosPedido as recalcularAgregadosCanonico } from '../../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js'

// Workaround Prisma 5.22: TransactionClient (Omit em classe genérica) perde delegates
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  // Agregados calculados pelo recalcularAgregadosPedido
  'valor_total_pedido',
  'quantidade_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  // Sistema / identidade
  'id_pedido',
  'id_organizacao',
  'id_workspace',
  'id_status_pedido',
  'data_criacao_pedido',
  'data_atualizacao_pedido',
  'data_exclusao_pedido',
  'data_consolidacao_pedido',
  'ids_origem_consolidacao_pedido',
])

const CAMPOS_BLOQUEADOS_ITEM = new Set([
  // Calculados
  'valor_total_item',
  'quantidade_atual_item',
  'quantidade_transferida_item', // saldoEngine — fluxo de transferência
  // Sistema / identidade
  'id_item',
  'id_organizacao',
  'id_workspace',
  'id_pedido',
  'data_criacao_item',
  'data_atualizacao_item',
  'data_exclusao_item',
])

// ── Campos armazenados em detalhes_operacionais_pedido — merge em JSON ─────────
// Esses campos não são colunas do Pedido; vivem como chaves dentro do JSON
// `detalhes_operacionais_pedido`. Incluem dados de Exportador, Importador,
// Fabricante e OPE.

const CAMPOS_DETALHES_OPERACIONAIS = new Set([
  // Exportador
  'nome_exportador',
  'endereco_exportador',
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  // Importador
  'nome_importador',
  // Fabricante
  'nome_fabricante',
  'endereco_fabricante',
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'zip_code_fabricante',
  // OPE
  'codigo_ope',
  'nome_ope',
  'endereco_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  'situacao_ope',
  'versao_ope',
  'cnpj_raiz_empresa_responsavel',
])

// ── Campos de quantidade — disparam recálculo de agregados ────────────────────

const CAMPOS_QUANTIDADE_ITEM = new Set([
  'quantidade_inicial_item',
  'quantidade_transferida_item',
  'quantidade_pronta_item',
  'quantidade_cancelada_item',
  'quantidade_atual_item',
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

// ── Helpers de erro ───────────────────────────────────────────────────────────

/**
 * Converte erros do Prisma em mensagens legíveis para o usuário.
 * P2002 = violação de unique constraint.
 */
function resolverMensagemErro(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const campos = prismaErr.meta?.target?.join(', ') ?? 'campo'
      return `Valor duplicado: o campo "${campos}" já existe para outro pedido`
    }
  }
  return err instanceof Error ? err.message : 'Erro desconhecido'
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
    id_organizacao: string,
    db: PrismaClient,
    payload: EdicaoMassaPayload,
  ): Promise<EdicaoMassaPreview> {
    this.validarCamposEditaveis(payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { id_organizacao: id_organizacao, id_pedido: { in: payload.pedido_ids } },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    // Itens só são contados quando algum campo de nível 'item' está sendo editado.
    // Sem isso, o preview informa itens afetados mesmo em edições puramente de pedido,
    // induzindo o usuário a achar que itens serão alterados quando não serão.
    const temCamposItem = payload.campos.some(c => c.nivel === 'item')
    const itensAfetados = temCamposItem
      ? pedidos.reduce<number>(
          (acc, p) => acc + ((p as { itens_pedido?: unknown[] }).itens_pedido?.length ?? 0),
          0,
        )
      : 0

    const camposPreview = payload.campos.map(c => {
      const valores: string[] = []

      if (c.nivel === 'pedido') {
        pedidos.forEach((p: Record<string, unknown>) => {
          const valor = CAMPOS_DETALHES_OPERACIONAIS.has(c.campo)
            ? ((p.detalhes_operacionais_pedido as Record<string, unknown> | null)?.[c.campo] ?? '')
            : (p[c.campo] ?? '')
          valores.push(String(valor))
        })
      } else {
        pedidos.forEach((p: Record<string, unknown>) => {
          const itens = (p.itens_pedido as Record<string, unknown>[]) ?? []
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
    id_organizacao: string,
    id_usuario: string,
    nome_usuario: string,
    db: PrismaClient,
    payload: EdicaoMassaPayload,
  ): Promise<EdicaoMassaResultado> {
    this.validarCamposEditaveis(payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { id_organizacao: id_organizacao, id_pedido: { in: payload.pedido_ids } },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
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
    const pedidoIds = (pedidos as Record<string, unknown>[]).map(p => p.id_pedido as string)

    // ── CAMINHO RÁPIDO (updateMany) ───────────────────────────────────────────
    // Condição: todos os campos de pedido são "substituir" em campos diretos do
    // schema (não estão em detalhes_operacionais) e não há campos de item.
    // Uma única query SQL atualiza todos os pedidos independente do volume.
    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposPedido.every(c => c.operacao === 'substituir' && !CAMPOS_DETALHES_OPERACIONAIS.has(c.campo))

    if (todosCamposPedidoSaoRapidos) {
      const dadosUpdateMany: Record<string, unknown> = {}
      for (const c of camposPedido) {
        dadosUpdateMany[c.campo] = c.valor
      }
      await db.pedido.updateMany({
        where: { id_pedido: { in: pedidoIds } },
        data: dadosUpdateMany,
      })
      pedidosAtualizados = pedidos.length
      return {
        pedidos_atualizados: pedidosAtualizados,
        itens_atualizados: 0,
        campos_alterados: payload.campos.map(c => c.campo),
        erros: [],
      }
    }

    // ── CAMINHO LENTO (loop por pedido) ───────────────────────────────────────
    // Campos com operação matemática (somar/subtrair/percentual), campos em
    // detalhes_operacionais (merge JSON), ou campos de item.
    // Timeout de 60s para suportar grandes volumes no Railway.
    await db.$transaction(async (tx0) => {
      const tx = tx0 as Tx
      for (const pedido of pedidos as Record<string, unknown>[]) {
        const pedidoId = pedido.id_pedido as string

        try {
          // Aplicar campos de nível pedido
          if (camposPedido.length > 0) {
            const dadosPedido: Record<string, unknown> = {}
            let detalhesUpdate: Record<string, unknown> | null = null

            for (const c of camposPedido) {
              if (CAMPOS_DETALHES_OPERACIONAIS.has(c.campo)) {
                // Campos armazenados em detalhes_operacionais_pedido — merge em JSON
                if (detalhesUpdate === null) {
                  const detAtual = (typeof pedido.detalhes_operacionais_pedido === 'object' && pedido.detalhes_operacionais_pedido !== null)
                    ? pedido.detalhes_operacionais_pedido as Record<string, unknown>
                    : {}
                  detalhesUpdate = { ...detAtual }
                }
                detalhesUpdate[c.campo] = c.valor
              } else {
                dadosPedido[c.campo] = this.aplicarOperacao(pedido[c.campo], c.operacao, c.valor)
              }
            }

            if (detalhesUpdate !== null) {
              dadosPedido.detalhes_operacionais_pedido = detalhesUpdate
            }

            await tx.pedido.update({
              where: { id_pedido: pedidoId },
              data: dadosPedido,
            })
          }

          // Aplicar campos de nível item — frontend já envia nome DDD da coluna
          if (camposItem.length > 0) {
            const itens = (pedido.itens_pedido as Record<string, unknown>[]) ?? []
            for (const item of itens) {
              const dadosItem: Record<string, unknown> = {}
              for (const c of camposItem) {
                dadosItem[c.campo] = this.aplicarOperacao(item[c.campo], c.operacao, c.valor)
              }
              const resultado = await tx.pedidoItem.update({
                where: { id_item: item.id_item as string, id_organizacao: id_organizacao },
                data: dadosItem,
              })
              if (resultado) itensAtualizados++
            }
          }

          // Recalcular agregados se campos de quantidade foram alterados
          if (precisaRecalcularAgregados) {
            await this.recalcularAgregados(id_organizacao, pedidoId, tx)
          }

          if (camposPedido.length > 0 || camposItem.length > 0) pedidosAtualizados++
        } catch (err: unknown) {
          erros.push({
            pedido_id: pedidoId,
            motivo: resolverMensagemErro(err),
          })
        }
      }

      // Audit trail via historico-global (fire-and-forget)
      const camposAlterados = payload.campos.map(c => c.campo)
      for (const p of pedidos as Array<Record<string, unknown>>) {
        auditLog({
          id_organizacao:               id_organizacao,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        id_usuario,
          nome_ator_historico_log:      nome_usuario,
          modulo_historico_log:         'pedido',
          tipo_recurso_historico_log:   'Pedido',
          id_recurso_historico_log:     p.id_pedido as string,
          acao_historico_log:           'EDITAR_EM_MASSA',
          detalhe_acao_historico_log:   `Edicao em massa: ${camposAlterados.join(', ')}`,
          estado_posterior_historico_log: { campos: payload.campos, nivel: payload.nivel },
        })
      }
    }, { timeout: 60000, maxWait: 10000 })

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

  /**
   * Recalcula os 5 agregados oficiais do Pedido a partir dos itens.
   *
   * Substituiu o método legado que populava só `quantidade_total_pedido` e
   * `valor_total_pedido` com fórmula divergente (valor = unit × qty_atual).
   * Agora delega ao helper canônico — cobre os 5 agregados de uma vez com
   * fórmulas oficiais (qty = SUM quantidade_inicial_item; valor = SUM valor_total_item;
   * peso/cubagem = SUM unitário × quantidade_inicial_item).
   */
  private async recalcularAgregados(
    id_organizacao: string,
    pedidoId: string,
    tx: Tx,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recalcularAgregadosCanonico(tx as any, pedidoId, id_organizacao)
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
