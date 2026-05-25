import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Receipt, Buildings, DownloadSimple, CalendarBlank, ChartLineUp,
  Plus, FilePdf, Paperclip, Trash, XCircle, PaperPlaneTilt, PencilSimple,
} from '@phosphor-icons/react'
import { ModalEditarFaturaProdutoGravity } from './modal-editar-fatura-produto-gravity'
import type { FaturaProdutoGravity } from '../../schemas/fatura-produto-gravity'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { ModalExclusao } from '../configurador/ModalConfirmarExclusao'
import { SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import { useHistoricoLogger } from '../../hooks/use-historico-logger'
import {
  adminBillingApi,
  adminOrganizacoesApi,
  setAuthTokenProvider,
  type GravityInvoiceApi,
  type GravityInvoiceStatus,
  type OrganizacaoApi,
} from '../../services/api-client'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { extractCatchError } from '../../utils/extract-api-error'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCents(cents: number, currency: string): string {
  const value = cents / 100
  const code = currency.toUpperCase()
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${code} ${value.toFixed(2).replace('.', ',')}`
  }
}

/** "1234,56" (display) → 123456 (cents) */
function displayToCents(display: string): number {
  if (!display) return 0
  const n = parseFloat(display.replace(/\./g, '').replace(',', '.'))
  if (isNaN(n)) return 0
  return Math.round(n * 100)
}

/** Máscara monetária durante digitação → "1.234,56" */
function maskMoeda(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const padded = digits.padStart(3, '0')
  const inteiro = padded.slice(0, -2).replace(/^0+/, '') || '0'
  const dec = padded.slice(-2)
  const inteiroFmt = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${inteiroFmt},${dec}`
}

function statusLabel(s: GravityInvoiceStatus): string {
  switch (s) {
    case 'RASCUNHO':   return 'RASCUNHO'
    case 'EMITIDA':    return 'EMITIDA'
    case 'ENVIADA':    return 'ENVIADA'
    case 'PAGA':       return 'PAGA'
    case 'EM_ATRASO':  return 'EM ATRASO'
    case 'ANULADA':    return 'ANULADA'
    case 'INCOBRAVEL': return 'INCOBRÁVEL'
    default: return s
  }
}

function statusColor(s: GravityInvoiceStatus): { cor: string; bg: string } {
  switch (s) {
    case 'PAGA':       return { cor: '#34d399', bg: 'rgba(52,211,153,0.12)' }
    case 'EMITIDA':    return { cor: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }
    case 'ENVIADA':    return { cor: '#34d399', bg: 'rgba(52,211,153,0.08)' }
    case 'RASCUNHO':   return { cor: '#818cf8', bg: 'rgba(129,140,248,0.12)' }
    case 'EM_ATRASO':
    case 'INCOBRAVEL': return { cor: '#f87171', bg: 'rgba(248,113,113,0.12)' }
    case 'ANULADA':    return { cor: '#64748b', bg: 'rgba(100,116,139,0.12)' }
    default: return { cor: '#64748b', bg: 'rgba(100,116,139,0.12)' }
  }
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function FinanceiroAdmin() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const addNotification = useShellStore(s => s.addNotification)
  const { logEvent } = useHistoricoLogger()

  const [invoices, setInvoices] = useState<GravityInvoiceApi[]>([])
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoApi[]>([])
  const [carregando, setCarregando] = useState(true)
  const [provider, setProvider] = useState<string>('—')

  // Paginação cursor-based
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const LIMIT = 50

  const carregarDados = useCallback(async (cursor?: string) => {
    setAuthTokenProvider(() => getToken())
    setCarregando(true)
    try {
      const [invResp, organizacoesResp] = await Promise.all([
        adminBillingApi.listInvoices({ cursor, limit: LIMIT }),
        adminOrganizacoesApi.list({ limit: 200 }),
      ])
      setInvoices(invResp.invoices)
      setProvider(invResp.provider)
      setNextCursor(invResp.pagination.next_cursor)
      setHasMore(invResp.pagination.has_more)
      setOrganizacoes(organizacoesResp.organizacoes)
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, t('admin.financeiro-admin.msg_erro_carregar')) })
    } finally {
      setCarregando(false)
    }
  }, [getToken, addNotification, t])

  useEffect(() => {
    // Quando filtros mudam, reseta paginação e recarrega da primeira página
    setCursorStack([])
    carregarDados()
  }, [carregarDados])

  const proximaPagina = () => {
    if (!nextCursor) return
    setCursorStack(prev => [...prev, nextCursor])
    carregarDados(nextCursor)
  }

  const paginaAnterior = () => {
    if (cursorStack.length === 0) return
    const novoStack = cursorStack.slice(0, -1)
    setCursorStack(novoStack)
    const prevCursor = novoStack[novoStack.length - 1]
    carregarDados(prevCursor)
  }

  // ─── Derivadas (memoizadas) ──────────────────────────────────────────────

  const abertas = useMemo(
    () => invoices.filter(i => i.status === 'EMITIDA' || i.status === 'ENVIADA' || i.status === 'EM_ATRASO'),
    [invoices],
  )
  const inadimplentes = useMemo(
    () => invoices.filter(i => i.status === 'EM_ATRASO' || i.status === 'INCOBRAVEL'),
    [invoices],
  )
  const totalAberto = useMemo(
    () => abertas.reduce((acc, i) => acc + i.amount_due_cents, 0),
    [abertas],
  )
  const totalInadimplencia = useMemo(
    () => inadimplentes.reduce((acc, i) => acc + i.amount_due_cents, 0),
    [inadimplentes],
  )
  const performancePct = useMemo(() => {
    const pagas = invoices.filter(i => i.status === 'PAGA').length
    return invoices.length > 0 ? Math.round((pagas / invoices.length) * 100) : 0
  }, [invoices])

  // Moeda dominante — pra exibir nos cards (assumindo majoritariamente BRL)
  const currencyForCards = useMemo(
    () => invoices[0]?.currency ?? 'brl',
    [invoices],
  )

  // ─── Estado do modal "Lançar Fatura" ─────────────────────────────────────

  const [modalAberto, setModalAberto] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [formTenantId, setFormTenantId] = useState<string | null>(null)
  const [formDescricao, setFormDescricao] = useState('')
  const [formCompetencia, setFormCompetencia] = useState('') // 'YYYY-MM'
  const [formVencimento, setFormVencimento] = useState('')   // 'YYYY-MM-DD'
  const [formEmail, setFormEmail] = useState('')             // email da org (cobrança)
  const [formValor, setFormValor] = useState('')             // mascarado
  const [formQuantidade, setFormQuantidade] = useState('1')
  const [formAutoFinalize, setFormAutoFinalize] = useState<'sim' | 'nao'>('sim')
  const [salvando, setSalvando] = useState(false)

  const [invoiceParaAnular, setInvoiceParaAnular] = useState<GravityInvoiceApi | null>(null)
  const [invoiceParaEnviar, setInvoiceParaEnviar] = useState<GravityInvoiceApi | null>(null)
  const [faturaParaEditar, setFaturaParaEditar] = useState<FaturaProdutoGravity | null>(null)

  const resetForm = () => {
    setFormDirty(false)
    setFormTenantId(null)
    setFormDescricao('')
    setFormCompetencia('')
    setFormVencimento('')
    setFormEmail('')
    setFormValor('')
    setFormQuantidade('1')
    setFormAutoFinalize('sim')
  }

  const abrirModal = () => {
    resetForm()
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    resetForm()
  }

  const handleSalvar = async () => {
    if (!formTenantId || !formDescricao.trim() || !formValor) {
      addNotification({ type: 'error', message: t('admin.financeiro-admin.modal_validacao') ?? 'Preencha cliente, descrição e valor' })
      return
    }

    setSalvando(true)
    try {
      const amountCents = displayToCents(formValor)
      const quantity = Math.max(1, Number(formQuantidade) || 1)

      const dueDate = formVencimento
        ? new Date(`${formVencimento}T23:59:59`).toISOString()
        : undefined

      const { invoice } = await adminBillingApi.createInvoice({
        customer_tenant_id: formTenantId,
        description: formDescricao,
        line_items: [{
          description: formDescricao,
          amount_cents: amountCents,
          quantity,
        }],
        due_date: dueDate,
        competencia: formCompetencia || undefined,
        customer_email: formEmail || undefined,
        currency: 'brl',
        auto_finalize: formAutoFinalize === 'sim',
      })

      fecharModal()
      addNotification({
        type: 'success',
        message: t('admin.financeiro-admin.msg_fatura_criada', { num: invoice.number ?? invoice.id }) ?? `Fatura ${invoice.number ?? invoice.id} criada`,
      })

      logEvent({
        acao_historico_log: 'CRIAÇÃO',
        modulo_historico_log: 'financeiro',
        tipo_recurso_historico_log: 'Fatura',
        id_recurso_historico_log: invoice.id,
        detalhe_acao_historico_log: `Fatura criada para ${invoice.customer.name} — ${formatCents(amountCents * quantity, 'brl')}`,
      })

      carregarDados()
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, t('admin.financeiro-admin.modal_falha_salvar')) })
    } finally {
      setSalvando(false)
    }
  }

  const handleAnular = async () => {
    if (!invoiceParaAnular) return
    const id = invoiceParaAnular.id
    const nome = invoiceParaAnular.number ?? id
    try {
      await adminBillingApi.voidInvoice(id)
      setInvoiceParaAnular(null)
      addNotification({
        type: 'success',
        message: t('admin.financeiro-admin.msg_fatura_anulada', { num: nome }) ?? `Fatura ${nome} anulada`,
      })
      logEvent({
        acao_historico_log: 'EXCLUSÃO',
        modulo_historico_log: 'financeiro',
        tipo_recurso_historico_log: 'Fatura',
        id_recurso_historico_log: id,
        detalhe_acao_historico_log: `Fatura ${nome} anulada`,
      })
      carregarDados()
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, t('admin.financeiro-admin.msg_erro_anular')) })
    }
  }

  const confirmarEnvio = async () => {
    if (!invoiceParaEnviar) return
    const inv = invoiceParaEnviar
    setInvoiceParaEnviar(null)
    try {
      await adminBillingApi.sendInvoice(inv.id)
      addNotification({
        type: 'success',
        message: t('admin.financeiro-admin.msg_enviada') ?? `Fatura enviada para ${inv.customer.email ?? inv.customer.name}`,
      })
      logEvent({
        acao_historico_log: 'ALTERAÇÃO',
        modulo_historico_log: 'financeiro',
        tipo_recurso_historico_log: 'Fatura',
        id_recurso_historico_log: inv.id,
        detalhe_acao_historico_log: `Fatura ${inv.number ?? inv.id} reenviada ao cliente`,
      })
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Falha ao enviar fatura') })
    }
  }

  // ─── Colunas memoizadas ──────────────────────────────────────────────────

  const COLUNAS = useMemo<TabelaGlobalColuna<GravityInvoiceApi>[]>(() => [
    {
      key: 'number',
      label: t('admin.financeiro-admin.tabela.numero') ?? '#',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Invoice Number',
      tooltipDescricao: 'Número legível da fatura gerado pelo provider (Conta Azul, banco, etc.)',
      render: (v, item) => (
        <code style={{
          fontSize: '0.8125rem', color: '#818cf8', background: 'rgba(129,140,248,0.08)',
          padding: '0.125rem 0.4rem', borderRadius: '4px',
        }}>
          {(v as string | null) ?? item.id.slice(-8)}
        </code>
      ),
    },
    {
      key: 'customer',
      label: t('admin.financeiro-admin.tabela.cliente') ?? 'Cliente',
      tipo: 'texto',
      tooltipTitulo: 'Tenant / Customer',
      tooltipDescricao: 'Tenant do Gravity dono da fatura.',
      render: (_, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600 }}>{item.customer.name}</span>
          {item.customer.email && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>{item.customer.email}</span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descrição',
      tipo: 'texto',
      tooltipTitulo: 'Descrição da Fatura',
      tooltipDescricao: 'Texto agregado das linhas da fatura.',
      render: (v) => <span style={{ color: 'var(--ws-text)' }}>{v as string}</span>,
    },
    {
      key: 'competencia',
      label: t('admin.financeiro-admin.tabela.competencia') ?? 'Competência',
      tipo: 'texto',
      tooltipTitulo: 'Competência',
      tooltipDescricao: "Mês/ano de referência da cobrança (YYYY-MM).",
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{(v as string | null) ?? '—'}</span>,
    },
    {
      key: 'amount_due_cents',
      label: t('admin.financeiro-admin.tabela.valor') ?? 'Valor',
      tipo: 'texto',
      align: 'right',
      tooltipTitulo: 'Valor Devido',
      tooltipDescricao: 'Total da fatura na moeda do provider.',
      render: (_, item) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>
          {formatCents(item.amount_due_cents, item.currency)}
        </span>
      ),
    },
    {
      key: 'due_date',
      label: t('admin.financeiro-admin.tabela.vencimento') ?? 'Vencimento',
      tipo: 'texto',
      tooltipTitulo: 'Due Date',
      tooltipDescricao: 'Data limite para pagamento.',
      render: (_, item) => {
        if (!item.due_date) return <span style={{ color: 'var(--ws-muted)' }}>—</span>
        const d = new Date(item.due_date)
        const overdue = item.status === 'EM_ATRASO'
        return (
          <span style={{ color: overdue ? '#f87171' : 'var(--ws-muted)' }}>
            {d.toLocaleDateString('pt-BR')}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: t('admin.financeiro-admin.tabela.status') ?? 'Status',
      tipo: 'texto',
      tooltipTitulo: 'Status de Pagamento',
      tooltipDescricao: 'Lifecycle event devolvido pelo provider.',
      render: (v) => {
        const st = v as GravityInvoiceStatus
        const { cor, bg } = statusColor(st)
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.04em', background: bg, color: cor, border: `1px solid ${bg}`,
          }}>
            {statusLabel(st)}
          </span>
        )
      },
    },
    {
      key: 'documents',
      label: 'Docs',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Documentos Disponíveis',
      tooltipDescricao: 'PDF da fatura, NF-e (quando emitida), boleto (quando aplicável).',
      render: (_, item) => {
        if (item.documents.length === 0) {
          return <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.15)', fontWeight: 700 }}>—</span>
        }
        return (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {item.documents.map((d, idx) => (
              <a
                key={idx}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                title={d.name}
                onClick={e => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {d.type === 'pdf' && <FilePdf size={16} weight="fill" color="#818cf8" />}
                {d.type === 'nfe' && <Receipt size={16} weight="fill" color="#34d399" />}
                {d.type === 'boleto' && <FilePdf size={16} weight="fill" color="#fbbf24" />}
                {(d.type === 'receipt' || d.type === 'other') && <Paperclip size={16} weight="fill" color="#64748b" />}
              </a>
            ))}
          </div>
        )
      },
    },
  ], [t])

  // Ações são função (não useMemo) para evitar stale closures com handlers
  const ACOES: TabelaGlobalAcao<GravityInvoiceApi>[] = [
    {
      id: 'pdf',
      icone: <DownloadSimple size={15} weight="bold" />,
      tooltip: 'Baixar PDF',
      onClick: (item) => {
        const pdf = item.documents.find(d => d.type === 'pdf')
        if (pdf) window.open(pdf.url, '_blank', 'noopener,noreferrer')
        else addNotification({ type: 'warning', message: 'Esta fatura não tem PDF disponível' })
      },
    },
    {
      id: 'editar',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar fatura / Gerenciar anexos',
      onClick: (item) => {
        // Mapeia GravityInvoiceApi (camada billing) para FaturaProdutoGravity (DDD-PT do modal)
        const fatura: FaturaProdutoGravity = {
          id_fatura_produto_gravity:                item.id,
          numero_fatura_produto_gravity:            item.number,
          status_fatura_produto_gravity:            item.status as FaturaProdutoGravity['status_fatura_produto_gravity'],
          id_organizacao:                           item.customer.tenant_id ?? item.customer.id,
          nome_organizacao_fatura_produto_gravity:  item.customer.name,
          email_organizacao_fatura_produto_gravity: item.customer.email,
          valor_total_fatura_produto_gravity:       item.amount_due_cents / 100,
          valor_pago_fatura_produto_gravity:        item.amount_paid_cents / 100,
          moeda_fatura_produto_gravity:             item.currency,
          data_vencimento_fatura_produto_gravity:   item.due_date,
          competencia_fatura_produto_gravity:       item.competencia,
          descricao_fatura_produto_gravity:         item.description,
          url_externa_fatura_produto_gravity:       item.hosted_url,
          data_criacao_fatura_produto_gravity:      item.created_at,
          documentos_fatura_produto_gravity:        [],
          provider_fatura_produto_gravity:          item.provider,
        }
        setFaturaParaEditar(fatura)
      },
      renderCustom: (item) => (
        <button
          type="button"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            const fatura: FaturaProdutoGravity = {
              id_fatura_produto_gravity:                item.id,
              numero_fatura_produto_gravity:            item.number,
              status_fatura_produto_gravity:            item.status as FaturaProdutoGravity['status_fatura_produto_gravity'],
              id_organizacao:                           item.customer.tenant_id ?? item.customer.id,
              nome_organizacao_fatura_produto_gravity:  item.customer.name,
              email_organizacao_fatura_produto_gravity: item.customer.email,
              valor_total_fatura_produto_gravity:       item.amount_due_cents / 100,
              valor_pago_fatura_produto_gravity:        item.amount_paid_cents / 100,
              moeda_fatura_produto_gravity:             item.currency,
              data_vencimento_fatura_produto_gravity:   item.due_date,
              competencia_fatura_produto_gravity:       item.competencia,
              descricao_fatura_produto_gravity:         item.description,
              url_externa_fatura_produto_gravity:       item.hosted_url,
              data_criacao_fatura_produto_gravity:      item.created_at,
              documentos_fatura_produto_gravity:        [],
              provider_fatura_produto_gravity:          item.provider,
            }
            setFaturaParaEditar(fatura)
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%', background: 'transparent',
            border: '1px solid transparent', color: '#64748b', cursor: 'pointer',
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={ev => {
            ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'
            ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'
            ev.currentTarget.style.color = '#818cf8'
          }}
          onMouseLeave={ev => {
            ev.currentTarget.style.background = 'transparent'
            ev.currentTarget.style.borderColor = 'transparent'
            ev.currentTarget.style.color = '#64748b'
          }}
        >
          <PencilSimple size={15} weight="bold" />
        </button>
      ),
    },
    // Ação "Enviar ao cliente" — só funcional com providers externos (Conta Azul, etc.).
    // Provider 'gravity' é local: não há integração de email implementada.
    // Renderizada como botão desabilitado com tooltip explicativo enquanto o provider
    // externo não for plugado (BILLING_PROVIDER env var).
    {
      id: 'send',
      icone: <PaperPlaneTilt size={15} weight="bold" />,
      tooltip: 'Enviar ao cliente',
      onClick: (item) => setInvoiceParaEnviar(item),
      renderCustom: (item) => {
        const habilitado = provider !== 'gravity'
        return (
          <TooltipGlobal descricao={habilitado ? 'Enviar ao cliente' : 'Indisponível neste provider — configure Conta Azul para habilitar envio'}>
            <button
              type="button"
              disabled={!habilitado}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                if (habilitado) setInvoiceParaEnviar(item)
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%', background: 'transparent',
                border: '1px solid transparent',
                color: habilitado ? '#64748b' : 'rgba(100,116,139,0.4)',
                cursor: habilitado ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s', flexShrink: 0,
              }}
              onMouseEnter={ev => {
                if (!habilitado) return
                ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'
                ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'
                ev.currentTarget.style.color = '#818cf8'
              }}
              onMouseLeave={ev => {
                ev.currentTarget.style.background = 'transparent'
                ev.currentTarget.style.borderColor = 'transparent'
                ev.currentTarget.style.color = habilitado ? '#64748b' : 'rgba(100,116,139,0.4)'
              }}
            >
              <PaperPlaneTilt size={15} weight="bold" />
            </button>
          </TooltipGlobal>
        )
      },
    },
    {
      id: 'void',
      icone: <XCircle size={15} weight="bold" />,
      tooltip: 'Anular fatura',
      onClick: (item) => setInvoiceParaAnular(item),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); setInvoiceParaAnular(item) }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%', background: 'transparent',
            border: '1px solid transparent', color: '#64748b', cursor: 'pointer',
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={ev => {
            ev.currentTarget.style.background = 'rgba(239,68,68,0.12)'
            ev.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            ev.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={ev => {
            ev.currentTarget.style.background = 'transparent'
            ev.currentTarget.style.borderColor = 'transparent'
            ev.currentTarget.style.color = '#64748b'
          }}
        >
          <Trash size={16} weight="bold" />
        </button>
      ),
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────

  useSincronizarTituloPaginaTopo(useMemo(() => ({
    subtitulo: `${t('admin.financeiro-admin.subtitulo')} · Provider: ${provider}`,
  }), [t, provider]))

  return (
    <>
      <PaginaGlobal
        className="ws-fade-up"
        layout="lista"
        stats={
          <>
            <CardBasicoGlobal
              titulo={t('admin.financeiro-admin.card_a_receber') ?? 'A Receber (Aberto)'}
              icone={<ChartLineUp weight="duotone" size={16} />}
              valor={formatCents(totalAberto, currencyForCards)}
              subtexto={`${abertas.length} fatura(s) pendente(s)`}
              variante="padrao"
              tooltip={
                <>
                  <div className="cg-tooltip__row"><span>Emitidas</span> <strong>{invoices.filter(i => i.status === 'EMITIDA').length}</strong></div>
                  <div className="cg-tooltip__row"><span>Enviadas</span> <strong>{invoices.filter(i => i.status === 'ENVIADA').length}</strong></div>
                  <div className="cg-tooltip__row"><span>Em Atraso</span> <strong style={{ color: '#f87171' }}>{invoices.filter(i => i.status === 'EM_ATRASO').length}</strong></div>
                  <div className="cg-tooltip__divider" />
                  <div className="cg-tooltip__row"><span>Total pendente</span> <strong>{abertas.length}</strong></div>
                </>
              }
            />
            <CardBasicoGlobal
              titulo={t('admin.financeiro-admin.card_risco') ?? 'Risco de Inadimplência'}
              valor={formatCents(totalInadimplencia, currencyForCards)}
              subtexto={`${inadimplentes.length} em atraso`}
              variante={inadimplentes.length > 0 ? 'perigo' : 'sucesso'}
              tooltip={
                <>
                  <div className="cg-tooltip__row"><span>Em Atraso</span> <strong style={{ color: '#f87171' }}>{invoices.filter(i => i.status === 'EM_ATRASO').length}</strong></div>
                  <div className="cg-tooltip__row"><span>Incobrável</span> <strong style={{ color: '#ef4444' }}>{invoices.filter(i => i.status === 'INCOBRAVEL').length}</strong></div>
                  <div className="cg-tooltip__divider" />
                  <div className="cg-tooltip__row"><span>Total em risco</span> <strong>{inadimplentes.length}</strong></div>
                </>
              }
            />
            <CardBasicoGlobal
              titulo={t('admin.financeiro-admin.card_performance') ?? 'Performance'}
              valor={`${performancePct}%`}
              subtexto={t('admin.financeiro-admin.card_performance_subtexto') ?? 'Taxa de recebimento'}
              variante="sucesso"
              tooltip={
                <>
                  <div className="cg-tooltip__row"><span>Pagas</span> <strong style={{ color: '#34d399' }}>{invoices.filter(i => i.status === 'PAGA').length}</strong></div>
                  <div className="cg-tooltip__row"><span>Total de faturas</span> <strong>{invoices.length}</strong></div>
                  <div className="cg-tooltip__divider" />
                  <div className="cg-tooltip__row"><span>Taxa de recebimento</span> <strong style={{ color: '#34d399' }}>{performancePct}%</strong></div>
                </>
              }
            />
          </>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <BotaoNovoAdminGlobal
            rotulo={t('admin.financeiro-admin.btn_lancar') ?? 'Lançar Fatura'}
            onClick={abrirModal}
          />
        </div>


        <div style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
          <TabelaGlobal<GravityInvoiceApi>
            id="admin-financeiro-invoices"
            idKey="id"
            dados={invoices}
            colunas={COLUNAS}
            acoes={ACOES}
            mensagemVazio={t('admin.financeiro-admin.vazio') ?? 'Sem faturas no período.'}
            tooltipBusca={t('admin.financeiro-admin.tooltip_busca') ?? 'Buscar por cliente, número ou descrição'}
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'financeiro_global', 'Relatório Financeiro Global')}
          />

          {(cursorStack.length > 0 || hasMore) && (
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center',
              marginTop: 16, padding: '0 8px', fontSize: '0.8125rem', color: 'var(--ws-muted)',
            }}>
              <button
                type="button"
                onClick={paginaAnterior}
                disabled={cursorStack.length === 0 || carregando}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                  color: 'var(--ws-text)',
                  cursor: cursorStack.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: cursorStack.length === 0 ? 0.4 : 1,
                }}
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={proximaPagina}
                disabled={!hasMore || carregando}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                  color: 'var(--ws-text)',
                  cursor: !hasMore ? 'not-allowed' : 'pointer',
                  opacity: !hasMore ? 0.4 : 1,
                }}
              >
                Próxima →
              </button>
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(129,140,248,0.06)',
          border: '1px solid rgba(129,140,248,0.15)',
          borderRadius: 10, padding: '1rem 1.25rem',
          fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.6,
        }}>
          💡 <strong style={{ color: 'var(--ws-text)' }}>
            {t('admin.financeiro-admin.info_gestao_manual') ?? 'Gestão Integrada'}
          </strong>
          {' — '}
          {t('admin.financeiro-admin.info_gestao_desc') ?? (
            'A origem desta lista é o provider configurado em BILLING_PROVIDER. PDF, status de pagamento e webhooks são gerenciados pelo provider. Veja docs/BILLING.md para ativar outros providers.'
          )}
        </div>

        {/* Modal Lançar Fatura ─────────────────────────────────────────── */}
        {(() => {
          const requisitosFatura: RequisitoSalvar[] = [
            { chave: 'organizacao', ok: !!formTenantId,                  mensagem: 'Selecionar a organização (cliente)' },
            { chave: 'descricao',   ok: formDescricao.trim().length > 0, mensagem: 'Descrição da fatura' },
            { chave: 'valor',       ok: !!formValor,                     mensagem: 'Valor (R$)' },
          ]
          return (
        <ModalFormularioAbasGlobal
          aberto={modalAberto}
          aoFechar={fecharModal}
          aoSalvar={handleSalvar}
          icone={<Receipt weight="duotone" size={24} />}
          titulo={t('admin.financeiro-admin.modal_novo_titulo') ?? 'Lançar Fatura'}
          subtitulo={t('admin.financeiro-admin.modal_subtitulo') ?? `Cria via provider: ${provider}`}
          tamanho="lg"
          dirty={formDirty}
          podesSalvar={formDirty && requisitosFatura.every(r => r.ok) && !salvando}
          abas={[
            {
              id: 'dados',
              rotulo: 'Dados',
              conteudo: (
                <BannerRequisitosContexto requisitos={requisitosFatura}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <SecaoFormulario titulo="Cliente" icone={<Buildings size={16} />} />

                  <CampoGeralGlobal label="Organização (Cliente)" obrigatorio>
                    <SelectGlobal
                      opcoes={organizacoes.map(o => ({ valor: o.id_organizacao, rotulo: `${o.nome_organizacao} (${o.subdominio_organizacao})` }))}
                      valor={formTenantId}
                      aoMudarValor={v => { setFormTenantId(v ? String(v) : null); setFormDirty(true) }}
                      iconeEsquerda={<Buildings size={16} />}
                      placeholder="Selecionar organização..."
                      buscavel
                    />
                  </CampoGeralGlobal>

                  <SecaoFormulario titulo="Fatura" icone={<CalendarBlank size={16} />} />

                  <CampoGeralGlobal label="Descrição" obrigatorio>
                    <input
                      type="text"
                      className="ws-input"
                      value={formDescricao}
                      onChange={e => { setFormDescricao(e.target.value); setFormDirty(true) }}
                      placeholder="Ex: Assinatura mensal Gravity Pro — Abril/2026"
                      maxLength={500}
                    />
                  </CampoGeralGlobal>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <CampoGeralGlobal label="Competência" tooltipDescricao="Período de faturamento (mês/ano)">
                      <CampoCalendarioGlobal
                        valor={{
                          inicio: formCompetencia ? new Date(`${formCompetencia}-01T00:00:00`) : null,
                          fim:    formCompetencia ? new Date(`${formCompetencia}-01T00:00:00`) : null,
                        }}
                        aoMudarValor={(v) => {
                          const d = v.inicio
                          if (!d) { setFormCompetencia(''); setFormDirty(true); return }
                          const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                          setFormCompetencia(ym)
                          setFormDirty(true)
                        }}
                        placeholder="aaaa-mm"
                      />
                    </CampoGeralGlobal>

                    <CampoGeralGlobal label="Vencimento">
                      <CampoCalendarioGlobal
                        valor={{
                          inicio: formVencimento ? new Date(`${formVencimento}T00:00:00`) : null,
                          fim:    formVencimento ? new Date(`${formVencimento}T00:00:00`) : null,
                        }}
                        aoMudarValor={(v) => {
                          const d = v.inicio
                          if (!d) { setFormVencimento(''); setFormDirty(true); return }
                          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                          setFormVencimento(iso)
                          setFormDirty(true)
                        }}
                        placeholder="dd/mm/aaaa"
                      />
                    </CampoGeralGlobal>

                    <CampoGeralGlobal label="Valor (R$)" obrigatorio>
                      <div className="ws-input-icon-wrap">
                        <span>R$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formValor}
                          onChange={e => { setFormValor(maskMoeda(e.target.value)); setFormDirty(true) }}
                          placeholder="0,00"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </CampoGeralGlobal>
                  </div>

                  <CampoGeralGlobal label="E-mail da Organização (cobrança)" tooltipDescricao="Email para envio da cobrança ao cliente. Opcional.">
                    <input
                      type="email"
                      className="ws-input"
                      value={formEmail}
                      onChange={e => { setFormEmail(e.target.value); setFormDirty(true) }}
                      placeholder="contato@exemplo.com"
                    />
                  </CampoGeralGlobal>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <CampoGeralGlobal label="Quantidade">
                      <input
                        type="number"
                        min={1}
                        className="ws-input"
                        value={formQuantidade}
                        onChange={e => { setFormQuantidade(e.target.value); setFormDirty(true) }}
                      />
                    </CampoGeralGlobal>

                    <CampoGeralGlobal label="Enviar ao criar">
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                        {(['sim', 'nao'] as const).map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => { setFormAutoFinalize(val); setFormDirty(true) }}
                            style={{
                              padding: '0.375rem 1rem', borderRadius: '9999px',
                              cursor: 'pointer', fontSize: '0.8125rem',
                              fontWeight: formAutoFinalize === val ? 600 : 400,
                              border: `1px solid ${formAutoFinalize === val ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)'}`,
                              background: formAutoFinalize === val ? 'rgba(16,185,129,0.15)' : 'transparent',
                              color: formAutoFinalize === val ? 'var(--color-primary)' : 'var(--ws-muted)',
                            }}
                          >
                            {val === 'sim' ? 'Finalizar e enviar' : 'Salvar como rascunho'}
                          </button>
                        ))}
                      </div>
                    </CampoGeralGlobal>
                  </div>

                  <BannerRequisitosGlobal />
                </div>
                </BannerRequisitosContexto>
              ),
            },
          ]}
        />
          )
        })()}

        {/* Modal Anular Fatura ─────────────────────────────────────────── */}
        <ModalExclusao
          aberto={!!invoiceParaAnular}
          titulo={t('admin.financeiro-admin.excluir_titulo') ?? 'Anular Fatura'}
          descricao={
            <>
              Você está prestes a anular a fatura{' '}
              <strong>{invoiceParaAnular?.number ?? invoiceParaAnular?.id}</strong> do cliente{' '}
              <strong>{invoiceParaAnular?.customer.name}</strong>.
              <br /><br />
              Esta ação é irreversível no provider — a fatura ficará com status VOID e não poderá ser cobrada.
            </>
          }
          nomeItem={`${invoiceParaAnular?.number ?? invoiceParaAnular?.id} — ${invoiceParaAnular?.customer.name}`}
          aoConfirmar={handleAnular}
          aoCancelar={() => setInvoiceParaAnular(null)}
        />

        <ModalExclusao
          aberto={!!invoiceParaEnviar}
          titulo="Enviar Fatura ao Cliente"
          descricao={
            <>
              Você está prestes a enviar a fatura{' '}
              <strong>{invoiceParaEnviar?.number ?? invoiceParaEnviar?.id}</strong> para{' '}
              <strong>{invoiceParaEnviar?.customer.email ?? invoiceParaEnviar?.customer.name}</strong>.
              <br /><br />
              O cliente receberá um e-mail de cobrança imediatamente. Confirme se o destinatário e o valor estão corretos antes de prosseguir.
            </>
          }
          nomeItem={`${invoiceParaEnviar?.number ?? invoiceParaEnviar?.id} — ${invoiceParaEnviar?.customer.email ?? invoiceParaEnviar?.customer.name ?? ''}`}
          aoConfirmar={confirmarEnvio}
          aoCancelar={() => setInvoiceParaEnviar(null)}
        />

        <ModalEditarFaturaProdutoGravity
          fatura={faturaParaEditar}
          aoFechar={() => setFaturaParaEditar(null)}
          aoSalvarDados={() => { void carregarDados(cursorStack[cursorStack.length - 1]) }}
        />
      </PaginaGlobal>
    </>
  )
}
