/**
 * ProcessoLista.tsx — Tabela 01: Processo → Pedido → Item (3 camadas).
 * Onda 2 — colunas Processo (avô) + paridade Pedido (pai/item).
 */
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Briefcase, DownloadSimple, Eye, FilePdf, Plus } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  TabelaVirtualGlobal,
  type GTAcao,
  type GTAcaoExport,
  type GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import { buildColunasListaProcesso, chavesColunasAvo } from '../components/lista/buildColunasListaProcesso'
import { buildColunasPai, type OpcoesUnidadesColunas } from '../components/lista/ColunasPai'
import { buildMapaColunasFilhoLista } from '../components/lista/mapaColunasFilhoLista'
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
import {
  CAMPOS_EDITAVEIS_PEDIDO,
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
import type { Pedido, PedidoItem } from '../shared/lista/pedidoTypes'
import { isCampoLogisticaPedido, normalizarCodigoLogisticaPedido } from '../shared/lista/camposLogisticaPedido'
import { TodosProcessosTabs } from './todos/TodosProcessosTabs'
import './todos/TodosProcessos.css'
import './ProcessoLista.css'

function normalizarValorEdicao(valor: unknown): unknown {
  if (valor != null && typeof valor === 'object') {
    if ('amount' in (valor as object)) return (valor as { amount: unknown }).amount
    if ('valor' in (valor as object)) return (valor as { valor: unknown }).valor
  }
  return valor
}

function parseIdFilhoLinha(idLinha: string): { camada: 'pedido' | 'item'; id: string } | null {
  if (idLinha.startsWith('ped-')) return { camada: 'pedido', id: idLinha.slice(4) }
  if (idLinha.startsWith('item-')) return { camada: 'item', id: idLinha.slice(5) }
  return null
}

export default function ProcessoLista() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
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

  const { unidadesPeso, unidadesCubagem } = useUnidadesPedido()
  const {
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
  } = useLogisticaCadastrosPedido()

  const opcoesColunas = useMemo<OpcoesUnidadesColunas>(() => ({
    unidadesPeso,
    unidadesCubagem,
    incotermsOpcoes: [],
    moedasOpcoes: [],
    workspacesMap: new Map(),
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
  }), [unidadesPeso, unidadesCubagem, paisesOpcoes, portosOpcoes, aeroportosOpcoes])

  const resolverPedido = useCallback(
    (id_pedido: string) => pedidos.find(p => p.id === id_pedido),
    [pedidos],
  )

  const colunasPedido = useMemo(
    () => buildColunasPai(t, opcoesColunas),
    [t, i18n.language, opcoesColunas],
  )

  const colunas = useMemo(
    () => buildColunasListaProcesso(t, opcoesColunas),
    [t, i18n.language, opcoesColunas],
  )

  const chavesAvo = useMemo(() => chavesColunasAvo(t), [t, i18n.language])

  const mapaColunasFilho = useMemo(
    () => buildMapaColunasFilhoLista(chavesAvo, colunasPedido, opcoesColunas, resolverPedido),
    [chavesAvo, colunasPedido, opcoesColunas, resolverPedido],
  )

  const buscaNorm = busca.trim().toLowerCase()
  const processosFiltrados = useMemo(() => {
    if (!buscaNorm) return processos
    return processos.filter(p =>
      p.numero_processo.toLowerCase().includes(buscaNorm)
      || (p.referencia_interna_processo?.toLowerCase().includes(buscaNorm) ?? false)
      || p.nome_importador.toLowerCase().includes(buscaNorm)
      || p.nome_exportador.toLowerCase().includes(buscaNorm),
    )
  }, [buscaNorm, processos])

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
    return filhosVisiveisDoProcesso(processo.id_processo, pedidosExpandidos, pedidos, itens)
  }, [pedidosExpandidos, pedidos, itens])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    salvarPreferenciasColunasProcesso(prefs)
  }, [])

  const handleEditar = useCallback(async (
    id_processo: string,
    campo: string,
    valor: unknown,
  ): Promise<ProcessoAvoLinha> => {
    const v = normalizarValorEdicao(valor)
    let atualizado: ProcessoAvoLinha | undefined
    setProcessos(prev => prev.map(p => {
      if (p.id_processo !== id_processo) return p
      atualizado = { ...p, [campo]: v }
      return atualizado
    }))
    if (!atualizado) throw new Error('Processo não encontrado')
    return atualizado
  }, [])

  const handleEditarFilho = useCallback(async (
    idLinha: string,
    campo: string,
    valor: unknown,
  ): Promise<FilhoLinhaLista> => {
    const parsed = parseIdFilhoLinha(idLinha)
    if (!parsed) throw new Error('Linha filha não reconhecida')

    const v = isCampoLogisticaPedido(campo)
      ? normalizarCodigoLogisticaPedido(valor)
      : normalizarValorEdicao(valor)

    if (parsed.camada === 'pedido') {
      let pedidoAtualizado: (Pedido & { id_processo: string }) | undefined
      setPedidos(prev => prev.map(p => {
        if (p.id !== parsed.id) return p
        pedidoAtualizado = { ...p, [campo]: v }
        return pedidoAtualizado
      }))
      if (!pedidoAtualizado) throw new Error('Pedido não encontrado')
      setResetCacheFilhos(n => n + 1)
      return { camada: 'pedido', pedido: pedidoAtualizado }
    }

    const pedidoPai = pedidos.find(p => p.id === itens.find(i => i.id === parsed.id)?.pedido_id)

    if (isCampoLogisticaPedido(campo) && pedidoPai) {
      let pedidoAtualizado: (Pedido & { id_processo: string }) | undefined
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedidoPai.id) return p
        pedidoAtualizado = { ...p, [campo]: v }
        return pedidoAtualizado
      }))
      if (!pedidoAtualizado) throw new Error('Pedido não encontrado')
      setResetCacheFilhos(n => n + 1)
      const itemAtual = itens.find(i => i.id === parsed.id)
      if (!itemAtual) throw new Error('Item não encontrado')
      return { camada: 'item', item: itemAtual }
    }

    if (CAMPOS_EDITAVEIS_PEDIDO.includes(campo) && pedidoPai) {
      let pedidoAtualizado: (Pedido & { id_processo: string }) | undefined
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedidoPai.id) return p
        pedidoAtualizado = { ...p, [campo]: v }
        return pedidoAtualizado
      }))
      if (!pedidoAtualizado) throw new Error('Pedido não encontrado')
      setResetCacheFilhos(n => n + 1)
      const itemAtual = itens.find(i => i.id === parsed.id)
      if (!itemAtual) throw new Error('Item não encontrado')
      return { camada: 'item', item: itemAtual }
    }

    let itemAtualizado: PedidoItem | undefined
    setItens(prev => prev.map(i => {
      if (i.id !== parsed.id) return i
      if (campo === 'valor_total_item' && v != null && typeof v === 'object' && 'currency' in (v as object)) {
        const moeda = (v as { currency: string }).currency
        const amount = (v as { amount: unknown }).amount
        itemAtualizado = { ...i, valor_total_item: Number(amount), moeda_item: moeda }
        return itemAtualizado
      }
      itemAtualizado = { ...i, [campo]: v }
      return itemAtualizado
    }))
    if (!itemAtualizado) throw new Error('Item não encontrado')
    setResetCacheFilhos(n => n + 1)
    return { camada: 'item', item: itemAtualizado }
  }, [itens, pedidos])

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
      onClick: (p) => { void navigate(`${p.id_processo}/workflow`) },
    },
  ], [navigate])

  const renderConectorFilho = useCallback((filho: FilhoLinhaLista) => (
    <ConectorFilhoLista
      filho={filho}
      pedidosExpandidos={pedidosExpandidos}
      onTogglePedido={togglePedidoItens}
    />
  ), [pedidosExpandidos, togglePedidoItens])

  const classNameLinhaFilho = useCallback(
    (filho: FilhoLinhaLista) =>
      filho.camada === 'pedido' ? 'pl-linha--pedido' : 'pl-linha--item',
    [],
  )

  const camposEditaveisFilhos = useMemo(() => camposEditaveisFilhosLista(), [])

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Briefcase weight="duotone" size={22} />}
          titulo="Processos"
          subtitulo="Lista hierárquica — Processo, Pedido e Item"
          acoes={
            <BotaoGlobal variante="primario" icone={<Plus weight="bold" />} onClick={() => { /* Onda 3 */ }}>
              Novo processo
            </BotaoGlobal>
          }
        />
      }
      toolbar={<TodosProcessosTabs />}
    >
      <div
        className="lp-page pl-page"
        style={{ minHeight: 'calc(100vh - 320px)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="lp-tabela-wrapper">
          <TabelaVirtualGlobal<ProcessoAvoLinha, FilhoLinhaLista>
            exibirCabecalhoQuandoVazio
            dados={processosFiltrados}
            colunas={colunas}
            mapaColunasFilho={mapaColunasFilho}
            itemId={(p) => p.id_processo}
            filhoId={idFilhoLinha}
            onCarregarFilhos={handleCarregarFilhos}
            resetCacheFilhos={resetCacheFilhos}
            renderConectorFilho={renderConectorFilho}
            classNameLinhaFilho={classNameLinhaFilho}
            acoes={acoesProcesso}
            acoesExportacao={acoesExportacao}
            onBuscar={setBusca}
            placeholderBusca="Buscar processo, referência ou parte..."
            emptyIcon={<Briefcase weight="duotone" size={48} />}
            emptyTitle="Nenhum processo encontrado"
            emptyDescription="Ajuste a busca ou crie um novo processo"
            ariaLabel="Lista hierárquica de processos, pedidos e itens"
            itensPorPagina={25}
            camposEditaveis={CAMPOS_EDITAVEIS_PROCESSO}
            camposEditaveisFilhos={camposEditaveisFilhos}
            onEditar={handleEditar}
            onEditarFilho={handleEditarFilho}
            permiteReplicacaoPaiEmItens={(campo) => !COLUNAS_SEM_REPLICACAO_PEDIDO_ITEM.has(campo)}
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            colunasPadrao={COLUNAS_PADRAO_VISIVEIS}
          />
        </div>
      </div>
    </PaginaGlobal>
  )
}
