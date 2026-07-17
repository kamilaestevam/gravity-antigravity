/**
 * TabelaTransacoesLeituraSmartRead — lista hierárquica (leitura → documentos)
 * Padrão Pedido/BID: TabelaVirtualGlobal + colunas/filtros/export/painel persistido
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import '@nucleo/tabela-virtual-global/tabela-virtual.css'
import { Trash, CaretDoubleDown, CaretDoubleUp, X } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useShellStore } from '@gravity/shell'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  resolverOrigemProdutoFluxoSmartRead,
  salvarOrigemProdutoFluxoSmartRead,
} from '../shared/origem-produto-fluxo-smart-read'
import {
  FiltroChips,
  FiltroPopoverColuna,
  TabelaVirtualGlobal,
} from '@nucleo/tabela-virtual-global'
import type {
  FiltroAtivo,
  FiltrosAtivosMap,
  GTColuna,
  GTPreferencias,
  GTVirtualHandle,
} from '@nucleo/tabela-virtual-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { BotaoNovoListaSmartRead } from './botao-novo-lista-smart-read'
import { SmartReadListaPainelBar } from './SmartReadListaPainelBar'
import { ModalNovaLeituraSmartRead } from './nova-leitura-smart-read/modal-nova-leitura-smart-read'
import { montarAcoesExportacaoListaSmartRead } from '../shared/acoes-exportacao-lista-smart-read'
import {
  COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ,
  criarColunasListaLeituraSmartRead,
  criarMapaColunasDocumentoLeitura,
  formatarValorExportColunaLeituraSmartRead,
} from '../shared/colunas-lista-leitura-smart-read'
import {
  criarColunasPersonalizadasListaLeituraSmartRead,
  criarMapaColunasPersonalizadasDocumentoLeitura,
  ehColunaPersonalizadaListaLeituraSmartRead,
  mesclarColunasPersonalizadasNasPreferenciasLista,
  valorColunaPersonalizadaSalvoEhVazio,
} from '../shared/colunas-personalizadas-lista-smart-read'
import { useColunasPersonalizadasSmartRead } from '../shared/use-colunas-personalizadas-smart-read'
import type { TipoColunaSmartRead } from '../components/ModalNovaColunaSmartRead'
import {
  enriquecerComColunasPersonalizadas,
  enriquecerListaComColunasPersonalizadas,
  salvarValorColunaPersonalizadaLeitura,
} from '../shared/persistencia-valores-colunas-personalizadas-smart-read'
import { normalizarDataSomenteDiaLeitura } from '../shared/formatacao-leitura-smart-read'
import {
  filtrarTransacoesListaSmartRead,
  valoresUnicosColunaTransacao,
} from '../shared/filtrar-transacoes-lista-smart-read'
import {
  montarDocumentosLeituraLista,
  type DocumentoLeituraLista,
} from '../shared/montar-documentos-leitura-smart-read'
import { smartReadApi } from '../shared/api'
import type { TransacaoLeitura } from '../shared/schemas'
import { resolverPassoRetomarDaListaSmartRead } from '../../../shared/resolver-passo-retomar-da-lista-smart-read'
import type { HintRetomarLeituraListaSmartRead } from '../../../shared/hint-retomar-leitura-lista-smart-read'
import {
  useListaPainelSmartRead,
  type AplicarConfigListaPainelCallbacks,
  type EstadoListaParaPainel,
} from '../shared/use-lista-painel-smart-read'
import type { SegmentoListaLeitura } from '../shared/use-transacoes-leitura-smart-read'
import { useConfiguracaoTabelaSmartRead } from '../shared/use-configuracao-tabela-smart-read'
import { NOME_PRODUTO_EXIBICAO } from '../shared/marca-smart-docs'
import '../shared/smart-read-lista-layout.css'

type TransacaoLeituraLista = TransacaoLeitura & {
  _colunas_personalizadas: Record<string, string>
}

type DocumentoLeituraListaEnriquecido = DocumentoLeituraLista & {
  _colunas_personalizadas: Record<string, string>
}

function normalizarValorSalvoColunaPersonalizada(
  valor: unknown,
  tipo?: TipoColunaSmartRead,
): string {
  if (valor == null) return ''
  if (tipo === 'checkbox') {
    if (valor === true || valor === 'true') return 'true'
    if (valor === false || valor === 'false') return 'false'
  }
  if (tipo === 'numero' || tipo === 'percentual') {
    const num = Number(valor)
    return Number.isFinite(num) ? String(num) : ''
  }
  if (tipo === 'data') return normalizarDataSomenteDiaLeitura(valor)
  return String(valor).trim()
}

type Props = {
  transacoes: TransacaoLeitura[]
  total: number
  pagina: number
  carregando: boolean
  erro: string | null
  termoBusca: string
  onBuscar: (termo: string) => void
  onRecarregar: () => void
  onPaginaChange: (pagina: number) => void
  tituloPainel?: string
  /** Segmento ativo — persistido no painel; UI das abas fica em ListaLeituraSmartRead */
  segmento?: SegmentoListaLeitura
  onSegmentoChange?: (segmento: SegmentoListaLeitura) => void
}

