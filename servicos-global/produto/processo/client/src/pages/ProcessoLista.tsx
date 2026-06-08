/**
 * ProcessoLista.tsx — Tabela 01: Processo → Pedido → Item (3 camadas).
 * Onda 2 — colunas Processo (avô) + paridade Pedido (pai/item).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Briefcase, DownloadSimple, Eye, FilePdf } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  TabelaVirtualGlobal,
  type GTAcao,
  type GTAcaoExport,
  type GTPreferencias,
  type GTAbaTipo,
} from '@nucleo/tabela-virtual-global'
import { buildColunasListaProcesso, chavesColunasAvo } from '../components/lista/buildColunasListaProcesso'
import { buildColunasPai, type OpcoesUnidadesColunas } from '../components/lista/ColunasPai'
import { buildMapaColunasFilhoLista } from '../components/lista/mapaColunasFilhoLista'
import { BarraAcoesProcesso } from '../components/lista/BarraAcoesProcesso'
import { ModalNovoProcessoManual } from '../components/lista/ModalNovoProcessoManual'
import { ModalProcessoPlaceholder } from '../components/lista/ModalProcessoPlaceholder'
import { ModalEdicaoMassaProcesso } from '../components/lista/ModalEdicaoMassaProcesso'
import { ModalDuplicarProcesso } from '../components/lista/ModalDuplicarProcesso'
import { ModalExcluirProcesso } from '../components/lista/ModalExcluirProcesso'
import {
  MOCK_PROCESSOS_AVO,
  PEDIDOS_MOCK_INICIAL,
  ITENS_MOCK_INICIAL,
  filhosVisiveisDoProcesso,
  idFilhoLinha,
  todosIdsPedidoMock,
  type FilhoLinhaLista,
  type ProcessoAvoLinha,
} from '../shared/lista/mockListaHierarquica'
import { useUnidadesPedido } from '../shared/lista/useUnidadesPedido'
import { useLogisticaCadastrosPedido } from '../shared/lista/useLogisticaCadastrosPedido'
import { ConectorFilhoLista } from '../components/lista/ConectorFilhoLista'
import { ConectorPaiLista } from '../components/lista/ConectorPaiLista'
import {
  CAMPOS_EDITAVEIS_PROCESSO,
  COLUNAS_EXPORT_PROCESSO,
  COLUNAS_PADRAO_VISIVEIS,
  COLUNAS_SEM_REPLICACAO_PEDIDO_ITEM,
  camposEditaveisFilhosLista,
} from '../shared/lista/processoListaColunasConfig'
import {
  carregarPreferenciasColunasProcesso,
  salvarPreferenciasColunasProcesso,
} from '../shared/lista/processoListaPreferencias'
import { buildExportDadosProcesso } from '../shared/lista/buildExportDadosProcesso'
import {
  exportarCSV,
  exportarExcel,
  exportarJSON,
  exportarPDF,
  exportarTXT,
  exportarXML,
} from '../shared/lista/exportUtils'
import { useEdicaoListaProcesso } from '../shared/lista/useEdicaoListaProcesso'
import { rotaDetalheProcessoLista } from '../shared/lista/rotaProcessoLista'
import { resolverRotuloStatusProcesso } from '../shared/lista/processoStatusConfig'
import { ProcessoListaStats } from '../components/lista/ProcessoListaStats'
import {
  ETAPAS_COR,
  ETAPAS_LABEL,
  ORDEM_ETAPAS,
  type EtapaProcesso,
} from './todos/_mocks'
import { useSelecaoStore, useProcessosSelecionados } from '../shared/state/selecaoStore'
import type { Pedido, PedidoItem } from '../shared/lista/pedidoTypes'
import { TodosProcessosTabs } from './todos/TodosProcessosTabs'
import './todos/TodosProcessos.css'
import './ProcessoLista.css'

export default function ProcessoLista({ embedTabs = true }: { embedTabs?: boolean }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { addNotification } = useShellStore()
  const novoDropdownRef = useRef<HTMLDivElement>(null)

  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'todos' | EtapaProcesso>('todos')
  const [processos, setProcessos] = useState<ProcessoAvoLinha[]>(() => [...MOCK_PROCESSOS_AVO])
  const [pedidos, setPedidos] = useState<Array<Pedido & { id_processo: string }>>(
    () => PEDIDOS_MOCK_INICIAL.map(p => ({ ...p })),
  )
  const [itens, setItens] = useState<PedidoItem[]>(() => ITENS_MOCK_INICIAL.map(i => ({ ...i })))
  const [preferencias, setPreferencias] = useState<GTPreferencias>(
    () => carregarPreferenciasColunasProcesso(),
  )
  const [pedidosExpandidos, setPedidosExpandidos] = useState<Set<string>>(
    () => new Set(todosIdsPedidoMock(pedidos)),
  )
  const [resetCacheFilhos, setResetCacheFilhos] = useState(0)

  const processosSelecionados = useProcessosSelecionados()
  const { setProcessosSelecionados, limparSelecao } = useSelecaoStore()

  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalImportAberto, setModalImportAberto] = useState(false)
  const [modalCockpitAberto, setModalCockpitAberto] = useState(false)
  const [modalEdicaoMassaAberto, setModalEdicaoMassaAberto] = useState(false)
  const [modalDuplicarAberto, setModalDuplicarAberto] = useState(false)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [excluindoLote, setExcluindoLote] = useState(false)

  const abas = useMemo<GTAbaTipo[]>(() => [
    { valor: 'todos', label: 'Todos' },
    ...ORDEM_ETAPAS.map(etapa => ({
      valor: etapa,
      label: ETAPAS_LABEL[etapa],
    })),
  ], [])

  useEffect(() => {
    if (!novoDropdownAberto) return
    const handleClick = (e: MouseEvent) => {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(e.target as Node)) {
        setNovoDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [novoDropdownAberto])

  const { unidadesPeso, unidadesCubagem, mapaFatorParaKg } = useUnidadesPedido()

  const { handleEditarFilho, pedidosExibicao } = useEdicaoListaProcesso(
    pedidos,
    setPedidos,
    itens,
    setItens,
    setResetCacheFilhos,
    mapaFatorParaKg,
  )
  const {
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
  } = useLogisticaCadastrosPedido()

  const opcoesColunas = useMemo<OpcoesUnidadesColunas>(() => ({
    unidadesPeso,
    unidadesCubagem,
    mapaFatorParaKg,
    incotermsOpcoes: [],
    moedasOpcoes: [],
    workspacesMap: new Map(),
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
  }), [unidadesPeso, unidadesCubagem, mapaFatorParaKg, paisesOpcoes, portosOpcoes, aeroportosOpcoes])

  const colunasPedido = useMemo(
    () => buildColunasPai(t, opcoesColunas),
    [t, i18n.language, opcoesColunas],
  )

  const colunas = useMemo(
    () => buildColunasListaProcesso(t, opcoesColunas),
    [t, i18n.language, opcoesColunas],
  )

  const chavesAvo = useMemo(() => chavesColunasAvo(t), [t, i18n.language])

  const resolverPedido = useCallback(
    (id_pedido: string) => pedidosExibicao.find(p => p.id === id_pedido),
    [pedidosExibicao],
  )

  const mapaColunasFilho = useMemo(
    () => buildMapaColunasFilhoLista(t, chavesAvo, colunasPedido, opcoesColunas, resolverPedido),
    [t, i18n.language, chavesAvo, colunasPedido, opcoesColunas, resolverPedido],
  )

  const buscaNorm = busca.trim().toLowerCase()
  const processosFiltrados = useMemo(() => {
    let resultado = processos
    if (abaAtiva !== 'todos') {
      resultado = resultado.filter(p => p.etapa_atual === abaAtiva)
    }
    if (!buscaNorm) return resultado
    return resultado.filter(p =>
      p.numero_processo.toLowerCase().includes(buscaNorm)
      || (p.referencia_interna_processo?.toLowerCase().includes(buscaNorm) ?? false)
      || p.nome_importador.toLowerCase().includes(buscaNorm)
      || p.nome_exportador.toLowerCase().includes(buscaNorm)
      || p.responsavel_processo.toLowerCase().includes(buscaNorm),
    )
  }, [buscaNorm, processos, abaAtiva])

  const handleMudarAba = useCallback((novaAba: string) => {
    setAbaAtiva(novaAba as 'todos' | EtapaProcesso)
    limparSelecao()
  }, [limparSelecao])

  const processoItemId = useCallback((p: ProcessoAvoLinha) => p.id_processo, [])

  const togglePedidoItens = useCallback((id_pedido: string) => {
    setPedidosExpandidos(prev => {
      const next = new Set(prev)
      if (next.has(id_pedido)) next.delete(id_pedido)
      else next.add(id_pedido)
      return next
    })
    setResetCacheFilhos(n => n + 1)
  }, [])

  const handleCarregarFilhos = useCallback(async (processo: ProcessoAvoLinha) => {
    return filhosVisiveisDoProcesso(processo.id_processo, pedidosExpandidos, pedidosExibicao, itens)
  }, [pedidosExpandidos, pedidosExibicao, itens])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    salvarPreferenciasColunasProcesso(prefs)
  }, [])

  const handleEditar = useCallback(async (
    id_processo: string,
    campo: string,
    valor: unknown,
  ): Promise<ProcessoAvoLinha> => {
    let v: unknown = valor
    if (valor != null && typeof valor === 'object') {
      if ('amount' in (valor as object)) v = (valor as { amount: unknown }).amount
      else if ('valor' in (valor as object)) v = (valor as { valor: unknown }).valor
    }
    let atualizado: ProcessoAvoLinha | undefined
    setProcessos(prev => prev.map(p => {
      if (p.id_processo !== id_processo) return p
      const patch: Partial<ProcessoAvoLinha> = { [campo]: v } as Partial<ProcessoAvoLinha>
      if (campo === 'codigo_status_processo' && typeof v === 'string') {
        if (v in ETAPAS_LABEL) {
          const etapa = v as EtapaProcesso
          patch.etapa_atual = etapa
          patch.rotulo_status_processo = ETAPAS_LABEL[etapa]
          patch.cor_status_processo = ETAPAS_COR[etapa]
        } else {
          const { label, cor } = resolverRotuloStatusProcesso(v)
          patch.rotulo_status_processo = label
          patch.cor_status_processo = cor
        }
      }
      atualizado = { ...p, ...patch }
      return atualizado
    }))
    if (!atualizado) throw new Error('Processo não encontrado')
    return atualizado
  }, [])

  const handleCriarProcesso = useCallback((novo: ProcessoAvoLinha) => {
    setProcessos(prev => [novo, ...prev])
    addNotification({ type: 'success', message: `Processo ${novo.numero_processo} criado` })
  }, [addNotification])

  const handleEdicaoMassa = useCallback((ids: string[], campo: string, valor: unknown) => {
    setProcessos(prev => prev.map(p => {
      if (!ids.includes(p.id_processo)) return p
      const patch: Partial<ProcessoAvoLinha> = { [campo]: valor } as Partial<ProcessoAvoLinha>
      if (campo === 'codigo_status_processo' && typeof valor === 'string') {
        if (valor in ETAPAS_LABEL) {
          const etapa = valor as EtapaProcesso
          patch.etapa_atual = etapa
          patch.rotulo_status_processo = ETAPAS_LABEL[etapa]
          patch.cor_status_processo = ETAPAS_COR[etapa]
        } else {
          const { label, cor } = resolverRotuloStatusProcesso(valor)
          patch.rotulo_status_processo = label
          patch.cor_status_processo = cor
        }
      }
      return { ...p, ...patch }
    }))
    addNotification({ type: 'success', message: `${ids.length} processo(s) atualizado(s)` })
  }, [addNotification])

  const handleDuplicar = useCallback((pares: Array<{ origemId: string; copia: ProcessoAvoLinha }>) => {
    const copias = pares.map(p => p.copia)
    setProcessos(prev => [...copias, ...prev])

    const novosPedidos: Array<Pedido & { id_processo: string }> = []
    const novosItens: PedidoItem[] = []

    for (const { origemId, copia } of pares) {
      const pedidosOrigem = pedidos.filter(p => p.id_processo === origemId)
      for (const ped of pedidosOrigem) {
        const novoPedidoId = `${ped.id}-dup-${copia.id_processo}`
        novosPedidos.push({
          ...ped,
          id: novoPedidoId,
          id_processo: copia.id_processo,
          numero_pedido: `${ped.numero_pedido}-CÓPIA`,
        })
        const itensPed = itens.filter(i => i.pedido_id === ped.id)
        for (const item of itensPed) {
          novosItens.push({
            ...item,
            id: `${item.id}-dup-${copia.id_processo}`,
            pedido_id: novoPedidoId,
          })
        }
      }
    }

    if (novosPedidos.length > 0) {
      setPedidos(prev => [...novosPedidos, ...prev])
      setItens(prev => [...novosItens, ...prev])
      setPedidosExpandidos(prev => {
        const next = new Set(prev)
        novosPedidos.forEach(p => next.add(p.id))
        return next
      })
      setResetCacheFilhos(n => n + 1)
    }

    setProcessosSelecionados([])
    addNotification({ type: 'success', message: `${copias.length} processo(s) duplicado(s)` })
  }, [pedidos, itens, addNotification, setProcessosSelecionados])

  const handleExcluirConfirmado = useCallback(async (ids: string[]) => {
    setExcluindoLote(true)
    try {
      const idsPedidos = pedidos.filter(p => ids.includes(p.id_processo)).map(p => p.id)
      setProcessos(prev => prev.filter(p => !ids.includes(p.id_processo)))
      setPedidos(prev => prev.filter(p => !ids.includes(p.id_processo)))
      setItens(prev => prev.filter(i => !idsPedidos.includes(i.pedido_id)))
      setProcessosSelecionados([])
      setResetCacheFilhos(n => n + 1)
      addNotification({ type: 'success', message: `${ids.length} processo(s) excluído(s)` })
    } finally {
      setExcluindoLote(false)
    }
  }, [pedidos, addNotification, setProcessosSelecionados])

  const handleExcluirLote = useCallback(() => {
    if (processosSelecionados.length === 0) return
    setModalExcluirAberto(true)
  }, [processosSelecionados.length])

  const buildDadosExport = useCallback(() => {
    const sepMap = { virgula: ',', 'ponto-virgula': ';', tab: '\t' } as const
    let cfg = {
      incluirCabecalho: true,
      separadorCsv: 'ponto-virgula' as const,
    }
    try {
      const raw = localStorage.getItem('processo:export_config')
      if (raw) {
        const parsed = JSON.parse(raw) as typeof cfg
        cfg = { ...cfg, ...parsed }
      }
    } catch { /* padrão */ }
    const dados = buildExportDadosProcesso(processosFiltrados, pedidos, itens, pedidosExpandidos)
    const sep = sepMap[cfg.separadorCsv] ?? ';'
    return { cfg, dados, colunasExport: COLUNAS_EXPORT_PROCESSO, sep }
  }, [processosFiltrados, pedidos, itens, pedidosExpandidos])

  const acoesExportacao = useMemo((): GTAcaoExport[] => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        void exportarExcel(dados, colunasExport, { nomeArquivo: 'processos', titulo: 'Processos' })
      },
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { cfg, dados, colunasExport, sep } = buildDadosExport()
        exportarCSV(dados, colunasExport, {
          nomeArquivo: 'processos',
          semCabecalho: !cfg.incluirCabecalho,
          separadorCsv: sep,
        })
      },
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { cfg, dados, colunasExport } = buildDadosExport()
        exportarTXT(dados, colunasExport, { nomeArquivo: 'processos', semCabecalho: !cfg.incluirCabecalho })
      },
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarXML(dados, colunasExport, { nomeArquivo: 'processos' })
      },
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarJSON(dados, colunasExport, { nomeArquivo: 'processos' })
      },
    },
    {
      label: 'PDF',
      icone: <FilePdf size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        void exportarPDF(dados, colunasExport, { nomeArquivo: 'processos', titulo: 'Processos' })
      },
    },
  ], [buildDadosExport])

  const acoesProcesso: GTAcao<ProcessoAvoLinha>[] = useMemo(() => [
    {
      id: 'ver',
      tooltip: 'Abrir processo',
      icone: <Eye size={16} weight="duotone" />,
      onClick: (p) => { void navigate(rotaDetalheProcessoLista(p)) },
    },
  ], [navigate])

  const acoesBarra = useMemo(() => (
    <BarraAcoesProcesso
      novoDropdownRef={novoDropdownRef}
      novoDropdownAberto={novoDropdownAberto}
      excluindoLote={excluindoLote}
      setNovoDropdownAberto={setNovoDropdownAberto}
      setSmartImportAberto={setModalImportAberto}
      setModalCockpitAberto={setModalCockpitAberto}
      setModalNovoProcessoAberto={setModalNovoAberto}
      setModalEdicaoMassaAberto={setModalEdicaoMassaAberto}
      setModalDuplicarAberto={setModalDuplicarAberto}
      onExcluirLote={handleExcluirLote}
    />
  ), [
    novoDropdownAberto,
    excluindoLote,
    handleExcluirLote,
  ])

  const renderConectorFilho = useCallback((filho: FilhoLinhaLista) => (
    <ConectorFilhoLista
      filho={filho}
      pedidosExpandidos={pedidosExpandidos}
      onTogglePedido={togglePedidoItens}
    />
  ), [pedidosExpandidos, togglePedidoItens])

  const renderConectorPai = useCallback(
    (_processo: ProcessoAvoLinha, ctx) => <ConectorPaiLista {...ctx} />,
    [],
  )

  const classNameLinhaPai = useCallback(() => 'pl-linha--processo', [])

  const classNameLinhaFilho = useCallback(
    (filho: FilhoLinhaLista) =>
      filho.camada === 'pedido' ? 'pl-linha--pedido' : 'pl-linha--item',
    [],
  )

  const camposEditaveisFilhos = useMemo(() => camposEditaveisFilhosLista(), [])

  return (
    <PaginaGlobal
      className="ws-fade-up processo-lista-page"
      layout="lista"
      cabecalho={
        embedTabs ? (
          <CabecalhoGlobal
            icone={<Briefcase weight="duotone" size={22} />}
            titulo="Lista"
            subtitulo="Processos do workspace — Processo, Pedido e Item"
          />
        ) : undefined
      }
      toolbar={embedTabs ? <TodosProcessosTabs /> : undefined}
    >
      <ProcessoListaStats processos={processos} />
      <div className="lp-page pl-page">
        <div className="lp-tabela-wrapper">
          <TabelaVirtualGlobal<ProcessoAvoLinha, FilhoLinhaLista>
            exibirCabecalhoQuandoVazio
            dados={processosFiltrados}
            colunas={colunas}
            mapaColunasFilho={mapaColunasFilho}
            itemId={processoItemId}
            filhoId={idFilhoLinha}
            onCarregarFilhos={handleCarregarFilhos}
            resetCacheFilhos={resetCacheFilhos}
            renderConectorFilho={renderConectorFilho}
            renderConectorPai={renderConectorPai}
            larguraColunaExpand="6.25rem"
            classNameLinhaPai={classNameLinhaPai}
            classNameLinhaFilho={classNameLinhaFilho}
            acoes={acoesProcesso}
            acoesExportacao={acoesExportacao}
            acoesBarra={acoesBarra}
            abas={abas}
            abaAtiva={abaAtiva}
            onMudarAba={handleMudarAba}
            onSelecaoMudar={setProcessosSelecionados}
            onBuscar={setBusca}
            placeholderBusca="Buscar por número, importador, exportador, responsável…"
            emptyIcon={<Briefcase weight="duotone" size={48} />}
            emptyTitle="Nenhum processo encontrado"
            emptyDescription="Ajuste a busca, filtro de status ou crie um novo processo"
            ariaLabel="Lista hierárquica de processos, pedidos e itens"
            itensPorPagina={25}
            camposEditaveis={CAMPOS_EDITAVEIS_PROCESSO}
            camposEditaveisFilhos={camposEditaveisFilhos}
            onEditar={handleEditar}
            onEditarFilho={handleEditarFilho}
            permiteReplicacaoPaiEmItens={(campo) => !COLUNAS_SEM_REPLICACAO_PEDIDO_ITEM.has(campo)}
            permiteReplicacaoFilhoEmSubfilhos={(filho, campo) =>
              filho.camada === 'pedido' && !COLUNAS_SEM_REPLICACAO_PEDIDO_ITEM.has(campo)
            }
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            colunasPadrao={COLUNAS_PADRAO_VISIVEIS}
          />
        </div>
      </div>

      <ModalNovoProcessoManual
        aberto={modalNovoAberto}
        onFechar={() => setModalNovoAberto(false)}
        onCriar={handleCriarProcesso}
      />
      <ModalProcessoPlaceholder
        aberto={modalImportAberto}
        titulo="Importação via planilha"
        subtitulo="Excel, CSV ou XML"
        tipo="import"
        onFechar={() => setModalImportAberto(false)}
      />
      <ModalProcessoPlaceholder
        aberto={modalCockpitAberto}
        titulo="Integração via API"
        subtitulo="Cockpit ou ERP"
        tipo="api"
        onFechar={() => setModalCockpitAberto(false)}
      />
      {modalEdicaoMassaAberto && (
        <ModalEdicaoMassaProcesso
          aberto={modalEdicaoMassaAberto}
          processos={processosSelecionados}
          onFechar={() => setModalEdicaoMassaAberto(false)}
          onAplicar={handleEdicaoMassa}
        />
      )}
      {modalDuplicarAberto && (
        <ModalDuplicarProcesso
          aberto={modalDuplicarAberto}
          processos={processosSelecionados}
          onFechar={() => setModalDuplicarAberto(false)}
          onDuplicar={handleDuplicar}
        />
      )}
      {modalExcluirAberto && (
        <ModalExcluirProcesso
          aberto={modalExcluirAberto}
          processos={processosSelecionados}
          onFechar={() => setModalExcluirAberto(false)}
          onConfirmar={handleExcluirConfirmado}
        />
      )}
    </PaginaGlobal>
  )
}
