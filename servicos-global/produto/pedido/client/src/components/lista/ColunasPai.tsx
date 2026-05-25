/**
 * ColunasPai.tsx — Definição de colunas do Pedido (linha pai)
 *
 * Exporta buildColunasPai(t) (GTColuna<Pedido>[]) e o _regrasAlertasRef compartilhado.
 * Separado para manter ListaPedidos.tsx abaixo de 2000 linhas.
 */

import React from 'react'
import { Trans } from 'react-i18next'
import type { TFunction } from 'i18next'
import { PencilSimpleLine, Eye, LinkSimple } from '@phosphor-icons/react'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/types'
import { STATUS_PEDIDO_LABELS, fmtQuantidade, fmtData, classeMoedaBadge } from '../../shared/types'
import type { RegrasConfigBackend } from '../../shared/api'
import { LABELS_FILTRO_INVERSO } from './filtros'
import type { GTUnidadeOpcao } from '../../shared/useUnidadesPedido'
import { getEditavel } from '../../shared/columnBehaviorConfig'
import { enriquecerColunasComRegraTooltip, montarTooltipCelulaComAviso } from '../../shared/buildTooltipRegraLista'
import { obterDescricaoExibicaoPedido } from '../../../../shared/pedidoDivergencias'
import { renderBadgeParteWorkspace } from './renderBadgeParteWorkspace'
import {
  urlEditarCnpjWorkspace,
  urlVincularExportador,
  urlVincularImportador,
} from './urlsDeepLinkConfigurador'

// Re-export so callers that used to import from ListaPedidos still work
export { LABELS_FILTRO_INVERSO }

// ── Status: cores padrão e leitura de localStorage ───────────────────────────

const PEDIDO_STATUS_STORAGE_KEY = 'pedido:status_config'

/** Cores padrão por código de status (backend) */
const STATUS_CORES_DEFAULT: Record<string, string> = {
  rascunho:      '#94a3b8',
  aberto:        '#60a5fa',
  transferencia: '#818cf8',
  consolidado:   '#a78bfa',
  cancelado:     '#f87171',
}

// ── Caches de parse — evitam JSON.parse repetido sem risco de dados stale ────
// Ainda chamam localStorage.getItem (barato), mas só fazem JSON.parse
// quando a string muda (caro). Funciona mesmo se o usuário salvar config
// durante a mesma sessão.

let _statusRaw: string | null | undefined = undefined
let _statusParsed: Record<string, { label: string; cor: string }> = {}

function _lerStatusConfig(): Record<string, { label: string; cor: string }> {
  const raw = localStorage.getItem(PEDIDO_STATUS_STORAGE_KEY)
  if (raw !== _statusRaw) {
    _statusRaw = raw
    try { _statusParsed = raw ? JSON.parse(raw) : {} }
    catch { _statusParsed = {} }
  }
  return _statusParsed
}

let _casasRaw: string | null | undefined = undefined
let _casasParsed: Record<string, number> = {}

function _lerCasasConfig(): Record<string, number> {
  const raw = localStorage.getItem('pedido:casas_decimais')
  if (raw !== _casasRaw) {
    _casasRaw = raw
    try { _casasParsed = raw ? JSON.parse(raw) as Record<string, number> : {} }
    catch { _casasParsed = {} }
  }
  return _casasParsed
}

/** Lê o mapa {id → cor} salvo pelo Configuracoes via localStorage */
export function lerStatusCores(): Record<string, string> {
  const config = _lerStatusConfig()
  const mapa: Record<string, string> = {}
  for (const [id, cfg] of Object.entries(config)) mapa[id] = cfg.cor
  return mapa
}

export function getStatusCor(status: string): string {
  const config = _lerStatusConfig()
  return config[status]?.cor ?? STATUS_CORES_DEFAULT[status] ?? '#64748b'
}

/** Lê o label de um status — inclui status customizados do localStorage */
export function getStatusLabel(status: string, t?: TFunction): string {
  const config = _lerStatusConfig()
  if (config[status]?.label) return config[status].label
  if (t) return t(`pedido.status.${status}`)
  return STATUS_PEDIDO_LABELS[status as keyof typeof STATUS_PEDIDO_LABELS] ?? status
}

// ── Casas decimais configuráveis pelo usuário ────────────────────────────────

export function lerCasasDecimaisConfig(): Record<string, number> {
  return _lerCasasConfig()
}

/** Retorna casas decimais para um campo, respeitando config do usuário em Configurações */
export function getCasas(campo: string, padrao: number): number {
  return _lerCasasConfig()[campo] ?? padrao
}

// ── Ref de alertas: carregado uma vez no mount, acessível pelos renders estáticos ──
export const _regrasAlertasRef: { current: RegrasConfigBackend | null } = { current: null }

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

export function renderQtdPedido(row: Pedido, campoItem: keyof PedidoItem, casas = 0, tooltip?: { titulo: string; descricao: string }) {
  const itens = row.itens ?? []
  if (itens.length === 0) return <span style={{ fontVariantNumeric: 'tabular-nums' }}>—</span>

  // Onda A8 — homogeneidade de unidade. Detecção em 2 níveis:
  //   1. Itens contribuintes (com valor > 0) — prioridade para definir a unidade
  //      do agregado, porque são quem efetivamente compõe a soma.
  //   2. Fallback: TODOS os itens com unidade declarada — quando nenhum item
  //      contribui (caso clássico: qty_pronta = 0 em todos), ainda precisamos
  //      detectar se as unidades dos itens declaradas DIVERGEM, ou exibir a
  //      unidade real (não cair no 'UN' hardcoded).
  // Sem isso, "todos itens KG mas todos com qty_pronta=0" mostrava "0 UN".
  const unidadesContribuintes = new Set(
    itens
      .filter(i => (Number(i[campoItem]) || 0) > 0)
      .map(i => i.unidade_comercializada_item ?? 'UN')
  )
  const unidadesDeclaradas = new Set(
    itens
      .map(i => i.unidade_comercializada_item)
      .filter((u): u is string => u != null && u !== '')
  )
  // Set efetivo: prefere contribuintes; se vazio, usa declaradas.
  const unidadesEfetivas = unidadesContribuintes.size > 0
    ? unidadesContribuintes
    : unidadesDeclaradas

  const wrap = (node: React.ReactNode) => tooltip
    ? <TooltipGlobal titulo={tooltip.titulo} descricao={tooltip.descricao}><span style={{ display: 'contents' }}>{node}</span></TooltipGlobal>
    : <>{node}</>

  // Unidades divergentes → não somar; mostrar alerta no padrão `renderAgregado`.
  if (unidadesEfetivas.size > 1) {
    return wrap(renderAgregado(null, true, 'Unidades divergentes entre itens'))
  }

  const unidade = [...unidadesEfetivas][0] ?? 'UN'
  const soma = itens.reduce((s, i) => s + (Number(i[campoItem]) || 0), 0)
  return wrap(
    <span className="gtv-celula-moeda">
      {fmtQuantidade(soma, casas)}
      <span className="gtv-celula-unidade-badge">{unidade}</span>
    </span>
  )
}

// ── Helper: badge de divergência entre itens ─────────────────────────────────
// Usado pelas colunas que agregam valores dos filhos.
// Os flags `_divergente` e `_valor_unico` são populados no FRONTEND (não no
// backend, apesar de comentário antigo dizer o contrário). A função que
// popula é `calcularDivergencias()` em `Pedidos.tsx`, disparada quando os
// itens do pedido são carregados (expansão da linha). Backend só retorna
// os campos brutos do Pedido — a divergência é detectada client-side por
// `getAlertavelKeys()` em `shared/columnAlertConfig.ts`.
const WarnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export function renderAgregado(
  valor: React.ReactNode | null | undefined,
  divergente: boolean | null | undefined,
  labelDivergente?: string,
  opts?: { fontMono?: boolean }
): React.ReactElement {
  const centro: React.CSSProperties = { display: 'block', textAlign: 'center' }

  // Nada para mostrar — célula vazia.
  if (!valor && !divergente) return <span style={centro}>—</span>

  // Sem valor canônico (caso clássico de agregado puro, ex: unidades divergentes
  // que nem podem ser somadas) — mostra só o alerta.
  if (!valor && divergente) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600 }}
        title={labelDivergente}>
        <WarnIcon />{labelDivergente ?? 'Valores divergentes'}
      </span>
    )
  }

  // Renderização do valor (estilo mantido com fontMono opcional).
  const conteudoValor = (
    <span style={opts?.fontMono ? { fontFamily: 'var(--font-mono, monospace)' } : undefined}>{valor}</span>
  )

  // Pedido tem valor próprio, mas itens divergem dele — mostra valor + badge
  // de alerta ao lado. Tooltip detalha a divergência.
  if (divergente) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        title={labelDivergente ?? 'Itens divergem do pedido'}>
        {conteudoValor}
        <span style={{ display: 'inline-flex', color: '#F59E0B', flexShrink: 0 }}><WarnIcon /></span>
      </span>
    )
  }

  return conteudoValor
}

