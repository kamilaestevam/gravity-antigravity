/**
 * edicaoEmMassaService.ts — Serviço de edição em massa de pedidos
 *
 * Responsabilidades:
 *   - Validar campos contra o SSOT compartilhado (shared/camposEdicaoMassa.ts)
 *   - Calcular preview sem alterar banco
 *   - Aplicar edições dentro da transação aberta por withOrganizacao
 *   - Gravar colunas criadas pelo usuário (EAV — PedidoListaColunaUsuarioValor)
 *   - Registrar audit trail
 *
 * Regras:
 *   - id_organizacao obrigatório em todas as queries
 *   - Frontend envia nome exato da coluna do Prisma (DDD-puro, sem ACL)
 *   - Blocklist e campos JSON vêm do SSOT — nenhuma lista duplicada aqui
 *   - Colunas de usuário viajam como `coluna_usuario:<id>` (validadas contra o banco)
 *   - Operações: substituir / somar / subtrair / percentual / avancar_dias / recuar_dias
 */

import { PrismaClient } from '@prisma/client'
import { obterWorkspaces, type WorkspaceLookupItem } from '@gravity/resolver-organizacao'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'
import { recalcularAgregadosPedido as recalcularAgregadosCanonico } from '../../../../processos-core/src/services/recalcularAgregadosPedido.js'
import { MAPA_PROPAGACAO_PEDIDO_ITEM } from '../../../shared/mapaPropagacaoPedidoItem.js'
import { normalizarChaveCampoPedido } from '../../../shared/migracaoChavesCampoPedido.js'
import {
  CAMPOS_DETALHES_OPERACIONAIS,
  motivoBloqueioCampo,
  ehCampoColunaUsuario,
  idColunaUsuarioDeCampo,
} from '../../../shared/camposEdicaoMassa.js'

// Workaround Prisma 5.22: TransactionClient (Omit em classe genérica) perde delegates
type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

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
// SSOT: MAPA_PROPAGACAO_PEDIDO_ITEM (shared/) contém os pares diretos
// Pedido→Item (incl. tipo_operacao_pedido → tipo_operacao_item).
// Aqui compomos com 3 pares exclusivos da edição em massa:
//   - 3× JSON nome_* → coluna nome_*_item (derivativos de snapshot)
//
// Atenção: o cascade SOBRESCREVE overrides individuais nos itens. O preview
// avisa o usuário antes da confirmação.

const PARES_CASCADE_PEDIDO_ITEM: Record<string, string> = {
  ...MAPA_PROPAGACAO_PEDIDO_ITEM,
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
  | 'checkbox' | 'percentual' | 'tipo_documento'
type OperacaoCampo = 'substituir' | 'somar' | 'subtrair' | 'percentual' | 'avancar_dias' | 'recuar_dias'

// ── Colunas criadas pelo usuário (EAV) ────────────────────────────────────────

interface ColunaUsuarioMassa {
  id: string
  nome: string
  tipo: string   // texto|numero|data|select|checkbox|percentual|tipo_documento|formula
  escopo: string // pedido|item|ambos
}

/** Operações permitidas por tipo de coluna de usuário. */
const OPERACOES_POR_TIPO_COLUNA_USUARIO: Record<string, ReadonlySet<OperacaoCampo>> = {
  numero:         new Set(['substituir', 'somar', 'subtrair', 'percentual']),
  percentual:     new Set(['substituir', 'somar', 'subtrair', 'percentual']),
  data:           new Set(['substituir', 'avancar_dias', 'recuar_dias']),
  texto:          new Set(['substituir']),
  select:         new Set(['substituir']),
  checkbox:       new Set(['substituir']),
  tipo_documento: new Set(['substituir']),
}

/** Tipo de operação efetivo (para aplicarOperacao) de uma coluna de usuário. */
function tipoEdicaoDeColunaUsuario(tipo: string): TipoCampoEdicao {
  if (tipo === 'numero' || tipo === 'percentual') return 'numero'
  if (tipo === 'data') return 'data'
  return 'texto'
}

// Delegates mínimos do EAV de colunas de usuário (evita `any` explícito —
// o PrismaClient composto do monorepo nem sempre expõe os tipos gerados aqui).
interface DelegatesColunaUsuario {
  pedidoListaColunaUsuario: {
    findMany(args: Record<string, unknown>): Promise<Array<Record<string, unknown>>>
  }
  pedidoListaColunaUsuarioValor: {
    findMany(args: Record<string, unknown>): Promise<Array<Record<string, unknown>>>
    upsert(args: Record<string, unknown>): Promise<unknown>
  }
}

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
  /** Pedidos que recebem tratamento completo (campos pedido + itens) mesmo com item_ids presente.
   *  Usado no caso misto: pedido selecionado explicitamente + itens avulsos de outros pedidos. */
  pedido_ids_completo?: string[]
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
  // AppError carrega mensagem já legível (ex: workspace órfão) — repassar
  if (err instanceof AppError) return err.message

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const nomes = (prismaErr.meta?.target ?? [])
        .map(rotuloCampo)
        .filter(Boolean)
        .join(', ') || 'campo'
      return `Já existe outro pedido com esse mesmo valor de ${nomes}. Use um valor diferente ou edite apenas 1 pedido por vez.`
    }
    if (prismaErr.code === 'P2024') {
      return 'A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.'
    }
  }

  const msg = err instanceof Error ? err.message : ''

  if (/Transaction.*not found|Transaction.*timed?\s*out|Transaction.*expired/i.test(msg)) {
    return 'A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.'
  }
  if (/Can't reach database|Connection.*refused|ECONNREFUSED/i.test(msg)) {
    return 'Não foi possível conectar ao banco de dados. Tente novamente em alguns segundos.'
  }

  return 'Erro interno ao processar a edição. Tente novamente ou contate o suporte.'
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

