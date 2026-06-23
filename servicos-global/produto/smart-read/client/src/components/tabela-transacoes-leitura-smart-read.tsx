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
import { BotaoNovoListaSmartRead } from './botao-novo-lista-smart-read'
import { SmartReadListaPainelBar } from './SmartReadListaPainelBar'
import { ModalExcluirLeiturasSmartRead } from './modal-excluir-leituras-smart-read'
import { ModalNovaLeituraSmartRead } from './nova-leitura-smart-read/modal-nova-leitura-smart-read'
import { montarAcoesExportacaoListaSmartRead } from '../shared/acoes-exportacao-lista-smart-read'
import {
  COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ,
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
import { smartReadApi } from '../shared/api'
import type { TransacaoLeitura } from '../shared/schemas'
import {
  useListaPainelSmartRead,
  type AplicarConfigListaPainelCallbacks,
  type EstadoListaParaPainel,
} from '../shared/use-lista-painel-smart-read'
import type { SegmentoListaLeitura } from '../shared/use-transacoes-leitura-smart-read'
import '../shared/smart-read-lista-layout.css'

const ITENS_POR_PAGINA = 50

const SEGMENTOS_LISTA: { id: SegmentoListaLeitura; rotulo: string }[] = [
  { id: 'envios', rotulo: 'Visão geral' },
  { id: 'transacoes-api', rotulo: 'Transações API' },
]

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
  segmento: SegmentoListaLeitura
  onSegmentoChange: (segmento: SegmentoListaLeitura) => void
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
  segmento,
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
    setAbaAtiva: () => undefined,
    setSortCampo: () => undefined,
    setSortDir: () => undefined,
    setBusca: (busca) => {
      if (busca !== termoBusca) onBuscar(busca)
    },
    setFiltrosAtivos: setFiltrosAtivosLista,
  }), [onBuscar, termoBusca])

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

  const colunas = useMemo(
    () => criarColunasListaLeituraSmartRead((item) => abrirLeituraExistente(item.id_leitura)),
    [abrirLeituraExistente],
  )
  const mapaColunasFilho = useMemo(
    () => criarMapaColunasDocumentoLeitura((item) => abrirLeituraExistente(item.id_leitura)),
    [abrirLeituraExistente],
  )

  const transacoesFiltradas = useMemo(
    () => filtrarTransacoesListaSmartRead(transacoes, filtrosAtivosLista),
    [transacoes, filtrosAtivosLista],
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

  const acoesExportacao = useMemo(
    () => montarAcoesExportacaoListaSmartRead({
      colunas,
      preferencias,
      colunasPadrao: [...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ],
      dados: transacoesFiltradas,
      formatValorExport: formatarValorExportColunaLeituraSmartRead,
      nomeArquivo: 'smart-read-leituras',
      titulo: `Lista ${tituloPainel} — Smart Read`,
    }),
    [colunas, preferencias, transacoesFiltradas, tituloPainel],
  )

  const handleCarregarFilhos = useCallback(async (leitura: TransacaoLeitura) => {
    const detalhe = await smartReadApi.obterLeitura(leitura.id_leitura)
    return montarDocumentosLeituraLista(detalhe)
  }, [])

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
      }
      setModalExcluirAberto(false)
    } finally {
      setExcluindo(false)
    }
  }, [addNotification, leiturasSelecionadas, onRecarregar])

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
          descricao="Remove as leituras selecionadas do Smart Read"
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
          aria-label={t('smart_read.lista.faixa_navegacao', {
            defaultValue: 'Painéis e segmento da lista',
          })}
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
          <section
            className="lp-faixa-navegacao__status"
            aria-label={t('smart_read.lista.segmento_secao', { defaultValue: 'Segmento de envios' })}
          >
            <span
              id="lista-faixa-segmento-label"
              className="lp-faixa-navegacao__secao-label"
              title={t('smart_read.lista.segmento_secao', { defaultValue: 'Segmento de envios' })}
            >
              {t('smart_read.lista.segmento_secao_curto', { defaultValue: 'Visão' })}
            </span>
            <div className="sr-segmento-tabs" role="tablist" aria-labelledby="lista-faixa-segmento-label">
              {SEGMENTOS_LISTA.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={segmento === item.id}
                  data-testid={`lista-segmento-tab-${item.id}`}
                  className={`sr-segmento-tab${segmento === item.id ? ' sr-segmento-tab--ativa' : ''}`}
                  onClick={() => onSegmentoChange(item.id)}
                >
                  {item.rotulo}
                </button>
              ))}
            </div>
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
        itensPorPagina={ITENS_POR_PAGINA}
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
        preferencias={preferencias}
        onSalvarPreferencias={handleSalvarPreferencias}
        colunasPadrao={[...COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ]}
        placeholderBusca="Localizar…"
        distribuirLarguraColunas
        ariaLabel={`Lista de ${tituloPainel} Smart Read`}
        emptyTitle={
          tituloPainel === 'Transações API' ? 'Nenhuma transação API encontrada' : 'Nenhum envio encontrado'
        }
        emptyDescription={
          termoBusca.trim() || Object.keys(filtrosAtivosLista).length > 0
            ? 'Nenhuma leitura corresponde à busca ou aos filtros.'
            : tituloPainel === 'Transações API'
              ? 'Envios feitos via API Cockpit aparecem aqui quando o legado marca source como API.'
              : 'Envie a primeira leitura para começar.'
        }
        emptyAction={
          !termoBusca.trim() && Object.keys(filtrosAtivosLista).length === 0 && tituloPainel !== 'Transações API' ? (
            <button type="button" className="sr-link-acao" onClick={() => abrirNovaLeitura()}>
              Enviar primeira leitura
            </button>
          ) : undefined
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

      <ModalExcluirLeiturasSmartRead
        aberto={modalExcluirAberto}
        quantidade={leiturasSelecionadas.length}
        excluindo={excluindo}
        onConfirmar={() => void handleConfirmarExclusao()}
        onCancelar={() => {
          if (!excluindo) setModalExcluirAberto(false)
        }}
      />
    </section>
  )
}
