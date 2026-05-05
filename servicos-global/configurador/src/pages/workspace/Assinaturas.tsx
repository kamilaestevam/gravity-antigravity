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
  PencilSimple, Trash, PauseCircle, PlayCircle, Package, WarningCircle, TreeStructure,
  FloppyDisk, ArrowCounterClockwise, Lightning, ArrowRight,
} from '@phosphor-icons/react'
import '../hub-store.css'
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
import { PRODUCT_META, RELACAO_ENTRE_PRODUTOS_GRAVITY } from '../../data/product-meta'
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
  // CANCELADA = "Inativa" (label DDD): cinza fraco, sinaliza inerte mas não-erro
  CANCELADA: { bg: 'rgba(100,116,139,0.10)', color: '#64748b', border: 'rgba(100,116,139,0.18)' },
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

// Regras de domínio (decisão dono 2026-05-04, atualizada 2026-05-05):
// - "Ativa"    = produto contratado e em uso (status_assinatura = ATIVA)
// - "Em Teste" = teste manual do produto antes do fechamento contratual
//                (status_assinatura = EM_TESTE) — atribuído manualmente,
//                não vem de onboarding automático.
// - "Suspensa" = admin suspendeu o produto no catálogo (cascata via toggleStatus)
// - "Cancelada" = usuário cancelou via lixeira (status_assinatura = CANCELADA)
//
// Stats cards contam SOMENTE ATIVA. EM_TESTE tem card próprio.
function statusEhAtiva(s: StatusAssinaturaProdutoGravity): boolean {
  return s === 'ATIVA'
}
function statusEhEmTeste(s: StatusAssinaturaProdutoGravity): boolean {
  return s === 'EM_TESTE'
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

  // ── Modo edição em lote dos workspaces da assinatura ───────────────────
  // Decisão dono 2026-05-05: cliques na sub-tabela (toggle play/pause)
  // não disparam HTTP imediatamente. Vão para esse rascunho; o usuário aplica
  // tudo via botão "Salvar alterações" no toolbar da expansão.
  // Decisão dono 2026-05-06: removida a trilha de "remover vínculo" — DELETE
  // do `produto_gravity_workspace` confundia (não removia o workspace, só o
  // vínculo). Padrão da plataforma é toggle ATIVA/INATIVA (ver Empresas e
  // Parceiros). Vínculos antigos ficam com `ativo = false`.
  type EdicaoWorkspacePendente = { tipo: 'toggle'; ativo: boolean }
  type EdicoesPorAssinatura = Record<string /* id_workspace */, EdicaoWorkspacePendente>
  type EdicoesGlobais = Record<string /* id_assinatura */, EdicoesPorAssinatura>

  const [edicoesPendentes, setEdicoesPendentes] = useState<EdicoesGlobais>({})
  const [salvandoEdicoes, setSalvandoEdicoes] = useState<Set<string>>(new Set())

  // Seleção por assinatura — alimenta o toolbar de ações em massa.
  // Map id_assinatura → Set<id_workspace>. Limpa após Salvar/Descartar.
  const [selecaoPorAssinatura, setSelecaoPorAssinatura] = useState<Record<string, string[]>>({})

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
        // Decisão dono 2026-05-05: assinaturas CANCELADA (label "Inativa") são
        // excluídas da view e tambem do set de slugs contratados — assim o
        // produto reaparece na seção "Disponíveis para contratar" e o usuario
        // pode re-assinar (POST /assinar-produto faz upsert que reativa).
        const slugsContratados = new Set<string>()
        if (assinaturasRes && assinaturasRes.ok) {
          const raw = await assinaturasRes.json()
          const parsed = listaAssinaturasProdutoGravitySchema.safeParse(raw)
          if (!parsed.success) {
            console.error('[Assinaturas] payload de /api/v1/organizacoes/me/assinaturas fora do contrato', parsed.error)
            addNotification({ type: 'error', message: 'Falha de contrato no payload de assinaturas.' })
          } else {
            const visiveis = parsed.data.assinaturas.filter(
              (a) => a.status_assinatura_produto_gravity !== 'CANCELADA',
            )
            setAssinaturas(visiveis)
            for (const a of visiveis) {
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
    statusEhAtiva(a.status_assinatura_produto_gravity),
  ).length
  const totalAssinaturasEmTeste = assinaturas.filter((a) =>
    statusEhEmTeste(a.status_assinatura_produto_gravity),
  ).length
  const totalAssinaturasSuspensas = assinaturas.filter(
    (a) => a.status_assinatura_produto_gravity === 'SUSPENSA',
  ).length

  // ── Handlers ────────────────────────────────────────────────────────────

  async function recarregar() {
    const headers = await getAuthHeaders()
    const res = await fetch('/api/v1/organizacoes/me/assinaturas', { headers }).catch(() => null)
    if (!res || !res.ok) return
    const parsed = listaAssinaturasProdutoGravitySchema.safeParse(await res.json())
    if (parsed.success) {
      // Filtra CANCELADA — não aparece na view (decisão dono 2026-05-05)
      setAssinaturas(
        parsed.data.assinaturas.filter(
          (a) => a.status_assinatura_produto_gravity !== 'CANCELADA',
        ),
      )
    }
  }

  async function aoSuspenderAssinatura(a: AssinaturaProdutoGravity) {
    // Suspender/Reativar usa PATCH (muda status sem cancelar).
    // Cancelamento (CANCELADA) é via lixeira → confirmarCancelamentoAssinatura.
    // Reativar só faz sentido para SUSPENSA (CANCELADA nunca chega na view;
    // filtrada da lista — decisão dono 2026-05-05).
    const reativando = a.status_assinatura_produto_gravity === 'SUSPENSA'
    const novoStatus: StatusAssinaturaProdutoGravity = reativando ? 'ATIVA' : 'SUSPENSA'
    const slug = a.produto.slug_produto_gravity
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status_assinatura_produto_gravity: novoStatus }),
      })
      if (!res.ok) throw new Error(reativando ? 'Falha ao reativar' : 'Falha ao suspender')
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

  // ── Handlers do modo edição em lote ───────────────────────────────────

  /** Stage: alterna o estado pendente "toggle" do workspace nesta assinatura.
   *  Se já tem um toggle pendente para esse workspace, REMOVE a pendência
   *  (volta ao estado servidor). Senão, ADICIONA toggle pendente. */
  function aoStagedToggleWorkspace(
    a: AssinaturaProdutoGravity,
    id_workspace: string,
    ativo_servidor: boolean,
  ) {
    const idA = a.id_assinatura_produto_gravity
    setEdicoesPendentes((prev) => {
      const cur = prev[idA] ?? {}
      const existente = cur[id_workspace]
      const next: EdicoesPorAssinatura = { ...cur }
      if (existente) {
        delete next[id_workspace]
      } else {
        next[id_workspace] = { tipo: 'toggle', ativo: !ativo_servidor }
      }
      const proximo = { ...prev }
      if (Object.keys(next).length === 0) delete proximo[idA]
      else proximo[idA] = next
      return proximo
    })
  }

  function descartarEdicoesWorkspaces(a: AssinaturaProdutoGravity) {
    setEdicoesPendentes((prev) => {
      const proximo = { ...prev }
      delete proximo[a.id_assinatura_produto_gravity]
      return proximo
    })
    setSelecaoPorAssinatura((prev) => {
      const proximo = { ...prev }
      delete proximo[a.id_assinatura_produto_gravity]
      return proximo
    })
  }

  /** Stage em lote: aplica a mesma ação a todos os IDs selecionados.
   *  Stage inteligente: se um workspace JÁ está no estado-alvo (no servidor),
   *  pula — evita pendência fantasma que não muda nada de fato. Garante que
   *  a contagem "X alterações pendentes" reflete só as mudanças reais. */
  function aoStagedAcaoEmMassa(
    a: AssinaturaProdutoGravity,
    ids_workspace: string[],
    acao: 'habilitar' | 'bloquear',
  ) {
    if (ids_workspace.length === 0) return
    const idA = a.id_assinatura_produto_gravity
    const ativo_alvo = acao === 'habilitar'
    setEdicoesPendentes((prev) => {
      const cur = prev[idA] ?? {}
      const next: EdicoesPorAssinatura = { ...cur }
      for (const id_workspace of ids_workspace) {
        const ativacao = a.ativacoes_produto_gravity.find((x) => x.id_workspace === id_workspace)
        const ativo_servidor = !!ativacao?.ativo_produto_gravity_workspace
        if (ativo_servidor === ativo_alvo) {
          // Já está no estado-alvo — limpa qualquer pendência prévia (não há nada a salvar)
          delete next[id_workspace]
          continue
        }
        next[id_workspace] = { tipo: 'toggle', ativo: ativo_alvo }
      }
      const proximo = { ...prev }
      if (Object.keys(next).length === 0) delete proximo[idA]
      else proximo[idA] = next
      return proximo
    })
  }

  async function salvarEdicoesWorkspaces(a: AssinaturaProdutoGravity) {
    const idA = a.id_assinatura_produto_gravity
    const pendentes = edicoesPendentes[idA] ?? {}
    if (Object.keys(pendentes).length === 0) return

    const slug = a.produto.slug_produto_gravity
    setSalvandoEdicoes((prev) => new Set(prev).add(idA))
    try {
      const headers = await getAuthHeaders()
      const promessas = Object.entries(pendentes).map(([id_workspace, edicao]) => {
        const url = `/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}/workspaces/${encodeURIComponent(id_workspace)}`
        return fetch(url, {
          method: 'PUT', headers,
          body: JSON.stringify({ ativo_produto_gravity_workspace: edicao.ativo }),
        })
      })
      const respostas = await Promise.all(promessas)
      const falharam = respostas.filter((r) => !r.ok).length
      if (falharam > 0) {
        addNotification({
          type: 'error',
          message: falharam === 1
            ? '1 alteração falhou ao salvar.'
            : `${falharam} alterações falharam ao salvar.`,
        })
        await recarregar()
      } else {
        addNotification({
          type: 'success',
          message: `Alterações salvas em "${a.produto.nome_produto_gravity}".`,
        })
        // Bug fix (2026-05-06): recarregar PRIMEIRO, descartar pendências
        // DEPOIS — evita flicker do badge HABILITADO/BLOQUEADO. Se descartar
        // antes, o render mostra o estado antigo do servidor por uns ms até
        // o reload completar (pendência local sobreescreve o estado do
        // servidor enquanto há pendência; sem pendência, mostra o estado do
        // servidor que ainda não foi recarregado).
        await recarregar()
        descartarEdicoesWorkspaces(a)
      }
    } catch {
      addNotification({ type: 'error', message: 'Erro ao salvar alterações.' })
    } finally {
      setSalvandoEdicoes((prev) => {
        const next = new Set(prev)
        next.delete(idA)
        return next
      })
    }
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
        /* Mesmo efeito do botao "Agendamento" em LogTestes — sinaliza estado
           ativo que pede atenção sem ser intrusivo. Usado no badge de
           "X alterações pendentes" e no botao "Salvar alterações". */
        @keyframes ws-pulse-active {
          0%   { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.6); }
          70%  { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
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
            subtexto={
              assinaturas.length > 0
                ? `${assinaturas.filter((a) => a.status_assinatura_produto_gravity !== 'CANCELADA').length} no total`
                : 'Sem produtos'
            }
            tooltip={
              <>
                <p className="cg-tooltip__title">STATUS DAS ASSINATURAS</p>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong>{totalAssinaturasAtivas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Em Teste</span>
                  <strong>{totalAssinaturasEmTeste}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong>{totalAssinaturasSuspensas}</strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo="Em Teste"
            icone={<Package weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{totalAssinaturasEmTeste}</span>}
            subtexto={totalAssinaturasEmTeste === 0 ? 'Nenhuma em trial' : 'No período de teste'}
            tooltip={
              <>
                <p className="cg-tooltip__title">PERÍODO DE TESTE</p>
                <div className="cg-tooltip__row">
                  <span>Em trial</span>
                  <strong>{totalAssinaturasEmTeste}</strong>
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
            renderExpandido={(a) => {
              const idA = a.id_assinatura_produto_gravity
              const pendentes = edicoesPendentes[idA] ?? {}
              const totalPendentes = Object.keys(pendentes).length
              const salvando = salvandoEdicoes.has(idA)
              const idsSelecionados = selecaoPorAssinatura[idA] ?? []
              const totalSelecionados = idsSelecionados.length

              // Calcula o estado EFETIVO de cada workspace (servidor + pending)
              const efetivoPorWorkspace = (id_workspace: string): { ativo_efetivo: boolean } => {
                const ativacao = a.ativacoes_produto_gravity.find((x) => x.id_workspace === id_workspace)
                const ativoServidor = !!ativacao?.ativo_produto_gravity_workspace
                const pend = pendentes[id_workspace]
                return { ativo_efetivo: pend ? pend.ativo : ativoServidor }
              }

              return (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{
                    padding: '1rem',
                    borderTop: '1px solid rgba(129,140,248,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      <TreeStructure size={14} /> Auditoria de Consumo por Workspace
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                      {/* Toolbar de ações em massa — só aparece se há seleção.
                          Info de seleção (contador + Selecionar todos / Limpar) foi
                          movida para o slot `bannerSelecaoCustom` da TabelaGlobal,
                          que renderiza entre busca e cabeçalho — fora deste toolbar. */}
                      {totalSelecionados > 0 && (
                        <>
                          <TooltipGlobal descricao="Habilitar acesso dos workspaces selecionados (rascunho — clique em Salvar)">
                            <BotaoGlobal
                              variante="secundario"
                              tamanho="pequeno"
                              icone={<PlayCircle size={14} weight="bold" />}
                              onClick={() => aoStagedAcaoEmMassa(a, idsSelecionados, 'habilitar')}
                              disabled={salvando}
                            >Habilitar</BotaoGlobal>
                          </TooltipGlobal>
                          <TooltipGlobal descricao="Bloquear acesso dos workspaces selecionados (rascunho — clique em Salvar)">
                            <BotaoGlobal
                              variante="secundario"
                              tamanho="pequeno"
                              icone={<PauseCircle size={14} weight="bold" />}
                              onClick={() => aoStagedAcaoEmMassa(a, idsSelecionados, 'bloquear')}
                              disabled={salvando}
                            >Bloquear</BotaoGlobal>
                          </TooltipGlobal>
                          {totalPendentes > 0 && (
                            <span style={{
                              width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)',
                            }} />
                          )}
                        </>
                      )}

                      {/* Toolbar Salvar/Descartar — só aparece se há pendentes */}
                      {totalPendentes > 0 && (
                        <>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24',
                            padding: '0.25rem 0.625rem', borderRadius: '9999px',
                            background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.25)',
                            animation: salvando ? 'none' : 'ws-pulse-active 2s infinite',
                          }}>{totalPendentes === 1 ? '1 alteração pendente' : `${totalPendentes} alterações pendentes`}</span>
                          <BotaoGlobal
                            variante="fantasma"
                            tamanho="pequeno"
                            onClick={() => descartarEdicoesWorkspaces(a)}
                            disabled={salvando}
                          >Descartar</BotaoGlobal>
                          <BotaoGlobal
                            variante="primario"
                            tamanho="pequeno"
                            onClick={() => void salvarEdicoesWorkspaces(a)}
                            disabled={salvando}
                            style={{ animation: salvando ? 'none' : 'ws-pulse-active 2s infinite' }}
                          >{salvando ? 'Salvando…' : 'Salvar alterações'}</BotaoGlobal>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{
                    border: '1px solid rgba(129,140,248,0.08)',
                    borderRadius: '12px', overflow: 'hidden',
                  }}>
                    <TabelaGlobal<Workspace>
                      id={`workspace-subscription-workspaces-${idA}`}
                      idKey="id_workspace"
                      ocultarBadgeSelecionados
                      dados={workspaces}
                      tooltipBusca="Filtrar workspaces habilitados nesta assinatura"
                      selecionadosExternos={idsSelecionados}
                      onSelecionadosChange={(ids) =>
                        setSelecaoPorAssinatura((prev) => ({ ...prev, [idA]: ids }))
                      }
                      bannerSelecaoCustom={totalSelecionados > 0 ? (
                        <>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 600, color: '#818cf8',
                            padding: '0.25rem 0.625rem', borderRadius: '9999px',
                            background: 'rgba(129,140,248,0.08)',
                            border: '1px solid rgba(129,140,248,0.25)',
                          }}>{totalSelecionados === 1 ? '1 selecionado' : `${totalSelecionados} selecionados`}</span>
                          {totalSelecionados < workspaces.length && (
                            <TooltipGlobal descricao="Estende a seleção para todos os workspaces da tabela">
                              <button
                                type="button"
                                onClick={() => setSelecaoPorAssinatura((prev) => ({
                                  ...prev,
                                  [idA]: workspaces.map((w) => w.id_workspace),
                                }))}
                                disabled={salvando}
                                style={{
                                  background: 'rgba(129,140,248,0.1)',
                                  border: '1px solid rgba(129,140,248,0.3)',
                                  color: '#818cf8',
                                  fontSize: '0.75rem', fontWeight: 700,
                                  padding: '0.3rem 0.75rem', borderRadius: '9999px',
                                  cursor: salvando ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit', transition: 'all 0.15s',
                                  opacity: salvando ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (salvando) return
                                  e.currentTarget.style.background = 'rgba(129,140,248,0.2)'
                                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(129,140,248,0.1)'
                                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'
                                }}
                              >Selecionar todos os {workspaces.length} da tabela</button>
                            </TooltipGlobal>
                          )}
                          {totalSelecionados === workspaces.length && workspaces.length > 0 && (
                            <TooltipGlobal descricao="Desmarca todos os workspaces selecionados">
                              <button
                                type="button"
                                onClick={() => setSelecaoPorAssinatura((prev) => ({ ...prev, [idA]: [] }))}
                                disabled={salvando}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid rgba(148,163,184,0.3)',
                                  color: '#94a3b8',
                                  fontSize: '0.75rem', fontWeight: 600,
                                  padding: '0.3rem 0.75rem', borderRadius: '9999px',
                                  cursor: salvando ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit', transition: 'all 0.15s',
                                  opacity: salvando ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (salvando) return
                                  e.currentTarget.style.background = 'rgba(148,163,184,0.1)'
                                  e.currentTarget.style.color = '#f1f5f9'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = '#94a3b8'
                                }}
                              >Limpar seleção</button>
                            </TooltipGlobal>
                          )}
                        </>
                      ) : null}
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
                                  fontWeight: 600,
                                  color: 'var(--ws-text)',
                                  textDecoration: 'none',
                                  transition: 'color 0.15s',
                                  cursor: 'pointer',
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
                          label: t('workspace.subscriptions.subtabela_status_produto_gravity'),
                          tipo: 'texto',
                          align: 'center',
                          render: (_v, ws) => {
                            const { ativo_efetivo } = efetivoPorWorkspace(ws.id_workspace)
                            return (
                              <span style={{
                                display: 'inline-flex',
                                padding: '0.15rem 0.5rem', borderRadius: '4px',
                                fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                                background: ativo_efetivo ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                                color: ativo_efetivo ? '#34d399' : 'var(--ws-muted)',
                                border: ativo_efetivo ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.1)',
                              }}>{ativo_efetivo ? 'HABILITADO' : 'BLOQUEADO'}</span>
                            )
                          },
                        },
                        {
                          key: 'id_workspace',
                          label: t('workspace.subscriptions.subtabela_acoes'),
                          tipo: 'texto',
                          align: 'right',
                          render: (_v, ws) => {
                            const { ativo_efetivo } = efetivoPorWorkspace(ws.id_workspace)
                            const ativacao = a.ativacoes_produto_gravity.find((x) => x.id_workspace === ws.id_workspace)
                            const ativo_servidor = !!ativacao?.ativo_produto_gravity_workspace
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <TooltipGlobal descricao={
                                  ativo_efetivo
                                    ? 'Bloquear acesso (rascunho — clique em Salvar)'
                                    : 'Habilitar acesso (rascunho — clique em Salvar)'
                                }>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      aoStagedToggleWorkspace(a, ws.id_workspace, ativo_servidor)
                                    }}
                                    disabled={salvando}
                                    style={{
                                      background: 'transparent', border: 'none', cursor: salvando ? 'not-allowed' : 'pointer',
                                      color: ativo_efetivo ? '#34d399' : 'var(--ws-muted)',
                                      opacity: salvando ? 0.4 : 1,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      width: 24, height: 24, borderRadius: '4px', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => { if (!salvando) e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                  >
                                    {ativo_efetivo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
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
              )
            }}
          />
        )}
      </div>

      {/* Catálogo de produtos disponíveis */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ marginBottom: '0.875rem' }}>
        {t('workspace.subscriptions.secao_disponiveis')}
      </p>
      <div className="gs-grid ws-fade-up ws-fade-up-d2">
        {catalogoProdutoGravity.map((p) => {
          const tipoCobranca = p.tipo_cobranca_produto_gravity as TipoCobrancaProdutoGravity | undefined
          const tipoCobrancaLabel = tipoCobranca
            ? t(`enum.tipo_cobranca_produto_gravity.${tipoCobranca}`, tipoCobranca.replace('POR_', ''))
            : ''
          const status = String(p.status_produto_gravity ?? '').toUpperCase()
          const isSoon = status === 'EM_BREVE'
          const slug = String(p.slug_produto_gravity ?? '')
          const meta = PRODUCT_META[slug]
          const relacionados = RELACAO_ENTRE_PRODUTOS_GRAVITY[slug] ?? []
          return (
            <div
              key={String(p.id_produto_gravity)}
              className={`gs-card gs-card--compact${isSoon ? ' gs-card--soon' : ' gs-card--available'}`}
            >
              <div className="gs-card__top">
                <div className="gs-card__icon" style={{ background: meta?.iconBg ?? 'rgba(99,102,241,0.15)' }}>
                  {meta?.icon ?? <Package weight="duotone" size={22} color="#818cf8" />}
                </div>
                <div className="gs-card__badges">
                  {isSoon ? (
                    <span className="gs-badge gs-badge--soon">
                      <Lightning weight="fill" size={11} /> Em Breve
                    </span>
                  ) : (
                    <span className="gs-badge gs-badge--available">
                      <span className="gs-badge__dot" /> Disponível
                    </span>
                  )}
                </div>
              </div>
              <div className="gs-card__body">
                <h3 className="gs-card__name">{meta?.nameKey ? t(meta.nameKey) : String(p.nome_produto_gravity)}</h3>
                {meta?.categoryKey && (
                  <span className="gs-card__category" style={{ color: meta.iconColor }}>
                    {t(meta.categoryKey)}
                  </span>
                )}
                <p className="gs-card__desc">{meta?.descKey ? t(meta.descKey) : String(p.descricao_produto_gravity ?? '')}</p>
                {meta?.tagKeys && (
                  <div className="gs-card__tags">
                    {meta.tagKeys.map(tk => (
                      <span key={tk} className={`gs-tag${isSoon ? ' gs-tag--muted' : ''}`}>{t(tk)}</span>
                    ))}
                  </div>
                )}
                {(() => {
                  if (isSoon) return null
                  const faixas = (Array.isArray(p.faixas_preco_produto_gravity) ? p.faixas_preco_produto_gravity : []) as FaixaPreco[]
                  const temFaixas = faixas.length > 0
                  const temUnitario = p.preco_unitario_produto_gravity != null && String(p.preco_unitario_produto_gravity).trim() !== ''
                  const temFranquia = !!p.qtd_usuarios_base_produto_gravity
                  if (!temFaixas && !temUnitario && !temFranquia) return null
                  return (
                    <div style={{ padding: '0.625rem', background: 'rgba(129,140,248,0.05)', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.12)', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#818cf8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tabela de Preços</p>
                        {tipoCobrancaLabel && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {tipoCobrancaLabel}
                          </span>
                        )}
                      </div>
                      {temFaixas ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {faixas.slice(0, 2).map((fx, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--sw-text-2)' }}>
                                {fx.faixa_ate_faixa_preco_produto_gravity
                                  ? `${fx.faixa_de_faixa_preco_produto_gravity}-${fx.faixa_ate_faixa_preco_produto_gravity}`
                                  : `Acima de ${fx.faixa_de_faixa_preco_produto_gravity}`}{' '}
                                {tipoCobrancaLabel}s
                              </span>
                              <strong style={{ color: 'var(--sw-text-1)' }}>
                                {getSimboloMoeda(fx.moeda_faixa_preco_produto_gravity)} {fx.preco_faixa_preco_produto_gravity}
                              </strong>
                            </div>
                          ))}
                          {faixas.length > 2 && (
                            <span style={{ fontSize: '0.625rem', color: 'var(--sw-text-3)', textAlign: 'center', marginTop: '4px' }}>
                              + {faixas.length - 2} faixas disponíveis
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: '6px' }}>
                          {temUnitario && (
                            <div style={{ flex: 1, padding: '5px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.6rem', color: 'var(--sw-text-3)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Valor Unitário</span>
                              <strong style={{ fontSize: '0.95rem', color: 'var(--sw-text-1)' }}>
                                {getSimboloMoeda(String(p.moeda_unitario_produto_gravity ?? 'BRL'))} {String(p.preco_unitario_produto_gravity)}
                              </strong>
                            </div>
                          )}
                          {temFranquia && (
                            <div style={{ flex: 1, padding: '5px 8px', background: 'rgba(52,211,153,0.07)', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.15)' }}>
                              <span style={{ fontSize: '0.6rem', color: '#34d399', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Franquia Free</span>
                              <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>{String(p.qtd_usuarios_base_produto_gravity)}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}
                {relacionados.length > 0 && (
                  <div className="gs-card__combina">
                    <span className="gs-card__combina-label">Combina com</span>
                    <div className="gs-card__combina-chips">
                      {relacionados.map(relSlug => {
                        const relMeta = PRODUCT_META[relSlug]
                        const relProduct = catalogoProdutoGravity.find(cp => cp.slug_produto_gravity === relSlug)
                        const nomeRelacionado = relMeta?.nameKey
                          ? t(relMeta.nameKey)
                          : String(relProduct?.nome_produto_gravity ?? relSlug)
                        if (!relMeta) return null
                        return (
                          <span
                            key={relSlug}
                            className="gs-combina-chip"
                            style={{ color: relMeta.iconColor }}
                          >
                            {nomeRelacionado}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="gs-card__footer">
                <span className="gs-card__users">
                  {isSoon
                    ? 'Aguarde liberação'
                    : (p.possui_setup_produto_gravity ? 'Requer Setup' : 'Ativação Instantânea')}
                </span>
                {isSoon ? (
                  <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
                    Aguarde
                  </BotaoGlobal>
                ) : (
                  <TooltipGlobal descricao="Iniciar processo de contratação e ativação do produto">
                    <BotaoGlobal
                      variante="primario"
                      tamanho="pequeno"
                      onClick={() => aoAssinarProduto(
                        String(p.slug_produto_gravity),
                        String(p.nome_produto_gravity),
                      )}
                    >
                      Assinar <ArrowRight weight="bold" size={13} />
                    </BotaoGlobal>
                  </TooltipGlobal>
                )}
              </div>
            </div>
          )
        })}
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

    {/* Modal "Remover Vínculo" foi removido em 2026-05-05: agora a remoção
        é via modo edição em lote (lixeira marca pendente, Salvar dispara). */}

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