// ── Helper: texto truncado a 50 chars + Eye + tooltip (colunas texto pai) ───
function renderTextoTruncado(valor: string | null | undefined, label: string): React.ReactElement {
  if (!valor) return <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
  if (valor.length <= 50) return <span>{valor}</span>
  return (
    <TooltipGlobal titulo={label} descricao={valor}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        {valor.slice(0, 50) + '…'}
        <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
      </span>
    </TooltipGlobal>
  )
}

// ── Helper: truncamento para uso dentro de renderAgregado ───────────────────
function truncarParaAgregado(valor: string | null | undefined, label: string): React.ReactNode {
  if (!valor) return null
  if (valor.length <= 50) return valor
  return (
    <TooltipGlobal titulo={label} descricao={valor}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        {valor.slice(0, 50) + '…'}
        <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
      </span>
    </TooltipGlobal>
  )
}

// ── Helper: gera uma coluna pai de data com pattern completo ────────────────
// Decisão UX 2026-05-13: TODAS as datas do Pedido seguem o mesmo pattern:
// - tipo 'periodo' (popover com calendário em modoUnico)
// - editavel via getEditavel (config do usuário em Configurações)
// - render com renderAgregado (alerta de divergência pai ≠ itens)
// - checkbox "Aplicar a todos os itens" aparece automático (campo está na
//   whitelist CAMPOS_PEDIDO_PROPAGAVEIS do mapaPropagacaoPedidoItem)
// Whitelist subiu de 22 para 57 campos em 2026-05-13 (migration
// pedido_item_datas_replicaveis adicionou 35 colunas no PedidoItem).
function criarColunaDataReplicavel(
  t: TFunction,
  campo: keyof Pedido & string,
  labelDivergente: string,
): GTColuna<Pedido> {
  return {
    key: campo,
    label: t(`pedido.coluna_pai.${campo}`),
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel(campo),
    tooltipTitulo: t(`pedido.coluna_pai.${campo}_titulo`),
    tooltipDescricao: t(`pedido.coluna_pai.${campo}_desc`),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => {
      const rowAny = row as unknown as Record<string, unknown>
      const valor = rowAny[campo] as string | null | undefined
      const divergente = rowAny[`${campo}_divergente`] as boolean | null | undefined
      return renderAgregado(valor ? fmtData(valor) : null, divergente, labelDivergente)
    },
  }
}

export interface OpcoesUnidadesColunas {
  unidadesPeso: GTUnidadeOpcao[]
  unidadesCubagem: GTUnidadeOpcao[]
  /**
   * Opções de Incoterm vindas de cadastros.incoterm via useIncotermsPedido.
   * Formato `{ valor, label }` esperado pelo popover de edição inline (select).
   */
  incotermsOpcoes?: Array<{ valor: string; label: string }>
  /**
   * Opções de moeda vindas de cadastros.moeda via useMoedasPedido.
   * Formato `{ valor, label }` esperado pelo popover select inline.
   */
  moedasOpcoes?: Array<{ valor: string; label: string }>
  /**
   * Mapa de id_workspace → nome_workspace para renderizar a coluna "Workspace".
   * Carregado da Lista (Pedidos.tsx) via `/api/v1/hub/init`. Quando vazio,
   * a coluna mostra o próprio id_workspace como fallback.
   */
  workspacesMap?: Map<string, { nome: string; cnpj?: string | null }>
}

