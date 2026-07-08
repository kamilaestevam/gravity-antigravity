import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { EdicaoTextoPopoverGlobal } from '../../../Tabelas/tabela-virtual-global/src/EdicaoTextoPopoverGlobal'
import {
  ArrowCounterClockwise,
  ArrowSquareOut,
  CaretDown,
  CaretRight,
  Columns,
  DownloadSimple,
  FileText,
  GitBranch,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Stack,
  Trash,
  Warning,
} from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  formatarValorListaPedidoSimulador,
  listarPedidosEmpresasSimulador,
  resumirListaPedidosSimulador,
  type ItemListaPedidoSimulador,
  type LinhaListaPedidoSimulador,
  type StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import {
  criarEstadoColunasListaSimuladorPedido,
  type ColunaListaSimuladorPedido,
} from './colunas-lista-simulador-pedido'
import './lista-simulador-pedido.css'
import { atualizarCelulaListaSimulador } from './atualizar-celula-lista-simulador-pedido'
import { CelulaEditavelListaSimuladorPedido } from './celula-editavel-lista-simulador-pedido'
import { EdicaoEnumPopoverSimuladorPedido } from './edicao-enum-popover-simulador-pedido'
import {
  resolverEstadoCelula,
  type NivelLinhaLista,
} from './regras-celula-lista-simulador-pedido'

type PainelListaSimulador = 'GERAL' | 'FINANCEIRO' | 'COMERCIAL'
type FiltroAbaColunas = 'todas' | 'exibidas' | 'ocultas' | 'manuais'

const STATUS_FILTROS: Array<{ id: string; label: string; cor: string; valor?: StatusListaPedidoSimulador }> = [
  { id: 'todas', label: 'Todas', cor: '#94a3b8' },
  { id: 'rascunho', label: 'Rascunho', cor: '#64748b', valor: 'RASCUNHO' },
  { id: 'aberto', label: 'Aberto', cor: '#f59e0b', valor: 'ABERTO' },
  { id: 'andamento', label: 'Em Andamento', cor: '#f97316', valor: 'EM ANDAMENTO' },
  { id: 'transferido', label: 'Transferido', cor: '#14b8a6', valor: 'TRANSFERIDO' },
  { id: 'consolidado', label: 'Consolidado', cor: '#8b5cf6', valor: 'CONSOLIDADO' },
]

const EXPORTAR_OPCOES = ['Excel (.xlsx)', 'CSV', 'TXT', 'XML', 'JSON', 'PDF']

const ITENS_POR_PAGINA = 10

const STATUS_CORES: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: '#94a3b8',
  ABERTO: '#f472b6',
  'EM ANDAMENTO': '#fb923c',
  TRANSFERIDO: '#2dd4bf',
  CONSOLIDADO: '#a78bfa',
}

const STATUS_LABELS: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: 'Rascunho',
  ABERTO: 'Aberto',
  'EM ANDAMENTO': 'Em Andamento',
  TRANSFERIDO: 'Transferido',
  CONSOLIDADO: 'Consolidado',
}

function estiloStatusBadge(status: StatusListaPedidoSimulador): CSSProperties {
  const cor = STATUS_CORES[status]
  return {
    color: cor,
    background: `${cor}1e`,
    border: `1px solid ${cor}33`,
    whiteSpace: 'nowrap',
  }
}

type Props = {
  empresasSelecionadas: PerfilEmpresaSimulador[]
}

type LinhaRenderLista =
  | { tipo: 'pai'; linha: LinhaListaPedidoSimulador; ultimoFilho: boolean }
  | { tipo: 'filho'; item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador; ultimoFilho: boolean }

type CelulaEmEdicao = {
  colunaId: string
  label: string
  anchorRect: DOMRect
  nivel: NivelLinhaLista
  linhaId: string
  itemId?: string
}

function chaveCelula(linhaId: string, colunaId: string, itemId?: string): string {
  return itemId ? `${linhaId}:${itemId}:${colunaId}` : `${linhaId}:${colunaId}`
}

