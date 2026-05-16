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
import { obterWorkspaces, type WorkspaceLookupItem } from '@gravity/resolver-organizacao'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'
import { recalcularAgregadosPedido as recalcularAgregadosCanonico } from '../../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js'
import { MAPA_PROPAGACAO_PEDIDO_ITEM } from '../../../shared/mapaPropagacaoPedidoItem.js'

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
  'cnpj_exportador',   // auto-fill: workspace.cnpj_workspace em EXP
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
  'cnpj_importador',   // auto-fill: workspace.cnpj_workspace em IMP
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

// ── Cascade Pedido → Item (Aba "Combinado") ───────────────────────────────────
//
// Regra de negócio: quando o usuário usa a aba **Combinado**, a alteração de
// um campo de pedido também é propagada para o campo equivalente de cada item.
//
// SSOT: MAPA_PROPAGACAO_PEDIDO_ITEM (shared/) contém os 57 pares diretos
// Pedido→Item. Aqui compomos com 4 pares exclusivos da edição em massa:
//   - tipo_operacao_pedido → tipo_operacao_item (não propaga em create/patch)
//   - 3× JSON nome_* → coluna nome_*_item (derivativos de snapshot)
//
// Atenção: o cascade SOBRESCREVE overrides individuais nos itens. O preview
// avisa o usuário antes da confirmação.

const PARES_CASCADE_PEDIDO_ITEM: Record<string, string> = {
  ...MAPA_PROPAGACAO_PEDIDO_ITEM,
  tipo_operacao_pedido: 'tipo_operacao_item',
  nome_exportador:      'nome_exportador_item',
  nome_importador:      'nome_importador_item',
  nome_fabricante:       'nome_fabricante_item',
}

// ── Auto-fill ao trocar tipo_operacao_pedido em massa ────────────────────────
//
// Quando o usuário edita `tipo_operacao_pedido` em massa, o sistema deve
// automaticamente preencher o lado nacional (importador em IMP, exportador
// em EXP) com nome+CNPJ do **workspace** do pedido (não da empresa-da-org).
//
// Mapping: dado o novo tipo_operacao_pedido, quais chaves no JSON
// `detalhes_operacionais_pedido` representam o lado nacional (a setar com
// dados do workspace) e qual coluna do PedidoItem cascadeia.
const AUTO_FILL_TIPO_OPERACAO: Record<'importacao' | 'exportacao', {
  /** Chave JSON que recebe nome_workspace */
  jsonChaveNome: 'nome_importador' | 'nome_exportador'
  /** Chave JSON que recebe cnpj_workspace */
  jsonChaveCnpj: 'cnpj_importador' | 'cnpj_exportador'
  /** Coluna do PedidoItem que cascadeia (recebe nome_workspace) */
  colunaItemNome: 'nome_importador_item' | 'nome_exportador_item'
  /** Chave JSON do lado OPOSTO (a limpar) */
  jsonChaveNomeOposta: 'nome_exportador' | 'nome_importador'
  /** Chave JSON CNPJ do lado OPOSTO (a limpar) */
  jsonChaveCnpjOposta: 'cnpj_exportador' | 'cnpj_importador'
  /** Coluna do item do lado OPOSTO (a limpar via cascade) */
  colunaItemNomeOposta: 'nome_exportador_item' | 'nome_importador_item'
}> = {
  importacao: {
    jsonChaveNome:        'nome_importador',
    jsonChaveCnpj:        'cnpj_importador',
    colunaItemNome:       'nome_importador_item',
    jsonChaveNomeOposta:  'nome_exportador',
    jsonChaveCnpjOposta:  'cnpj_exportador',
    colunaItemNomeOposta: 'nome_exportador_item',
  },
  exportacao: {
    jsonChaveNome:        'nome_exportador',
    jsonChaveCnpj:        'cnpj_exportador',
    colunaItemNome:       'nome_exportador_item',
    jsonChaveNomeOposta:  'nome_importador',
    jsonChaveCnpjOposta:  'cnpj_importador',
    colunaItemNomeOposta: 'nome_importador_item',
  },
}


// ── Tipos internos ────────────────────────────────────────────────────────────