export function buildColunasPai(t: TFunction, opcoes: OpcoesUnidadesColunas): GTColuna<Pedido>[] {
  const { unidadesPeso, unidadesCubagem, incotermsOpcoes, moedasOpcoes, workspacesMap } = opcoes

  const colunas: GTColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: t('pedido.coluna_pai.numero_pedido'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('numero_pedido'),
    campo: 'numero_pedido',
    tooltipTitulo: t('pedido.coluna_pai.numero_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.numero_pedido_desc'),
    tooltipDescricaoCelula: (row: Pedido) => {
      if (!row.part_number_duplicado_no_pedido) return undefined
      return montarTooltipCelulaComAviso(
        t,
        'numero_pedido',
        t('pedido.coluna_filho.part_number.duplicado_tooltip'),
      )
    },
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      const numero = row.numero_pedido || null
      if (!row.part_number_duplicado_no_pedido) {
        return numero ? <span>{numero}</span> : renderAgregado(null, false)
      }
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {numero ? <span>{numero}</span> : <span>—</span>}
          <span style={{ display: 'inline-flex', color: '#F59E0B', flexShrink: 0 }}><WarnIcon /></span>
        </span>
      )
    },
  },
  {
    key: 'tipo_operacao',
    label: t('pedido.coluna_pai.tipo_operacao'),
    tipo: 'badge',
    align: 'center',
    filtravel: true,
    editavel: getEditavel('tipo_operacao'),
    campo: 'tipo_operacao',
    opcoes: [
      { valor: 'importacao', label: t('pedido.coluna_pai.tipo_operacao_importacao') },
      { valor: 'exportacao', label: t('pedido.coluna_pai.tipo_operacao_exportacao') },
    ],
    tooltipTitulo: t('pedido.coluna_pai.tipo_operacao_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.tipo_operacao_desc'),
    grupo: 'Identificação',
    tooltipDescricaoCelula: (row: Pedido) => {
      if (!row.tipo_operacao_divergente) return undefined
      return montarTooltipCelulaComAviso(
        t,
        'tipo_operacao',
        t('pedido.coluna_pai.tipo_operacao_divergente'),
      )
    },
    render: (_val: unknown, row: Pedido) => {
      const badge = (
        <StatusBadgeGlobal
          valor={row.tipo_operacao === 'importacao' ? t('pedido.coluna_pai.tipo_operacao_importacao') : t('pedido.coluna_pai.tipo_operacao_exportacao')}
          genero="feminino"
          style={row.tipo_operacao === 'importacao'
            ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
            : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
          }
        />
      )
      if (row.tipo_operacao_divergente) {
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {badge}
            <span style={{ color: '#F59E0B' }}><WarnIcon /></span>
          </span>
        )
      }
      return badge
    },
    findDisplay: (row: Pedido) => row.tipo_operacao === 'importacao' ? t('pedido.coluna_pai.tipo_operacao_importacao') : t('pedido.coluna_pai.tipo_operacao_exportacao'),
  },
  // ── Coluna "Workspace" — filtro multi-workspace (entrega 2026-05-13) ────────
  // key = 'id_workspace' (DDD-puro). mapPedido() em api.ts injeta id_workspace
  // no objeto Pedido via spread, então leitura row.id_workspace funciona.
  // O popover de filtro exibe NOMES (não IDs) — handled em Pedidos.tsx via
  // valoresUnicosPorCampo special-case. Sempre visível, posicionada logo após
  // "Tipo de Operação" (decisão de UX 2026-05-13 — dono).
  //
  // DÍVIDA: o framework GTColuna (nucleo-global) usa `label` no header e em
  // `opcoes[].label`. DDD-puro pede `rotulo`. Refactor é multi-arquivo (todas
  // as colunas de todos os produtos consumindo a tabela virtual) e foi
  // pulled-out para uma entrega dedicada.
  {
    key: 'id_workspace',
    label: t('pedido.coluna_pai.workspace_label'),
    tipo: 'texto',           // promovido para 'enum' em Pedidos.tsx → detectarTipoColuna
    filtravel: true,
    sortavel: false,         // backend ordena por id_workspace, não nome — manter simples
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      const rowAny = row as unknown as Record<string, unknown>
      const id = String(rowAny.id_workspace ?? rowAny.company_id ?? '')
      const nome = workspacesMap?.get(id)?.nome ?? id
      const divergente = rowAny.id_workspace_divergente === true
      const labelDivergente = t('pedido.coluna_pai.workspace_divergente', 'Workspaces divergentes entre itens')
      if (!nome) {
        return divergente
          ? renderAgregado(null, true, labelDivergente)
          : <span style={{ color: 'var(--text-muted)' }}>{'—'}</span>
      }
      const conteudo = nome.length <= 50
        ? <span style={{ display: 'block', textAlign: 'left' }}>{nome}</span>
        : (
          <TooltipGlobal titulo={t('pedido.coluna_pai.workspace_label')} descricao={nome}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {nome.slice(0, 50) + '…'}
              <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
            </span>
          </TooltipGlobal>
        )
      return renderAgregado(conteudo, divergente, labelDivergente)
    },
  },
  // ── Nome Exportador ────────────────────────────────────────────────────────
  // Exportação: workspace = exportador → badge com nome do workspace + link urlEditarCnpjWorkspace
  // Importação: contraparte estrangeira → "Vincular Exportador" (vazio) ou badge (preenchido)
  {
    key: 'nome_exportador',
    label: t('pedido.coluna_pai.nome_exportador'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_pai.nome_exportador_bloqueado'),
    tooltipTitulo: t('pedido.coluna_pai.nome_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_exportador_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) => {
      const isExportacao = row.tipo_operacao === 'exportacao'

      // ─── EXPORTAÇÃO: workspace = exportador → badge auto-preenchido ───
      if (isExportacao) {
        const nomeWorkspace = workspacesMap?.get(row.id_workspace ?? '')?.nome
        if (nomeWorkspace) {
          const href = urlEditarCnpjWorkspace(row.id_workspace ?? '', row.id)
          return renderBadgeParteWorkspace({
            nomeWorkspace,
            titulo: t('pedido.coluna_pai.parte_exportador_titulo'),
            descricao: t('pedido.coluna_pai.exportador_workspace_desc', { nome: nomeWorkspace }),
            href,
          })
        }
        // Workspace sem nome cadastrado → link para cadastrar
        const href = urlEditarCnpjWorkspace(row.id_workspace ?? '', row.id)
        return (
          <TooltipGlobal descricao={t('pedido.coluna_pai.workspace_sem_nome')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              {t('pedido.coluna_pai.cadastrar_exportador')}
            </span>
          </TooltipGlobal>
        )
      }

      // ─── IMPORTAÇÃO: contraparte estrangeira → vincular ou badge ───
      const nome = row.nome_exportador
      const idExportador = row.importacao_exportador_id
      if (nome && nome.trim()) {
        const href = urlVincularExportador(idExportador, row.id)
        return (
          <TooltipGlobal descricao={nome.length > 50 ? nome : t('pedido.coluna_pai.clique_editar_exportador')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.28)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.78rem', color: '#818cf8', maxWidth: '100%' }}
            >
              <LinkSimple size={12} weight="bold" style={{ flexShrink: 0, color: '#818cf8' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</span>
            </span>
          </TooltipGlobal>
        )
      }
      const href = urlVincularExportador(null, row.id)
      return (
        <TooltipGlobal descricao={t('pedido.coluna_pai.nenhum_exportador_vinculado')}>
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); window.location.href = href }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
            style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
          >
            <PencilSimpleLine size={12} weight="bold" />
            {t('pedido.coluna_pai.vincular_exportador')}
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── Nome Importador ────────────────────────────────────────────────────────
  // Importação: workspace = importador → badge com nome do workspace + link urlEditarCnpjWorkspace
  // Exportação: contraparte estrangeira → "Vincular Importador" (vazio) ou badge (preenchido)
  {
    key: 'nome_importador',
    label: t('pedido.coluna_pai.nome_importador'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: false,
    tooltipBloqueado: t('pedido.coluna_pai.nome_importador_bloqueado'),
    tooltipTitulo: t('pedido.coluna_pai.nome_importador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_importador_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) => {
      const isImportacao = row.tipo_operacao === 'importacao'

      // ─── IMPORTAÇÃO: workspace = importador → badge auto-preenchido ───
      if (isImportacao) {
        const nomeWorkspace = workspacesMap?.get(row.id_workspace ?? '')?.nome
        if (nomeWorkspace) {
          const href = urlEditarCnpjWorkspace(row.id_workspace ?? '', row.id)
          return renderBadgeParteWorkspace({
            nomeWorkspace,
            titulo: t('pedido.coluna_pai.parte_importador_titulo'),
            descricao: t('pedido.coluna_pai.importador_workspace_desc', { nome: nomeWorkspace }),
            href,
          })
        }
        // Workspace sem nome cadastrado → link para cadastrar
        const href = urlEditarCnpjWorkspace(row.id_workspace ?? '', row.id)
        return (
          <TooltipGlobal descricao={t('pedido.coluna_pai.workspace_sem_nome')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              {t('pedido.coluna_pai.cadastrar_importador')}
            </span>
          </TooltipGlobal>
        )
      }

      // ─── EXPORTAÇÃO: contraparte estrangeira → vincular ou badge ───
      const nome = row.nome_importador
      const idImportador = row.exportacao_importador_id
      if (nome && nome.trim()) {
        const href = urlVincularImportador(idImportador, row.id)
        return (
          <TooltipGlobal descricao={nome.length > 50 ? nome : t('pedido.coluna_pai.clique_editar_importador')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', background: 'rgba(129, 140, 248, 0.12)', border: '1px solid rgba(129, 140, 248, 0.28)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.78rem', color: '#818cf8', maxWidth: '100%' }}
            >
              <LinkSimple size={12} weight="bold" style={{ flexShrink: 0, color: '#818cf8' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</span>
            </span>
          </TooltipGlobal>
        )
      }
      const href = urlVincularImportador(null, row.id)
      return (
        <TooltipGlobal descricao={t('pedido.coluna_pai.nenhum_importador_vinculado')}>
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); window.location.href = href }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
            style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
          >
            <PencilSimpleLine size={12} weight="bold" />
            {t('pedido.coluna_pai.vincular_importador')}
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── CNPJ Importador ──────────────────────────────────────────────────────────
  // Fonte única de verdade: cnpj_workspace do Workspace (via workspacesMap).
  // Importação: workspace = importador → exibe CNPJ do workspace.
  // Exportação: contraparte estrangeira → "—" com tooltip.
  {
    key: 'cnpj_importador',
    label: t('pedido.coluna_pai.cnpj_importador'),
    tipo: 'texto',
    editavel: false,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cnpj_importador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cnpj_importador_desc'),
    render: (_val: unknown, row: Pedido) => {
      const isImportacao = row.tipo_operacao === 'importacao'
      if (!isImportacao) {
        return (
          <TooltipGlobal descricao={t('pedido.coluna_pai.cnpj_importador_nao_aplica')}>
            <span style={{ color: 'var(--text-disabled, #666)', cursor: 'not-allowed' }}>—</span>
          </TooltipGlobal>
        )
      }
      const cnpjWorkspace = workspacesMap?.get(row.id_workspace ?? '')?.cnpj
      const raw = cnpjWorkspace ?? ''
      const digits = raw.replace(/\D/g, '')
      const formatted = digits.length === 14
        ? `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`
        : ''
      if (!formatted) {
        const href = urlEditarCnpjWorkspace(row.id_workspace ?? '', row.id)
        return (
          <TooltipGlobal descricao={t('pedido.coluna_pai.cnpj_nao_cadastrado')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              {t('pedido.coluna_pai.cadastrar_cnpj')}
            </span>
          </TooltipGlobal>
        )
      }
      return <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', letterSpacing: '0.01em' }}>{formatted}</span>
    },
  },
  // ── CNPJ Exportador ──────────────────────────────────────────────────────────
  // Fonte única de verdade: cnpj_workspace do Workspace (via workspacesMap).
  // Exportação: workspace = exportador → exibe CNPJ do workspace.
  // Importação: contraparte estrangeira → "—" com tooltip.
  {
    key: 'cnpj_exportador',
    label: t('pedido.coluna_pai.cnpj_exportador'),
    tipo: 'texto',
    editavel: false,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cnpj_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cnpj_exportador_desc'),
    render: (_val: unknown, row: Pedido) => {
      const isExportacao = row.tipo_operacao === 'exportacao'
      if (!isExportacao) {
        return (
          <TooltipGlobal descricao={t('pedido.coluna_pai.cnpj_exportador_nao_aplica')}>
            <span style={{ color: 'var(--text-disabled, #666)', cursor: 'not-allowed' }}>—</span>
          </TooltipGlobal>
        )
      }
      const cnpjWorkspace = workspacesMap?.get(row.id_workspace ?? '')?.cnpj
      const raw = cnpjWorkspace ?? ''
      const digits = raw.replace(/\D/g, '')
      const formatted = digits.length === 14
        ? `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`
        : ''
      if (!formatted) {
        const href = urlEditarCnpjWorkspace(row.id_workspace ?? '', row.id)
        return (
          <TooltipGlobal descricao={t('pedido.coluna_pai.cnpj_nao_cadastrado')}>
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              {t('pedido.coluna_pai.cadastrar_cnpj')}
            </span>
          </TooltipGlobal>
        )
      }
      return <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', letterSpacing: '0.01em' }}>{formatted}</span>
    },
  },
  {
    key: 'nome_fabricante',
    label: t('pedido.coluna_pai.nome_fabricante'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_fabricante'),
    campo: 'nome_fabricante',
    tooltipTitulo: t('pedido.coluna_pai.nome_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_fabricante_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(truncarParaAgregado(row.nome_fabricante, t('pedido.coluna_pai.nome_fabricante')), row.nome_fabricante_divergente, t('pedido.coluna_pai.fabricantes_divergentes')),
  },
  {
    key: 'referencia_importador',
    label: t('pedido.coluna_pai.referencia_importador'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_importador'),
    tooltipTitulo: t('pedido.coluna_pai.referencia_importador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.referencia_importador_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(truncarParaAgregado(row.referencia_importador, t('pedido.coluna_pai.referencia_importador')), row.referencia_importador_divergente, t('pedido.coluna_pai.referencias_divergentes')),
  },
  {
    key: 'referencia_exportador',
    label: t('pedido.coluna_pai.referencia_exportador'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_exportador'),
    tooltipTitulo: t('pedido.coluna_pai.referencia_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.referencia_exportador_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(truncarParaAgregado(row.referencia_exportador, t('pedido.coluna_pai.referencia_exportador')), row.referencia_exportador_divergente, t('pedido.coluna_pai.referencias_divergentes')),
  },
  {
    key: 'ncm',
    label: t('pedido.coluna_pai.ncm'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('ncm'),
    tooltipTitulo: t('pedido.coluna_pai.ncm_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.ncm_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      // Formata NCM (8 dígitos → 0000.00.00) para consistência visual.
      const raw = row.ncm_valor_unico ?? null
      const d = (raw ?? '').replace(/\D/g, '')
      const fmt = d.length === 8 ? `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6)}` : raw
      // Quando divergente, label informa quantos NCMs distintos existem nos itens.
      // Usa renderAgregado para padronizar com as demais colunas (valor + ícone
      // de alerta lado a lado). Sem ⚠ na string — o ícone SVG já sinaliza.
      const labelDivergente = t('pedido.coluna_pai.ncms_distintos', { count: row.ncms_distintos_count ?? '?' })
      return renderAgregado(fmt, row.ncm_divergente, labelDivergente, { fontMono: true })
    },
  },
  {
    key: 'descricao_item',
    label: t('pedido.coluna_pai.descricao_item'),
    tipo: 'texto',
    filtravel: false,
    editavel: getEditavel('descricao_item'),
    tooltipTitulo: t('pedido.coluna_pai.descricao_item_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.descricao_item_desc'),
    grupo: 'Identificação',
    getValorEditar: (row: Pedido) => obterDescricaoExibicaoPedido(row as Record<string, unknown>) ?? '',
    render: (_val: unknown, row: Pedido) =>
      renderTextoTruncado(
        obterDescricaoExibicaoPedido(row as Record<string, unknown>),
        t('pedido.coluna_pai.descricao_item'),
      ),
  },
  {
    key: 'numero_proforma',
    label: t('pedido.coluna_pai.numero_proforma'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('numero_proforma'),
    campo: 'numero_proforma',
    tooltipTitulo: t('pedido.coluna_pai.numero_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.numero_proforma_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.numero_proforma, t('pedido.coluna_pai.numero_proforma')),
  },
  {
    key: 'numero_invoice',
    label: t('pedido.coluna_pai.numero_invoice'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('numero_invoice'),
    campo: 'numero_invoice',
    tooltipTitulo: t('pedido.coluna_pai.numero_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.numero_invoice_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.numero_invoice, t('pedido.coluna_pai.numero_invoice')),
  },
  {
    key: 'incoterm',
    label: t('pedido.coluna_pai.incoterm'),
    // tipo: 'select' (decisão UX 2026-05-13) — substitui input texto livre por
    // dropdown com opções de cadastros.incoterm (SSOT). incotermsOpcoes vem
    // do useIncotermsPedido em Pedidos.tsx via factory.
    tipo: 'select',
    opcoes: incotermsOpcoes ?? [],
    filtravel: true,
    editavel: getEditavel('incoterm'),
    tooltipTitulo: t('pedido.coluna_pai.incoterm_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.incoterm_desc'),
    grupo: 'Financeiro',
    align: 'center',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.incoterm, row.incoterm_divergente, t('pedido.coluna_pai.incoterms_divergentes')),
  },
  {
    key: 'valor_total_pedido',
    label: t('pedido.coluna_pai.valor_total_pedido'),
    tipo: 'moeda',
    filtravel: true,
    sortavel: true,
    align: 'left',
    casasDecimais: 2,
    tooltipTitulo: t('pedido.coluna_pai.valor_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.valor_total_pedido_desc'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) => {
      // Onda A8 — homogeneidade de moeda. Quando itens divergem em moeda,
      // o helper recalcularAgregadosPedido grava `valor_total_pedido = null`
      // e o front (via calcularDivergencias em Pedidos.tsx) seta a flag
      // `moeda_item_divergente = true`. renderAgregado então mostra o
      // alerta padrão "⚠ Moedas divergentes entre itens".
      const moeda = row.moeda_pedido ?? 'USD'
      const num = Number(row.valor_total_pedido)
      const temValor = row.valor_total_pedido != null && !isNaN(num)
      const valorJsx = temValor
        ? (
          <span className="gtv-celula-moeda">
            <span className={classeMoedaBadge(moeda)}>{moeda}</span>
            {fmtQuantidade(num, 2)}
          </span>
        )
        : null
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.valor_total_pedido_titulo')} descricao={t('pedido.coluna_pai.valor_total_pedido_desc')}>
          <span style={{ display: 'contents' }}>
            {renderAgregado(valorJsx, row.moeda_item_divergente, t('pedido.coluna_pai.moedas_divergentes'))}
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'moeda_pedido',
    label: t('pedido.coluna_pai.moeda_pedido_item'),
    tipo: 'select',
    opcoes: moedasOpcoes ?? [],
    filtravel: true,
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_moeda'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) => {
      const moeda = row.moeda_pedido
      if (!moeda) return <span>{'—'}</span>
      // O ⚠ é posicionado com position:absolute para NÃO ocupar espaço no
      // fluxo — assim a célula centraliza apenas o badge e ele fica alinhado
      // verticalmente com os badges das linhas filhas (que não têm ⚠).
      return (
        <span style={{ position: 'relative', display: 'inline-block' }} title={row.moeda_item_divergente ? t('pedido.coluna_pai.moedas_divergentes') : undefined}>
          <span className="gtv-celula-moeda">
            <span className={classeMoedaBadge(moeda)}>{moeda}</span>
          </span>
          {row.moeda_item_divergente && (
            <span style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '5px', display: 'inline-flex', color: '#F59E0B' }}><WarnIcon /></span>
          )}
        </span>
      )
    },
  },
  {
    key: 'valor_por_unidade_item',
    label: t('pedido.coluna_pai.valor_unitario_item'),
    tipo: 'moeda',
    filtravel: true,
    align: 'left',
    casasDecimais: getCasas('valor_por_unidade_item', 2),
    tooltipTitulo: t('pedido.coluna_pai.valor_unitario_item_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.valor_unitario_item_desc'),
    grupo: 'Financeiro',
    // valor_por_unidade_item é por item — não há somatória no nível pai.
    // MAS se as moedas dos itens divergem, mostramos alerta (Mand. 08 — faz
    // barulho explícito em vez de "—" silencioso). Flag populada pelo
    // `calcularDivergencias` em Pedidos.tsx ao expandir o pedido.
    render: (_val: unknown, row: Pedido) =>
      row.moeda_item_divergente
        ? renderAgregado(null, true, t('pedido.coluna_pai.moedas_divergentes'))
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
  },
  {
    key: 'unidade_comercializada_pedido',
    label: t('pedido.coluna_pai.unidade_comercializada'),
    tipo: 'unidade',
    apenasUnidade: true,
    filtravel: true,
    grupo: 'Quantidades',
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_unidade_full'),
    getValorEditar: (row: Pedido) => ({
      unit: row.unidade_comercializada_pedido ?? 'UN',
      quantity: 0,
    }),
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(
        row.unidade_comercializada_pedido,
        row.unidade_comercializada_item_divergente,
        t('pedido.coluna_pai.unidades_divergentes'),
      ),
  },
  {
    key: 'quantidade_total_pedido',
    label: t('pedido.coluna_pai.quantidade_total_inicial_pedido'),
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_unidade_inicial'),
    tooltipTitulo: t('pedido.coluna_pai.quantidade_total_inicial_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_total_inicial_pedido_desc'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_inicial_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_total_inicial_pedido_titulo'), descricao: t('pedido.coluna_pai.quantidade_total_inicial_pedido_desc') }),
  },
  {
    key: 'quantidade_pronta_itens_pedido_total',
    label: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total'),
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_unidade_pronta'),
    tooltipTitulo: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_desc'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_pronta_total_item_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_titulo'), descricao: t('pedido.coluna_pai.quantidade_pronta_itens_pedido_total_desc') }),
  },
  {
    key: 'saldo_itens_do_pedido',
    label: t('pedido.coluna_pai.saldo_itens_do_pedido'),
    // tipo: 'unidade' (espelhado com as outras 4 colunas de qty) — mostra badge
    // da unidade homogênea ou alerta "Unidades divergentes" via mesma lógica
    // de renderQtdPedido. Decisão UX 2026-05-13.
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_unidade_saldo'),
    tooltipTitulo: t('pedido.coluna_pai.saldo_itens_do_pedido_titulo'),
    tooltipDescricao: <span><Trans i18nKey="pedido.coluna_pai.calculado_itens_editar_formula" components={{ a: <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados" /> }} /></span>,
    tooltipInterativo: true,
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => {
      const itens = row.itens ?? []
      // Sem itens carregados (ex: lista colapsada) — usa o valor agregado do backend
      // ou calcula inicial - transferida como fallback. Sem alerta porque não há
      // como saber se diverge sem inspecionar os itens.
      if (itens.length === 0) {
        const total = row.quantidade_total_pedido ?? null
        const transf = row.quantidade_transferida_total ?? null
        const qtd = row.saldo_itens_do_pedido ?? (total != null && transf != null ? Math.max(0, total - transf) : null)
        return (
          <TooltipGlobal
            titulo={t('pedido.coluna_pai.saldo_itens_do_pedido_titulo')}
            descricao={<span><Trans i18nKey="pedido.coluna_pai.calculado_itens_editar_formula" components={{ a: <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados" /> }} /></span>}
            interativo
          >
            <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#60a5fa' : undefined }}>
              {qtd != null ? fmtQuantidade(qtd, getCasas('quantidade_total_pedido', 0)) : '—'}
            </span>
          </TooltipGlobal>
        )
      }

      // Detecção de divergência de unidade entre itens — mesma regra de
      // renderQtdPedido (contribuintes com saldo>0; fallback declaradas).
      const saldoPorItem = (i: PedidoItem) =>
        Math.max(0, (Number(i.quantidade_inicial_pedido) || 0)
          - (Number(i.quantidade_transferida_pedido) || 0)
          - (Number(i.quantidade_cancelada_pedido) || 0))

      const unidadesContribuintes = new Set(
        itens.filter(i => saldoPorItem(i) > 0).map(i => i.unidade_comercializada_item ?? 'UN')
      )
      const unidadesDeclaradas = new Set(
        itens.map(i => i.unidade_comercializada_item).filter((u): u is string => u != null && u !== '')
      )
      const unidadesEfetivas = unidadesContribuintes.size > 0 ? unidadesContribuintes : unidadesDeclaradas

      const tooltipWrap = (node: React.ReactNode) => (
        <TooltipGlobal
          titulo={t('pedido.coluna_pai.saldo_itens_do_pedido_titulo')}
          descricao={<span><Trans i18nKey="pedido.coluna_pai.calculado_itens_editar_formula" components={{ a: <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados" /> }} /></span>}
          interativo
        >
          <span style={{ display: 'contents' }}>{node}</span>
        </TooltipGlobal>
      )

      if (unidadesEfetivas.size > 1) {
        return tooltipWrap(renderAgregado(null, true, t('pedido.coluna_pai.unidades_divergentes')))
      }

      const unidade = [...unidadesEfetivas][0] ?? 'UN'
      const soma = itens.reduce((s, i) => s + saldoPorItem(i), 0)
      return tooltipWrap(
        <span className="gtv-celula-moeda" style={{ color: soma > 0 ? '#60a5fa' : undefined }}>
          {fmtQuantidade(soma, getCasas('quantidade_total_pedido', 0))}
          <span className="gtv-celula-unidade-badge">{unidade}</span>
        </span>
      )
    },
  },
  {
    key: 'quantidade_transferida_total',
    label: t('pedido.coluna_pai.quantidade_transferida_total'),
    // tipo: 'unidade' (espelhado com QTD inicial/pronta) — usa renderQtdPedido
    // pra exibir badge de unidade + alerta "Unidades divergentes" quando itens
    // têm unidade_comercializada_item diferente. Decisão UX 2026-05-13.
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_unidade_transferida'),
    tooltipTitulo: t('pedido.coluna_pai.quantidade_transferida_total_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_transferida_total_desc'),
    tooltipBloqueado: t('pedido.coluna_pai.quantidade_transferida_bloqueado'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_transferida_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_transferida_total_titulo'), descricao: t('pedido.coluna_pai.quantidade_transferida_total_desc') }),
  },
  {
    key: 'quantidade_cancelada_total_pedido',
    label: t('pedido.coluna_pai.quantidade_cancelada_total_pedido'),
    // tipo: 'unidade' (espelhado com QTD inicial/pronta) — usa renderQtdPedido.
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_unidade_cancelada'),
    tooltipTitulo: t('pedido.coluna_pai.quantidade_cancelada_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_cancelada_total_pedido_desc'),
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_cancelada_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_cancelada_total_pedido_titulo'), descricao: t('pedido.coluna_pai.quantidade_cancelada_total_pedido_desc') }),
  },
  {
    key: 'data_emissao_pedido',
    label: t('pedido.coluna_pai.data_emissao_pedido'),
    tipo: 'periodo',
    filtravel: true,
    editavel: getEditavel('data_emissao_pedido'),
    campo: 'data_emissao_pedido',
    tooltipTitulo: t('pedido.coluna_pai.data_emissao_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.data_emissao_pedido_desc'),
    grupo: 'Datas',
    render: (_val: unknown, row: Pedido) => {
      // Recomputa divergência DIRETAMENTE a partir dos itens carregados no row,
      // ignorando qualquer flag stale em row.data_emissao_pedido_divergente.
      // Decisão UX 2026-05-13: alerta deve refletir o estado ATUAL dos dados
      // sem depender de quando calcularDivergencias rodou pela última vez.
      // Custo: O(itens.length) por render — aceitável (poucos itens por pedido).
      const itens = row.itens ?? []
      // Normaliza qualquer formato (Date, ISO completo, date-only, com fuso) em
      // YYYY-MM-DD canônico via UTC. Mesma função que está em calcularDivergencias.
      const dateKey = (v: unknown): string | null => {
        if (v == null) return null
        const s = String(v)
        if (!s) return null
        const d = new Date(s)
        if (!isNaN(d.getTime())) {
          const y = d.getUTCFullYear()
          const m = String(d.getUTCMonth() + 1).padStart(2, '0')
          const dd = String(d.getUTCDate()).padStart(2, '0')
          return `${y}-${m}-${dd}`
        }
        return s.substring(0, 10) || null
      }
      const datasItens = itens.map(i => dateKey(i.data_emissao_pedido)).filter((v): v is string => v != null)
      const datasUnicas = new Set(datasItens)
      const dataPai = dateKey(row.data_emissao_pedido)
      let divergente = datasUnicas.size > 1
      if (!divergente && dataPai && datasUnicas.size === 1) {
        if ([...datasUnicas][0] !== dataPai) divergente = true
      }
      return renderAgregado(
        row.data_emissao_pedido ? fmtData(row.data_emissao_pedido) : null,
        divergente,
        t('pedido.coluna_pai.datas_emissao_divergentes'),
      )
    },
  },
  {
    key: 'status',
    label: t('pedido.coluna_pai.status'),
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: t('pedido.coluna_pai.status_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.status_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      const cor = getStatusCor(row.status)
      return (
        <StatusBadgeGlobal
          valor={getStatusLabel(row.status, t)}
          genero="masculino"
          style={{
            color: cor,
            background: `${cor}1e`,
            border: `1px solid ${cor}33`,
          }}
        />
      )
    },
    findDisplay: (row: Pedido) => getStatusLabel(row.status, t),
  },
  // ── Dados comerciais ────────────────────────────────────────────────────────
  {
    key: 'referencia_fabricante',
    label: t('pedido.coluna_pai.referencia_fabricante'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('referencia_fabricante'),
    tooltipTitulo: t('pedido.coluna_pai.referencia_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.referencia_fabricante_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(truncarParaAgregado(row.referencia_fabricante, t('pedido.coluna_pai.referencia_fabricante')), row.referencia_fabricante_divergente, t('pedido.coluna_pai.referencias_divergentes')),
  },
  {
    key: 'cobertura_cambial',
    label: t('pedido.coluna_pai.cobertura_cambial'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('cobertura_cambial'),
    campo: 'cobertura_cambial',
    tooltipTitulo: t('pedido.coluna_pai.cobertura_cambial_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cobertura_cambial_desc'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(truncarParaAgregado(row.cobertura_cambial_valor_unico, t('pedido.coluna_pai.cobertura_cambial')), row.cobertura_cambial_divergente, t('pedido.coluna_pai.coberturas_cambiais_divergentes')),
  },
  // ── Câmbio ────────────────────────────────────────────────────────────────────
  {
    key: 'moeda_cambio_pedido',
    label: t('pedido.coluna_pai.moeda_cambio'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Câmbio',
    render: (_val: unknown, row: Pedido) => {
      const moeda = row.moeda_cambio_pedido
      if (!moeda) return <span>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
        </span>
      )
    },
  },
  {
    key: 'taxa_cambio_estimada',
    label: t('pedido.coluna_pai.taxa_cambio_estimada'),
    tipo: 'numero',
    align: 'right',
    casasDecimais: 4,
    grupo: 'Câmbio',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.taxa_cambio_estimada != null ? fmtQuantidade(Number(row.taxa_cambio_estimada), 4) : '—'}
      </span>
    ),
  },
  {
    key: 'valor_total_cambio_pedido',
    label: t('pedido.coluna_pai.valor_total_cambio'),
    tipo: 'numero',
    align: 'left',
    casasDecimais: 2,
    grupo: 'Câmbio',
    render: (_val: unknown, row: Pedido) => {
      const moeda = row.moeda_cambio_pedido ?? row.moeda_pedido ?? 'BRL'
      const num = Number(row.valor_total_cambio_pedido)
      if (row.valor_total_cambio_pedido == null || isNaN(num)) return <span>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
          {fmtQuantidade(num, 2)}
        </span>
      )
    },
  },
  {
    key: 'contrato_cambio_id_pedido',
    label: t('pedido.coluna_pai.contrato_cambio_label'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Câmbio',
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.contrato_cambio_id_pedido, t('pedido.coluna_pai.contrato_cambio')),
  },
  {
    key: 'condicao_pagamento',
    label: t('pedido.coluna_pai.condicao_pagamento_pedido'),
    tipo: 'texto',
    filtravel: true,
    editavel: getEditavel('condicao_pagamento'),
    tooltipTitulo: t('pedido.coluna_pai.condicao_pagamento_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.condicao_pagamento_pedido_desc'),
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(truncarParaAgregado(row.condicao_pagamento, t('pedido.coluna_pai.condicao_pagamento')), row.condicao_pagamento_divergente, t('pedido.coluna_pai.condicoes_pagamento_divergentes')),
  },
  // ── Dados físicos ───────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_total_pedido',
    label: t('pedido.coluna_pai.peso_liquido_total_pedido'),
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('peso_liquido_total_pedido', 3),
    unidades: unidadesPeso,
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_peso_bruto'),
    tooltipTitulo: t('pedido.coluna_pai.peso_liquido_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.peso_liquido_total_pedido_desc'),
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('peso_liquido_total_pedido', 3)
      const num = Number(row.peso_liquido_total_pedido ?? 0)
      // Espelhamento estrito com qty (decisão UX 2026-05-13 — Opção A):
      // itens que divergem em peso_liquido_unidade_item -> alerta, sem soma.
      // Fonte das unidades: cadastros.unidade categoria=peso (KG/G/TON).
      const itens = row.itens ?? []
      if (itens.length > 0) {
        const unidadesContribuintes = new Set(
          itens.filter(i => (Number(i.peso_liquido_unitario) || 0) > 0)
            .map(i => i.peso_liquido_unidade_item ?? 'KG')
        )
        const unidadesDeclaradas = new Set(
          itens.map(i => i.peso_liquido_unidade_item).filter((u): u is string => u != null && u !== '')
        )
        const unidadesEfetivas = unidadesContribuintes.size > 0 ? unidadesContribuintes : unidadesDeclaradas
        if (unidadesEfetivas.size > 1) {
          return (
            <TooltipGlobal titulo={t('pedido.coluna_pai.peso_liquido_total_pedido_titulo')} descricao={t('pedido.coluna_pai.peso_liquido_total_pedido_desc')}>
              <span style={{ display: 'contents' }}>{renderAgregado(null, true, t('pedido.coluna_pai.unidades_peso_liquido_divergentes'))}</span>
            </TooltipGlobal>
          )
        }
      }
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.peso_liquido_total_pedido_titulo')} descricao={t('pedido.coluna_pai.peso_liquido_total_pedido_desc')}>
          <span className="gtv-celula-moeda">
            {row.peso_liquido_total_pedido != null ? fmtQuantidade(num, casas) : '—'}
            <span className="gtv-celula-unidade-badge">kg</span>
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'peso_bruto_total_pedido',
    label: t('pedido.coluna_pai.peso_bruto_total_pedido'),
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('peso_bruto_total_pedido', 3),
    unidades: unidadesPeso,
    avisoImpacto: t('pedido.coluna_pai.aviso_impacto_peso_liquido'),
    tooltipTitulo: t('pedido.coluna_pai.peso_bruto_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.peso_bruto_total_pedido_desc'),
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('peso_bruto_total_pedido', 3)
      const num = Number(row.peso_bruto_total_pedido ?? 0)
      // Espelhamento estrito (Opção A — 2026-05-13) — divergencia em
      // peso_bruto_unidade_item -> alerta. Fonte: cadastros.unidade categoria=peso.
      const itens = row.itens ?? []
      if (itens.length > 0) {
        const unidadesContribuintes = new Set(
          itens.filter(i => (Number(i.peso_bruto_unitario) || 0) > 0)
            .map(i => i.peso_bruto_unidade_item ?? 'KG')
        )
        const unidadesDeclaradas = new Set(
          itens.map(i => i.peso_bruto_unidade_item).filter((u): u is string => u != null && u !== '')
        )
        const unidadesEfetivas = unidadesContribuintes.size > 0 ? unidadesContribuintes : unidadesDeclaradas
        if (unidadesEfetivas.size > 1) {
          return (
            <TooltipGlobal titulo={t('pedido.coluna_pai.peso_bruto_total_pedido_titulo')} descricao={t('pedido.coluna_pai.peso_bruto_total_pedido_desc')}>
              <span style={{ display: 'contents' }}>{renderAgregado(null, true, t('pedido.coluna_pai.unidades_peso_bruto_divergentes'))}</span>
            </TooltipGlobal>
          )
        }
      }
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.peso_bruto_total_pedido_titulo')} descricao={t('pedido.coluna_pai.peso_bruto_total_pedido_desc')}>
          <span className="gtv-celula-moeda">
            {row.peso_bruto_total_pedido != null ? fmtQuantidade(num, casas) : '—'}
            <span className="gtv-celula-unidade-badge">kg</span>
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'cubagem_total_pedido',
    label: t('pedido.coluna_pai.cubagem_total_pedido'),
    tipo: 'unidade',
    filtravel: true,
    sortavel: true,
    align: 'right',
    casasDecimais: getCasas('cubagem_total_pedido', 4),
    unidades: unidadesCubagem,
    tooltipTitulo: t('pedido.coluna_pai.cubagem_total_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cubagem_total_pedido_desc'),
    grupo: 'Dados Físicos',
    render: (_val: unknown, row: Pedido) => {
      const casas = getCasas('cubagem_total_pedido', 4)
      const num = Number(row.cubagem_total_pedido ?? 0)
      // Espelhamento estrito (Opção A — 2026-05-13): itens com cubagem_unidade_item
      // divergente -> alerta. Cubagem aceita 1D/2D/3D (CM/M/CM2/M2/ML/LT/M3 —
      // categorias comprimento|area|volume do cadastros.unidade). Não há fator
      // de conversão entre dimensões, então soma divergente é semanticamente
      // inválida (somar "5 cm" com "3 m²" não faz sentido).
      const itens = row.itens ?? []
      if (itens.length > 0) {
        const unidadesContribuintes = new Set(
          itens.filter(i => (Number(i.cubagem_unitaria) || 0) > 0)
            .map(i => i.cubagem_unidade_item ?? 'M3')
        )
        const unidadesDeclaradas = new Set(
          itens.map(i => i.cubagem_unidade_item).filter((u): u is string => u != null && u !== '')
        )
        const unidadesEfetivas = unidadesContribuintes.size > 0 ? unidadesContribuintes : unidadesDeclaradas
        if (unidadesEfetivas.size > 1) {
          return (
            <TooltipGlobal titulo={t('pedido.coluna_pai.cubagem_total_pedido_titulo')} descricao={t('pedido.coluna_pai.cubagem_total_pedido_desc')}>
              <span style={{ display: 'contents' }}>{renderAgregado(null, true, t('pedido.coluna_pai.unidades_cubagem_divergentes'))}</span>
            </TooltipGlobal>
          )
        }
      }
      return (
        <TooltipGlobal titulo={t('pedido.coluna_pai.cubagem_total_pedido_titulo')} descricao={t('pedido.coluna_pai.cubagem_total_pedido_desc')}>
          <span className="gtv-celula-moeda">
            {row.cubagem_total_pedido != null ? fmtQuantidade(num, casas) : '—'}
            <span className="gtv-celula-unidade-badge">m³</span>
          </span>
        </TooltipGlobal>
      )
    },
  },
  // ── Datas de progresso (Decisão UX 2026-05-13: todas usam pattern unificado
  // com renderAgregado + replicar-em-itens via checkbox no popover) ──────────
  criarColunaDataReplicavel(t, 'data_prevista_pedido_pronto',    t('pedido.coluna_pai.divergente_data_prevista_pedido_pronto')),
  criarColunaDataReplicavel(t, 'data_confirmada_pedido_pronto',  t('pedido.coluna_pai.divergente_data_confirmada_pedido_pronto')),
  criarColunaDataReplicavel(t, 'data_meta_pedido_pronto',        t('pedido.coluna_pai.divergente_data_meta_pedido_pronto')),
  criarColunaDataReplicavel(t, 'data_prevista_inspecao_pedido',  t('pedido.coluna_pai.divergente_data_prevista_inspecao')),
  criarColunaDataReplicavel(t, 'data_confirmada_inspecao_pedido',t('pedido.coluna_pai.divergente_data_confirmada_inspecao')),
  criarColunaDataReplicavel(t, 'data_meta_inspecao_pedido',      t('pedido.coluna_pai.divergente_data_meta_inspecao')),
  criarColunaDataReplicavel(t, 'data_prevista_coleta_pedido',    t('pedido.coluna_pai.divergente_data_prevista_coleta')),
  criarColunaDataReplicavel(t, 'data_confirmada_coleta_pedido',  t('pedido.coluna_pai.divergente_data_confirmada_coleta')),
  criarColunaDataReplicavel(t, 'data_meta_coleta_pedido',        t('pedido.coluna_pai.divergente_data_meta_coleta')),
  criarColunaDataReplicavel(t, 'data_consolidacao_pedido',       t('pedido.coluna_pai.divergente_data_consolidacao')),
  criarColunaDataReplicavel(t, 'data_transferencia_saldo_pedido',t('pedido.coluna_pai.divergente_data_transferencia_saldo')),
  // ── Exportador (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_exportador',
    label: t('pedido.coluna_pai.pais_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.pais_exportador, t('pedido.coluna_pai.pais_exportador')),
  },
  {
    key: 'estado_exportador',
    label: t('pedido.coluna_pai.estado_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.estado_exportador, t('pedido.coluna_pai.estado_exportador')),
  },
  {
    key: 'cidade_exportador',
    label: t('pedido.coluna_pai.cidade_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.cidade_exportador, t('pedido.coluna_pai.cidade_exportador')),
  },
  {
    key: 'endereco_exportador',
    label: t('pedido.coluna_pai.endereco_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.endereco_exportador, t('pedido.coluna_pai.endereco_exportador')),
  },
  {
    key: 'zip_code_exportador',
    label: t('pedido.coluna_pai.zip_code_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.zip_code_exportador, t('pedido.coluna_pai.zip_code_exportador')),
  },
  {
    key: 'exportador_ou_fabricante',
    label: t('pedido.coluna_pai.exportador_ou_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.exportador_ou_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.exportador_ou_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.exportador_ou_fabricante, t('pedido.coluna_pai.exportador_ou_fabricante')),
  },
  {
    key: 'relacao_exportador_fabricante',
    label: t('pedido.coluna_pai.relacao_exportador_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.relacao_exportador_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.relacao_exportador_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.relacao_exportador_fabricante, t('pedido.coluna_pai.relacao_exportador_fabricante')),
  },
  // ── Contato do exportador ───────────────────────────────────────────────────
  {
    key: 'nome_contato_exportador',
    label: t('pedido.coluna_pai.nome_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.nome_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.nome_contato_exportador, t('pedido.coluna_pai.nome_contato_exportador')),
  },
  {
    key: 'email_contato_exportador',
    label: t('pedido.coluna_pai.email_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.email_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.email_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.email_contato_exportador, t('pedido.coluna_pai.email_contato_exportador')),
  },
  {
    key: 'whatsapp_contato_exportador',
    label: t('pedido.coluna_pai.whatsapp_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.whatsapp_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.whatsapp_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.whatsapp_contato_exportador, t('pedido.coluna_pai.whatsapp_contato_exportador')),
  },
  {
    key: 'cargo_contato_exportador',
    label: t('pedido.coluna_pai.cargo_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cargo_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cargo_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.cargo_contato_exportador, t('pedido.coluna_pai.cargo_contato_exportador')),
  },
  {
    key: 'departamento_contato_exportador',
    label: t('pedido.coluna_pai.departamento_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.departamento_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.departamento_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.departamento_contato_exportador, t('pedido.coluna_pai.departamento_contato_exportador')),
  },
  // ── Fabricante (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_fabricante',
    label: t('pedido.coluna_pai.pais_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.pais_fabricante, t('pedido.coluna_pai.pais_fabricante')),
  },
  {
    key: 'estado_fabricante',
    label: t('pedido.coluna_pai.estado_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.estado_fabricante, t('pedido.coluna_pai.estado_fabricante')),
  },
  {
    key: 'cidade_fabricante',
    label: t('pedido.coluna_pai.cidade_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.cidade_fabricante, t('pedido.coluna_pai.cidade_fabricante')),
  },
  {
    key: 'endereco_fabricante',
    label: t('pedido.coluna_pai.endereco_fabricante'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.endereco_fabricante, t('pedido.coluna_pai.endereco_fabricante')),
  },
  {
    key: 'zip_code_fabricante',
    label: t('pedido.coluna_pai.zip_code_fabricante'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.zip_code_fabricante, t('pedido.coluna_pai.zip_code_fabricante')),
  },
  // ── OPE ────────────────────────────────────────────────────────────────────
  {
    key: 'cnpj_raiz_empresa_responsavel',
    label: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.cnpj_raiz_empresa_responsavel, t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel')),
  },
  {
    key: 'codigo_ope',
    label: t('pedido.coluna_pai.codigo_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.codigo_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.codigo_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.codigo_ope, t('pedido.coluna_pai.codigo_ope')),
  },
  {
    key: 'situacao_ope',
    label: t('pedido.coluna_pai.situacao_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.situacao_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.situacao_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.situacao_ope, t('pedido.coluna_pai.situacao_ope')),
  },
  {
    key: 'versao_ope',
    label: t('pedido.coluna_pai.versao_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.versao_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.versao_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.versao_ope, t('pedido.coluna_pai.versao_ope')),
  },
  {
    key: 'nome_ope',
    label: t('pedido.coluna_pai.nome_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.nome_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.nome_ope, t('pedido.coluna_pai.nome_ope')),
  },
  {
    key: 'pais_ope',
    label: t('pedido.coluna_pai.pais_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.pais_ope, t('pedido.coluna_pai.pais_ope')),
  },
  {
    key: 'estado_ope',
    label: t('pedido.coluna_pai.estado_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.estado_ope, t('pedido.coluna_pai.estado_ope')),
  },
  {
    key: 'cidade_ope',
    label: t('pedido.coluna_pai.cidade_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.cidade_ope, t('pedido.coluna_pai.cidade_ope')),
  },
  {
    key: 'endereco_ope',
    label: t('pedido.coluna_pai.endereco_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.endereco_ope, t('pedido.coluna_pai.endereco_ope')),
  },
  {
    key: 'zip_code_ope',
    label: t('pedido.coluna_pai.zip_code_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.zip_code_ope, t('pedido.coluna_pai.zip_code_ope')),
  },
  {
    key: 'tin_ope',
    label: t('pedido.coluna_pai.tin_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.tin_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.tin_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.tin_ope, t('pedido.coluna_pai.tin_ope')),
  },
  {
    key: 'email_ope',
    label: t('pedido.coluna_pai.email_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.email_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.email_ope_desc'),
    render: (_val: unknown, row: Pedido) => renderTextoTruncado(row.email_ope, t('pedido.coluna_pai.email_ope')),
  },
  // ── Documentos (anexos e volumes) ───────────────────────────────────────────
  {
    key: 'anexo_pedido',
    label: t('pedido.coluna_pai.anexo_pedido'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_pai.anexo_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.anexo_pedido_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_pedido ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_proforma',
    label: t('pedido.coluna_pai.anexo_proforma'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_pai.anexo_proforma_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.anexo_proforma_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_proforma ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_invoice',
    label: t('pedido.coluna_pai.anexo_invoice'),
    tipo: 'texto',
    grupo: 'Identificação',
    tooltipTitulo: t('pedido.coluna_pai.anexo_invoice_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.anexo_invoice_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_invoice ? '📎' : '—'}</span>,
  },
  {
    key: 'quantidade_volumes_pedido',
    label: t('pedido.coluna_pai.quantidade_volumes_pedido'),
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    grupo: 'Quantidades',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_volumes_pedido_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_volumes_pedido_desc'),
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_volumes_pedido != null ? String(row.quantidade_volumes_pedido) : '—'}
      </span>
    ),
  },
  // ── Datas — Draft do Pedido + Proforma + Invoice (Decisão UX 2026-05-13:
  // todas seguem pattern unificado com replicar-em-itens via checkbox) ────────

  // Draft do Pedido (7)
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_rascunho_pedido',   t('pedido.coluna_pai.divergente_data_prevista_recebimento_rascunho_pedido')),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_rascunho_pedido', t('pedido.coluna_pai.divergente_data_confirmada_recebimento_rascunho_pedido')),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_rascunho_pedido',       t('pedido.coluna_pai.divergente_data_meta_recebimento_rascunho_pedido')),
  criarColunaDataReplicavel(t, 'data_prevista_aprovacao_rascunho_pedido',     t('pedido.coluna_pai.divergente_data_prevista_aprovacao_rascunho_pedido')),
  criarColunaDataReplicavel(t, 'data_confirmada_aprovacao_rascunho_pedido',   t('pedido.coluna_pai.divergente_data_confirmada_aprovacao_rascunho_pedido')),
  criarColunaDataReplicavel(t, 'data_meta_aprovacao_rascunho_pedido',         t('pedido.coluna_pai.divergente_data_meta_aprovacao_rascunho_pedido')),
  criarColunaDataReplicavel(t, 'data_documento_pedido',                       t('pedido.coluna_pai.divergente_data_documento_pedido')),

  criarColunaDataReplicavel(t, 'data_documento_proforma',                     t('pedido.coluna_pai.divergente_data_documento_proforma')),
  criarColunaDataReplicavel(t, 'data_documento_invoice',                      t('pedido.coluna_pai.divergente_data_documento_invoice')),

  // Proforma (13)
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_rascunho_proforma',    t('pedido.coluna_pai.divergente_data_prevista_recebimento_rascunho_proforma')),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_rascunho_proforma',  t('pedido.coluna_pai.divergente_data_confirmada_recebimento_rascunho_proforma')),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_rascunho_proforma',        t('pedido.coluna_pai.divergente_data_meta_recebimento_rascunho_proforma')),
  criarColunaDataReplicavel(t, 'data_prevista_aprovacao_rascunho_proforma',      t('pedido.coluna_pai.divergente_data_prevista_aprovacao_rascunho_proforma')),
  criarColunaDataReplicavel(t, 'data_confirmada_aprovacao_rascunho_proforma',    t('pedido.coluna_pai.divergente_data_confirmada_aprovacao_rascunho_proforma')),
  criarColunaDataReplicavel(t, 'data_meta_aprovacao_rascunho_proforma',          t('pedido.coluna_pai.divergente_data_meta_aprovacao_rascunho_proforma')),
  criarColunaDataReplicavel(t, 'data_prevista_envio_original_proforma',          t('pedido.coluna_pai.divergente_data_prevista_envio_original_proforma')),
  criarColunaDataReplicavel(t, 'data_confirmada_envio_original_proforma',        t('pedido.coluna_pai.divergente_data_confirmada_envio_original_proforma')),
  criarColunaDataReplicavel(t, 'data_meta_envio_original_proforma',              t('pedido.coluna_pai.divergente_data_meta_envio_original_proforma')),
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_original_proforma',    t('pedido.coluna_pai.divergente_data_prevista_recebimento_original_proforma')),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_original_proforma',  t('pedido.coluna_pai.divergente_data_confirmada_recebimento_original_proforma')),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_original_proforma',        t('pedido.coluna_pai.divergente_data_meta_recebimento_original_proforma')),

  // Invoice (12)
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_rascunho_invoice',    t('pedido.coluna_pai.divergente_data_prevista_recebimento_rascunho_invoice')),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_rascunho_invoice',  t('pedido.coluna_pai.divergente_data_confirmada_recebimento_rascunho_invoice')),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_rascunho_invoice',        t('pedido.coluna_pai.divergente_data_meta_recebimento_rascunho_invoice')),
  criarColunaDataReplicavel(t, 'data_prevista_aprovacao_rascunho_invoice',      t('pedido.coluna_pai.divergente_data_prevista_aprovacao_rascunho_invoice')),
  criarColunaDataReplicavel(t, 'data_confirmada_aprovacao_rascunho_invoice',    t('pedido.coluna_pai.divergente_data_confirmada_aprovacao_rascunho_invoice')),
  criarColunaDataReplicavel(t, 'data_meta_aprovacao_rascunho_invoice',          t('pedido.coluna_pai.divergente_data_meta_aprovacao_rascunho_invoice')),
  criarColunaDataReplicavel(t, 'data_prevista_envio_original_invoice',          t('pedido.coluna_pai.divergente_data_prevista_envio_original_invoice')),
  criarColunaDataReplicavel(t, 'data_confirmada_envio_original_invoice',        t('pedido.coluna_pai.divergente_data_confirmada_envio_original_invoice')),
  criarColunaDataReplicavel(t, 'data_meta_envio_original_invoice',              t('pedido.coluna_pai.divergente_data_meta_envio_original_invoice')),
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_original_invoice',    t('pedido.coluna_pai.divergente_data_prevista_recebimento_original_invoice')),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_original_invoice',  t('pedido.coluna_pai.divergente_data_confirmada_recebimento_original_invoice')),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_original_invoice',        t('pedido.coluna_pai.divergente_data_meta_recebimento_original_invoice')),
  ]

  return enriquecerColunasComRegraTooltip(colunas, t, 'pai')
}