function detectarTipoColunaListaSmartRead(col: GTColuna<TransacaoLeitura>): 'texto' | 'enum' | 'numero' {
  if (col.tipo === 'numero') return 'numero'
  if (col.key === 'status_fluxo_leitura') return 'enum'
  if (typeof col.key === 'string' && ehColunaPersonalizadaListaLeituraSmartRead(col.key)) {
    return col.tipo === 'numero' ? 'numero' : 'texto'
  }
  return 'texto'
}

export function TabelaTransacoesLeituraSmartRead({
  transacoes,
  total,
  pagina,
  carregando,
  erro,
  termoBusca,
  onBuscar,
  onRecarregar,
  onPaginaChange,
  tituloPainel = 'Envios',
  segmento = 'envios',
  onSegmentoChange,
}: Props) {
  const { t } = useTranslation()
  const { linhasPagina, densidade } = useConfiguracaoTabelaSmartRead()
  const addNotification = useShellStore((s) => s.addNotification)
  const tabelaRef = useRef<GTVirtualHandle>(null)
  const painelAplicadoRef = useRef<string | null>(null)

  const {
    paineis,
    setPaineis,
    painelAtual,
    painelAtualId,
    setPainelAtualId,
    carregando: carregandoPaineis,
    aplicarConfigDoPainel,
    persistirPainelAtual,
    persistirPainelAtualImediato,
    criarPainel,
    trocarPainel,
  } = useListaPainelSmartRead()

  const { colunasAtivas: colunasPersonalizadasAtivas } = useColunasPersonalizadasSmartRead()
  const filhosPorIdRef = useRef<Map<string, DocumentoLeituraListaEnriquecido>>(new Map())

  const [transacoesLista, setTransacoesLista] = useState<TransacaoLeituraLista[]>(() =>
    enriquecerListaComColunasPersonalizadas(transacoes),
  )

  useEffect(() => {
    setTransacoesLista(enriquecerListaComColunasPersonalizadas(transacoes))
  }, [transacoes])

  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(undefined)
  const [filtrosAtivosLista, setFiltrosAtivosLista] = useState<FiltrosAtivosMap>({})
  const [popoverFiltroAberto, setPopoverFiltroAberto] = useState<string | null>(null)
  const [popoverFiltroPos, setPopoverFiltroPos] = useState<{ top: number; left: number } | null>(null)

  const [leiturasSelecionadas, setLeiturasSelecionadas] = useState<TransacaoLeitura[]>([])
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [modalNovaLeituraAberto, setModalNovaLeituraAberto] = useState(false)
  const [arquivosNovaLeitura, setArquivosNovaLeitura] = useState<File[]>([])
  const [idLeituraExistente, setIdLeituraExistente] = useState<string | null>(null)
  const [passoRetomarLista, setPassoRetomarLista] = useState<number | null>(null)
  const [hintRetomarLista, setHintRetomarLista] = useState<HintRetomarLeituraListaSmartRead | null>(null)
  const [temExpandido, setTemExpandido] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const origemProduto = resolverOrigemProdutoFluxoSmartRead(searchParams.get('origem'))
  const origemPedido = origemProduto === 'pedido'
  const origemBidFrete = origemProduto === 'bid-frete-internacional'
  const idBidOrigem = searchParams.get('id_bid')

  useEffect(() => {
    const origem = searchParams.get('origem')
    if (origem === 'pedido' || origem === 'bid-frete-internacional') {
      salvarOrigemProdutoFluxoSmartRead(origem)
    }
    const abreNovaLeitura =
      searchParams.get('acao') === 'nova-leitura'
      && (origem === 'pedido' || origem === 'bid-frete-internacional')
    if (!abreNovaLeitura) return
    setModalNovaLeituraAberto(true)
    const next = new URLSearchParams(searchParams)
    next.delete('acao')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const handleExpandidosMudar = useCallback((count: number) => {
    setTemExpandido(count > 0)
  }, [])

  const filtrosAtivosKeys = useMemo(
    () => new Set(Object.keys(filtrosAtivosLista)),
    [filtrosAtivosLista],
  )

  const montarEstadoPainel = useCallback((): EstadoListaParaPainel => ({
    preferencias,
    abaAtiva: segmento,
    sortCampo: 'data_envio',
    sortDir: 'desc',
    busca: termoBusca,
    filtrosAtivos: filtrosAtivosLista,
  }), [preferencias, termoBusca, filtrosAtivosLista, segmento])

  const listaPainelCallbacks = useMemo((): AplicarConfigListaPainelCallbacks => ({
    setPreferencias,
    setAbaAtiva: (aba) => {
      if (aba === 'envios' || aba === 'transacoes-api') {
        onSegmentoChange?.(aba)
      }
    },
    setSortCampo: () => undefined,
    setSortDir: () => undefined,
    setBusca: (busca) => {
      if (busca !== termoBusca) onBuscar(busca)
    },
    setFiltrosAtivos: setFiltrosAtivosLista,
  }), [onBuscar, onSegmentoChange, termoBusca])

  const handleTrocarPainelLista = useCallback((id: string) => {
    painelAplicadoRef.current = null
    void trocarPainel(id, montarEstadoPainel(), listaPainelCallbacks)
  }, [trocarPainel, montarEstadoPainel, listaPainelCallbacks])

  const handleCriarPainelLista = useCallback(async (nome: string): Promise<boolean> => {
    painelAplicadoRef.current = null
    try {
      const criado = await criarPainel(nome, montarEstadoPainel(), listaPainelCallbacks)
      if (!criado) {
        addNotification({
          type: 'error',
          message: t('smart_read.lista.painel_criado_erro', {
            defaultValue: 'Não foi possível salvar o painel.',
          }),
        })
        return false
      }
      addNotification({
        type: 'success',
        message: t('smart_read.lista.painel_criado_sucesso', {
          defaultValue: 'Painel "{{nome}}" criado.',
          nome: criado.nome,
        }),
      })
      return true
    } catch {
      addNotification({
        type: 'error',
        message: t('smart_read.lista.painel_criado_erro', {
          defaultValue: 'Não foi possível salvar o painel.',
        }),
      })
      return false
    }
  }, [criarPainel, montarEstadoPainel, listaPainelCallbacks, addNotification, t])

  useEffect(() => {
    if (!painelAtual || carregandoPaineis) return
    if (painelAplicadoRef.current === painelAtual.id) return
    painelAplicadoRef.current = painelAtual.id
    aplicarConfigDoPainel(painelAtual, listaPainelCallbacks)
  }, [painelAtual, carregandoPaineis, aplicarConfigDoPainel, listaPainelCallbacks])

  useEffect(() => {
    if (colunasPersonalizadasAtivas.length === 0) return
    setPreferencias((prev) =>
      mesclarColunasPersonalizadasNasPreferenciasLista(colunasPersonalizadasAtivas, prev),
    )
  }, [colunasPersonalizadasAtivas, painelAtualId])

  useEffect(() => {
    if (!painelAtualId || carregandoPaineis) return
    persistirPainelAtual(montarEstadoPainel())
  }, [painelAtualId, carregandoPaineis, montarEstadoPainel, persistirPainelAtual, filtrosAtivosLista, termoBusca])

  const itemId = useCallback((item: TransacaoLeitura) => item.id_leitura, [])
  const filhoId = useCallback((item: DocumentoLeituraLista) => item.id_documento_leitura, [])

  const montarHintRetomarLista = useCallback(
    (item: TransacaoLeitura): HintRetomarLeituraListaSmartRead => ({
      nome_arquivo: item.nome_arquivo,
      nome_leitura: item.nome_leitura,
      total_arquivos: item.total_arquivos,
      status_leitura: item.status_leitura,
      status_fluxo_leitura: item.status_fluxo_leitura,
      passo_retomar: resolverPassoRetomarDaListaSmartRead(item),
    }),
    [],
  )

  const abrirLeituraExistente = useCallback(
    (
      idLeitura: string,
      passoAtual: number | null = null,
      hint: HintRetomarLeituraListaSmartRead | null = null,
    ) => {
      setArquivosNovaLeitura([])
      setIdLeituraExistente(idLeitura)
      setPassoRetomarLista(passoAtual)
      setHintRetomarLista(hint)
      setModalNovaLeituraAberto(true)
    },
    [],
  )

  const abrirLeituraDaTransacao = useCallback(
    (item: TransacaoLeitura) => {
      const hint = montarHintRetomarLista(item)
      abrirLeituraExistente(item.id_leitura, hint.passo_retomar ?? null, hint)
    },
    [abrirLeituraExistente, montarHintRetomarLista],
  )

  const abrirLeituraDoDocumento = useCallback(
    (item: DocumentoLeituraLista) => {
      const pai = transacoes.find((t) => t.id_leitura === item.id_leitura)
      if (!pai) {
        abrirLeituraExistente(item.id_leitura, 2, null)
        return
      }
      const hint = montarHintRetomarLista(pai)
      abrirLeituraExistente(item.id_leitura, hint.passo_retomar ?? null, hint)
    },
    [abrirLeituraExistente, montarHintRetomarLista, transacoes],
  )

  const colunas = useMemo(
    () => [
      ...criarColunasListaLeituraSmartRead(abrirLeituraDaTransacao),
      ...criarColunasPersonalizadasListaLeituraSmartRead(colunasPersonalizadasAtivas),
    ],
    [abrirLeituraDaTransacao, colunasPersonalizadasAtivas],
  )
  const mapaColunasFilho = useMemo(
    () => ({
      ...criarMapaColunasDocumentoLeitura(abrirLeituraDoDocumento),
      ...criarMapaColunasPersonalizadasDocumentoLeitura(colunasPersonalizadasAtivas),
    }),
    [abrirLeituraDoDocumento, colunasPersonalizadasAtivas],
  )

  const transacoesFiltradas = useMemo(
    () => filtrarTransacoesListaSmartRead(transacoesLista, filtrosAtivosLista),
    [transacoesLista, filtrosAtivosLista],
  )

  const handleEditarColunaPersonalizada = useCallback(
    async (id: string, campo: string, valor: unknown): Promise<TransacaoLeituraLista> => {
      if (!ehColunaPersonalizadaListaLeituraSmartRead(campo)) {
        throw new Error('Coluna não editável.')
      }
      const item = transacoesLista.find((t) => t.id_leitura === id)
      if (!item) throw new Error('Leitura não encontrada.')
      const colDef = colunasPersonalizadasAtivas.find((c) => c.id === campo)
      const valorNormalizado = normalizarValorSalvoColunaPersonalizada(valor, colDef?.tipo)
      if (colDef?.obrigatorio && valorColunaPersonalizadaSalvoEhVazio(valorNormalizado, colDef.tipo)) {
        throw new Error(`O campo "${colDef.nome}" é obrigatório.`)
      }
      const colunasAtualizadas = salvarValorColunaPersonalizadaLeitura(
        id,
        campo,
        valorNormalizado,
      )
      const atualizado: TransacaoLeituraLista = {
        ...item,
        _colunas_personalizadas: colunasAtualizadas,
      }
      setTransacoesLista((prev) =>
        prev.map((t) => (t.id_leitura === id ? atualizado : t)),
      )
      return atualizado
    },
    [transacoesLista, colunasPersonalizadasAtivas],
  )

  const handleEditarFilhoColunaPersonalizada = useCallback(
    async (id: string, campo: string, valor: unknown): Promise<DocumentoLeituraListaEnriquecido> => {
      if (!ehColunaPersonalizadaListaLeituraSmartRead(campo)) {
        throw new Error('Coluna não editável.')
      }
      const filho = filhosPorIdRef.current.get(id)
      if (!filho) throw new Error('Documento não encontrado.')
      const colDef = colunasPersonalizadasAtivas.find((c) => c.id === campo)
      const valorNormalizado = normalizarValorSalvoColunaPersonalizada(valor, colDef?.tipo)
      if (colDef?.obrigatorio && valorColunaPersonalizadaSalvoEhVazio(valorNormalizado, colDef.tipo)) {
        throw new Error(`O campo "${colDef.nome}" é obrigatório.`)
      }
      const colunasAtualizadas = salvarValorColunaPersonalizadaLeitura(
        filho.id_leitura,
        campo,
        valorNormalizado,
      )
      const atualizado: DocumentoLeituraListaEnriquecido = {
        ...filho,
        _colunas_personalizadas: colunasAtualizadas,
      }
      filhosPorIdRef.current.set(id, atualizado)
      setTransacoesLista((prev) =>
        prev.map((t) =>
          t.id_leitura === filho.id_leitura
            ? { ...t, _colunas_personalizadas: colunasAtualizadas }
            : t,
        ),
      )
      return atualizado
    },
    [colunasPersonalizadasAtivas],
  )

  const handleCarregarFilhos = useCallback(async (leitura: TransacaoLeitura) => {
    const detalhe = await smartReadApi.obterLeitura(leitura.id_leitura)
    const documentos = enriquecerListaComColunasPersonalizadas(
      montarDocumentosLeituraLista(detalhe),
    )
    for (const doc of documentos) {
      filhosPorIdRef.current.set(doc.id_documento_leitura, doc)
    }
    return documentos
  }, [])

  const chavesColunasPersonalizadasEditaveis = useMemo(
    () => colunasPersonalizadasAtivas.map((c) => c.id),
    [colunasPersonalizadasAtivas],
  )

  const totalArquivosRodape = useMemo(
    () => transacoesFiltradas.reduce((soma, item) => soma + (item.total_arquivos ?? 0), 0),
    [transacoesFiltradas],
  )

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    if (painelAtualId) {
      persistirPainelAtualImediato({
        preferencias: prefs,
        abaAtiva: segmento,
        sortCampo: 'data_envio',
        sortDir: 'desc',
        busca: termoBusca,
        filtrosAtivos: filtrosAtivosLista,
      })
    }
  }, [painelAtualId, persistirPainelAtualImediato, termoBusca, filtrosAtivosLista, segmento])

  const onFiltroColuna = useCallback((key: string, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    setPopoverFiltroPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX })
    setPopoverFiltroAberto(key)
  }, [])

  const handleAplicarFiltroColuna = useCallback((campo: string, filtro: FiltroAtivo) => {
    setFiltrosAtivosLista((prev) => ({ ...prev, [campo]: filtro }))
    setPopoverFiltroAberto(null)
    if (painelAtualId) {
      persistirPainelAtualImediato({
        ...montarEstadoPainel(),
        filtrosAtivos: { ...filtrosAtivosLista, [campo]: filtro },
      })
    }
  }, [painelAtualId, persistirPainelAtualImediato, montarEstadoPainel, filtrosAtivosLista])

  const handleLimparFiltroColuna = useCallback((campo: string) => {
    setFiltrosAtivosLista((prev) => {
      const next = { ...prev }
      delete next[campo]
      return next
    })
    setPopoverFiltroAberto(null)
    if (painelAtualId) {
      const next = { ...filtrosAtivosLista }
      delete next[campo]
      persistirPainelAtualImediato({ ...montarEstadoPainel(), filtrosAtivos: next })
    }
  }, [painelAtualId, persistirPainelAtualImediato, montarEstadoPainel, filtrosAtivosLista])

  const handleLimparTodosFiltrosColuna = useCallback(() => {
    setFiltrosAtivosLista({})
    if (termoBusca.trim()) onBuscar('')
    if (painelAtualId) {
      persistirPainelAtualImediato({
        preferencias,
        abaAtiva: segmento,
        sortCampo: 'data_envio',
        sortDir: 'desc',
        busca: '',
        filtrosAtivos: {},
      })
    }
  }, [onBuscar, painelAtualId, persistirPainelAtualImediato, preferencias, segmento, termoBusca])

  const acoesExportacao = useMemo(
    () => montarAcoesExportacaoListaSmartRead({
      colunas,
      preferencias,
      colunasPadrao: [...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ],
      dados: transacoesFiltradas,
      formatValorExport: formatarValorExportColunaLeituraSmartRead,
      nomeArquivo: 'smart-read-leituras',
      titulo: `Lista ${tituloPainel} — ${NOME_PRODUTO_EXIBICAO}`,
    }),
    [colunas, preferencias, transacoesFiltradas, tituloPainel],
  )

  const handleConfirmarExclusao = useCallback(async () => {
    if (leiturasSelecionadas.length === 0) return
    setExcluindo(true)
    try {
      const resultados = await Promise.allSettled(
        leiturasSelecionadas.map((item) => smartReadApi.excluirLeitura(item.id_leitura)),
      )
      const falhas = resultados.filter((r) => r.status === 'rejected')
      const sucesso = resultados.length - falhas.length
      if (sucesso > 0) {
        addNotification({
          type: 'success',
          message:
            sucesso === 1
              ? 'Leitura excluída com sucesso.'
              : `${sucesso} leituras excluídas com sucesso.`,
        })
        setLeiturasSelecionadas([])
        onRecarregar()
      }
      if (falhas.length > 0) {
        const mensagem =
          falhas[0].status === 'rejected' && falhas[0].reason instanceof Error
            ? falhas[0].reason.message
            : 'Não foi possível excluir uma ou mais leituras.'
        addNotification({ type: 'error', message: mensagem })
        if (sucesso === 0) {
          throw new Error(mensagem)
        }
      }
    } finally {
      setExcluindo(false)
    }
  }, [addNotification, leiturasSelecionadas, onRecarregar])

  const exclusaoModalTitulo = useMemo(() => {
    const quantidade = leiturasSelecionadas.length
    return quantidade === 1
      ? 'Excluir 1 leitura selecionada?'
      : `Excluir ${quantidade} leituras selecionadas?`
  }, [leiturasSelecionadas.length])

  const exclusaoModalNomeItem = useMemo(() => {
    if (leiturasSelecionadas.length === 0) return undefined
    return leiturasSelecionadas
      .map((item) => item.nome_leitura?.trim() || `Leitura ${item.id_leitura}`)
      .join(', ')
  }, [leiturasSelecionadas])

  const abrirNovaLeitura = useCallback((arquivos: File[] = []) => {
    setIdLeituraExistente(null)
    setArquivosNovaLeitura(arquivos)
    setModalNovaLeituraAberto(true)
  }, [])

  const acoesBarra = useMemo(
    () => (
      <div className="sr-lista-acoes-barra">
        <TooltipGlobal
          descricao={temExpandido ? 'Recolher tudo' : 'Expandir tudo'}
        >
          <button
            type="button"
            className="sr-btn-expandir-todos"
            onClick={() => {
              if (temExpandido) tabelaRef.current?.recolherTodos()
              else void tabelaRef.current?.expandirTodos()
            }}
            aria-label={temExpandido ? 'Recolher tudo' : 'Expandir tudo'}
          >
            {temExpandido
              ? <CaretDoubleUp size={14} weight="bold" />
              : <CaretDoubleDown size={14} weight="bold" />}
          </button>
        </TooltipGlobal>

        <BotaoNovoListaSmartRead onAbrirNovaLeitura={() => abrirNovaLeitura()} />

        <TooltipGlobal
          titulo={
            leiturasSelecionadas.length > 0
              ? `Excluir · ${leiturasSelecionadas.length} leitura(s)`
              : 'Excluir'
          }
          descricao={`Remove as leituras selecionadas do ${NOME_PRODUTO_EXIBICAO}`}
        >
          <BotaoGlobal
            variante="perigo"
            tamanho="pequeno"
            icone={<Trash size={14} weight="duotone" />}
            aria-label="Excluir leituras selecionadas"
            disabled={leiturasSelecionadas.length === 0 || excluindo}
            onClick={() => setModalExcluirAberto(true)}
          />
        </TooltipGlobal>

        {(Object.keys(filtrosAtivosLista).length > 0 || termoBusca.trim()) && (
          <div className="sr-lista-acoes-barra__chips">
            <FiltroChips
              colunas={colunas}
              filtrosAtivos={filtrosAtivosLista}
              onLimparFiltro={handleLimparFiltroColuna}
              onLimparTodos={handleLimparTodosFiltrosColuna}
              onEditarFiltro={onFiltroColuna}
              thresholdConsolidar={2}
              prefixo={termoBusca.trim() ? (
                <span className="fc-chip">
                  <span className="fc-chip-label">
                    {t('smart_read.lista.chip_busca', { defaultValue: 'Busca' })}:
                  </span>
                  <span className="fc-chip-valor">{termoBusca}</span>
                  <button
                    type="button"
                    className="fc-chip-remove"
                    onClick={() => onBuscar('')}
                    aria-label={t('smart_read.lista.remover_busca', { defaultValue: 'Remover busca' })}
                  >
                    <X size={10} weight="bold" />
                  </button>
                </span>
              ) : null}
            />
          </div>
        )}
      </div>
    ),
    [
      abrirNovaLeitura,
      colunas,
      excluindo,
      filtrosAtivosLista,
      handleLimparFiltroColuna,
      handleLimparTodosFiltrosColuna,
      leiturasSelecionadas.length,
      onBuscar,
      onFiltroColuna,
      t,
      temExpandido,
      termoBusca,
    ],
  )

  const colunaFiltroAberta = popoverFiltroAberto
    ? colunas.find((c) => c.key === popoverFiltroAberto)
    : undefined

  return (
    <section className={`sr-painel sr-painel--tabela${densidade === 'compacto' ? ' sr-painel--compacto' : ''}`}>
      {erro && (
        <div className="sr-erro" role="alert">
          {erro}
        </div>
      )}

      {popoverFiltroAberto && colunaFiltroAberta?.key && popoverFiltroPos && (
        <FiltroPopoverColuna
          campo={String(colunaFiltroAberta.key)}
          label={colunaFiltroAberta.label}
          tipo={detectarTipoColunaListaSmartRead(colunaFiltroAberta)}
          filtroAtual={filtrosAtivosLista[String(colunaFiltroAberta.key)]}
          valoresUnicos={valoresUnicosColunaTransacao(transacoes, String(colunaFiltroAberta.key))}
          onAplicar={handleAplicarFiltroColuna}
          onLimpar={handleLimparFiltroColuna}
          onFechar={() => setPopoverFiltroAberto(null)}
          anchorPos={popoverFiltroPos}
        />
      )}

      <div className="lp-tabela-chrome">
        <nav
          className="lp-faixa-navegacao"
          aria-label={t('smart_read.lista.paineis_secao', { defaultValue: 'Painéis da lista' })}
          data-testid="lista-faixa-navegacao"
        >
          <section
            className="lp-faixa-navegacao__paineis"
            aria-label={t('smart_read.lista.paineis_secao', { defaultValue: 'Painéis da lista' })}
          >
            <SmartReadListaPainelBar
              paineis={paineis}
              painelAtualId={painelAtualId}
              setPaineis={setPaineis}
              setPainelAtualId={setPainelAtualId}
              onTrocarPainel={handleTrocarPainelLista}
              onCriarPainel={handleCriarPainelLista}
              carregando={carregandoPaineis}
              variant="unificado"
            />
          </section>
        </nav>

        <TabelaVirtualGlobal<TransacaoLeitura, DocumentoLeituraLista>
        imperativeRef={tabelaRef}
        dados={transacoesFiltradas}
        colunas={colunas}
        itemId={itemId}
        mapaColunasFilho={mapaColunasFilho}
        onCarregarFilhos={handleCarregarFilhos}
        onExpandidosMudar={handleExpandidosMudar}
        filhoId={filhoId}
        labelPai={['leitura', 'leituras']}
        labelFilho={['arquivo', 'arquivos']}
        itensPorPagina={linhasPagina}
        totalItens={Object.keys(filtrosAtivosLista).length > 0 ? transacoesFiltradas.length : total}
        totalFilhos={totalArquivosRodape}
        paginaAtual={pagina}
        onMudarPagina={onPaginaChange}
        carregando={carregando || carregandoPaineis}
        acoesBarra={acoesBarra}
        acoesExportacao={acoesExportacao}
        onSelecaoMudar={setLeiturasSelecionadas}
        onBuscar={onBuscar}
        onFiltroColuna={onFiltroColuna}
        filtrosAtivosKeys={filtrosAtivosKeys}
        onEditar={handleEditarColunaPersonalizada}
        onEditarFilho={handleEditarFilhoColunaPersonalizada}
        camposEditaveisFilhos={chavesColunasPersonalizadasEditaveis}
        preferencias={preferencias}
        onSalvarPreferencias={handleSalvarPreferencias}
        colunasPadrao={[...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ]}
        placeholderBusca="Localizar…"
        distribuirLarguraColunas
        ariaLabel={`Lista de ${tituloPainel} ${NOME_PRODUTO_EXIBICAO}`}
        emptyTitle={
          tituloPainel === 'Transações API' ? 'Nenhuma transação API encontrada' : 'Nenhum envio encontrado'
        }
        emptyDescription={
          termoBusca.trim() || Object.keys(filtrosAtivosLista).length > 0
            ? 'Nenhuma leitura corresponde à busca ou aos filtros.'
            : tituloPainel === 'Transações API'
              ? 'Envios feitos via API Cockpit aparecem aqui quando o legado marca source como API.'
              : undefined
        }
        classNameLinhaFilho={() => 'sr-linha-documento'}
      />
      </div>

      <ModalNovaLeituraSmartRead
        aberto={modalNovaLeituraAberto}
        arquivosIniciais={arquivosNovaLeitura}
        idLeituraExistente={idLeituraExistente}
        passoRetomarLista={passoRetomarLista}
        hintRetomarLista={hintRetomarLista}
        origemPedido={origemPedido}
        origemBidFrete={origemBidFrete}
        idBidOrigem={idBidOrigem}
        onFechar={() => {
          setModalNovaLeituraAberto(false)
          setArquivosNovaLeitura([])
          setIdLeituraExistente(null)
          setPassoRetomarLista(null)
          setHintRetomarLista(null)
          void onRecarregar()
        }}
        onConcluido={() => void onRecarregar()}
      />

      <ModalConfirmarExcluirGlobal
        aberto={modalExcluirAberto}
        titulo={exclusaoModalTitulo}
        descricao={`Remove a leitura e os documentos processados no ${NOME_PRODUTO_EXIBICAO}.`}
        nomeItem={exclusaoModalNomeItem}
        aoConfirmar={handleConfirmarExclusao}
        aoCancelar={() => {
          if (!excluindo) setModalExcluirAberto(false)
        }}
      />
    </section>
  )
}
