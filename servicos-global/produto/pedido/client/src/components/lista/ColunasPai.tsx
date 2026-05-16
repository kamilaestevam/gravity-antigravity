/**
 * ColunasPai.tsx — Definição de colunas do Pedido (linha pai)
 *
 * Exporta buildColunasPai(t) (GTColuna<Pedido>[]) e o _regrasAlertasRef compartilhado.
 * Separado para manter ListaPedidos.tsx abaixo de 2000 linhas.
 */

import React from 'react'
import type { TFunction } from 'i18next'
import { PencilSimpleLine } from '@phosphor-icons/react'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/types'
import { STATUS_PEDIDO_LABELS, fmtQuantidade, fmtData, classeMoedaBadge } from '../../shared/types'
import type { RegrasConfigBackend } from '../../shared/api'
import { LABELS_FILTRO_INVERSO } from './filtros'
import type { GTUnidadeOpcao } from '../../shared/useUnidadesPedido'
import { getEditavel } from '../../shared/columnBehaviorConfig'

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
   * Mapa de id_workspace → nome_workspace para renderizar a coluna "Workspace".
   * Carregado da Lista (Pedidos.tsx) via `/api/v1/hub/init`. Quando vazio,
   * a coluna mostra o próprio id_workspace como fallback.
   */
  workspacesMap?: Map<string, { nome: string; cnpj?: string | null }>
}

