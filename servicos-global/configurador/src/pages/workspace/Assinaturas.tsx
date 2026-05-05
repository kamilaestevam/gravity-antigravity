// pages/workspace/Assinaturas.tsx
// Tela self-service de assinaturas da organização autenticada.
// Contrato: GET /api/v1/organizacoes/me/assinaturas (Mandamento 09).
//
// Mudanças DDD (2026-05-04):
//   - Payload agora usa nomes idênticos ao schema.prisma (sem chaves legadas inglês)
//   - Status comercial vem de ProdutoGravityAssinatura (Trial/Ativa/Suspensa/Cancelada)
//   - Workspaces habilitados vêm de ProdutoGravityWorkspace (relação real, não estado local)
//   - Toggle/remoção de workspace persiste no backend
//   - Validação Zod strict em toda resposta (Mandamento 06/08)

import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard, FileXls, FileCsv, FileText, FilePdf, Code,
  PencilSimple, Trash, PauseCircle, PlayCircle, Package, CurrencyDollar, WarningCircle, TreeStructure,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import {
  TabelaGlobal,
  type TabelaGlobalColuna,
  type TabelaGlobalAcao,
  type TabelaExportAcao,
} from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ModalExclusao } from './ModalConfirmarExclusao'
import { ModalEditarAssinatura } from './ModalEditarAssinatura'
import {
  exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF,
  type ColunasExport,
} from '../../services/export-service'
import { catalogService } from '../../services/catalog-service'
import type { FaixaPreco } from '../../types/entidades'
import { getSimboloMoeda } from '../../utils/formatters'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { useShellStore } from '@gravity/shell'
import {
  listaAssinaturasProdutoGravitySchema,
  type AssinaturaProdutoGravity,
  type StatusAssinaturaProdutoGravity,
  type TipoCobrancaProdutoGravity,
} from '../../schemas/assinatura-produto-gravity'

// ─── Workspaces (lido de /me/workspaces) ────────────────────────────────────

interface Workspace {
  id_workspace:       string
  nome_workspace:     string
  status_workspace:   string
}

// ─── Mapas de cor por enum (keys idênticas ao Prisma) ───────────────────────

const corTipoCobrancaProdutoGravity: Record<TipoCobrancaProdutoGravity, string> = {
  MENSAL:         '#818cf8',
  POR_PROCESSO:   '#a78bfa',
  POR_DOCUMENTO:  '#a78bfa',
  POR_ESTIMATIVA: '#a78bfa',
  POR_DI_DUIMP:   '#a78bfa',
  POR_DUE:        '#a78bfa',
  POR_PRODUTO:    '#a78bfa',
  POR_FLUXO:      '#a78bfa',
  POR_LPCO:       '#fb923c',
}

const corStatusAssinaturaProdutoGravity: Record<
  StatusAssinaturaProdutoGravity,
  { bg: string; color: string; border: string }
