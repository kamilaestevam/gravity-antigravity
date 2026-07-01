/**
 * TabelaTransacoesLeituraSmartRead — lista hierárquica (leitura → documentos)
 * Padrão Pedido/BID: TabelaVirtualGlobal + colunas/filtros/export/painel persistido
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '@nucleo/tabela-virtual-global/tabela-virtual.css'
import { Trash, CaretDoubleDown, CaretDoubleUp } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useShellStore } from '@gravity/shell'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
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
  CAMPOS_EDITAVEIS_PAI_LISTA_SMART_READ,
  criarColunasListaLeituraSmartRead,
  criarMapaColunasDocumentoLeitura,
  formatarValorExportColunaLeituraSmartRead,
} from '../shared/colunas-lista-leitura-smart-read'
import {
  filtrarTransacoesListaSmartRead,
  valoresUnicosColunaTransacao,
} from '../shared/filtrar-transacoes-lista-smart-read'
import {
  montarDocumentosLeituraLista,
  type DocumentoLeituraLista,
} from '../shared/montar-documentos-leitura-smart-read'
import { CAMPOS_EDITAVEIS_FILHO_LISTA_SMART_READ } from '../shared/column-behavior-lista-smart-read'
import {
  buscarColunaCatalogoDocumentoSmartRead,
  normalizarValorSalvarColunaListaSmartRead,
} from '../shared/formatacao-coluna-lista-smart-read'
import { useMoedasSmartRead } from '../shared/use-moedas-smart-read'
import { parseIdDocumentoLeituraLista } from '../../../shared/lista-edicao-espelhada-smart-read'
import { smartReadApi } from '../shared/api'
import type { TransacaoLeitura } from '../shared/schemas'
import {
  useListaPainelSmartRead,
  type AplicarConfigListaPainelCallbacks,
  type EstadoListaParaPainel,
} from '../shared/use-lista-painel-smart-read'
import type { SegmentoListaLeitura } from '../shared/use-transacoes-leitura-smart-read'
import { NOME_PRODUTO_EXIBICAO } from '../shared/marca-smart-docs'
import '../shared/smart-read-lista-layout.css'

const ITENS_POR_PAGINA = 50
const PLACEHOLDER_DATA_LISTA_SMART_READ = 'DD/MM/AAAA'

type OverlayColunasPaiLeitura = {
  numeros_documento?: string | null
  valores_colunas: Record<string, string>
}

function normalizarValorCampoListaSmartRead(campo: string, valor: unknown): string {
  if (campo === 'numeros_documento') {
    return valor == null ? '' : String(valor).trim()
  }
  const coluna = buscarColunaCatalogoDocumentoSmartRead(campo)
  if (coluna) {
    return normalizarValorSalvarColunaListaSmartRead(coluna, valor)
  }
  return valor == null ? '' : String(valor).trim()
}

function extrairOverlayPaiDeDocumentos(
  documentos: DocumentoLeituraLista[],
): OverlayColunasPaiLeitura {
  const numeros = [
    ...new Set(
      documentos
        .map((doc) => doc.numero_documento?.trim())
        .filter((numero): numero is string => Boolean(numero)),
    ),
  ]
  const valores_colunas: Record<string, string> = {}
  const referencia = documentos[0]
  if (referencia) {
    for (const [chave, valor] of Object.entries(referencia.valores_colunas)) {
      if (valor?.trim()) valores_colunas[chave] = valor
    }
  }
  return {
    numeros_documento: numeros.length > 0 ? numeros.join(' · ') : null,
    valores_colunas,
  }
}

function documentoListaParaFilho(
  doc: DocumentoLeituraLista,
): DocumentoLeituraLista {
  return {
    ...doc,
    status_documento: doc.status_documento ?? 'COMPLETED',
    media_acertos: doc.media_acertos ?? null,
    data_envio: doc.data_envio ?? null,
  }
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
  if (col.key === 'status_leitura') return 'enum'
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
  const [temExpandido, setTemExpandido] = useState(false)
  const [resetCacheFilhos, setResetCacheFilhos] = useState(0)
  const [overlayColunasPai, setOverlayColunasPai] = useState<Record<string, OverlayColunasPaiLeitura>>({})

  const { moedasOpcoes } = useMoedasSmartRead()

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
    if (!painelAtualId || carregandoPaineis) return
    persistirPainelAtual(montarEstadoPainel())
  }, [painelAtualId, carregandoPaineis, montarEstadoPainel, persistirPainelAtual, filtrosAtivosLista, termoBusca])

  const itemId = useCallback((item: TransacaoLeitura) => item.id_leitura, [])
  const filhoId = useCallback((item: DocumentoLeituraLista) => item.id_documento_leitura, [])

  const abrirLeituraExistente = useCallback((idLeitura: string) => {
    setArquivosNovaLeitura([])
    setIdLeituraExistente(idLeitura)
    setModalNovaLeituraAberto(true)
  }, [])

  const getValorCatalogoPai = useCallback(
    (item: TransacaoLeitura, key: string) => overlayColunasPai[item.id_leitura]?.valores_colunas[key],
    [overlayColunasPai],
  )

  const colunas = useMemo(
    () => criarColunasListaLeituraSmartRead(
      (item) => abrirLeituraExistente(item.id_leitura),
      { opcoesMoedas: moedasOpcoes, getValorCatalogoPai },
    ),
    [abrirLeituraExistente, moedasOpcoes, getValorCatalogoPai],
  )
  const mapaColunasFilho = useMemo(
    () => criarMapaColunasDocumentoLeitura((item) => abrirLeituraExistente(item.id_leitura)),
    [abrirLeituraExistente],
  )

  const transacoesFiltradas = useMemo(
    () => filtrarTransacoesListaSmartRead(transacoes, filtrosAtivosLista),
    [transacoes, filtrosAtivosLista],
  )

  const transacoesExibicao = useMemo(
    () => transacoesFiltradas.map((item) => {
      const overlay = overlayColunasPai[item.id_leitura]
      if (!overlay) return item
      return {
        ...item,
        numeros_documento: overlay.numeros_documento ?? item.numeros_documento,
      }
    }),
    [transacoesFiltradas, overlayColunasPai],
  )

  const totalArquivosRodape = useMemo(
    () => transacoesExibicao.reduce((soma, item) => soma + (item.total_arquivos ?? 0), 0),
    [transacoesExibicao],
  )

  const aplicarOverlayAposEdicao = useCallback((
    idLeitura: string,
    documentosAtualizados: DocumentoLeituraLista[],
  ) => {
    if (documentosAtualizados.length === 0) return
    const overlay = extrairOverlayPaiDeDocumentos(documentosAtualizados)
    setOverlayColunasPai((prev) => ({
      ...prev,
      [idLeitura]: {
        numeros_documento: overlay.numeros_documento,
        valores_colunas: {
          ...(prev[idLeitura]?.valores_colunas ?? {}),
          ...overlay.valores_colunas,
        },
      },
    }))
    if (documentosAtualizados.length > 1) {
      setResetCacheFilhos((valor) => valor + 1)
    }
  }, [])

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

  const acoesExportacao = useMemo(
    () => montarAcoesExportacaoListaSmartRead({
      colunas,
      preferencias,
      colunasPadrao: [...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ],
      dados: transacoesExibicao,
      formatValorExport: formatarValorExportColunaLeituraSmartRead,
      nomeArquivo: 'smart-read-leituras',
      titulo: `Lista ${tituloPainel} — ${NOME_PRODUTO_EXIBICAO}`,
    }),
    [colunas, preferencias, transacoesExibicao, tituloPainel],
  )

  const handleCarregarFilhos = useCallback(async (leitura: TransacaoLeitura) => {
    const detalhe = await smartReadApi.obterLeitura(leitura.id_leitura)
    return montarDocumentosLeituraLista(detalhe)
  }, [])

  const handleEditarFilho = useCallback(async (
    idDocumento: string,
    campo: string,
    valor: unknown,
  ): Promise<DocumentoLeituraLista> => {
    const parseado = parseIdDocumentoLeituraLista(idDocumento)
    if (!parseado || parseado.indice_extracao == null) {
      throw new Error('Documento inválido para edição na lista')
    }

    const valorTexto = normalizarValorCampoListaSmartRead(campo, valor)
    const resposta = await smartReadApi.editarCampoDocumentoLista(
      parseado.id_leitura,
      {
        id_arquivo: parseado.id_arquivo,
        indice_documento: parseado.indice_extracao,
        campo_coluna: campo,
        valor: valorTexto,
      },
    )

    aplicarOverlayAposEdicao(parseado.id_leitura, resposta.documentos_atualizados)

    const atualizado = resposta.documentos_atualizados.find((d) => d.id_documento_leitura === idDocumento)
    if (!atualizado) {
      throw new Error('Documento não retornado após salvar')
    }

    return documentoListaParaFilho(atualizado)
  }, [aplicarOverlayAposEdicao])

  const handleEditarPai = useCallback(async (
    idLeitura: string,
    campo: string,
    valor: unknown,
  ): Promise<TransacaoLeitura> => {
    const leituraAtual = transacoesExibicao.find((item) => item.id_leitura === idLeitura)
    if (!leituraAtual) {
      throw new Error('Leitura não encontrada na página atual')
    }

    const detalhe = await smartReadApi.obterLeitura(idLeitura)
    const documentos = montarDocumentosLeituraLista(detalhe)
    const primeiroDocumento = documentos[0]
    if (!primeiroDocumento) {
      throw new Error('Nenhum documento disponível para editar nesta leitura')
    }

    const parseado = parseIdDocumentoLeituraLista(primeiroDocumento.id_documento_leitura)
    if (!parseado || parseado.indice_extracao == null) {
      throw new Error('Documento inválido para edição na lista')
    }

    const valorTexto = normalizarValorCampoListaSmartRead(campo, valor)
    const resposta = await smartReadApi.editarCampoDocumentoLista(idLeitura, {
      id_arquivo: parseado.id_arquivo,
      indice_documento: parseado.indice_extracao,
      campo_coluna: campo,
      valor: valorTexto,
    })

    aplicarOverlayAposEdicao(idLeitura, resposta.documentos_atualizados)

    const overlay = extrairOverlayPaiDeDocumentos(resposta.documentos_atualizados)
    return {
      ...leituraAtual,
      numeros_documento: overlay.numeros_documento ?? leituraAtual.numeros_documento,
    }
  }, [aplicarOverlayAposEdicao, transacoesExibicao])

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
      </div>
    ),
    [abrirNovaLeitura, excluindo, leiturasSelecionadas.length, temExpandido],
  )

  const colunaFiltroAberta = popoverFiltroAberto
    ? colunas.find((c) => c.key === popoverFiltroAberto)
    : undefined

  return (
    <section className="sr-painel sr-painel--tabela">
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
        dados={transacoesExibicao}
        colunas={colunas}
        itemId={itemId}
        mapaColunasFilho={mapaColunasFilho}
        onCarregarFilhos={handleCarregarFilhos}
        onExpandidosMudar={handleExpandidosMudar}
        filhoId={filhoId}
        camposEditaveis={CAMPOS_EDITAVEIS_PAI_LISTA_SMART_READ}
        onEditar={handleEditarPai}
        camposEditaveisFilhos={CAMPOS_EDITAVEIS_FILHO_LISTA_SMART_READ}
        onEditarFilho={handleEditarFilho}
        resetCacheFilhos={resetCacheFilhos}
        placeholderData={PLACEHOLDER_DATA_LISTA_SMART_READ}
        onErroAoSalvar={(mensagem) => addNotification({ type: 'error', message: mensagem })}
        onSalvoComSucesso={() => addNotification({
          type: 'success',
          message: t('smart_read.lista.campo_salvo_sucesso', { defaultValue: 'Campo atualizado.' }),
        })}
        labelPai={['leitura', 'leituras']}
        labelFilho={['arquivo', 'arquivos']}
        itensPorPagina={ITENS_POR_PAGINA}
        totalItens={Object.keys(filtrosAtivosLista).length > 0 ? transacoesExibicao.length : total}
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
        onFechar={() => {
          setModalNovaLeituraAberto(false)
          setArquivosNovaLeitura([])
          setIdLeituraExistente(null)
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