function normalizarPayloadEdicaoMassa(payload: EdicaoMassaPayload): EdicaoMassaPayload {
  return {
    ...payload,
    campos: payload.campos.map(c => ({
      ...c,
      campo: normalizarChaveCampoPedido(c.campo),
    })),
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
    payload = normalizarPayloadEdicaoMassa(payload)
    this.validarCamposEditaveis(payload.campos)
    const colunasUsuario = await this.validarColunasUsuario(id_organizacao, db, payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { id_organizacao: id_organizacao, id_pedido: { in: payload.pedido_ids } },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    // Valores atuais das colunas de usuário (EAV) — para valores_distintos
    const valoresColunaUsuario = await this.carregarValoresColunaUsuario(
      id_organizacao, db, colunasUsuario, pedidos as Record<string, unknown>[],
    )

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
      const cascadePara = c.nivel === 'pedido' && ehCombinado && !ehCampoColunaUsuario(c.campo)
        ? PARES_CASCADE_PEDIDO_ITEM[c.campo]
        : undefined
      let overridesSobrescritos = 0
      const idColunaUsuario = idColunaUsuarioDeCampo(c.campo)

      if (idColunaUsuario) {
        // Coluna de usuário — valores atuais vêm do EAV
        if (c.nivel === 'pedido') {
          pedidos.forEach((p: Record<string, unknown>) => {
            valores.push(valoresColunaUsuario.get(`${idColunaUsuario}:${p.id_pedido as string}`) ?? '')
          })
        } else {
          pedidos.forEach((p: Record<string, unknown>) => {
            const todosItens = (p.itens_pedido as Record<string, unknown>[]) ?? []
            const itens = filtroItemIds
              ? todosItens.filter(i => filtroItemIds.has(i.id_item as string))
              : todosItens
            itens.forEach(item => {
              valores.push(valoresColunaUsuario.get(`${idColunaUsuario}:${item.id_item as string}`) ?? '')
            })
          })
        }
      } else if (c.nivel === 'pedido') {
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
    payload = normalizarPayloadEdicaoMassa(payload)
    this.validarCamposEditaveis(payload.campos)
    const colunasUsuario = await this.validarColunasUsuario(id_organizacao, db, payload.campos)

    const pedidos = await db.pedido.findMany({
      where: { id_organizacao: id_organizacao, id_pedido: { in: payload.pedido_ids } },
      include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
    })

    if (pedidos.length === 0) {
      throw new AppError('Nenhum pedido encontrado para edição', 404, 'NOT_FOUND')
    }

    // Colunas de usuário (EAV) ficam fora dos updates Prisma diretos
    const camposPedido = payload.campos.filter(c => c.nivel === 'pedido' && !ehCampoColunaUsuario(c.campo))
    const camposItem = payload.campos.filter(c => c.nivel === 'item' && !ehCampoColunaUsuario(c.campo))
    const camposColunaUsuarioPedido = payload.campos.filter(c => c.nivel === 'pedido' && ehCampoColunaUsuario(c.campo))
    const camposColunaUsuarioItem = payload.campos.filter(c => c.nivel === 'item' && ehCampoColunaUsuario(c.campo))

    // Valores atuais do EAV — necessários para operações relativas (somar, dias)
    const valoresColunaUsuario = (camposColunaUsuarioPedido.length > 0 || camposColunaUsuarioItem.length > 0)
      ? await this.carregarValoresColunaUsuario(id_organizacao, db, colunasUsuario, pedidos as Record<string, unknown>[])
      : new Map<string, string>()

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

    // pedido_ids_completo: pedidos que recebem tratamento completo (campos pedido + itens)
    // mesmo quando filtroItemIds está presente (caso misto: pedido selecionado + itens avulsos).
    const pedidoIdsCompleto = payload.pedido_ids_completo && payload.pedido_ids_completo.length > 0
      ? new Set(payload.pedido_ids_completo)
      : null

    // ── CAMINHO RÁPIDO (updateMany) ───────────────────────────────────────────
    // Condição: todas as operações são "substituir" em campos diretos do schema
    // (pedido fora de detalhes_operacionais; item sem campo de quantidade que
    // exija recálculo de agregados). Campos de item e cascade Pedido→Item são
    // cobertos por UM updateMany de itens — o valor é constante para todos.
    // **Auto-fill ao trocar tipo_operacao_pedido força slow path** (LT1):
    // o auto-fill exige merge JSON em detalhes_operacionais_pedido + valor por
    // workspace, incompatível com updateMany.
    // No máximo 2 queries SQL independente do volume de pedidos/itens —
    // essencial para grandes seleções (100+ pedidos) não estourarem o timeout
    // da transação.
    const todosCamposSaoRapidos =
      (camposPedido.length > 0 || camposItem.length > 0) &&
      camposColunaUsuarioPedido.length === 0 &&  // EAV exige upsert por pedido → slow path
      camposColunaUsuarioItem.length === 0 &&
      novoTipo === null &&  // LT1 — auto-fill incompatível com fast path
      !precisaRecalcularAgregados &&  // Recálculo é por pedido → slow path
      camposPedido.every(c => c.operacao === 'substituir' && !CAMPOS_DETALHES_OPERACIONAIS.has(c.campo)) &&
      camposItem.every(c => c.operacao === 'substituir')

    if (todosCamposSaoRapidos) {
      // Com filtroItemIds (seleção de itens específicos / caso misto), campos
      // de pedido aplicam apenas aos pedidos explicitamente selecionados
      // (pedido_ids_completo) — mesma regra de podeTocarPedido do slow path.
      const pedidoIdsAlvo = filtroItemIds
        ? pedidoIds.filter(id => pedidoIdsCompleto !== null && pedidoIdsCompleto.has(id))
        : pedidoIds
      // Dados de item: campos item explícitos + cascade Pedido→Item.
      // aplicarOperacao converte data 'YYYY-MM-DD' → ISO-8601 (Prisma DateTime).
      const dadosItemMany: Record<string, unknown> = {}
      for (const c of camposItem) {
        dadosItemMany[c.campo] = this.aplicarOperacao(undefined, 'substituir', c.valor, c.tipo)
      }
      for (const { campoPedido, campoItem } of camposCascade) {
        if (!(campoItem in dadosItemMany)) {
          dadosItemMany[campoItem] = this.aplicarOperacao(undefined, 'substituir', campoPedido.valor, campoPedido.tipo)
        }
      }

      const dadosUpdateMany: Record<string, unknown> = {}
      for (const c of camposPedido) {
        dadosUpdateMany[c.campo] = this.aplicarOperacao(undefined, 'substituir', c.valor, c.tipo)
      }
      try {
        if (Object.keys(dadosUpdateMany).length > 0 && pedidoIdsAlvo.length > 0) {
          await db.pedido.updateMany({
            where: { id_organizacao: id_organizacao, id_pedido: { in: pedidoIdsAlvo } },
            data: dadosUpdateMany,
          })
        }
        if (Object.keys(dadosItemMany).length > 0) {
          const resultadoItens = await db.pedidoItem.updateMany({
            where: filtroItemIds
              ? { id_organizacao: id_organizacao, id_item: { in: [...filtroItemIds] } }
              : { id_organizacao: id_organizacao, id_pedido: { in: pedidoIds } },
            data: dadosItemMany,
          })
          itensAtualizados = resultadoItens.count
          camposItemGravados = resultadoItens.count * Object.keys(dadosItemMany).length
        }
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

      const temUpdatePedido = Object.keys(dadosUpdateMany).length > 0 && pedidoIdsAlvo.length > 0
      const temUpdateItem = Object.keys(dadosItemMany).length > 0
      const pedidosAfetados = new Set<string>()
      if (temUpdatePedido) {
        pedidoIdsAlvo.forEach(id => pedidosAfetados.add(id))
      }
      if (temUpdateItem) {
        if (filtroItemIds) {
          const itensAlvo = await db.pedidoItem.findMany({
            where: { id_organizacao: id_organizacao, id_item: { in: [...filtroItemIds] } },
            select: { id_pedido: true },
          })
          itensAlvo.forEach(i => pedidosAfetados.add(i.id_pedido))
        } else {
          pedidoIds.forEach(id => pedidosAfetados.add(id))
        }
      }
      pedidosAtualizados = pedidosAfetados.size
      camposPedidoGravados = temUpdatePedido ? pedidoIdsAlvo.length * camposPedido.length : 0

      // Audit trail via historico-global (fire-and-forget) — apenas pedidos
      // efetivamente alterados (paridade com contador pedidos_atualizados).
      const camposPayloadRapido = payload.campos.map(c => c.campo)
      for (const p of pedidos as Array<Record<string, unknown>>) {
        const pedidoId = p.id_pedido as string
        if (!pedidosAfetados.has(pedidoId)) continue
        auditLog({
          id_organizacao:               id_organizacao,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        id_usuario,
          nome_ator_historico_log:      nome_usuario,
          modulo_historico_log:         'pedido',
          tipo_recurso_historico_log:   'Pedido',
          id_recurso_historico_log:     p.id_pedido as string,
          acao_historico_log:           'EDITAR_EM_MASSA',
          detalhe_acao_historico_log:   `Edicao em massa: ${camposPayloadRapido.join(', ')}`,
          estado_posterior_historico_log: {
            campos: payload.campos,
            nivel: payload.nivel,
            campos_auto_fill: [],
          },
        })
      }

      const camposAlteradosRapido = new Set<string>(camposPayloadRapido)
      camposCascade.forEach(({ campoItem }) => camposAlteradosRapido.add(campoItem))
      return {
        pedidos_atualizados: pedidosAtualizados,
        itens_atualizados: itensAtualizados,
        campos_pedido_alterados: camposPedidoGravados,
        campos_item_alterados: camposItemGravados,
        campos_alterados: [...camposAlteradosRapido],
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
          // Quando filtroItemIds está presente (seleção de itens específicos),
          // NÃO alterar campos do pedido — EXCETO se o pedido está em pedidoIdsCompleto
          // (caso misto: pedido explicitamente selecionado + itens avulsos de outros).
          const podeTocarPedido = !filtroItemIds || (pedidoIdsCompleto !== null && pedidoIdsCompleto.has(pedidoId))
          let tocouPedido = false

          // Aplicar campos de nível pedido
          if (camposPedido.length > 0 && podeTocarPedido) {
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
              where: { id_pedido: pedidoId, id_organizacao: id_organizacao },
              data: dadosPedido,
            })
            camposPedidoGravados += camposPedido.length + camposAutoFill.length
            tocouPedido = true
          }

          // Colunas de usuário — nível pedido (upsert EAV, mesma transação)
          if (camposColunaUsuarioPedido.length > 0 && podeTocarPedido) {
            for (const c of camposColunaUsuarioPedido) {
              const idCol = idColunaUsuarioDeCampo(c.campo) as string
              const col = colunasUsuario.get(idCol) as ColunaUsuarioMassa
              const atual = valoresColunaUsuario.get(`${idCol}:${pedidoId}`)
              const novo = this.aplicarOperacao(atual, c.operacao, c.valor, tipoEdicaoDeColunaUsuario(col.tipo))
              await this.upsertValorColunaUsuario(id_organizacao, db, idCol, 'pedido', pedidoId, String(novo ?? ''))
              camposPedidoGravados++
            }
            tocouPedido = true
          }

          // Aplicar campos de nível item — frontend já envia nome DDD da coluna.
          // Inclui também cascade Pedido→Item (camposCascade) quando aba é Combinado.
          // **Auto-fill** também cascadeia para nome_*_item de cada item.
          const temAutoFillItem = novoTipo !== null
          const temUpdateItem = camposItem.length > 0 || camposCascade.length > 0
            || camposColunaUsuarioItem.length > 0 || temAutoFillItem
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
                  // aplicarOperacao converte data 'YYYY-MM-DD' → ISO-8601 (Prisma DateTime)
                  dadosItem[campoItem] = this.aplicarOperacao(undefined, 'substituir', campoPedido.valor, campoPedido.tipo)
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
              let alterouEsteItem = false
              if (Object.keys(dadosItem).length > 0) {
                await db.pedidoItem.update({
                  where: { id_item: item.id_item as string, id_organizacao: id_organizacao },
                  data: dadosItem,
                })
                alterouEsteItem = true
                camposItemGravados += Object.keys(dadosItem).length
              }
              // Colunas de usuário — nível item (upsert EAV, mesma transação)
              for (const c of camposColunaUsuarioItem) {
                const idCol = idColunaUsuarioDeCampo(c.campo) as string
                const col = colunasUsuario.get(idCol) as ColunaUsuarioMassa
                const itemId = item.id_item as string
                const atual = valoresColunaUsuario.get(`${idCol}:${itemId}`)
                const novo = this.aplicarOperacao(atual, c.operacao, c.valor, tipoEdicaoDeColunaUsuario(col.tipo))
                await this.upsertValorColunaUsuario(id_organizacao, db, idCol, 'item', itemId, String(novo ?? ''))
                alterouEsteItem = true
                camposItemGravados++
              }
              if (alterouEsteItem) itensAtualizados++
            }
          }

          // Recalcular agregados se campos de quantidade foram alterados
          if (precisaRecalcularAgregados) {
            await this.recalcularAgregados(id_organizacao, pedidoId, db)
          }

          if (tocouPedido || temUpdateItem) pedidosAtualizados++
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

  /**
   * Valida cada campo contra o SSOT (shared/camposEdicaoMassa.ts).
   * Rejeita bloqueados E desconhecidos — Mand. 08, falha ruidosa.
   * Colunas de usuário passam aqui; são validadas contra o banco em
   * validarColunasUsuario().
   */
  private validarCamposEditaveis(campos: CampoEdicaoMassa[]): void {
    for (const c of campos) {
      const motivo = motivoBloqueioCampo(c.campo, c.nivel)
      if (motivo === 'bloqueado') {
        throw new AppError(
          `Campo "${c.campo}" é calculado e não pode ser editado em massa`,
          400,
          'CAMPO_BLOQUEADO',
        )
      }
      if (motivo === 'desconhecido') {
        throw new AppError(
          `Campo "${c.campo}" não é reconhecido como campo editável em massa (nível ${c.nivel})`,
          400,
          'CAMPO_DESCONHECIDO',
        )
      }
    }
  }

  /**
   * Valida colunas de usuário referenciadas no payload contra o banco:
   * existência, ativo, escopo compatível com o nível e operação permitida
   * pelo tipo. Colunas "formula" são calculadas — rejeitadas.
   * Retorna Map id_coluna → metadados para uso na aplicação.
   */
  private async validarColunasUsuario(
    id_organizacao: string,
    db: PrismaClient,
    campos: CampoEdicaoMassa[],
  ): Promise<Map<string, ColunaUsuarioMassa>> {
    const referencias = campos.filter(c => ehCampoColunaUsuario(c.campo))
    if (referencias.length === 0) return new Map()

    const ids = [...new Set(referencias.map(c => idColunaUsuarioDeCampo(c.campo) as string))]
    const rows = await (db as unknown as DelegatesColunaUsuario).pedidoListaColunaUsuario.findMany({
      where: {
        id_organizacao: id_organizacao,
        id_coluna_usuario_pedido: { in: ids },
        ativo_coluna_usuario_pedido: true,
      },
    })

    const mapa = new Map<string, ColunaUsuarioMassa>(rows.map(r => [
      r.id_coluna_usuario_pedido as string,
      {
        id:     r.id_coluna_usuario_pedido as string,
        nome:   r.nome_coluna_usuario_pedido as string,
        tipo:   r.tipo_coluna_usuario_pedido as string,
        escopo: r.escopo_coluna_usuario_pedido as string,
      },
    ]))

    for (const c of referencias) {
      const idCol = idColunaUsuarioDeCampo(c.campo) as string
      const col = mapa.get(idCol)
      if (!col) {
        throw new AppError(
          `Coluna de usuário "${idCol}" não encontrada ou inativa`,
          400,
          'COLUNA_USUARIO_NAO_ENCONTRADA',
        )
      }
      if (col.tipo === 'formula') {
        throw new AppError(
          `Coluna "${col.nome}" é calculada (fórmula) e não pode ser editada em massa`,
          400,
          'CAMPO_BLOQUEADO',
        )
      }
      const escopoCompativel = col.escopo === 'ambos' || col.escopo === c.nivel
      if (!escopoCompativel) {
        throw new AppError(
          `Coluna "${col.nome}" tem escopo "${col.escopo}" e não aceita edição no nível ${c.nivel}`,
          400,
          'ESCOPO_INCOMPATIVEL',
        )
      }
      const permitidas = OPERACOES_POR_TIPO_COLUNA_USUARIO[col.tipo] ?? OPERACOES_POR_TIPO_COLUNA_USUARIO.texto
      if (!permitidas.has(c.operacao)) {
        throw new AppError(
          `Coluna "${col.nome}" (tipo ${col.tipo}) não aceita a operação "${c.operacao}"`,
          400,
          'OPERACAO_INCOMPATIVEL',
        )
      }
    }

    return mapa
  }

  /**
   * Carrega valores atuais (EAV) das colunas de usuário para os pedidos e
   * itens do batch. Chave do Map: `${id_coluna}:${id_vinculo}`.
   */
  private async carregarValoresColunaUsuario(
    id_organizacao: string,
    db: PrismaClient,
    colunas: Map<string, ColunaUsuarioMassa>,
    pedidos: Record<string, unknown>[],
  ): Promise<Map<string, string>> {
    if (colunas.size === 0) return new Map()

    const vinculoIds: string[] = []
    for (const p of pedidos) {
      vinculoIds.push(p.id_pedido as string)
      for (const item of (p.itens_pedido as Record<string, unknown>[]) ?? []) {
        vinculoIds.push(item.id_item as string)
      }
    }

    const registros = await (db as unknown as DelegatesColunaUsuario).pedidoListaColunaUsuarioValor.findMany({
      where: {
        id_organizacao: id_organizacao,
        id_coluna_usuario_pedido: { in: [...colunas.keys()] },
        id_vinculo_valor_coluna_usuario_pedido: { in: vinculoIds },
      },
    })

    return new Map(registros.map(r => [
      `${r.id_coluna_usuario_pedido as string}:${r.id_vinculo_valor_coluna_usuario_pedido as string}`,
      r.valor_coluna_usuario_pedido as string,
    ]))
  }

  /** Upsert de um valor de coluna de usuário (mesma transação do batch). */
  private async upsertValorColunaUsuario(
    id_organizacao: string,
    db: PrismaClient,
    idColuna: string,
    vinculo: 'pedido' | 'item',
    idVinculo: string,
    valor: string,
  ): Promise<void> {
    await (db as unknown as DelegatesColunaUsuario).pedidoListaColunaUsuarioValor.upsert({
      where: {
        id_organizacao_id_coluna_usuario_pedido_id_vinculo_valor_coluna_usuario_pedido: {
          id_organizacao:                         id_organizacao,
          id_coluna_usuario_pedido:               idColuna,
          id_vinculo_valor_coluna_usuario_pedido: idVinculo,
        },
      },
      create: {
        id_organizacao:                         id_organizacao,
        id_coluna_usuario_pedido:               idColuna,
        vinculo_valor_coluna_usuario_pedido:    vinculo,
        id_vinculo_valor_coluna_usuario_pedido: idVinculo,
        valor_coluna_usuario_pedido:            valor,
      },
      update: { valor_coluna_usuario_pedido: valor },
    })
  }
}