type TipoCampoEdicao = 'texto' | 'numero' | 'data' | 'select' | 'usuario' | 'ncm'
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
  /** IDs específicos de itens a editar. Se presente, apenas estes itens são alterados.
   *  Se ausente/vazio, todos os itens dos pedidos selecionados são editados. */
  item_ids?: string[]
  campos: CampoEdicaoMassa[]
  nivel: 'pedido' | 'item' | 'combinado'
}

interface EdicaoMassaPreview {
  pedidos_afetados: number
  itens_afetados: number
  campos_pedido_alterados: number     // # de gravações no Pedido (pedidos × campos)
  campos_item_alterados: number       // # de gravações em Item (itens × campos, incluindo cascade)
  campos: {
    campo: string
    nivel: 'pedido' | 'item'
    operacao: OperacaoCampo
    valor: string | number
    multiplos_valores: boolean
    valores_distintos?: string[]
    alertas: string[]
    cascade_para?: string             // se o campo cascadeia, nome da coluna de item-alvo
    overrides_sobrescritos?: number   // # de itens cujo valor atual diverge do que será aplicado
  }[]
  alertas_globais: string[]
  /**
   * Auto-fill ao trocar tipo_operacao_pedido: lista de pedidos com workspace
   * sem CNPJ (aviso amarelo no UI — Mand. 08, não bloqueia).
   */
  aviso_workspace_sem_cnpj?: Array<{ id_pedido: string; numero_pedido: string; id_workspace: string }>
  /**
   * Auto-fill ao trocar tipo_operacao_pedido: lista de pedidos com status
   * crítico (≠ rascunho/aberto) — aviso laranja no UI.
   */
  aviso_status_critico?: Array<{ id_pedido: string; numero_pedido: string; status_pedido: string }>
  /**
   * Auto-fill: dados de workspace que serão aplicados (para banner azul).
   * Map indexado por id_workspace, com nome+cnpj.
   */
  workspaces_auto_fill?: Array<{ id_workspace: string; nome_workspace: string; cnpj_workspace: string | null }>
}

interface EdicaoMassaResultado {
  pedidos_atualizados: number
  itens_atualizados: number
  campos_pedido_alterados: number     // total de gravações no Pedido (pedidos × campos pedido)
  campos_item_alterados: number       // total de gravações em Item (itens × campos item, incluindo cascade)
  campos_alterados: string[]          // nomes únicos de campos alterados (uniao pedido + item após cascade)
  erros: { pedido_id: string; motivo: string }[]
}

// ── Helpers de erro ───────────────────────────────────────────────────────────

const ROTULOS_CAMPO: Record<string, string> = {
  numero_pedido: 'Número do Pedido',
  id_organizacao: '',
}

function rotuloCampo(coluna: string): string {
  return ROTULOS_CAMPO[coluna] ?? coluna
}

/**
 * Converte erros do Prisma em mensagens legíveis para o usuário.
 * P2002 = violação de unique constraint.
 */
