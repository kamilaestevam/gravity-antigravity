/**
 * ListaPedidos.tsx — Tela principal do produto Pedido
 *
 * Tabela virtualizada com TabelaVirtualGlobal (TanStack Virtual v3).
 * Suporta até 1 milhão de linhas via cursor keyset pagination.
 *
 * Hierarquia: Pedido (pai) → PedidoItem (filho expandível)
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  Eye,
  PencilSimple,
  Trash,
  Copy,
  CurrencyDollar,
  Scales,
  Cube,
  Warning,
  CheckCircle,
  Coins,
  ArrowRight,
  Gauge,
  Money,
  DownloadSimple,
  ArrowsClockwise,
  X,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import { useCardPreferences } from '../shared/useCardPreferences'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON } from '../shared/exportUtils'
import type { ColunasExport } from '../shared/exportUtils'
import {
  pedidoVirtualApi,
  pedidoConfigApi,
  pedidoLoteApi,
} from '../shared/api'
import type {
  Pedido,
  PedidoItem,
  PedidoStatusConfig,
  PedidoPreferenciasColunas,
} from '../shared/types'
import {
  STATUS_PEDIDO_LABELS,
  fmtQuantidade,
  fmtMoeda,
  fmtData,
} from '../shared/types'
import './ListaPedidos.css'

// ── Status padrão (fallback sem API) ─────────────────────────────────────────

const ABAS_PADRAO: GTAbaTipo[] = [
  { valor: 'todos',        label: 'Todos'           },
  { valor: 'aberto',       label: 'Aberto'          },
  { valor: 'transferencia',label: 'Em Transferência'},
  { valor: 'consolidado',  label: 'Consolidado'     },
  { valor: 'cancelado',    label: 'Cancelado'       },
]

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

const COLUNAS_PAI: GTColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: 'Pedido',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    naoOcultavel: true,
    tooltipTitulo: 'Número do Pedido',
    tooltipDescricao: 'Identificador único do documento comercial (PO/SO)',
    largura: 140,
  },
  {
    key: 'tipo_operacao',
    label: 'Tipo',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Tipo de Operação',
    tooltipDescricao: 'Importação (Purchase Order) ou Exportação (Sales Order)',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
        genero="feminino"
      />
    ),
  },
  {
    key: 'exportador_nome',
    label: 'Exportador',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Exportador / Fornecedor',
    tooltipDescricao: 'Fornecedor estrangeiro (na importação) ou entidade exportadora',
    largura: 180,
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_nome ?? '—'}</span>,
  },
  {
    key: 'fabricante_nome',
    label: 'Fabricante',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Fabricante',
    tooltipDescricao: 'Identificação da origem produtiva',
    largura: 160,
    render: (_val: unknown, row: Pedido) => <span>{row.fabricante_nome ?? '—'}</span>,
  },
  {
    key: 'referencia_importador',
    label: 'Ref. Importador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referência do Importador',
    tooltipDescricao: 'Código de referência interna do importador para o pedido',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_importador ?? '—'}</span>,
  },
  {
    key: 'referencia_exportador',
    label: 'Ref. Exportador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referência do Exportador',
    tooltipDescricao: 'Código de referência utilizado pelo exportador',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_exportador ?? '—'}</span>,
  },
  {
    key: 'numero_proforma',
    label: 'Proforma',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Número Proforma',
    tooltipDescricao: 'Referência da Proforma Invoice vinculada',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.numero_proforma ?? '—'}</span>,
  },
  {
    key: 'numero_invoice',
    label: 'Invoice',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Número Invoice',
    tooltipDescricao: 'Identificador da Commercial Invoice (Fatura)',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.numero_invoice ?? '—'}</span>,
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Incoterm',
    tooltipDescricao: 'Regra de entrega: FOB, CIF, EXW, etc.',
    largura: 90,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.incoterm ?? '—'}</span>,
  },
  {
    key: 'valor_total_pedido',
    label: 'Valor Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Valor Total do Pedido',
    tooltipDescricao: 'Valor FOB total na moeda do pedido',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_total_pedido != null
          ? fmtMoeda(row.valor_total_pedido, row.moeda_pedido)
          : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_total_pedido',
    label: 'Qtd Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Total',
    tooltipDescricao: 'Quantidade total contratada no pedido',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.quantidade_total_pedido != null
          ? `${fmtQuantidade(row.quantidade_total_pedido, row.casas_decimais_quantidade_total_pedido)} ${row.unidade_comercializada_pedido ?? ''}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'data_emissao_pedido',
    label: 'Data P.O',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data do Pedido',
    tooltipDescricao: 'Data de registro ou emissão da Purchase Order',
    largura: 100,
    render: (_val: unknown, row: Pedido) => <span>{fmtData(row.data_emissao_pedido)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Status do Pedido',
    tooltipDescricao: 'Ciclo de vida: Draft, Aberto, Em Transferência, Consolidado, Cancelado',
    oculta: true,
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={STATUS_PEDIDO_LABELS[row.status] ?? row.status}
        genero="masculino"
      />
    ),
  },
]

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

const COLUNAS_FILHO: GTColuna<PedidoItem>[] = [
  {
    key: 'part_number',
    label: 'Part Number',
    tipo: 'texto',
    naoOcultavel: true,
    largura: 130,
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.part_number}</span>,
  },
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    largura: 100,
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.ncm}</span>,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    tipo: 'texto',
    largura: 220,
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao}</span>,
  },
  {
    key: 'quantidade_inicial',
    label: 'Qtd Inicial',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Quantidade Inicial',
    tooltipDescricao: 'Quantidade original do item — valor imutável',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_inicial, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_atual',
    label: 'Saldo Atual',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Saldo Atual',
    tooltipDescricao: 'Saldo vivo disponível para alocação em processos logísticos',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.8125rem',
        fontWeight: row.quantidade_atual === 0 ? 400 : 600,
        color: row.quantidade_atual === 0 ? 'var(--text-muted)' : 'var(--color-success, #34d399)',
      }}>
        {fmtQuantidade(row.quantidade_atual, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_pronta',
    label: 'Qtd Pronta',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Quantidade Pronta',
    tooltipDescricao: 'Montante produzido pela fábrica e validado para embarque',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_pronta, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida',
    label: 'Qtd Transferida',
    tipo: 'numero',
    align: 'right',
    largura: 130,
    tooltipTitulo: 'Quantidade Transferida',
    tooltipDescricao: 'Total já alocado em processos logísticos (embarques)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_transferida, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'unidade_comercializada_item',
    label: 'UoM',
    tipo: 'texto',
    align: 'center',
    largura: 80,
    tooltipTitulo: 'Unidade de Medida',
    tooltipDescricao: 'Unidade de medida do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.unidade_comercializada_item ?? '—'}</span>,
  },
  {
    key: 'valor_unitario',
    label: 'Vlr Unitário',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Valor Unitário',
    tooltipDescricao: 'Valor unitário na moeda do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_unitario != null ? fmtMoeda(row.valor_unitario, row.moeda_item) : '—'}
      </span>
    ),
  },
]

// ── Colunas para exportação ───────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Pedido',          key: 'numero_pedido',               largura: 18 },
  { header: 'Tipo',            key: 'tipo_operacao',               largura: 14 },
  { header: 'Exportador',      key: 'exportador_nome',             largura: 25 },
  { header: 'Fabricante',      key: 'fabricante_nome',             largura: 22 },
  { header: 'Ref. Importador', key: 'referencia_importador',       largura: 20 },
  { header: 'Ref. Exportador', key: 'referencia_exportador',       largura: 20 },
  { header: 'Proforma',        key: 'numero_proforma',             largura: 16 },
  { header: 'Invoice',         key: 'numero_invoice',              largura: 16 },
  { header: 'Incoterm',        key: 'incoterm',                    largura: 12 },
  { header: 'Valor Total',     key: 'valor_total_pedido',          largura: 18 },
  { header: 'Moeda',           key: 'moeda_pedido',                largura: 10 },
  { header: 'Qtd Total',       key: 'quantidade_total_pedido',     largura: 14 },
  { header: 'Data P.O',        key: 'data_emissao_pedido',         largura: 14 },
  { header: 'Status',          key: 'status',                      largura: 16 },
]

// ── Ações de linha (pai) ──────────────────────────────────────────────────────

const ACOES_PAI: GTAcao<Pedido>[] = [
  {
    id: 'ver',
    tooltip: 'Ver detalhes do pedido',
    icone: <Eye size={15} weight="duotone" />,
    onClick: (row: Pedido) => { console.info('[Pedido] Ver:', row.id) },
  },
  {
    id: 'editar',
    tooltip: 'Editar dados do pedido',
    icone: <PencilSimple size={15} weight="duotone" />,
    onClick: (row: Pedido) => { console.info('[Pedido] Editar:', row.id) },
  },
  {
    id: 'duplicar',
    tooltip: 'Duplicar pedido',
    icone: <Copy size={15} weight="duotone" />,
    onClick: (row: Pedido) => { console.info('[Pedido] Duplicar:', row.id) },
  },
  {
    id: 'deletar',
    tooltip: 'Deletar pedido (somente Draft)',
    icone: <Trash size={15} weight="duotone" />,
    variant: 'danger',
    visivel: (row: Pedido) => row.status === 'draft',
    onClick: (row: Pedido) => { console.info('[Pedido] Deletar:', row.id) },
  },
]

// ── Componente ────────────────────────────────────────────────────────────────

export default function ListaPedidos() {
  const { t } = useTranslation()
  const { visiveis: cardsVisiveis } = useCardPreferences()

  // ── Estado de dados ──────────────────────────────────────────────────────────
  const [pedidos, setPedidos]               = useState<Pedido[]>([])
  const [carregando, setCarregando]         = useState(true)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [temMais, setTemMais]               = useState(false)
  const [cursor, setCursor]                 = useState<string | undefined>(undefined)
  const [total, setTotal]                   = useState(0)

  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [abaAtiva, setAbaAtiva]             = useState('todos')
  const [abas, setAbas]                     = useState<GTAbaTipo[]>(ABAS_PADRAO)
  const [preferencias, setPreferencias]     = useState<GTPreferencias | undefined>(undefined)
  const [sortCampo, setSortCampo]           = useState('data_emissao_pedido')
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>('desc')
  const [busca, setBusca]                   = useState('')
  const [erroLote, setErroLote]             = useState<string | null>(null)

  // ── Refs para evitar duplo carregamento ──────────────────────────────────────
  const carregandoRef = useRef(false)

  // ── Carregar status e preferências ──────────────────────────────────────────
  useEffect(() => {
    pedidoConfigApi.listarStatus()
      .then(res => {
        if (res.data.length > 0) {
          const abasApi: GTAbaTipo[] = [
            { valor: 'todos', label: 'Todos' },
            ...res.data
              .sort((a, b) => a.ordem - b.ordem)
              .map((s: PedidoStatusConfig) => ({
                valor: s.nome,
                label: s.rotulo,
                cor: s.cor,
              })),
          ]
          setAbas(abasApi)
        }
      })
      .catch(() => { /* fallback para ABAS_PADRAO */ })

    pedidoConfigApi.getPreferenciasUsuario()
      .then(prefs => {
        if (prefs?.colunas_visiveis?.length > 0) {
          setPreferencias({
            colunas_visiveis: prefs.colunas_visiveis,
            larguras: prefs.colunas_largura,
          })
        }
      })
      .catch(() => { /* sem preferências salvas */ })
  }, [])

  // ── Primeira carga ───────────────────────────────────────────────────────────
  const carregarInicial = useCallback(async (
    novaAba: string = abaAtiva,
    novaOrdem: string = sortCampo,
    novaDir: 'asc' | 'desc' = sortDir,
    novaBusca: string = busca,
  ) => {
    if (carregandoRef.current) return
    carregandoRef.current = true
    setCarregando(true)
    setCursor(undefined)
    try {
      const res = await pedidoVirtualApi.listar({
        sort: novaOrdem,
        dir: novaDir,
        limit: 100,
        status: novaAba !== 'todos' ? novaAba : undefined,
        busca: novaBusca || undefined,
      })
      setPedidos(res.data)
      setTotal(res.total)
      setTemMais(res.hasMore)
      setCursor(res.nextCursor ?? undefined)
    } catch {
      // Em dev sem backend, usar mock vazio para não bloquear UI
      setPedidos([])
      setTotal(0)
      setTemMais(false)
    } finally {
      setCarregando(false)
      carregandoRef.current = false
    }
  }, [abaAtiva, sortCampo, sortDir, busca])

  useEffect(() => { carregarInicial() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Carregar mais (cursor) ───────────────────────────────────────────────────
  const handleCarregarMais = useCallback(async () => {
    if (!temMais || carregandoMais || !cursor) return
    setCarregandoMais(true)
    try {
      const res = await pedidoVirtualApi.listar({
        cursor,
        sort: sortCampo,
        dir: sortDir,
        limit: 100,
        status: abaAtiva !== 'todos' ? abaAtiva : undefined,
        busca: busca || undefined,
      })
      setPedidos(prev => [...prev, ...res.data])
      setTemMais(res.hasMore)
      setCursor(res.nextCursor ?? undefined)
    } finally {
      setCarregandoMais(false)
    }
  }, [temMais, carregandoMais, cursor, sortCampo, sortDir, abaAtiva, busca])

  // ── Mudar aba ────────────────────────────────────────────────────────────────
  const handleMudarAba = useCallback((aba: string) => {
    setAbaAtiva(aba)
    carregarInicial(aba, sortCampo, sortDir, busca)
  }, [carregarInicial, sortCampo, sortDir, busca])

  // ── Ordenação ────────────────────────────────────────────────────────────────
  const handleOrdenar = useCallback((campo: string, dir: 'asc' | 'desc') => {
    setSortCampo(campo)
    setSortDir(dir)
    carregarInicial(abaAtiva, campo, dir, busca)
  }, [carregarInicial, abaAtiva, busca])

  // ── Busca ────────────────────────────────────────────────────────────────────
  const handleBuscar = useCallback((termo: string) => {
    setBusca(termo)
    carregarInicial(abaAtiva, sortCampo, sortDir, termo)
  }, [carregarInicial, abaAtiva, sortCampo, sortDir])

  // ── Edição inline ────────────────────────────────────────────────────────────
  const handleEditar = useCallback(async (id: string, campo: string, valor: unknown): Promise<Pedido> => {
    const atualizado = await pedidoVirtualApi.editarCampo(id, campo, valor)
    setPedidos(prev => prev.map(p => p.id === id ? atualizado : p))
    return atualizado
  }, [])

  // ── Carregar filhos (itens do pedido) ────────────────────────────────────────
  const handleCarregarFilhos = useCallback(async (pedido: Pedido): Promise<PedidoItem[]> => {
    return pedido.itens ?? []
  }, [])

  // ── Salvar preferências ──────────────────────────────────────────────────────
  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    pedidoConfigApi.salvarPreferenciasUsuario({
      colunas_visiveis: prefs.colunas_visiveis,
      colunas_largura: prefs.larguras,
    }).catch(() => { /* silent — preferências ficam localmente */ })
  }, [])

  // ── Ações em lote ─────────────────────────────────────────────────────────────
  const acoesLote: GTAcaoLote<Pedido>[] = [
    {
      id: 'mudar-status',
      label: 'Mudar Status',
      icone: <ArrowsClockwise size={15} weight="duotone" />,
      onClick: async (itens: Pedido[]) => {
        const ids = itens.map((p: Pedido) => p.id)
        try {
          const preview = await pedidoLoteApi.mudarStatusPreview(ids, 'consolidado')
          if (window.confirm(`${preview.resumo.join('\n')}\n\nConfirmar?`)) {
            await pedidoLoteApi.mudarStatusConfirmar(ids, 'consolidado')
            await carregarInicial()
          }
        } catch (err) {
          setErroLote(err instanceof Error ? err.message : 'Erro ao mudar status')
        }
      },
    },
    {
      id: 'cancelar',
      label: 'Cancelar Pedidos',
      icone: <X size={15} weight="duotone" />,
      variant: 'danger',
      onClick: async (itens: Pedido[]) => {
        const ids = itens.map((p: Pedido) => p.id)
        try {
          const preview = await pedidoLoteApi.cancelarPreview(ids)
          if (window.confirm(`${preview.resumo.join('\n')}\n\nConfirmar cancelamento?`)) {
            await pedidoLoteApi.cancelarConfirmar(ids)
            await carregarInicial()
          }
        } catch (err) {
          setErroLote(err instanceof Error ? err.message : 'Erro ao cancelar')
        }
      },
    },
  ]

  // ── Ações de exportação (client-side) ────────────────────────────────────────
  const acoesExportacao = useMemo((): GTAcaoExport[] => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarExcel(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos', titulo: 'Pedidos' },
      ),
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSV(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarTXT(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarXML(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarJSON(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
  ], [pedidos])

  // ── Stats para KPIs ──────────────────────────────────────────────────────────
  const valorTotal    = pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)
  const qtdTotal      = pedidos.reduce((acc, p) => acc + (p.quantidade_total_pedido ?? 0), 0)
  const todosItens    = pedidos.flatMap(p => p.itens ?? [])
  const itensProntos  = todosItens.reduce((acc, i) => acc + (i.quantidade_pronta    ?? 0), 0)
  const qtdAtualTotal = todosItens.reduce((acc, i) => acc + (i.quantidade_atual     ?? 0), 0)
  const coberturaPend = pedidos
    .filter(p => p.cobertura_cambial === 'sem_cobertura' || !p.cobertura_cambial)
    .reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)

  return (
    <div className="ws-fade-up lp-page">

      {/* ── KPI cards ── */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          {cardsVisiveis.map(pref => {
            if (pref.id === 'total_pedidos') return (
              <CardBasicoGlobal key="total_pedidos"
                titulo={t('pedido.total_pedidos')}
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
                valor={total}
                subtexto={`${todosItens.length} ${t('pedido.itens_total')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.abertos')}</span><strong>{pedidos.filter(p => p.status === 'aberto').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.em_andamento')}</span><strong>{pedidos.filter(p => p.status === 'transferencia').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.concluidos')}</span><strong>{pedidos.filter(p => p.status === 'consolidado').length}</strong></p>
                </>}
              />
            )
            if (pref.id === 'valor_total') return (
              <CardBasicoGlobal key="valor_total"
                titulo={t('pedido.valor_total')}
                icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={fmtMoeda(valorTotal)}
                variante="sucesso"
                subtexto={t('pedido.soma_pedidos')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.moeda')}</span><strong>USD</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_por_pedido')}</span><strong>{fmtMoeda(pedidos.length ? valorTotal / pedidos.length : 0)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'qtd_total') return (
              <CardBasicoGlobal key="qtd_total"
                titulo={t('pedido.qtd_total')}
                icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                valor={fmtQuantidade(qtdTotal)}
                variante="aviso"
                subtexto={`${fmtQuantidade(qtdAtualTotal)} ${t('pedido.saldo_atual')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.pronto')}</span><strong>{fmtQuantidade(itensProntos)}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.saldo_vivo')}</span><strong>{fmtQuantidade(qtdAtualTotal)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'cobertura_pendente') return (
              <CardBasicoGlobal key="cobertura_pendente"
                titulo={t('pedido.cobertura_pendente')}
                icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
                valor={fmtMoeda(coberturaPend)}
                variante="erro"
                subtexto={t('pedido.sem_cobertura')}
                tooltip={<p className="cg-tooltip__row"><span>{t('pedido.aguardando_cobertura')}</span><strong>{pedidos.filter(p => !p.cobertura_cambial || p.cobertura_cambial === 'sem_cobertura').length}</strong></p>}
              />
            )
            return null
          })}
        </div>
      </div>

      {/* ── Feedback de erro em lote ── */}
      {erroLote && (
        <div className="lp-erro-lote" role="alert">
          <Warning size={16} weight="duotone" />
          <span>{erroLote}</span>
          <button onClick={() => setErroLote(null)} aria-label="Fechar erro"><X size={14} /></button>
        </div>
      )}

      {/* ── Tabela virtual ── */}
      <div className="lp-tabela-wrapper">
        <TabelaVirtualGlobal<Pedido, PedidoItem>
          dados={pedidos}
          colunas={COLUNAS_PAI}
          itemId={(p: Pedido) => p.id}

          colunasFilhas={COLUNAS_FILHO}
          onCarregarFilhos={handleCarregarFilhos}
          filhoId={(i: PedidoItem) => i.id}

          temMais={temMais}
          carregandoMais={carregandoMais}
          onCarregarMais={handleCarregarMais}

          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={handleMudarAba}

          acoes={ACOES_PAI}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          acoesBarra={
            <BotaoGlobal
              variante="primario"
              tamanho="sm"
              icone={<Plus size={14} weight="bold" />}
              onClick={() => { console.info('[Pedido] Novo pedido') }}
            >
              Novo Pedido
            </BotaoGlobal>
          }

          onBuscar={handleBuscar}
          placeholderBusca="Buscar pedido, exportador, referência..."
          onOrdenar={handleOrdenar}
          sortCampo={sortCampo}
          sortDir={sortDir}

          camposEditaveis={['numero_invoice', 'numero_proforma', 'referencia_importador']}
          onEditar={handleEditar}

          preferencias={preferencias}
          onSalvarPreferencias={handleSalvarPreferencias}

          carregando={carregando}
          emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
          emptyTitle="Nenhum pedido encontrado"
          emptyDescription="Crie seu primeiro pedido ou ajuste os filtros ativos."
          emptyAction={
            <BotaoGlobal
              variante="primario"
              tamanho="sm"
              icone={<Plus size={14} weight="bold" />}
              onClick={() => { console.info('[Pedido] Novo pedido (empty)') }}
            >
              Novo Pedido
            </BotaoGlobal>
          }

          rowHeight={44}
          childRowHeight={36}
          overscan={6}
          ariaLabel="Lista de pedidos"
        />
      </div>

    </div>
  )
}