export function buildColunasPai(t: TFunction, opcoes: OpcoesUnidadesColunas): GTColuna<Pedido>[] {
  const { unidadesPeso, unidadesCubagem, incotermsOpcoes, workspacesMap } = opcoes

  /** Monta URL deep-link para editar CNPJ do workspace no Configurador, com retorno automático */
  const urlEditarCnpjWorkspace = (idWorkspace: string, pedidoId?: string) => {
    const urlAtual = new URL(window.location.href)
    if (pedidoId) urlAtual.searchParams.set('expandir', pedidoId)
    const retorno = encodeURIComponent(urlAtual.toString())
    const base = import.meta.env.DEV ? 'http://localhost:8000' : '/configurador'
    return `${base}/workspace/workspaces?id=${idWorkspace}&foco=cnpj&retorno=${retorno}`
  }

  return [
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
    grupo: 'Identificação',
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
      { valor: 'importacao', label: 'Importação' },
      { valor: 'exportacao', label: 'Exportação' },
    ],
    tooltipTitulo: t('pedido.coluna_pai.tipo_operacao_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.tipo_operacao_desc'),
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
        genero="feminino"
        style={row.tipo_operacao === 'importacao'
          ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
          : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
        }
      />
    ),
    findDisplay: (row: Pedido) => row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação',
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
    label: 'Workspace',
    tipo: 'texto',           // promovido para 'enum' em Pedidos.tsx → detectarTipoColuna
    filtravel: true,
    sortavel: false,         // backend ordena por id_workspace, não nome — manter simples
    grupo: 'Identificação',
    render: (_val: unknown, row: Pedido) => {
      const id = (row as unknown as { id_workspace?: string }).id_workspace ?? ''
      const nome = workspacesMap?.get(id)?.nome ?? id
      return <span style={{ display: 'block', textAlign: 'left' }}>{nome}</span>
    },
  },
  {
    key: 'nome_exportador',
    label: t('pedido.coluna_pai.nome_exportador'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_exportador'),
    tooltipBloqueado: 'Exportador definido automaticamente pelo workspace — não editável em Exportação',
    tooltipTitulo: t('pedido.coluna_pai.nome_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_exportador_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_exportador, row.nome_exportador_divergente, 'Exportadores divergentes entre itens'),
  },
  {
    key: 'nome_importador',
    label: t('pedido.coluna_pai.nome_importador'),
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    editavel: getEditavel('nome_importador'),
    tooltipBloqueado: 'Importador definido automaticamente pelo workspace — não editável em Importação',
    tooltipTitulo: t('pedido.coluna_pai.nome_importador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_importador_desc'),
    grupo: 'Partes',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(row.nome_importador, row.nome_importador_divergente, 'Importadores divergentes entre itens'),
  },
  // ── CNPJ Importador ──────────────────────────────────────────────────────────
  // Fonte única de verdade: cnpj_workspace do Workspace (via workspacesMap).
  // Importação: workspace = importador → exibe CNPJ do workspace.
  // Exportação: contraparte estrangeira → "—" com tooltip.
  {
    key: 'cnpj_importador',
    label: 'CNPJ do Importador',
    tipo: 'texto',
    editavel: false,
    grupo: 'Partes',
    tooltipTitulo: 'CNPJ do Importador',
    tooltipDescricao: 'CNPJ da empresa importadora. Fonte única: CNPJ do Workspace. Em exportação, não se aplica (contraparte estrangeira).',
    render: (_val: unknown, row: Pedido) => {
      const isImportacao = row.tipo_operacao === 'importacao'
      if (!isImportacao) {
        return (
          <TooltipGlobal descricao="Em operações de exportação, o CNPJ do Importador não se aplica — a contraparte estrangeira não possui CNPJ brasileiro.">
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
          <TooltipGlobal descricao="CNPJ não cadastrado no Workspace. Clique para cadastrar">
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              Cadastrar CNPJ
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
    label: 'CNPJ do Exportador',
    tipo: 'texto',
    editavel: false,
    grupo: 'Partes',
    tooltipTitulo: 'CNPJ do Exportador',
    tooltipDescricao: 'CNPJ da empresa exportadora. Fonte única: CNPJ do Workspace. Em importação, não se aplica (contraparte estrangeira).',
    render: (_val: unknown, row: Pedido) => {
      const isExportacao = row.tipo_operacao === 'exportacao'
      if (!isExportacao) {
        return (
          <TooltipGlobal descricao="Em operações de importação, o CNPJ do Exportador não se aplica — a contraparte estrangeira não possui CNPJ brasileiro.">
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
          <TooltipGlobal descricao="CNPJ não cadastrado no Workspace. Clique para cadastrar">
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); window.location.href = href }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
              style={{ color: 'var(--accent, #f0c040)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
            >
              <PencilSimpleLine size={12} weight="bold" />
              Cadastrar CNPJ
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
      renderAgregado(row.nome_fabricante, row.nome_fabricante_divergente, 'Fabricantes divergentes entre itens'),
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
      renderAgregado(row.referencia_importador, row.referencia_importador_divergente, 'Referências divergentes entre itens'),
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
      renderAgregado(row.referencia_exportador, row.referencia_exportador_divergente, 'Referências divergentes entre itens'),
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
      const labelDivergente = `${row.ncms_distintos_count ?? '?'} NCMs diferentes nos itens`
      return renderAgregado(fmt, row.ncm_divergente, labelDivergente, { fontMono: true })
    },
  },
  {
    key: 'descricao_item',
    label: t('pedido.coluna_pai.descricao_item'),
    tipo: 'texto',
    filtravel: false,
    tooltipTitulo: t('pedido.coluna_pai.descricao_item_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.descricao_item_desc'),
    grupo: 'Identificação',
    render: () => <span>{'—'}</span>,
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
    render: (_val: unknown, row: Pedido) => <span>{row.numero_proforma ?? '—'}</span>,
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
    render: (_val: unknown, row: Pedido) => <span>{row.numero_invoice ?? '—'}</span>,
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
      renderAgregado(row.incoterm, row.incoterm_divergente, 'Incoterms divergentes entre itens'),
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
            {renderAgregado(valorJsx, row.moeda_item_divergente, 'Moedas divergentes entre itens')}
          </span>
        </TooltipGlobal>
      )
    },
  },
  {
    key: 'moeda_pedido',
    label: 'Moeda do Pedido/Item',
    tipo: 'moeda',
    filtravel: true,
    avisoImpacto: 'A alteração da moeda irá alterar também Valor Total do Pedido/Item e Valor do Item',
    grupo: 'Financeiro',
    render: (_val: unknown, row: Pedido) => {
      const moeda = row.moeda_pedido
      if (!moeda) return <span>{'—'}</span>
      return (
        <span className="gtv-celula-moeda">
          <span className={classeMoedaBadge(moeda)}>{moeda}</span>
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
        ? renderAgregado(null, true, 'Moedas divergentes entre itens')
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
  },
  {
    key: 'unidade_comercializada_pedido',
    label: 'Unidade Comercializada',
    tipo: 'unidade',
    filtravel: true,
    grupo: 'Quantidades',
    avisoImpacto: 'A alteração da unidade irá alterar também Qtd. Inicial, Qtd. Pronta, Qtd. Transferida, Saldo e Qtd. Cancelada',
    render: (_val: unknown, row: Pedido) =>
      renderAgregado(
        row.unidade_comercializada_pedido,
        row.unidade_comercializada_item_divergente,
        'Unidades divergentes entre itens',
      ),
  },
  {
    key: 'quantidade_total_pedido',
    label: t('pedido.coluna_pai.quantidade_total_inicial_pedido'),
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: 'A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Pronta, Qtd. Transferida, Saldo e Qtd. Cancelada',
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
    avisoImpacto: 'A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Inicial, Qtd. Transferida, Saldo e Qtd. Cancelada',
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
    avisoImpacto: 'A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Inicial, Qtd. Pronta, Qtd. Transferida e Qtd. Cancelada',
    tooltipTitulo: t('pedido.coluna_pai.saldo_itens_do_pedido_titulo'),
    tooltipDescricao: <span>Calculado com base nos itens — não editável. <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>,
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
            descricao={<span>Calculado com base nos itens — não editável. <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>}
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
          descricao={<span>Calculado com base nos itens — não editável. <a href="/produto/pedido/configuracoes?tab=colunas-campos-calculados">Editar fórmula no Configurador</a></span>}
          interativo
        >
          <span style={{ display: 'contents' }}>{node}</span>
        </TooltipGlobal>
      )

      if (unidadesEfetivas.size > 1) {
        return tooltipWrap(renderAgregado(null, true, 'Unidades divergentes entre itens'))
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
    avisoImpacto: 'A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Inicial, Qtd. Pronta, Saldo e Qtd. Cancelada',
    tooltipTitulo: t('pedido.coluna_pai.quantidade_transferida_total_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.quantidade_transferida_total_desc'),
    tooltipBloqueado: 'Campo calculado — soma de quantidade_transferida_pedido de todos os itens. Alterado apenas por operações de transferência.',
    grupo: 'Quantidades',
    render: (_val: unknown, row: Pedido) => renderQtdPedido(row, 'quantidade_transferida_pedido', 0, { titulo: t('pedido.coluna_pai.quantidade_transferida_total_titulo'), descricao: t('pedido.coluna_pai.quantidade_transferida_total_desc') }),
  },
  {
    key: 'quantidade_cancelada_total_pedido',
    label: t('pedido.coluna_pai.quantidade_cancelada_total_pedido'),
    // tipo: 'unidade' (espelhado com QTD inicial/pronta) — usa renderQtdPedido.
    tipo: 'unidade',
    align: 'right',
    avisoImpacto: 'A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Inicial, Qtd. Pronta, Qtd. Transferida e Saldo',
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
        'Datas de emissão divergentes entre itens',
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
      renderAgregado(row.referencia_fabricante, row.referencia_fabricante_divergente, 'Referências divergentes entre itens'),
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
      renderAgregado(row.cobertura_cambial_valor_unico, row.cobertura_cambial_divergente, 'Coberturas cambiais divergentes entre itens'),
  },
  // ── Câmbio ────────────────────────────────────────────────────────────────────
  {
    key: 'moeda_cambio_pedido',
    label: 'Moeda Câmbio',
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
    label: 'Taxa Câmbio Estimada',
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
    label: 'Valor Total Câmbio',
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
    label: 'Contrato de Câmbio',
    tipo: 'texto',
    filtravel: true,
    grupo: 'Câmbio',
    render: (_val: unknown, row: Pedido) => <span>{row.contrato_cambio_id_pedido ?? '—'}</span>,
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
      renderAgregado(row.condicao_pagamento, row.condicao_pagamento_divergente, 'Condições de pagamento divergentes entre itens'),
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
    avisoImpacto: 'A alteração da unidade irá alterar também Peso Bruto Total',
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
              <span style={{ display: 'contents' }}>{renderAgregado(null, true, 'Unidades de peso líquido divergentes entre itens')}</span>
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
    avisoImpacto: 'A alteração da unidade irá alterar também Peso Líquido Total',
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
              <span style={{ display: 'contents' }}>{renderAgregado(null, true, 'Unidades de peso bruto divergentes entre itens')}</span>
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
              <span style={{ display: 'contents' }}>{renderAgregado(null, true, 'Unidades de cubagem divergentes entre itens')}</span>
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
  criarColunaDataReplicavel(t, 'data_prevista_pedido_pronto',    'Datas previstas de pedido pronto divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_pedido_pronto',  'Datas confirmadas de pedido pronto divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_pedido_pronto',        'Datas meta de pedido pronto divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_inspecao_pedido',  'Datas previstas de inspeção divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_inspecao_pedido','Datas confirmadas de inspeção divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_inspecao_pedido',      'Datas meta de inspeção divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_coleta_pedido',    'Datas previstas de coleta divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_coleta_pedido',  'Datas confirmadas de coleta divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_coleta_pedido',        'Datas meta de coleta divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_consolidacao_pedido',       'Datas de consolidação divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_transferencia_saldo_pedido','Datas de transferência de saldo divergentes entre itens'),
  // ── Exportador (detalhes) ───────────────────────────────────────────────────
  {
    key: 'pais_exportador',
    label: t('pedido.coluna_pai.pais_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.pais_exportador ?? '—'}</span>,
  },
  {
    key: 'estado_exportador',
    label: t('pedido.coluna_pai.estado_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.estado_exportador ?? '—'}</span>,
  },
  {
    key: 'cidade_exportador',
    label: t('pedido.coluna_pai.cidade_exportador'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_exportador ?? '—'}</span>,
  },
  {
    key: 'endereco_exportador',
    label: t('pedido.coluna_pai.endereco_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_exportador ?? '—'}</span>,
  },
  {
    key: 'zip_code_exportador',
    label: t('pedido.coluna_pai.zip_code_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_exportador ?? '—'}</span>,
  },
  {
    key: 'exportador_ou_fabricante',
    label: t('pedido.coluna_pai.exportador_ou_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.exportador_ou_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.exportador_ou_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_ou_fabricante ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante',
    label: t('pedido.coluna_pai.relacao_exportador_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.relacao_exportador_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.relacao_exportador_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.relacao_exportador_fabricante ?? '—'}</span>,
  },
  // ── Contato do exportador ───────────────────────────────────────────────────
  {
    key: 'nome_contato_exportador',
    label: t('pedido.coluna_pai.nome_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.nome_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.nome_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'email_contato_exportador',
    label: t('pedido.coluna_pai.email_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.email_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.email_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.email_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'whatsapp_contato_exportador',
    label: t('pedido.coluna_pai.whatsapp_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.whatsapp_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.whatsapp_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.whatsapp_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'cargo_contato_exportador',
    label: t('pedido.coluna_pai.cargo_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cargo_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cargo_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cargo_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'departamento_contato_exportador',
    label: t('pedido.coluna_pai.departamento_contato_exportador'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.departamento_contato_exportador_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.departamento_contato_exportador_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.departamento_contato_exportador ?? '—'}</span>,
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
    render: (_val: unknown, row: Pedido) => <span>{row.pais_fabricante ?? '—'}</span>,
  },
  {
    key: 'estado_fabricante',
    label: t('pedido.coluna_pai.estado_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.estado_fabricante ?? '—'}</span>,
  },
  {
    key: 'cidade_fabricante',
    label: t('pedido.coluna_pai.cidade_fabricante'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_fabricante ?? '—'}</span>,
  },
  {
    key: 'endereco_fabricante',
    label: t('pedido.coluna_pai.endereco_fabricante'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_fabricante ?? '—'}</span>,
  },
  {
    key: 'zip_code_fabricante',
    label: t('pedido.coluna_pai.zip_code_fabricante'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_fabricante_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_fabricante_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_fabricante ?? '—'}</span>,
  },
  // ── OPE ────────────────────────────────────────────────────────────────────
  {
    key: 'cnpj_raiz_empresa_responsavel',
    label: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cnpj_raiz_empresa_responsavel_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cnpj_raiz_empresa_responsavel ?? '—'}</span>,
  },
  {
    key: 'codigo_ope',
    label: t('pedido.coluna_pai.codigo_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.codigo_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.codigo_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.codigo_ope ?? '—'}</span>,
  },
  {
    key: 'situacao_ope',
    label: t('pedido.coluna_pai.situacao_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.situacao_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.situacao_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.situacao_ope ?? '—'}</span>,
  },
  {
    key: 'versao_ope',
    label: t('pedido.coluna_pai.versao_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.versao_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.versao_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.versao_ope ?? '—'}</span>,
  },
  {
    key: 'nome_ope',
    label: t('pedido.coluna_pai.nome_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.nome_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.nome_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.nome_ope ?? '—'}</span>,
  },
  {
    key: 'pais_ope',
    label: t('pedido.coluna_pai.pais_ope'),
    tipo: 'texto',
    filtravel: true,
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.pais_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.pais_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.pais_ope ?? '—'}</span>,
  },
  {
    key: 'estado_ope',
    label: t('pedido.coluna_pai.estado_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.estado_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.estado_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.estado_ope ?? '—'}</span>,
  },
  {
    key: 'cidade_ope',
    label: t('pedido.coluna_pai.cidade_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.cidade_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.cidade_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_ope ?? '—'}</span>,
  },
  {
    key: 'endereco_ope',
    label: t('pedido.coluna_pai.endereco_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.endereco_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.endereco_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_ope ?? '—'}</span>,
  },
  {
    key: 'zip_code_ope',
    label: t('pedido.coluna_pai.zip_code_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.zip_code_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.zip_code_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_ope ?? '—'}</span>,
  },
  {
    key: 'tin_ope',
    label: t('pedido.coluna_pai.tin_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.tin_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.tin_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.tin_ope ?? '—'}</span>,
  },
  {
    key: 'email_ope',
    label: t('pedido.coluna_pai.email_ope'),
    tipo: 'texto',
    grupo: 'Partes',
    tooltipTitulo: t('pedido.coluna_pai.email_ope_titulo'),
    tooltipDescricao: t('pedido.coluna_pai.email_ope_desc'),
    render: (_val: unknown, row: Pedido) => <span>{row.email_ope ?? '—'}</span>,
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
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_rascunho_pedido',   'Datas previstas de recebimento do draft do pedido divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_rascunho_pedido', 'Datas confirmadas de recebimento do draft do pedido divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_rascunho_pedido',       'Datas meta de recebimento do draft do pedido divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_aprovacao_rascunho_pedido',     'Datas previstas de aprovação do draft do pedido divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_aprovacao_rascunho_pedido',   'Datas confirmadas de aprovação do draft do pedido divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_aprovacao_rascunho_pedido',         'Datas meta de aprovação do draft do pedido divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_documento_pedido',                      'Datas de documento do pedido divergentes entre itens'),

  criarColunaDataReplicavel(t, 'data_documento_proforma',                      'Datas de documento proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_documento_invoice',                       'Datas de documento invoice divergentes entre itens'),

  // Proforma (13)
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_rascunho_proforma',    'Datas previstas de recebimento do draft da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_rascunho_proforma',  'Datas confirmadas de recebimento do draft da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_rascunho_proforma',        'Datas meta de recebimento do draft da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_aprovacao_rascunho_proforma',      'Datas previstas de aprovação do draft da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_aprovacao_rascunho_proforma',    'Datas confirmadas de aprovação do draft da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_aprovacao_rascunho_proforma',          'Datas meta de aprovação do draft da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_envio_original_proforma',          'Datas previstas de envio original da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_envio_original_proforma',        'Datas confirmadas de envio original da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_envio_original_proforma',              'Datas meta de envio original da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_original_proforma',    'Datas previstas de recebimento original da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_original_proforma',  'Datas confirmadas de recebimento original da proforma divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_original_proforma',        'Datas meta de recebimento original da proforma divergentes entre itens'),

  // Invoice (12)
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_rascunho_invoice',    'Datas previstas de recebimento do draft da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_rascunho_invoice',  'Datas confirmadas de recebimento do draft da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_rascunho_invoice',        'Datas meta de recebimento do draft da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_aprovacao_rascunho_invoice',      'Datas previstas de aprovação do draft da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_aprovacao_rascunho_invoice',    'Datas confirmadas de aprovação do draft da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_aprovacao_rascunho_invoice',          'Datas meta de aprovação do draft da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_envio_original_invoice',          'Datas previstas de envio original da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_envio_original_invoice',        'Datas confirmadas de envio original da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_envio_original_invoice',              'Datas meta de envio original da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_prevista_recebimento_original_invoice',    'Datas previstas de recebimento original da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_confirmada_recebimento_original_invoice',  'Datas confirmadas de recebimento original da invoice divergentes entre itens'),
  criarColunaDataReplicavel(t, 'data_meta_recebimento_original_invoice',        'Datas meta de recebimento original da invoice divergentes entre itens'),
  ]
}