function resolverMensagemErro(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const nomes = (prismaErr.meta?.target ?? [])
        .map(rotuloCampo)
        .filter(Boolean)
        .join(', ') || 'campo'
      return `Já existe outro pedido com esse mesmo valor de ${nomes}. Use um valor diferente ou edite apenas 1 pedido por vez.`
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

    // Cascade Pedido → Item ativo apenas na aba "Combinado".
    const ehCombinado = payload.nivel === 'combinado'
    const camposPedidoComCascade = payload.campos.filter(
      c => c.nivel === 'pedido' && ehCombinado && PARES_CASCADE_PEDIDO_ITEM[c.campo],
    )
    // Quando item_ids está presente, apenas estes itens serão afetados.
    // Set para lookup O(1) — se ausente, filtroItemIds é null (= todos).
    const filtroItemIds = payload.item_ids && payload.item_ids.length > 0
      ? new Set(payload.item_ids)
      : null

    const totalItensSomados = pedidos.reduce<number>(
      (acc, p) => {
        const itens = (p as { itens_pedido?: Record<string, unknown>[] }).itens_pedido ?? []
        if (!filtroItemIds) return acc + itens.length
        return acc + itens.filter(i => filtroItemIds.has(i.id_item as string)).length
      },
      0,
    )

    // ── Co1: Preview também faz S2S quando tipo_operacao_pedido está no batch ─
    // Necessário para banners da UI mostrarem nome+CNPJ REAIS do workspace
    // (não texto genérico). Cache compartilhado se houvesse: como preview e
    // confirmar são requests HTTP distintos, cada um faz a sua call.
    const campoTipoOperacaoPreview = payload.campos.find(
      c => c.campo === 'tipo_operacao_pedido' && c.operacao === 'substituir' && c.nivel === 'pedido',
    )
    const trocaTipoNoPreview = campoTipoOperacaoPreview !== undefined
    let wsAutoFill: WorkspaceLookupItem[] = []
    if (trocaTipoNoPreview) {
      const idsWorkspaceUnicos = [
        ...new Set(
          (pedidos as Record<string, unknown>[])
            .map(p => p.id_workspace as string)
            .filter(Boolean),
        ),
      ]
      wsAutoFill = await obterWorkspaces({
        configuradorBaseUrl: process.env.CONFIGURATOR_URL ?? '',
        chaveInterna:        process.env.CHAVE_INTERNA_SERVICO ?? '',
        ids:                 idsWorkspaceUnicos,
      })
    }

    // Itens são contados se há campos de nível 'item' OU cascade ativo OU
    // auto-fill cascade (troca de tipo cascadeia nome_*_item para todos os itens).
    const temCamposItem = payload.campos.some(c => c.nivel === 'item')
      || camposPedidoComCascade.length > 0
      || trocaTipoNoPreview
    const itensAfetados = temCamposItem ? totalItensSomados : 0

    const camposPreview = payload.campos.map(c => {
      const valores: string[] = []
      const cascadePara = c.nivel === 'pedido' && ehCombinado
        ? PARES_CASCADE_PEDIDO_ITEM[c.campo]
        : undefined
      let overridesSobrescritos = 0

      if (c.nivel === 'pedido') {
        pedidos.forEach((p: Record<string, unknown>) => {
          const valor = CAMPOS_DETALHES_OPERACIONAIS.has(c.campo)
            ? ((p.detalhes_operacionais_pedido as Record<string, unknown> | null)?.[c.campo] ?? '')
            : (p[c.campo] ?? '')
          valores.push(String(valor))

          // Cascade: contar itens cujo valor atual diverge do que será aplicado
          if (cascadePara) {
            const todosItens = (p.itens_pedido as Record<string, unknown>[]) ?? []
            const itens = filtroItemIds
              ? todosItens.filter(i => filtroItemIds.has(i.id_item as string))
              : todosItens
            itens.forEach(item => {
              const valorItem = String(item[cascadePara] ?? '')
              if (valorItem !== String(c.valor) && valorItem !== '') {
                overridesSobrescritos++
              }
            })
          }
        })
      } else {
        pedidos.forEach((p: Record<string, unknown>) => {
          const todosItens = (p.itens_pedido as Record<string, unknown>[]) ?? []
          const itens = filtroItemIds
            ? todosItens.filter(i => filtroItemIds.has(i.id_item as string))
            : todosItens
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
      if (cascadePara && overridesSobrescritos > 0) {
        alertas.push(`${overridesSobrescritos} ${overridesSobrescritos === 1 ? 'item será sobrescrito' : 'itens serão sobrescritos'} (cascade para ${cascadePara})`)
      }

      return {
        campo: c.campo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.valor,
        multiplos_valores: distintos.length > 1,
        valores_distintos: distintos,
        alertas,
        cascade_para: cascadePara,
        overrides_sobrescritos: cascadePara ? overridesSobrescritos : undefined,
      }
    })

    // Contagens granulares para o preview
    const camposPedidoNivel = payload.campos.filter(c => c.nivel === 'pedido').length
    const camposItemNivel   = payload.campos.filter(c => c.nivel === 'item').length

    const campos_pedido_alterados = pedidos.length * camposPedidoNivel
    const campos_item_alterados   =
      totalItensSomados * camposItemNivel                                // campos item explícitos
      + totalItensSomados * camposPedidoComCascade.length                // campos cascade

    // ── Avisos do auto-fill (B6 + B7 + Co1) ──────────────────────────────────
    // Só populados quando há tipo_operacao_pedido no batch.
    let aviso_workspace_sem_cnpj: EdicaoMassaPreview['aviso_workspace_sem_cnpj']
    let aviso_status_critico: EdicaoMassaPreview['aviso_status_critico']
    let workspaces_auto_fill: EdicaoMassaPreview['workspaces_auto_fill']
    if (trocaTipoNoPreview) {
      const wsByid = new Map(wsAutoFill.map(w => [w.idWorkspace, w]))
      // Workspaces sem CNPJ (avisa, não bloqueia — D1 do dono)
      aviso_workspace_sem_cnpj = (pedidos as Record<string, unknown>[])
        .filter(p => {
          const ws = wsByid.get(p.id_workspace as string)
          return ws ? ws.cnpjWorkspace === null : false
        })
        .map(p => ({
          id_pedido:     p.id_pedido as string,
          numero_pedido: p.numero_pedido as string,
          id_workspace:  p.id_workspace as string,
        }))

      // Status crítico = tudo exceto rascunho/aberto (D2 do dono)
      const STATUS_NAO_CRITICOS = new Set(['rascunho', 'aberto'])
      aviso_status_critico = (pedidos as Record<string, unknown>[])
        .filter(p => !STATUS_NAO_CRITICOS.has(p.status_pedido as string))
        .map(p => ({
          id_pedido:     p.id_pedido as string,
          numero_pedido: p.numero_pedido as string,
          status_pedido: p.status_pedido as string,
        }))

      // Lista de workspaces para banner azul (mostra "será preenchido com X")
      workspaces_auto_fill = wsAutoFill.map(w => ({
        id_workspace:   w.idWorkspace,
        nome_workspace: w.nomeWorkspace,
        cnpj_workspace: w.cnpjWorkspace,
      }))
    }

    return {
      pedidos_afetados: pedidos.length,
      itens_afetados: itensAfetados,
      campos_pedido_alterados,
      campos_item_alterados,
      campos: camposPreview,
      alertas_globais: [],
      aviso_workspace_sem_cnpj,
      aviso_status_critico,
      workspaces_auto_fill,
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
    let camposPedidoGravados = 0
    let camposItemGravados = 0

    // Cascade Pedido→Item: ativo apenas na aba "Combinado". Para cada campo de
    // pedido cujo nome está na whitelist, propagar o valor para o campo de item
    // equivalente em todos os itens dos pedidos selecionados.
    const ehCombinado = payload.nivel === 'combinado'
    const camposCascade: { campoPedido: CampoEdicaoMassa; campoItem: string }[] = ehCombinado
      ? camposPedido
          .filter(c => PARES_CASCADE_PEDIDO_ITEM[c.campo])
          .map(c => ({ campoPedido: c, campoItem: PARES_CASCADE_PEDIDO_ITEM[c.campo] }))
      : []

    // ── Auto-fill ao trocar tipo_operacao_pedido ─────────────────────────────
    // Quando o batch inclui `tipo_operacao_pedido` (substituir), buscamos
    // 1x batch os dados dos workspaces únicos e construímos um Map.
    // Cada pedido aplica o auto-fill com SEU PRÓPRIO workspace (T3).
    // Falha S2S → propaga AppError 503 (Mand. 08, falha ruidosa).
    const campoTipoOperacao = camposPedido.find(
      c => c.campo === 'tipo_operacao_pedido' && c.operacao === 'substituir',
    )
    const novoTipo = campoTipoOperacao
      ? (String(campoTipoOperacao.valor) as 'importacao' | 'exportacao')
      : null
    let wsMap: Map<string, WorkspaceLookupItem> | null = null
    if (novoTipo) {
      const idsWorkspaceUnicos = [
        ...new Set(
          (pedidos as Record<string, unknown>[])
            .map(p => p.id_workspace as string)
            .filter(Boolean),
        ),
      ]
      const workspaces = await obterWorkspaces({
        configuradorBaseUrl: process.env.CONFIGURATOR_URL ?? '',
        chaveInterna:        process.env.CHAVE_INTERNA_SERVICO ?? '',
        ids:                 idsWorkspaceUnicos,
      })
      wsMap = new Map(workspaces.map(w => [w.idWorkspace, w]))
    }

    const precisaRecalcularAgregados = camposItem.some(c => CAMPOS_QUANTIDADE_ITEM.has(c.campo))
    const pedidoIds = (pedidos as Record<string, unknown>[]).map(p => p.id_pedido as string)

    // Quando item_ids está presente, apenas estes itens serão editados.
    // Set para lookup O(1) — se ausente, filtroItemIds é null (= todos os itens).
    const filtroItemIds = payload.item_ids && payload.item_ids.length > 0
      ? new Set(payload.item_ids)
      : null

    // ── CAMINHO RÁPIDO (updateMany) ───────────────────────────────────────────
    // Condição: todos os campos de pedido são "substituir" em campos diretos do
    // schema (não estão em detalhes_operacionais), não há campos de item E não
    // há cascade pendente (cascade exige update por item, então cai no slow).
    // **Auto-fill ao trocar tipo_operacao_pedido também força slow path** (LT1):
    // o auto-fill exige merge JSON em detalhes_operacionais_pedido + cascade item,
    // incompatível com updateMany.
    // Uma única query SQL atualiza todos os pedidos independente do volume.
    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposCascade.length === 0 &&
      novoTipo === null &&  // LT1 — auto-fill incompatível com fast path
      !filtroItemIds &&     // Seleção de itens específicos → slow path (não toca pedido)
      camposPedido.every(c => c.operacao === 'substituir' && !CAMPOS_DETALHES_OPERACIONAIS.has(c.campo))

    if (todosCamposPedidoSaoRapidos) {
      const dadosUpdateMany: Record<string, unknown> = {}
      for (const c of camposPedido) {
        dadosUpdateMany[c.campo] = c.valor
      }
      try {
        await db.pedido.updateMany({
          where: { id_pedido: { in: pedidoIds } },
          data: dadosUpdateMany,
        })
      } catch (err: unknown) {
        // Defesa em profundidade contra @@unique violation (P2002). O Zod
        // custom da rota já bloqueia campos unique + substituir + multi-seleção,
        // mas se algum outro caminho chegar aqui (curl, futura unique nova
        // não cadastrada em CAMPOS_UNIQUE_PEDIDO), convertemos o erro Prisma
        // em AppError 422 com mensagem clara em vez de propagar como 500.
        if (typeof err === 'object' && err !== null && 'code' in err) {
          const prismaErr = err as { code: string; meta?: { target?: string[] } }
          if (prismaErr.code === 'P2002') {
            const nomes = (prismaErr.meta?.target ?? [])
              .map(rotuloCampo)
              .filter(Boolean)
              .join(', ') || 'campo'
            throw new AppError(
              `Já existe outro pedido com esse mesmo valor de ${nomes}. Use um valor diferente ou edite apenas 1 pedido por vez.`,
              422,
              'UNIQUE_VIOLATION',
            )
          }
        }
        throw err
      }
      pedidosAtualizados = pedidos.length
      camposPedidoGravados = pedidos.length * camposPedido.length
      return {
        pedidos_atualizados: pedidosAtualizados,
        itens_atualizados: 0,
        campos_pedido_alterados: camposPedidoGravados,
        campos_item_alterados: 0,
        campos_alterados: payload.campos.map(c => c.campo),
        erros: [],
      }
    }

    // ── CAMINHO LENTO (loop por pedido) ───────────────────────────────────────
    // Campos com operação matemática (somar/subtrair/percentual), campos em
    // detalhes_operacionais (merge JSON), ou campos de item.
    // Timeout de 60s para suportar grandes volumes no Railway.
    // Audit fields rastreados — Co2. Inclui campos auto-preenchidos (não estão
    // no payload), permitindo compliance refletir TODAS as alterações reais.
    const camposAutoFillPorPedido = new Map<string, string[]>()

    // IMPORTANTE: `db` já é TransactionClient (entregue por withOrganizacao).
    // TransactionClient NÃO expõe `$transaction` — aninhar causa
    // "db.$transaction is not a function". Usar `db` diretamente.
    {
      for (const pedido of pedidos as Record<string, unknown>[]) {
        const pedidoId = pedido.id_pedido as string

        try {
          // Aplicar campos de nível pedido
          // Quando filtroItemIds está presente (seleção de itens específicos),
          // NÃO alterar campos do pedido — apenas os itens selecionados.
          if (camposPedido.length > 0 && !filtroItemIds) {
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
                dadosPedido[c.campo] = this.aplicarOperacao(pedido[c.campo], c.operacao, c.valor, c.tipo)
              }
            }

            // ── Auto-fill ao trocar tipo_operacao_pedido (B5 + T1 + Co2) ────
            // Aplica DEPOIS dos campos manuais (T1: edição manual vence).
            // Se o usuário NÃO editou manualmente o campo do lado nacional, o
            // auto-fill prevalece. Se editou, o manual vence.
            const camposAutoFill: string[] = []
            if (novoTipo && wsMap) {
              const idWorkspacePedido = pedido.id_workspace as string
              const ws = wsMap.get(idWorkspacePedido)
              if (!ws) {
                throw new AppError(
                  `Workspace ${idWorkspacePedido} não encontrado no Configurador (pedido ${pedidoId} ficou órfão)`,
                  503,
                  'WORKSPACE_NOT_FOUND',
                )
              }
              const cfg = AUTO_FILL_TIPO_OPERACAO[novoTipo]
              if (detalhesUpdate === null) {
                const detAtual = (typeof pedido.detalhes_operacionais_pedido === 'object' && pedido.detalhes_operacionais_pedido !== null)
                  ? pedido.detalhes_operacionais_pedido as Record<string, unknown>
                  : {}
                detalhesUpdate = { ...detAtual }
              }
              // T1: edição manual vence sobre auto-fill. Só preenche se usuário
              // NÃO mexeu manualmente nessa chave neste batch.
              const usuarioEditouNomeLado = camposPedido.some(c => c.campo === cfg.jsonChaveNome)
              const usuarioEditouCnpjLado = camposPedido.some(c => c.campo === cfg.jsonChaveCnpj)
              if (!usuarioEditouNomeLado) {
                detalhesUpdate[cfg.jsonChaveNome] = ws.nomeWorkspace
                camposAutoFill.push(cfg.jsonChaveNome)
              }
              if (!usuarioEditouCnpjLado) {
                detalhesUpdate[cfg.jsonChaveCnpj] = ws.cnpjWorkspace
                camposAutoFill.push(cfg.jsonChaveCnpj)
              }
              // Limpa lado oposto sempre (ele não faz mais sentido após troca)
              detalhesUpdate[cfg.jsonChaveNomeOposta] = null
              detalhesUpdate[cfg.jsonChaveCnpjOposta] = null
              camposAutoFill.push(cfg.jsonChaveNomeOposta, cfg.jsonChaveCnpjOposta)
              camposAutoFillPorPedido.set(pedidoId, camposAutoFill)
            }

            if (detalhesUpdate !== null) {
              dadosPedido.detalhes_operacionais_pedido = detalhesUpdate
            }

            await db.pedido.update({
              where: { id_pedido: pedidoId },
              data: dadosPedido,
            })
            camposPedidoGravados += camposPedido.length + camposAutoFill.length
          }

          // Aplicar campos de nível item — frontend já envia nome DDD da coluna.
          // Inclui também cascade Pedido→Item (camposCascade) quando aba é Combinado.
          // **Auto-fill** também cascadeia para nome_*_item de cada item.
          const temAutoFillItem = novoTipo !== null
          const temUpdateItem = camposItem.length > 0 || camposCascade.length > 0 || temAutoFillItem
          if (temUpdateItem) {
            const todosItens = (pedido.itens_pedido as Record<string, unknown>[]) ?? []
            // Filtrar por item_ids quando seleção é de itens específicos
            const itens = filtroItemIds
              ? todosItens.filter(i => filtroItemIds.has(i.id_item as string))
              : todosItens
            for (const item of itens) {
              const dadosItem: Record<string, unknown> = {}
              // Campos item explícitos (aba Item ou Combinado com campos item)
              for (const c of camposItem) {
                dadosItem[c.campo] = this.aplicarOperacao(item[c.campo], c.operacao, c.valor, c.tipo)
              }
              // Cascade Pedido→Item (Combinado). Sempre 'substituir' — não faz
              // sentido somar/percentual em cascade. Campo item explícito tem
              // prioridade sobre cascade se ambos tocarem o mesmo destino.
              for (const { campoPedido, campoItem } of camposCascade) {
                if (!(campoItem in dadosItem)) {
                  dadosItem[campoItem] = campoPedido.valor
                }
              }
              // Auto-fill cascade ao trocar tipo: nome do workspace nas colunas
              // *_item, limpa lado oposto. Item explícito ou cascade do payload
              // têm prioridade (não sobrescreve).
              if (novoTipo && wsMap) {
                const idWorkspacePedido = pedido.id_workspace as string
                const ws = wsMap.get(idWorkspacePedido)
                if (ws) {
                  const cfg = AUTO_FILL_TIPO_OPERACAO[novoTipo]
                  if (!(cfg.colunaItemNome in dadosItem)) {
                    dadosItem[cfg.colunaItemNome] = ws.nomeWorkspace
                  }
                  // Limpa coluna oposta no item (independente)
                  if (!(cfg.colunaItemNomeOposta in dadosItem)) {
                    dadosItem[cfg.colunaItemNomeOposta] = null
                  }
                }
              }
              if (Object.keys(dadosItem).length === 0) continue
              const resultado = await db.pedidoItem.update({
                where: { id_item: item.id_item as string },
                data: dadosItem,
              })
              if (resultado) {
                itensAtualizados++
                camposItemGravados += Object.keys(dadosItem).length
              }
            }
          }

          // Recalcular agregados se campos de quantidade foram alterados
          if (precisaRecalcularAgregados) {
            await this.recalcularAgregados(id_organizacao, pedidoId, db)
          }

          if (camposPedido.length > 0 || temUpdateItem) pedidosAtualizados++
        } catch (err: unknown) {
          console.warn('[EdicaoEmMassa] Falha no pedido', pedidoId, err)
          erros.push({
            pedido_id: pedidoId,
            motivo: resolverMensagemErro(err),
          })
        }
      }

      // Audit trail via historico-global (fire-and-forget) — Co2: inclui
      // campos auto-preenchidos no histórico para compliance/auditoria.
      const camposPayload = payload.campos.map(c => c.campo)
      for (const p of pedidos as Array<Record<string, unknown>>) {
        const pedidoId = p.id_pedido as string
        const camposAutoFill = camposAutoFillPorPedido.get(pedidoId) ?? []
        const todosCampos = [...camposPayload, ...camposAutoFill]
        auditLog({
          id_organizacao:               id_organizacao,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        id_usuario,
          nome_ator_historico_log:      nome_usuario,
          modulo_historico_log:         'pedido',
          tipo_recurso_historico_log:   'Pedido',
          id_recurso_historico_log:     pedidoId,
          acao_historico_log:           'EDITAR_EM_MASSA',
          detalhe_acao_historico_log:   `Edicao em massa: ${todosCampos.join(', ')}`,
          estado_posterior_historico_log: {
            campos: payload.campos,
            nivel: payload.nivel,
            campos_auto_fill: camposAutoFill,
          },
        })
      }
    }

    // Campos únicos alterados — inclui os de cascade (pedido + alvo item) e
    // campos auto-preenchidos pelo auto-fill ao trocar tipo_operacao_pedido.
    const camposUnicos = new Set<string>()
    payload.campos.forEach(c => camposUnicos.add(c.campo))
    camposCascade.forEach(({ campoItem }) => camposUnicos.add(campoItem))
    camposAutoFillPorPedido.forEach(arr => arr.forEach(c => camposUnicos.add(c)))
    if (novoTipo) {
      const cfg = AUTO_FILL_TIPO_OPERACAO[novoTipo]
      camposUnicos.add(cfg.colunaItemNome)
      camposUnicos.add(cfg.colunaItemNomeOposta)
    }

    return {
      pedidos_atualizados: pedidosAtualizados,
      itens_atualizados: itensAtualizados,
      campos_pedido_alterados: camposPedidoGravados,
      campos_item_alterados: camposItemGravados,
      campos_alterados: [...camposUnicos],
      erros,
    }
  }

  /** Aplica a operação a um valor atual, retornando o novo valor */
  private aplicarOperacao(
    valorAtual: unknown,
    operacao: OperacaoCampo,
    valor: string | number,
    tipo?: TipoCampoEdicao,
  ): unknown {
    switch (operacao) {
      case 'substituir':
        if (tipo === 'data' && typeof valor === 'string' && !valor.includes('T')) {
          return new Date(valor + 'T00:00:00.000Z').toISOString()
        }
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