> = {
  EM_TESTE:  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  ATIVA:     { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
  SUSPENSA:  { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
  CANCELADA: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
}

// ─── Auth helper ────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { /* sem token */ }
  return headers
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatarMoeda(valor: string, moeda: string): string {
  const n = Number(valor)
  if (isNaN(n)) return valor
  const locale = moeda.toLowerCase() === 'brl' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(n)
}

function formatarData(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

function statusEhAtivo(s: StatusAssinaturaProdutoGravity): boolean {
  return s === 'EM_TESTE' || s === 'ATIVA'
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function Assinaturas() {
  const _auth = useAuth()
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)

  const [assinaturas, setAssinaturas] = useState<AssinaturaProdutoGravity[]>([])
  const [catalogoProdutoGravity, setCatalogoProdutoGravity] = useState<Record<string, unknown>[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [carregando, setCarregando] = useState(true)
  const [assinaturaParaCancelar, setAssinaturaParaCancelar] = useState<AssinaturaProdutoGravity | null>(null)
  const [assinaturaEditando, setAssinaturaEditando] = useState<AssinaturaProdutoGravity | null>(null)
  const [vinculoWorkspaceParaRemover, setVinculoWorkspaceParaRemover] = useState<{
    assinatura: AssinaturaProdutoGravity
    id_workspace: string
    nome_workspace: string
  } | null>(null)

  // ── Carregar assinaturas + workspaces + catálogo ────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        setCarregando(true)
        const headers = await getAuthHeaders()

        const [allProducts, assinaturasRes, workspacesRes] = await Promise.all([
          catalogService.getProdutos(),
          fetch('/api/v1/organizacoes/me/assinaturas', { headers }).catch(() => null),
          fetch('/api/v1/me/workspaces', { headers }).catch(() => null),
        ])

        // Workspaces (DTO ainda em chaves legadas — atualizar em PR separado)
        if (workspacesRes && workspacesRes.ok) {
          const body = await workspacesRes.json()
          const lista = (body.workspaces ?? body.companies ?? []) as Record<string, unknown>[]
          setWorkspaces(lista.map((w) => ({
            id_workspace:     String(w.id_workspace ?? w.id ?? ''),
            nome_workspace:   String(w.nome_workspace ?? w.name ?? ''),
            status_workspace: String(w.status_workspace ?? w.status ?? 'ATIVO'),
          })))
        }

        // Assinaturas (Mandamento 06: parse Zod strict)
        const slugsContratados = new Set<string>()
        if (assinaturasRes && assinaturasRes.ok) {
          const raw = await assinaturasRes.json()
          const parsed = listaAssinaturasProdutoGravitySchema.safeParse(raw)
          if (!parsed.success) {
            console.error('[Assinaturas] payload de /api/v1/organizacoes/me/assinaturas fora do contrato', parsed.error)
            addNotification({ type: 'error', message: 'Falha de contrato no payload de assinaturas.' })
          } else {
            setAssinaturas(parsed.data.assinaturas)
            for (const a of parsed.data.assinaturas) {
              slugsContratados.add(a.produto.slug_produto_gravity)
            }
          }
        }

        // Catálogo de produtos disponíveis (não contratados)
        setCatalogoProdutoGravity(
          allProducts.filter((p: Record<string, unknown>) =>
            !slugsContratados.has(p.slug_produto_gravity as string),
          ),
        )
      } catch (err) {
        addNotification({
          type: 'error',
          message: err instanceof Error ? err.message : 'Falha ao carregar assinaturas.',
        })
        catalogService.getProdutos().then(setCatalogoProdutoGravity).catch(() => {})
      } finally {
        setCarregando(false)
      }
    }
    loadData()
  }, [])

  // ── Stats ───────────────────────────────────────────────────────────────

  const totalAssinaturasAtivas = assinaturas.filter((a) =>
    statusEhAtivo(a.status_assinatura_produto_gravity),
  ).length
  const totalAssinaturasSuspensas = assinaturas.filter(
    (a) => a.status_assinatura_produto_gravity === 'SUSPENSA',
  ).length
  const custoMensalAssinaturas = assinaturas
    .filter((a) =>
      statusEhAtivo(a.status_assinatura_produto_gravity)
      && a.produto.tipo_cobranca_produto_gravity === 'MENSAL',
    )
    .reduce((acc, a) => acc + Number(a.produto.preco_unitario_produto_gravity || 0), 0)

  // ── Handlers ────────────────────────────────────────────────────────────

  async function recarregar() {
    const headers = await getAuthHeaders()
    const res = await fetch('/api/v1/organizacoes/me/assinaturas', { headers }).catch(() => null)
    if (!res || !res.ok) return
    const parsed = listaAssinaturasProdutoGravitySchema.safeParse(await res.json())
    if (parsed.success) setAssinaturas(parsed.data.assinaturas)
  }

  async function aoSuspenderAssinatura(a: AssinaturaProdutoGravity) {
    const reativando = a.status_assinatura_produto_gravity === 'SUSPENSA'
       || a.status_assinatura_produto_gravity === 'CANCELADA'
    const slug = a.produto.slug_produto_gravity
    try {
      const headers = await getAuthHeaders()
      if (reativando) {
        const res = await fetch('/api/v1/organizacoes/me/assinaturas/assinar-produto', {
          method: 'POST', headers,
          body: JSON.stringify({ slug_produto_gravity: slug }),
        })
        if (!res.ok) throw new Error('Falha ao reativar')
      } else {
        const res = await fetch(`/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}`, {
          method: 'DELETE', headers,
        })
        if (!res.ok) throw new Error('Falha ao suspender')
      }
      await recarregar()
      addNotification({
        type: reativando ? 'success' : 'warning',
        message: `Assinatura "${a.produto.nome_produto_gravity}" ${reativando ? 'reativada' : 'suspensa'} com sucesso.`,
      })
    } catch {
      addNotification({
        type: 'error',
        message: `Erro ao ${reativando ? 'reativar' : 'suspender'} assinatura.`,
      })
    }
  }

  function aoCancelarAssinatura(a: AssinaturaProdutoGravity) {
    setAssinaturaParaCancelar(a)
  }

  async function confirmarCancelamentoAssinatura() {
    if (!assinaturaParaCancelar) return
    const a = assinaturaParaCancelar
    const slug = a.produto.slug_produto_gravity
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}`, {
        method: 'DELETE', headers,
      })
      if (!res.ok) throw new Error('Falha ao cancelar')
      await recarregar()
      // Devolve produto ao catálogo de disponíveis
      const allProducts = await catalogService.getProdutos().catch(() => [])
      const slugsContratados = new Set(
        assinaturas
          .filter((x) => x.id_assinatura_produto_gravity !== a.id_assinatura_produto_gravity)
          .map((x) => x.produto.slug_produto_gravity),
      )
      setCatalogoProdutoGravity(
        allProducts.filter((p: Record<string, unknown>) =>
          !slugsContratados.has(p.slug_produto_gravity as string),
        ),
      )
      addNotification({
        type: 'success',
        message: `Assinatura de "${a.produto.nome_produto_gravity}" cancelada com sucesso.`,
      })
    } catch {
      addNotification({
        type: 'error',
        message: `Erro ao cancelar assinatura de "${a.produto.nome_produto_gravity}".`,
      })
    }
    setAssinaturaParaCancelar(null)
  }

  async function aoAssinarProduto(slug: string, nome: string) {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/v1/organizacoes/me/assinaturas/assinar-produto', {
        method: 'POST', headers,
        body: JSON.stringify({ slug_produto_gravity: slug }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Falha ao assinar')
      }
      await recarregar()
      setCatalogoProdutoGravity((prev) => prev.filter((p) => p.slug_produto_gravity !== slug))
      addNotification({ type: 'success', message: `Produto "${nome}" ativado com sucesso!` })
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao assinar produto.',
      })
    }
  }

  async function aoToggleWorkspace(
    a: AssinaturaProdutoGravity,
    id_workspace: string,
    ativo_atual: boolean,
  ) {
    const slug = a.produto.slug_produto_gravity
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(
        `/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}/workspaces/${encodeURIComponent(id_workspace)}`,
        {
          method: 'PUT', headers,
          body: JSON.stringify({ ativo_produto_gravity_workspace: !ativo_atual }),
        },
      )
      if (!res.ok) throw new Error('Falha ao alterar workspace')
      await recarregar()
    } catch {
      addNotification({ type: 'error', message: 'Erro ao alterar workspace.' })
    }
  }

  async function confirmarRemocaoVinculoWorkspace() {
    if (!vinculoWorkspaceParaRemover) return
    const { assinatura, id_workspace, nome_workspace } = vinculoWorkspaceParaRemover
    const slug = assinatura.produto.slug_produto_gravity
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(
        `/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}/workspaces/${encodeURIComponent(id_workspace)}`,
        { method: 'DELETE', headers },
      )
      if (!res.ok) throw new Error('Falha ao remover vínculo')
      await recarregar()
      addNotification({
        type: 'success',
        message: `Workspace "${nome_workspace}" removido da assinatura.`,
      })
    } catch {
      addNotification({ type: 'error', message: 'Erro ao remover vínculo.' })
    }
    setVinculoWorkspaceParaRemover(null)
  }

  // ── Colunas da TabelaGlobal ─────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<AssinaturaProdutoGravity>[] = [
    {
      key: 'produto',
      label: t('workspace.subscriptions.tabela.produto'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Produto Contratado',
      tooltipDescricao: 'Nome do módulo ou serviço ativo na plataforma.',
      render: (_v, a) => <span style={{ fontWeight: 600 }}>{a.produto.nome_produto_gravity}</span>,
    },
    {
      key: 'id_produto_gravity',
      label: t('workspace.subscriptions.tabela.cobranca'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Modelo de Cobrança',
      tooltipDescricao: t('workspace.subscriptions.tabela.cobranca_desc'),
      render: (_v, a) => {
        const tipo = a.produto.tipo_cobranca_produto_gravity
        const cor = corTipoCobrancaProdutoGravity[tipo] ?? '#94a3b8'
        const label = t(`enum.tipo_cobranca_produto_gravity.${tipo}`, tipo.replace('POR_', ''))
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.175rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700,
            background: `${cor}18`, color: cor, border: `1px solid ${cor}30`,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{label}</span>
        )
      },
    },
    {
      key: 'data_inicio_periodo_assinatura_produto_gravity',
      label: t('workspace.subscriptions.tabela.valor'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Valor do Produto',
      tooltipDescricao: 'Preço cobrado por ciclo ou unidade de consumo.',
      render: (_v, a) => (
        <span style={{ fontFamily: 'monospace', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
          {formatarMoeda(a.produto.preco_unitario_produto_gravity, a.produto.moeda_unitario_produto_gravity)}
        </span>
      ),
    },
    {
      key: 'data_fim_periodo_assinatura_produto_gravity',
      label: t('workspace.subscriptions.tabela.renovacao'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Data de Renovação',
      tooltipDescricao: t('workspace.subscriptions.tabela.renovacao_desc'),
      render: (_v, a) => (
        <span style={{ color: 'var(--ws-muted)' }}>
          {formatarData(a.data_fim_periodo_assinatura_produto_gravity)}
        </span>
      ),
    },
    {
      key: 'ativacoes_produto_gravity',
      label: t('workspace.subscriptions.tabela.workspaces_habilitados'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Distribuição por Workspace',
      tooltipDescricao: t('workspace.subscriptions.tabela.workspaces_desc'),
      render: (_v, a) => {
        const habilitados = a.ativacoes_produto_gravity.filter(
          (w) => w.ativo_produto_gravity_workspace,
        )
        if (habilitados.length === 0) {
          return (
            <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>
              {t('workspace.subscriptions.vazio_workspaces')}
            </span>
          )
        }
        const show = habilitados.slice(0, 2)
        const rest = habilitados.length - show.length
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {show.map((w) => (
              <span key={w.id_workspace} style={{
                fontSize: '0.625rem', fontWeight: 700,
                background: 'rgba(52,211,153,0.08)',
                color: '#34d399',
                padding: '0.125rem 0.4rem', borderRadius: '4px',
                border: '1px solid rgba(52,211,153,0.15)',
              }}>{w.workspace.nome_workspace}</span>
            ))}
            {rest > 0 && (
              <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 700 }}>
                +{rest} (clique para ver)
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'status_assinatura_produto_gravity',
      label: t('workspace.subscriptions.tabela_status'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Status da Assinatura',
      tooltipDescricao: 'Indica se a assinatura está em teste, ativa, suspensa ou cancelada.',
      render: (v) => {
        const status = v as StatusAssinaturaProdutoGravity
        const c = corStatusAssinaturaProdutoGravity[status] ?? corStatusAssinaturaProdutoGravity.SUSPENSA
        const label = t(`enum.status_assinatura_produto_gravity.${status}`, status)
        return (
          <span
            className={status === 'EM_TESTE' ? 'ux-pulse-trial' : undefined}
            style={{
              display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: c.bg, color: c.color, border: `1px solid ${c.border}`,
            }}
          >{label}</span>
        )
      },
    },
  ]

  // ── Ações de linha ──────────────────────────────────────────────────────

  const ACOES: TabelaGlobalAcao<AssinaturaProdutoGravity>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />,
      tooltip: 'Suspender / Reativar',
      onClick: aoSuspenderAssinatura,
      renderCustom: (a) => {
        const suspensa = a.status_assinatura_produto_gravity === 'SUSPENSA'
          || a.status_assinatura_produto_gravity === 'CANCELADA'
        return (
          <TooltipGlobal descricao={suspensa ? 'Reativar' : 'Suspender'}>
            <button
              type="button"
              onClick={() => aoSuspenderAssinatura(a)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'transparent', border: '1px solid transparent',
                color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
              }}
              onMouseEnter={(ev) => {
                ev.currentTarget.style.background = suspensa ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)'
                ev.currentTarget.style.borderColor = suspensa ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'
                ev.currentTarget.style.color = suspensa ? '#34d399' : '#fbbf24'
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.background = 'transparent'
                ev.currentTarget.style.borderColor = 'transparent'
                ev.currentTarget.style.color = '#64748b'
              }}
            >
              {suspensa ? <PlayCircle size={16} weight="bold" /> : <PauseCircle size={16} weight="bold" />}
            </button>
          </TooltipGlobal>
        )
      },
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar assinatura',
      onClick: (a) => setAssinaturaEditando(a),
    },
    {
      id: 'cancel',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Cancelar assinatura',
      onClick: aoCancelarAssinatura,
      onRenderStyle: () => ({
        background: 'rgba(248,113,113,0.12)',
        borderColor: 'rgba(248,113,113,0.3)',
        color: '#f87171',
      }),
    },
  ]

  // ── Exportação ──────────────────────────────────────────────────────────

  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Produto',   key: 'nome_produto_gravity'             },
    { header: 'Cobrança',  key: 'tipo_cobranca_produto_gravity'    },
    { header: 'Valor',     key: 'preco_unitario_produto_gravity'   },
    { header: 'Renovação', key: 'data_fim_periodo_assinatura_produto_gravity' },
    { header: 'Status',    key: 'status_assinatura_produto_gravity' },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'assinaturas', titulo: 'Assinaturas & Planos' }

  // Linha plana para exportação (achatamento do JOIN)
  const dadosExport = assinaturas.map((a) => ({
    nome_produto_gravity:                          a.produto.nome_produto_gravity,
    tipo_cobranca_produto_gravity:                 a.produto.tipo_cobranca_produto_gravity,
    preco_unitario_produto_gravity:                formatarMoeda(
      a.produto.preco_unitario_produto_gravity,
      a.produto.moeda_unitario_produto_gravity,
    ),
    data_fim_periodo_assinatura_produto_gravity:   formatarData(
      a.data_fim_periodo_assinatura_produto_gravity,
    ),
    status_assinatura_produto_gravity:             a.status_assinatura_produto_gravity,
  }))

  const _ACOES_EXPORT: TabelaExportAcao<AssinaturaProdutoGravity>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: () => void exportarExcel(dadosExport, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV',           icone: <FileCsv size={14} weight="bold" />, onClick: () => exportarCSV(dadosExport, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT',           icone: <FileText size={14} weight="bold" />, onClick: () => exportarTXT(dadosExport, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML',           icone: <Code size={14} weight="bold" />,     onClick: () => exportarXML(dadosExport, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF',           icone: <FilePdf size={14} weight="bold" />, onClick: () => exportarPDF(dadosExport, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON',          icone: <Code size={14} weight="bold" />,     onClick: () => exportarJSON(dadosExport, COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
    <style>
      {`
        @keyframes ripplePulse {
          0% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1); }
          70% { box-shadow: 0 0 0 8px rgba(129, 140, 248, 0), 0 4px 12px rgba(0, 0, 0, 0.1); }
          100% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0), 0 4px 12px rgba(0, 0, 0, 0.1); }
        }
        .ux-pulse-card {
          background: linear-gradient(145deg, var(--ws-surface) 0%, rgba(129, 140, 248, 0.05) 100%) !important;
          border: 1px solid rgba(129, 140, 248, 0.35) !important;
          animation: ripplePulse 2.5s infinite;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          position: relative;
        }
        .ux-pulse-card:hover {
          transform: translateY(-2px);
          border-color: rgba(129, 140, 248, 0.7) !important;
          background: linear-gradient(145deg, var(--ws-surface) 0%, rgba(129, 140, 248, 0.1) 100%) !important;
          animation: none;
          box-shadow: 0 8px 24px rgba(129, 140, 248, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        @keyframes ripplePulseTrial {
          0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        .ux-pulse-trial {
          animation: ripplePulseTrial 2s infinite !important;
        }
      `}
    </style>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<CreditCard weight="duotone" size={22} color="#818cf8" />}
          titulo={t('workspace.subscriptions.titulo')}
          subtitulo={t('workspace.subscriptions.subtitulo')}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('workspace.subscriptions.produtos_ativos')}
            icone={<Package weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{totalAssinaturasAtivas}</span>}
            subtexto={assinaturas.length > 0 ? `${assinaturas.length} no total` : 'Sem produtos'}
            tooltip={
              <>
                <p className="cg-tooltip__title">STATUS DAS ASSINATURAS</p>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong>{assinaturas.filter((a) => a.status_assinatura_produto_gravity === 'ATIVA').length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Em Teste</span>
                  <strong>{assinaturas.filter((a) => a.status_assinatura_produto_gravity === 'EM_TESTE').length}</strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.subscriptions.custo_fixo')}
            icone={<CurrencyDollar weight="duotone" size={16} />}
            valor={
              <span style={{ fontSize: '1.5rem' }}>
                R$ {custoMensalAssinaturas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            }
            subtexto="Mensalidade SaaS"
            tooltip={
              <>
                <p className="cg-tooltip__title">COMPOSIÇÃO DO CUSTO</p>
                <div className="cg-tooltip__row">
                  <span>Mensal (Trial/Ativa)</span>
                  <strong>R$ {custoMensalAssinaturas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Custo por uso</span>
                  <strong>Variável</strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.subscriptions.acessos_suspensos')}
            icone={<WarningCircle weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.75rem' }}>{totalAssinaturasSuspensas}</span>}
            subtexto={totalAssinaturasSuspensas === 0 ? 'Tudo operacional' : 'Requer atenção'}
            variante={totalAssinaturasSuspensas > 0 ? 'perigo' : 'padrao'}
            tooltip={
              <>
                <p className="cg-tooltip__title">ATENÇÃO</p>
                <div className="cg-tooltip__row">
                  <span>Assinaturas suspensas</span>
                  <strong>{totalAssinaturasSuspensas}</strong>
                </div>
              </>
            }
          />
        </>
      }
    >
      {/* Produtos contratados */}
      <p className="ws-section-title" style={{ marginBottom: '0.875rem', marginTop: '0.25rem' }}>
        {t('workspace.subscriptions.secao_contratados')}
      </p>
      <div style={{ marginBottom: '2rem' }}>
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
            Carregando assinaturas...
          </div>
        ) : (
          <TabelaGlobal<AssinaturaProdutoGravity>
            id="workspace-subscriptions"
            idKey="id_assinatura_produto_gravity"
            dados={assinaturas}
            colunas={COLUNAS}
            acoes={ACOES}
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
            mensagemVazio="Nenhuma assinatura encontrada na busca."
            mensagemSemFiltro="Nenhuma assinatura contratada."
            tooltipBusca="Localizar assinatura por nome do produto ou status"
            tooltipExpandir="Ver workspaces vinculados a esta assinatura"
            renderExpandido={(a) => (
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid rgba(129,140,248,0.1)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <TreeStructure size={14} /> Auditoria de Consumo por Workspace
                </div>
                <div style={{
                  border: '1px solid rgba(129,140,248,0.08)',
                  borderRadius: '12px', overflow: 'hidden',
                }}>
                  <TabelaGlobal<Workspace>
                    id={`workspace-subscription-workspaces-${a.id_assinatura_produto_gravity}`}
                    idKey="id_workspace"
                    dados={workspaces}
                    tooltipBusca="Filtrar workspaces habilitados nesta assinatura"
                    colunas={[
                      {
                        key: 'nome_workspace',
                        label: t('workspace.subscriptions.subtabela_nome_workspace'),
                        tipo: 'texto',
                        render: (v, ws) => {
                          const nome = String(v)
                          const subdominio = nome
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[̀-ͯ]/g, '')
                            .replace(/[^a-z0-9]/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, '')
                          return (
                            <a
                              href={`http://localhost:8010/workspace/${subdominio}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontWeight: 600, color: 'var(--ws-text)',
                                textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#818cf8'
                                e.currentTarget.style.textDecoration = 'underline'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--ws-text)'
                                e.currentTarget.style.textDecoration = 'none'
                              }}
                              onClick={(ev) => ev.stopPropagation()}
                            >{ws.nome_workspace}</a>
                          )
                        },
                      },
                      {
                        key: 'status_workspace',
                        label: t('workspace.subscriptions.subtabela_status_servico'),
                        tipo: 'texto',
                        render: (_v, ws) => {
                          const ativacao = a.ativacoes_produto_gravity.find(
                            (x) => x.id_workspace === ws.id_workspace,
                          )
                          const ativo = !!ativacao?.ativo_produto_gravity_workspace
                          const suspensa = a.status_assinatura_produto_gravity === 'SUSPENSA'
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                display: 'inline-flex',
                                padding: '0.15rem 0.5rem', borderRadius: '4px',
                                fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                                background: ativo ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                                color: ativo ? '#34d399' : 'var(--ws-muted)',
                                border: ativo ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.1)',
                              }}>{ativo ? 'HABILITADO' : 'BLOQUEADO'}</span>
                              {ativo && suspensa && (
                                <span style={{
                                  display: 'inline-flex',
                                  padding: '0.15rem 0.5rem', borderRadius: '4px',
                                  fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                                  background: 'rgba(248,113,113,0.1)',
                                  color: '#f87171',
                                  border: '1px solid rgba(248,113,113,0.2)',
                                }}>SUSPENSA</span>
                              )}
                            </div>
                          )
                        },
                      },
                      {
                        key: 'id_workspace',
                        label: t('workspace.subscriptions.subtabela_acoes'),
                        tipo: 'texto',
                        align: 'right',
                        render: (_v, ws) => {
                          const ativacao = a.ativacoes_produto_gravity.find(
                            (x) => x.id_workspace === ws.id_workspace,
                          )
                          const ativo = !!ativacao?.ativo_produto_gravity_workspace
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <TooltipGlobal descricao={ativo ? 'Suspender acesso neste workspace' : 'Reativar acesso neste workspace'}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    void aoToggleWorkspace(a, ws.id_workspace, ativo)
                                  }}
                                  style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: ativo ? '#34d399' : 'var(--ws-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 24, height: 24, borderRadius: '4px', transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                >
                                  {ativo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
                                </button>
                              </TooltipGlobal>

                              <TooltipGlobal descricao="Remover vínculo deste workspace">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setVinculoWorkspaceParaRemover({
                                      assinatura: a,
                                      id_workspace: ws.id_workspace,
                                      nome_workspace: ws.nome_workspace,
                                    })
                                  }}
                                  style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: 'var(--ws-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 24, height: 24, borderRadius: '4px', transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#f87171'
                                    e.currentTarget.style.background = 'rgba(248,113,113,0.1)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--ws-muted)'
                                    e.currentTarget.style.background = 'transparent'
                                  }}
                                >
                                  <Trash size={16} weight="bold" />
                                </button>
                              </TooltipGlobal>
                            </div>
                          )
                        },
                      },
                    ]}
                    mensagemVazio="Nenhum workspace cadastrado."
                  />
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Catálogo de produtos disponíveis */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ marginBottom: '0.875rem' }}>
        {t('workspace.subscriptions.secao_disponiveis')}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
        className="ws-fade-up ws-fade-up-d2"
      >
        {catalogoProdutoGravity.map((p) => {
          const tipoCobranca = p.tipo_cobranca_produto_gravity as TipoCobrancaProdutoGravity | undefined
          const tipoCobrancaLabel = tipoCobranca
            ? t(`enum.tipo_cobranca_produto_gravity.${tipoCobranca}`, tipoCobranca.replace('POR_', ''))
            : ''
          return (
            <div key={String(p.id_produto_gravity)} className="ux-pulse-card" style={{
              borderRadius: '12px', padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ws-text)', margin: 0 }}>
                  {String(p.nome_produto_gravity)}
                </p>
                <span style={{
                  padding: '0.175rem 0.5rem', borderRadius: '4px',
                  fontSize: '0.625rem', fontWeight: 800, lineHeight: 1,
                  background: 'rgba(52,211,153,0.1)',
                  color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.2)',
                  textTransform: 'uppercase',
                }}>{tipoCobrancaLabel}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0, minHeight: '3em' }}>
                {String(p.descricao_produto_gravity ?? '')}
              </p>
              {Array.isArray(p.faixas_preco_produto_gravity) ? (
                <div style={{ padding: '0.625rem', background: 'rgba(129,140,248,0.05)', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.1)' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Tabela de Preços</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {(p.faixas_preco_produto_gravity as FaixaPreco[]).slice(0, 2).map((fx, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--ws-muted)' }}>
                          {fx.faixa_ate_faixa_preco_produto_gravity
                            ? `${fx.faixa_de_faixa_preco_produto_gravity}-${fx.faixa_ate_faixa_preco_produto_gravity}`
                            : `Acima de ${fx.faixa_de_faixa_preco_produto_gravity}`}{' '}
                          {tipoCobrancaLabel}s
                        </span>
                        <strong style={{ color: 'var(--ws-text)' }}>
                          {getSimboloMoeda(fx.moeda_faixa_preco_produto_gravity)} {fx.preco_faixa_preco_produto_gravity}
                        </strong>
                      </div>
                    ))}
                    {(p.faixas_preco_produto_gravity as FaixaPreco[]).length > 2 && (
                      <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', textAlign: 'center', marginTop: '4px' }}>
                        + {(p.faixas_preco_produto_gravity as FaixaPreco[]).length - 2} faixas disponíveis
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', display: 'block' }}>VALOR UNITÁRIO</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--ws-text)' }}>
                      {getSimboloMoeda(String(p.moeda_unitario_produto_gravity ?? 'BRL'))} {String(p.preco_unitario_produto_gravity ?? '')}
                    </strong>
                  </div>
                  {!!p.qtd_usuarios_base_produto_gravity && (
                    <div style={{ padding: '4px 8px', background: 'rgba(52,211,153,0.05)', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.1)' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#34d399', display: 'block' }}>FRANQUIA</span>
                      <strong style={{ fontSize: '1rem', color: '#34d399' }}>{String(p.qtd_usuarios_base_produto_gravity)} Free</strong>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                  {p.possui_setup_produto_gravity ? 'Requer Setup' : 'Ativação Instantânea'}
                </span>
                <TooltipGlobal descricao="Iniciar processo de contratação e ativação do produto">
                  <BotaoGlobal
                    variante="primario"
                    tamanho="pequeno"
                    onClick={() => aoAssinarProduto(
                      String(p.slug_produto_gravity),
                      String(p.nome_produto_gravity),
                    )}
                  >Assinar</BotaoGlobal>
                </TooltipGlobal>
              </div>
            </div>
          )
        })}

        {/* "Em Breve" mocks */}
        {[
          { id: 'mock-1', nome: 'Smart Read', descricao: 'Plataforma de automação (IDP) e IA para extração e validação inteligente de documentos de Comércio Exterior.', tipoCobranca: 'Subscription' },
          { id: 'mock-2', nome: 'BID Frete Internacional', descricao: 'Centralize cotações marítimas e aéreas, comparando agentes de carga em tempo real.', tipoCobranca: 'Transactional' },
          { id: 'mock-3', nome: 'BID Câmbio', descricao: 'Otimize transações de fechamento ao competir taxas entre corretoras e bancos em uma única interface.', tipoCobranca: 'Transactional' },
        ].map((p) => (
          <div key={p.id} style={{
            borderRadius: '12px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.03)',
            opacity: 0.55, cursor: 'not-allowed',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ws-muted)', margin: 0 }}>{p.nome}</p>
              <span style={{
                padding: '0.175rem 0.5rem', borderRadius: '4px',
                fontSize: '0.625rem', fontWeight: 800, lineHeight: 1,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--ws-muted)',
                border: '1px solid rgba(255,255,255,0.05)',
                textTransform: 'uppercase',
              }}>Em Breve</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0, minHeight: '3em' }}>{p.descricao}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>{p.tipoCobranca}</span>
              <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled>Aguarde</BotaoGlobal>
            </div>
          </div>
        ))}
      </div>
    </PaginaGlobal>

    <ModalExclusao
      aberto={!!assinaturaParaCancelar}
      titulo="Cancelar Assinatura"
      descricao={
        <>Tem certeza de que deseja cancelar a assinatura de{' '}
          <strong>{assinaturaParaCancelar?.produto.nome_produto_gravity}</strong>?
        </>
      }
      nomeItem="Esta ação é irreversível e o acesso ao produto será bloqueado imediatamente."
      aoConfirmar={confirmarCancelamentoAssinatura}
      aoCancelar={() => setAssinaturaParaCancelar(null)}
    />

    <ModalExclusao
      aberto={!!vinculoWorkspaceParaRemover}
      titulo="Remover Vínculo do Workspace"
      descricao={
        <>Tem certeza de que deseja remover o workspace{' '}
          <strong>{vinculoWorkspaceParaRemover?.nome_workspace}</strong> desta assinatura?
        </>
      }
      nomeItem="O acesso a este serviço será cortado imediatamente para essa instância de trabalho e a linha será removida da auditoria."
      aoConfirmar={confirmarRemocaoVinculoWorkspace}
      aoCancelar={() => setVinculoWorkspaceParaRemover(null)}
    />

    <ModalEditarAssinatura
      assinatura={assinaturaEditando}
      workspaces={workspaces}
      aoFechar={() => setAssinaturaEditando(null)}
      aoSalvar={async () => {
        await recarregar()
        setAssinaturaEditando(null)
        addNotification({ type: 'success', message: 'Assinatura atualizada.' })
      }}
    />
    </>
  )
}