export function ListaSimuladorPedido({ empresasSelecionadas }: Props) {
  const [painelAtivo, setPainelAtivo] = useState<PainelListaSimulador>('GERAL')
  const [statusFiltro, setStatusFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [colunas, setColunas] = useState<ColunaListaSimuladorPedido[]>(criarEstadoColunasListaSimuladorPedido)
  const [filtroAbaColunas, setFiltroAbaColunas] = useState<FiltroAbaColunas>('todas')
  const [colunasAberto, setColunasAberto] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [buscaColuna, setBuscaColuna] = useState('')
  const [linhas, setLinhas] = useState<LinhaListaPedidoSimulador[]>([])
  const [celulaEmEdicao, setCelulaEmEdicao] = useState<CelulaEmEdicao | null>(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [resultadoEdicao, setResultadoEdicao] = useState<'sucesso' | 'erro' | null>(null)
  const [flashCelulas, setFlashCelulas] = useState<Map<string, 'salvo' | 'erro'>>(new Map())

  useEffect(() => {
    setLinhas(listarPedidosEmpresasSimulador(empresasSelecionadas))
    setPagina(1)
    setSelecionados(new Set())
    setExpandidos(new Set())
    setCelulaEmEdicao(null)
  }, [empresasSelecionadas])

  const linhasBase = linhas

  const linhasFiltradas = useMemo(() => {
    const statusValor = STATUS_FILTROS.find((s) => s.id === statusFiltro)?.valor
    const termo = busca.trim().toLowerCase()
    return linhasBase.filter((l) => {
      if (statusValor && l.status !== statusValor) return false
      if (!termo) return true
      return (
        l.numeroPedido.toLowerCase().includes(termo)
        || l.exportador.toLowerCase().includes(termo)
        || l.workspace.toLowerCase().includes(termo)
        || l.incoterm.toLowerCase().includes(termo)
        || l.detalhesItens.some((item) => item.numeroItem.includes(termo))
        || Object.values(l.campos).some((v) => v?.toLowerCase().includes(termo))
      )
    })
  }, [linhasBase, statusFiltro, busca])

  const resumo = useMemo(() => resumirListaPedidosSimulador(linhasFiltradas), [linhasFiltradas])

  const totalPaginas = Math.max(1, Math.ceil(linhasFiltradas.length / ITENS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)

  const linhasPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    return linhasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA)
  }, [linhasFiltradas, paginaAtual])

  const linhasRender = useMemo(() => {
    const resultado: LinhaRenderLista[] = []
    for (const linha of linhasPagina) {
      const aberto = expandidos.has(linha.id)
      const filhos = aberto ? linha.detalhesItens : []
      resultado.push({ tipo: 'pai', linha, ultimoFilho: filhos.length === 0 })
      filhos.forEach((item, idx) => {
        resultado.push({
          tipo: 'filho',
          item,
          pai: linha,
          ultimoFilho: idx === filhos.length - 1,
        })
      })
    }
    return resultado
  }, [linhasPagina, expandidos])

  const colunasVisiveis = colunas.filter((c) => c.visivel)
  const totalColunas = colunas.length
  const totalExibidas = colunasVisiveis.length
  const totalOcultas = colunas.filter((c) => !c.visivel && !c.manual).length
  const totalManuais = colunas.filter((c) => c.manual).length

  const colunasFiltradas = colunas.filter((c) => {
    const termoColuna = buscaColuna.trim().toLowerCase()
    if (termoColuna && !c.label.toLowerCase().includes(termoColuna)) return false
    if (filtroAbaColunas === 'exibidas') return c.visivel
    if (filtroAbaColunas === 'ocultas') return !c.visivel && !c.manual
    if (filtroAbaColunas === 'manuais') return c.manual
    return true
  })

  const toggleExpansao = (id: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelecao = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleTodos = () => {
    if (selecionados.size === linhasPagina.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(linhasPagina.map((l) => l.id)))
    }
  }

  const linhaEmEdicao = celulaEmEdicao
    ? linhas.find((l) => l.id === celulaEmEdicao.linhaId)
    : undefined

  const itemEmEdicao = celulaEmEdicao?.itemId
    ? linhaEmEdicao?.detalhesItens.find((i) => i.id === celulaEmEdicao.itemId)
    : undefined

  const valorEmEdicao = useMemo(() => {
    if (!celulaEmEdicao || !linhaEmEdicao) return null
    if (itemEmEdicao) return itemEmEdicao.campos[celulaEmEdicao.colunaId] ?? null
    return linhaEmEdicao.campos[celulaEmEdicao.colunaId] ?? null
  }, [celulaEmEdicao, linhaEmEdicao, itemEmEdicao])

  const estadoEmEdicao = useMemo(() => {
    if (!celulaEmEdicao || !linhaEmEdicao) return null
    return resolverEstadoCelula(
      celulaEmEdicao.colunaId,
      celulaEmEdicao.nivel,
      linhaEmEdicao,
      itemEmEdicao,
    )
  }, [celulaEmEdicao, linhaEmEdicao, itemEmEdicao])

  function registrarFlash(linhaId: string, colunaId: string, itemId: string | undefined, tipo: 'salvo' | 'erro') {
    const chave = chaveCelula(linhaId, colunaId, itemId)
    setFlashCelulas((prev) => new Map(prev).set(chave, tipo))
    window.setTimeout(() => {
      setFlashCelulas((prev) => {
        const next = new Map(prev)
        next.delete(chave)
        return next
      })
    }, 600)
  }

  function handleConfirmarEdicao(valor: string | null) {
    if (!celulaEmEdicao) return
    setSalvandoEdicao(true)
    setResultadoEdicao(null)
    window.setTimeout(() => {
      setLinhas((prev) =>
        atualizarCelulaListaSimulador(
          prev,
          celulaEmEdicao.linhaId,
          celulaEmEdicao.colunaId,
          valor,
          celulaEmEdicao.itemId,
        ),
      )
      setSalvandoEdicao(false)
      setResultadoEdicao('sucesso')
      registrarFlash(celulaEmEdicao.linhaId, celulaEmEdicao.colunaId, celulaEmEdicao.itemId, 'salvo')
      window.setTimeout(() => {
        setCelulaEmEdicao(null)
        setResultadoEdicao(null)
      }, 350)
    }, 180)
  }

  function renderPopoverEdicao() {
    if (!celulaEmEdicao || !estadoEmEdicao) return null
    const { anchorRect, label } = celulaEmEdicao

    if (estadoEmEdicao.tipo === 'enum' && estadoEmEdicao.opcoes?.length) {
      return (
        <EdicaoEnumPopoverSimuladorPedido
          anchorRect={anchorRect}
          label={label.toUpperCase()}
          valor={valorEmEdicao}
          opcoes={estadoEmEdicao.opcoes}
          onConfirmar={handleConfirmarEdicao}
          onCancelar={() => setCelulaEmEdicao(null)}
          salvando={salvandoEdicao}
          resultado={resultadoEdicao}
        />
      )
    }

    return (
      <EdicaoTextoPopoverGlobal
        anchorRect={anchorRect}
        label={label.toUpperCase()}
        valor={valorEmEdicao}
        placeholder={estadoEmEdicao.tipo === 'periodo' ? 'DD/MM/AAAA' : ''}
        onConfirmar={handleConfirmarEdicao}
        onCancelar={() => setCelulaEmEdicao(null)}
        salvando={salvandoEdicao}
        resultado={resultadoEdicao}
      />
    )
  }

  function renderCelulaConteudo(
    colunaId: string,
    linha: LinhaListaPedidoSimulador,
    item?: ItemListaPedidoSimulador,
  ) {
    const campos = item?.campos ?? linha.campos
    const valor = campos[colunaId]

    if (colunaId === 'numero_pedido') {
      if (item) {
        return (
          <span className="pds-lista-numero pds-lista-numero--filho">
            <span className="pds-lista-sequencia">{item.sequencia}</span>
            <span className="pds-lista-item-id">{item.numeroItem}</span>
            {item.alerta && <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />}
          </span>
        )
      }
      return (
        <span className="pds-lista-numero">
          {linha.numeroPedido}
          {(linha.numeroPedido.startsWith('PO-CONS') || linha.alertaIncoterm) && (
            <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />
          )}
        </span>
      )
    }

    if (colunaId === 'tipo_operacao' && valor) {
      const importacao = valor === 'IMPORTAÇÃO'
      return (
        <StatusBadgeGlobal
          valor={importacao ? 'Importação' : 'Exportação'}
          genero="feminino"
          style={importacao
            ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', whiteSpace: 'nowrap' }
            : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', whiteSpace: 'nowrap' }
          }
        />
      )
    }

    if (colunaId === 'status' && valor) {
      const status = valor as StatusListaPedidoSimulador
      return (
        <StatusBadgeGlobal
          valor={STATUS_LABELS[status] ?? valor}
          genero="masculino"
          style={estiloStatusBadge(status)}
        />
      )
    }

    if (colunaId === 'nome_exportador') {
      if (linha.vincularExportador && !item) {
        return <button type="button" className="pds-lista-vincular">Vincular Exportador</button>
      }
      if (!valor) return <span className="pds-lista-vazio">—</span>
      return (
        <span className="pds-lista-exportador">
          <ArrowSquareOut size={11} aria-hidden />
          {valor}
        </span>
      )
    }

    if (colunaId === 'incoterm') {
      const alertaPai = linha.alertaIncoterm && !item
      return (
        <span className="pds-lista-incoterm">
          {valor ?? '—'}
          {alertaPai && (
            <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />
          )}
        </span>
      )
    }

    if (colunaId.startsWith('anexo_') && valor) {
      return <span className="pds-lista-anexo">{valor}</span>
    }

    return <span className={valor ? '' : 'pds-lista-vazio'}>{valor ?? '—'}</span>
  }

  function renderCelula(
    coluna: ColunaListaSimuladorPedido,
    linha: LinhaListaPedidoSimulador,
    item?: ItemListaPedidoSimulador,
  ) {
    const nivel: NivelLinhaLista = item ? 'item' : 'pai'
    const flash = flashCelulas.get(chaveCelula(linha.id, coluna.id, item?.id))

    return (
      <CelulaEditavelListaSimuladorPedido
        colunaId={coluna.id}
        nivel={nivel}
        linha={linha}
        item={item}
        labelColuna={coluna.label}
        flashSalvo={flash === 'salvo'}
        flashErro={flash === 'erro'}
        onIniciarEdicao={setCelulaEmEdicao}
      >
        {renderCelulaConteudo(coluna.id, linha, item)}
      </CelulaEditavelListaSimuladorPedido>
    )
  }

  return (
    <div className="pds-lista">
      <div className="pds-lista-kpis">
        <div className="pds-lista-kpi">
          <span className="pds-lista-kpi-label">Valor Total</span>
          <strong className="pds-lista-kpi-valor">{formatarValorListaPedidoSimulador(resumo.valorTotal)}</strong>
          <span className="pds-lista-kpi-hint">Soma dos pedidos filtrados</span>
        </div>
        <div className="pds-lista-kpi">
          <span className="pds-lista-kpi-label">Total de Pedidos</span>
          <strong className="pds-lista-kpi-valor">{resumo.totalPedidos}</strong>
          <span className="pds-lista-kpi-hint">{resumo.totalItens} total de itens</span>
        </div>
      </div>

      <div className="pds-lista-paineis">
        <span className="pds-lista-paineis-label">Painéis</span>
        {(['GERAL', 'FINANCEIRO', 'COMERCIAL'] as PainelListaSimulador[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`pds-lista-painel-tab ${painelAtivo === p ? 'pds-lista-painel-tab--ativo' : ''}`}
            onClick={() => setPainelAtivo(p)}
          >
            {p}
            <span className="pds-lista-painel-menu">⋯</span>
          </button>
        ))}
        <button type="button" className="pds-lista-painel-add" aria-label="Novo painel">+</button>
      </div>

      <div className="pds-lista-status-bar">
        {STATUS_FILTROS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`pds-lista-status-chip ${statusFiltro === s.id ? 'pds-lista-status-chip--ativo' : ''}`}
            onClick={() => { setStatusFiltro(s.id); setPagina(1) }}
          >
            <span className="pds-lista-status-dot" style={{ background: s.cor }} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="pds-lista-toolbar">
        <div className="pds-lista-toolbar-esq">
          <div className="pds-lista-busca">
            <MagnifyingGlass size={14} aria-hidden />
            <input
              type="search"
              placeholder="Buscar pedido..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
            />
          </div>
          <button type="button" className="pds-lista-btn-novo">
            <Plus size={14} aria-hidden />
            Novo
            <CaretDown size={12} aria-hidden />
          </button>
          <button type="button" className="pds-lista-btn-acao" disabled>
            <GitBranch size={14} aria-hidden />
            Transferir
          </button>
          <div className="pds-lista-icones">
            <button type="button" className="pds-lista-icone" disabled aria-label="Editar"><PencilSimple size={14} /></button>
            <button type="button" className="pds-lista-icone" disabled aria-label="Consolidar"><Stack size={14} /></button>
            <button type="button" className="pds-lista-icone" disabled aria-label="PDF"><FileText size={14} /></button>
            <button type="button" className="pds-lista-icone pds-lista-icone--danger" disabled aria-label="Excluir"><Trash size={14} /></button>
          </div>
        </div>
        <div className="pds-lista-toolbar-dir">
          <span className="pds-lista-workspaces-badge">
            Workspaces: {empresasSelecionadas.length} selecionados
          </span>
          <div className="pds-lista-dropdown-wrap">
            <button
              type="button"
              className={`pds-lista-btn-sec ${colunasAberto ? 'pds-lista-btn-sec--ativo' : ''}`}
              onClick={() => { setColunasAberto((v) => !v); setExportarAberto(false) }}
            >
              <Columns size={14} aria-hidden />
              Colunas
            </button>
            {colunasAberto && (
              <div className="pds-lista-dropdown pds-lista-dropdown--colunas">
                <div className="pds-lista-dropdown-busca">
                  <MagnifyingGlass size={12} aria-hidden />
                  <input
                    type="search"
                    placeholder="Buscar coluna..."
                    value={buscaColuna}
                    onChange={(e) => setBuscaColuna(e.target.value)}
                  />
                </div>
                <div className="pds-lista-dropdown-tabs">
                  {([
                    ['todas', `Todas (${totalColunas})`],
                    ['exibidas', `Exibidas (${totalExibidas})`],
                    ['ocultas', `Ocultas (${totalOcultas})`],
                    ['manuais', `Manuais (${totalManuais})`],
                  ] as Array<[FiltroAbaColunas, string]>).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`pds-lista-dropdown-tab ${filtroAbaColunas === id ? 'pds-lista-dropdown-tab--ativo' : ''}`}
                      onClick={() => setFiltroAbaColunas(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="pds-lista-dropdown-acoes">
                  <label className="pds-lista-dropdown-check">
                    <input
                      type="checkbox"
                      checked={colunasVisiveis.length === colunas.length}
                      onChange={() => setColunas((prev) => prev.map((c) => ({ ...c, visivel: true })))}
                    />
                    Selecionar tudo
                  </label>
                  <button
                    type="button"
                    className="pds-lista-restaurar"
                    onClick={() => {
                      setColunas(criarEstadoColunasListaSimuladorPedido())
                      setFiltroAbaColunas('todas')
                    }}
                  >
                    <ArrowCounterClockwise size={12} aria-hidden />
                    Restaurar padrão
                  </button>
                </div>
                <ul className="pds-lista-colunas-lista">
                  {colunasFiltradas.map((c) => (
                    <li key={c.id}>
                      <label>
                        <span className="pds-lista-coluna-handle">⠿</span>
                        <input
                          type="checkbox"
                          checked={c.visivel}
                          onChange={() =>
                            setColunas((prev) =>
                              prev.map((col) => (col.id === c.id ? { ...col, visivel: !col.visivel } : col)),
                            )
                          }
                        />
                        {c.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="pds-lista-dropdown-wrap">
            <button
              type="button"
              className={`pds-lista-btn-sec ${exportarAberto ? 'pds-lista-btn-sec--ativo' : ''}`}
              onClick={() => { setExportarAberto((v) => !v); setColunasAberto(false) }}
            >
              <DownloadSimple size={14} aria-hidden />
              Exportar
            </button>
            {exportarAberto && (
              <ul className="pds-lista-dropdown pds-lista-dropdown--exportar">
                {EXPORTAR_OPCOES.map((op) => (
                  <li key={op}>
                    <button type="button">
                      {op.endsWith('PDF') ? <FileText size={14} aria-hidden /> : <DownloadSimple size={14} aria-hidden />}
                      {op}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="pds-lista-tabela-wrap">
        <table className="pds-lista-tabela">
          <thead>
            <tr>
              <th className="pds-lista-th-expand" aria-label="Expandir" />
              <th className="pds-lista-th-check">
                <input
                  type="checkbox"
                  checked={linhasPagina.length > 0 && selecionados.size === linhasPagina.length}
                  onChange={toggleTodos}
                  aria-label="Selecionar todos"
                />
              </th>
              {colunasVisiveis.map((c) => (
                <th key={c.id} title={c.id}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhasRender.map((entrada) => {
              if (entrada.tipo === 'pai') {
                const linha = entrada.linha
                const aberto = expandidos.has(linha.id)
                const temItens = linha.detalhesItens.length > 0
                const classes = [
                  selecionados.has(linha.id) ? 'pds-lista-row--sel' : '',
                  aberto ? 'pds-lista-row--pai-expandido' : '',
                  aberto && entrada.ultimoFilho ? 'pds-lista-row--pai-expandido-solo' : '',
                ].filter(Boolean).join(' ')

                return (
                  <tr key={linha.id} className={classes || undefined}>
                    <td className="pds-lista-td-expand">
                      {temItens ? (
                        <button
                          type="button"
                          className="pds-lista-expandir"
                          onClick={() => toggleExpansao(linha.id)}
                          aria-expanded={aberto}
                          aria-label={aberto ? `Recolher ${linha.numeroPedido}` : `Expandir ${linha.numeroPedido}`}
                        >
                          {aberto ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
                        </button>
                      ) : null}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={selecionados.has(linha.id)}
                        onChange={() => toggleSelecao(linha.id)}
                        aria-label={`Selecionar ${linha.numeroPedido}`}
                      />
                    </td>
                    {colunasVisiveis.map((c) => (
                      <td key={c.id}>{renderCelula(c, linha)}</td>
                    ))}
                  </tr>
                )
              }

              const { item, pai, ultimoFilho } = entrada
              const classes = [
                selecionados.has(item.id) ? 'pds-lista-row--sel' : '',
                'pds-lista-row--filho',
                ultimoFilho ? 'pds-lista-row--filho-ultimo' : '',
              ].filter(Boolean).join(' ')

              return (
                <tr key={item.id} className={classes}>
                  <td className="pds-lista-td-expand" />
                  <td>
                    <input
                      type="checkbox"
                      checked={selecionados.has(item.id)}
                      onChange={() => toggleSelecao(item.id)}
                      aria-label={`Selecionar item ${item.numeroItem}`}
                    />
                  </td>
                  {colunasVisiveis.map((c) => (
                    <td key={c.id}>{renderCelula(c, pai, item)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="pds-lista-footer">
        <span>
          {linhasFiltradas.length} pedidos · {resumo.totalItens} itens · página {paginaAtual} de {totalPaginas}
        </span>
        <div className="pds-lista-paginacao">
          <button
            type="button"
            disabled={paginaAtual <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === paginaAtual ? 'pds-lista-pagina--ativa' : ''}
              onClick={() => setPagina(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            ›
          </button>
        </div>
      </footer>

      {renderPopoverEdicao()}
    </div>
  )
}
