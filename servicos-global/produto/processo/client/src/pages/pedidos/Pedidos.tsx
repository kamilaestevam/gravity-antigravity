/**
 * Pedidos.tsx — Pedidos de compra vinculados ao processo
 *
 * TabelaVirtualGlobal: pedidos como nível pai, itens como nível filho.
 * Dados 100% da API — cursor pagination, edição inline, lote, exportação.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Package, Plus, Eye, PencilSimple, X } from '@phosphor-icons/react'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import type {
  PedidoRico,
  PedidoItemRico,
  PedidoStatusConfig,
} from '../../shared/types'
import {
  getPedidos,
  getPedidoItens,
  editarCampoPedido,
  getPedidosStatus,
  getPreferenciasUsuario,
  salvarPreferenciasUsuario,
  exportarPedidos,
} from '../../shared/api'

// ── Env / IDs ─────────────────────────────────────────────────────────────────

const idOrganizacao = import.meta.env.VITE_TENANT_ID ?? 'tenant-demo'
const userId = import.meta.env.VITE_USER_ID ?? 'user-demo'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtUSD = (val: string | number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(Number(val))

const fmtDecimal = (val: string | number) =>
  Number(val).toLocaleString('pt-BR', { maximumFractionDigits: 2 })

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR')

// ── Componente ────────────────────────────────────────────────────────────────

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoRico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('todos')
  const [busca, setBusca] = useState('')
  const [sortCampo, setSortCampo] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusList, setStatusList] = useState<PedidoStatusConfig[]>([])
  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>()

  // ── Carregamento inicial ───────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      setCarregando(true)
      try {
        const [statusData, prefsData, listData] = await Promise.all([
          getPedidosStatus(idOrganizacao),
          getPreferenciasUsuario(idOrganizacao, userId),
          getPedidos(idOrganizacao, { sort: sortCampo, dir: sortDir, limit: 50 }),
        ])
        setStatusList(statusData)
        if (prefsData) {
          setPreferencias({
            colunas_visiveis: prefsData.colunas_visiveis,
            larguras: prefsData.colunas_largura,
          })
        }
        setPedidos(listData.data)
      } catch {
        // erros silenciosos — tabela exibirá estado vazio
      } finally {
        setCarregando(false)
      }
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Recarregar ao mudar aba / busca / sort ────────────────────────────────

  const recarregar = useCallback(
    async (
      novoStatus: string,
      novaBusca: string,
      novoCampo: string,
      novoDir: 'asc' | 'desc'
    ) => {
      setCarregando(true)
      try {
        const resp = await getPedidos(idOrganizacao, {
          sort: novoCampo,
          dir: novoDir,
          limit: 50,
          status: novoStatus !== 'todos' ? novoStatus : undefined,
          busca: novaBusca || undefined,
        })
        setPedidos(resp.data)
      } catch {
        // silencioso
      } finally {
        setCarregando(false)
      }
    },
    []
  )

  // ── Aba ───────────────────────────────────────────────────────────────────

  function handleMudarAba(aba: string) {
    setAbaAtiva(aba)
    void recarregar(aba, busca, sortCampo, sortDir)
  }

  // ── Busca ─────────────────────────────────────────────────────────────────

  function handleBuscar(termo: string) {
    setBusca(termo)
    void recarregar(abaAtiva, termo, sortCampo, sortDir)
  }

  // ── Ordenação ─────────────────────────────────────────────────────────────

  function handleOrdenar(campo: string, dir: 'asc' | 'desc') {
    setSortCampo(campo)
    setSortDir(dir)
    void recarregar(abaAtiva, busca, campo, dir)
  }

  // ── Carregar filhos (itens do pedido) ─────────────────────────────────────
  // useCallback com deps estáveis para não disparar o useEffect de
  // auto-revalidação do useGTExpandir em todo render de Pedidos.
  const carregarItens = useCallback(
    (pedido: PedidoRico): Promise<PedidoItemRico[]> => getPedidoItens(idOrganizacao, pedido.id),
    [idOrganizacao],
  )

  // ── Edição inline ─────────────────────────────────────────────────────────

  async function handleEditar(id: string, campo: string, valor: unknown): Promise<PedidoRico> {
    const atualizado = await editarCampoPedido(idOrganizacao, id, campo, valor)
    setPedidos(prev => prev.map(p => (p.id === id ? atualizado : p)))
    return atualizado
  }

  // ── Salvar preferências ───────────────────────────────────────────────────

  async function handleSalvarPreferencias(prefs: GTPreferencias) {
    setPreferencias(prefs)
    await salvarPreferenciasUsuario(idOrganizacao, userId, {
      colunas_visiveis: prefs.colunas_visiveis,
      colunas_largura: prefs.larguras,
    })
  }

  // ── Abas ──────────────────────────────────────────────────────────────────

  const abas: GTAbaTipo[] = [
    { valor: 'todos', label: 'Todos' },
    ...statusList.map(s => ({
      valor: s.nome,
      label: s.rotulo,
      cor: s.cor,
    })),
  ]

  // ── Colunas pai ───────────────────────────────────────────────────────────

  const colunasPai: GTColuna<PedidoRico>[] = [
    {
      key: 'numero',
      label: 'Nº Pedido',
      sortavel: true,
      naoOcultavel: true,
      largura: 140,
      tooltipTitulo: 'Número do Pedido',
      tooltipDescricao: 'Identificador único do pedido de compra no processo',
    },
    {
      key: 'exportador_nome',
      label: 'Exportador',
      sortavel: true,
      largura: 200,
      tooltipTitulo: 'Exportador',
      tooltipDescricao: 'Fornecedor internacional responsável pelo envio da mercadoria',
    },
    {
      key: 'status',
      label: 'Status',
      largura: 130,
      tooltipTitulo: 'Status do Pedido',
      tooltipDescricao: 'Situação atual do pedido dentro do fluxo de importação',
      render: (_val: unknown, row: PedidoRico) => {
        const cfg = statusList.find(s => s.nome === row.status)
        const rotulo = cfg?.rotulo ?? row.status
        const cor = cfg?.cor ?? '#6b7280'
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              background: `${cor}22`,
              color: cor,
              border: `1px solid ${cor}44`,
            }}
          >
            {rotulo}
          </span>
        )
      },
    },
    {
      key: 'valor_fob',
      label: 'Valor FOB',
      align: 'right',
      sortavel: true,
      largura: 130,
      tooltipTitulo: 'Valor FOB',
      tooltipDescricao: 'Valor total da mercadoria no ponto de embarque em dólares',
      render: (_val: unknown, row: PedidoRico) => <span>{fmtUSD(row.valor_fob)}</span>,
    },
    {
      key: 'moeda',
      label: 'Moeda',
      largura: 80,
      tooltipTitulo: 'Moeda',
      tooltipDescricao: 'Moeda utilizada no pedido de compra',
    },
    {
      key: 'peso_bruto',
      label: 'Peso Bruto (kg)',
      align: 'right',
      largura: 130,
      tooltipTitulo: 'Peso Bruto',
      tooltipDescricao: 'Peso total do pedido incluindo embalagem em quilogramas',
      render: (_val: unknown, row: PedidoRico) => <span>{fmtDecimal(row.peso_bruto)}</span>,
    },
    {
      key: 'created_at',
      label: 'Data',
      sortavel: true,
      largura: 110,
      tooltipTitulo: 'Data de Criação',
      tooltipDescricao: 'Data em que o pedido foi registrado no sistema',
      render: (_val: unknown, row: PedidoRico) => <span>{fmtDate(row.created_at)}</span>,
    },
  ]

  // ── Colunas filha ─────────────────────────────────────────────────────────

  const colunasFilha: GTColuna<PedidoItemRico>[] = [
    {
      key: 'numero_item',
      label: 'Item',
      largura: 70,
      tooltipTitulo: 'Número do Item',
      tooltipDescricao: 'Sequencial do item dentro do pedido de compra',
    },
    {
      key: 'descricao',
      label: 'Descrição',
      largura: 250,
      tooltipTitulo: 'Descrição do Item',
      tooltipDescricao: 'Nome comercial da mercadoria conforme fatura do exportador',
    },
    {
      key: 'ncm',
      label: 'NCM',
      largura: 110,
      tooltipTitulo: 'NCM',
      tooltipDescricao: 'Código da Nomenclatura Comum do Mercosul para classificação fiscal',
      render: (_val: unknown, row: PedidoItemRico) =>
        row.ncm ? (
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
            {row.ncm}
          </span>
        ) : null,
    },
    {
      key: 'quantidade',
      label: 'Qtd.',
      align: 'right',
      largura: 100,
      tooltipTitulo: 'Quantidade',
      tooltipDescricao: 'Volume adquirido do item na unidade de medida informada',
      render: (_val: unknown, row: PedidoItemRico) => (
        <span>
          {fmtDecimal(row.quantidade)} {row.unidade}
        </span>
      ),
    },
    {
      key: 'valor_total',
      label: 'Valor Total',
      align: 'right',
      largura: 120,
      tooltipTitulo: 'Valor Total',
      tooltipDescricao: 'Valor FOB total do item em dólares americanos',
      render: (_val: unknown, row: PedidoItemRico) => <span>{fmtUSD(row.valor_total)}</span>,
    },
    {
      key: 'status_li',
      label: 'LI',
      largura: 100,
      tooltipTitulo: 'Status da LI',
      tooltipDescricao: 'Situação da Licença de Importação junto aos órgãos anuentes',
      render: (_val: unknown, row: PedidoItemRico) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            background: 'var(--ws-surface-2, #f3f4f6)',
            color: 'var(--ws-muted, #6b7280)',
          }}
        >
          {row.status_li}
        </span>
      ),
    },
  ]

  // ── Ações de linha ────────────────────────────────────────────────────────

  const acoes: GTAcao<PedidoRico>[] = [
    {
      id: 'ver',
      tooltip: 'Ver detalhes',
      icone: <Eye size={16} weight="duotone" />,
      onClick: (row: PedidoRico) => {
        // navegação para detalhe do pedido — implementar rota
        void row
      },
    },
    {
      id: 'editar',
      tooltip: 'Editar pedido',
      icone: <PencilSimple size={16} weight="duotone" />,
      onClick: (row: PedidoRico) => {
        void row
      },
    },
    {
      id: 'cancelar',
      tooltip: 'Cancelar pedido',
      icone: <X size={16} weight="duotone" />,
      variant: 'danger',
      visivel: (row: PedidoRico) => row.status !== 'cancelado',
      onClick: (row: PedidoRico) => {
        void row
      },
    },
  ]

  // ── Ações em lote ─────────────────────────────────────────────────────────

  const acoesLote: GTAcaoLote<PedidoRico>[] = [
    {
      id: 'exportar_lote',
      label: 'Exportar selecionados',
      onClick: async (itens: PedidoRico[]) => {
        await exportarPedidos(idOrganizacao, itens.map(i => i.id), 'csv')
      },
    },
    {
      id: 'cancelar_lote',
      label: 'Cancelar selecionados',
      variant: 'danger',
      onClick: (_itens: PedidoRico[]) => {
        // abrir modal de confirmação
      },
    },
  ]

  // ── Ações de exportação ───────────────────────────────────────────────────

  const acoesExportacao: GTAcaoExport[] = [
    {
      label: 'CSV',
      onClick: async () => {
        await exportarPedidos(idOrganizacao, pedidos.map(p => p.id), 'csv')
      },
    },
    {
      label: 'Excel',
      onClick: async () => {
        await exportarPedidos(idOrganizacao, pedidos.map(p => p.id), 'xlsx')
      },
    },
    {
      label: 'JSON',
      onClick: async () => {
        await exportarPedidos(idOrganizacao, pedidos.map(p => p.id), 'json')
      },
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100%' }}>
      <TabelaVirtualGlobal<PedidoRico, PedidoItemRico>
        dados={pedidos}
        colunas={colunasPai}
        itemId={(p: PedidoRico) => p.id}
        colunasFilhas={colunasFilha}
        onCarregarFilhos={carregarItens}
        filhoId={(filho: PedidoItemRico) => filho.id}
        itensPorPagina={50}
        abas={abas}
        abaAtiva={abaAtiva}
        onMudarAba={handleMudarAba}
        acoes={acoes}
        acoesLote={acoesLote}
        acoesExportacao={acoesExportacao}
        acoesBarra={
          <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
            Novo Pedido
          </BotaoGlobal>
        }
        onBuscar={handleBuscar}
        placeholderBusca="Buscar pedidos..."
        onOrdenar={handleOrdenar}
        sortCampo={sortCampo}
        sortDir={sortDir}
        camposEditaveis={['exportador_nome', 'moeda', 'status']}
        onEditar={handleEditar}
        preferencias={preferencias}
        onSalvarPreferencias={prefs => void handleSalvarPreferencias(prefs)}
        carregando={carregando}
        emptyIcon={<Package weight="duotone" size={48} />}
        emptyTitle="Nenhum pedido encontrado"
        emptyDescription="Crie o primeiro pedido ou ajuste os filtros"
        emptyAction={
          <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
            Novo Pedido
          </BotaoGlobal>
        }
        ariaLabel="Tabela de pedidos de compra"
      />
    </div>
  )
}
