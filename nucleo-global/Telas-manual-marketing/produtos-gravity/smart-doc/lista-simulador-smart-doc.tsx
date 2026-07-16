import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CaretDoubleDown, CaretDoubleUp, ChartLineUp, FileText, Timer, Trash, X } from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { TabelaVirtualGlobal } from '../../../Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal'
import { FiltroPopoverColuna } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroPopoverColuna'
import { FiltroChips } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroChips'
import type {
  FiltroAtivo,
  FiltrosAtivosMap,
  GTColuna,
  GTPreferencias,
  GTVirtualHandle,
} from '../../../Tabelas/tabela-virtual-global/src/tipos'
import '../../../Tabelas/tabela-virtual-global/src/tabela-virtual.css'
import '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import '../pedido/lista-simulador-pedido.css'
import './lista-simulador-smart-doc.css'
import {
  FaixaPaineisListaSimuladorPedido,
  PAINEIS_LISTA_SIMULADOR_INICIAIS,
  type PainelItemSimulador,
} from '../pedido/faixa-paineis-lista-simulador-pedido'
import type { PerfilEmpresaSimulador } from './dados-cliente-maduro-simulador-smart-doc'
import {
  CHAVES_TODAS_COLUNAS_LISTA_SMART_DOC_SIMULADOR,
  STATUS_FILTRO_LISTA_SMART_DOC_SIMULADOR,
  calcularResumoKpiListaSimulador,
  filtrarTransacoesPorSegmento,
  materializarTransacoesListaSimulador,
  montarDocumentosLeituraListaSimulador,
  type DocumentoLeituraListaSimulador,
  type SegmentoListaLeituraSimulador,
  type TransacaoLeituraSimulador,
} from './dados-lista-simulador-smart-doc'
import {
  criarColunasListaSimuladorSmartDoc,
  criarMapaColunasDocumentoLeituraSimulador,
} from './colunas-lista-simulador-smart-doc'
import {
  filtrarTransacoesListaSimuladorSmartDoc,
  valoresUnicosColunaTransacaoSimulador,
} from './filtrar-transacoes-lista-simulador-smart-doc'
import {
  formatarPercentualLeituraSimulador,
  formatarSavingHorasLeituraSimulador,
  formatarSavingValorLeituraSimulador,
} from './formatacao-lista-simulador-smart-doc'

const SEGMENTOS: { id: SegmentoListaLeituraSimulador; rotulo: string }[] = [
  { id: 'envios', rotulo: 'Visão geral' },
  { id: 'transacoes-api', rotulo: 'Transações API' },
]

const ITENS_POR_PAGINA = 50

type Props = {
  empresasSelecionadas: PerfilEmpresaSimulador[]
  onIrInsights?: () => void
  onAbrirNovaLeitura?: () => void
  onLinhaExpandidaChange?: (idLeitura: string | null) => void
}

function estiloChipStatusFiltro(id: string, cor: string, ativo: boolean): CSSProperties {
  if (id === 'todas') {
    return {
      color: ativo ? '#e9d5ff' : '#94a3b8',
      background: 'transparent',
      borderColor: 'transparent',
    }
  }
  if (ativo) {
    return {
      color: cor,
      background: `${cor}2e`,
      borderColor: `${cor}55`,
      boxShadow: `0 0 0 1px ${cor}22`,
    }
  }
  return {
    color: '#94a3b8',
    background: 'transparent',
    borderColor: 'transparent',
  }
}

function detectarTipoColunaListaSmartDoc(col: GTColuna<TransacaoLeituraSimulador>): 'texto' | 'enum' | 'numero' {
  if (col.tipo === 'numero') return 'numero'
  if (col.key === 'status_leitura') return 'enum'
  return 'texto'
}

export function ListaSimuladorSmartDoc({
  empresasSelecionadas,
  onIrInsights,
  onAbrirNovaLeitura,
  onLinhaExpandidaChange,
}: Props) {
  const tabelaRef = useRef<GTVirtualHandle>(null)
  const tabelaWrapRef = useRef<HTMLDivElement>(null)
  const [paineisLista, setPaineisLista] = useState<PainelItemSimulador[]>([
    { id: 'geral', nome: 'Geral', ordem: 0 },
    ...PAINEIS_LISTA_SIMULADOR_INICIAIS.filter((p) => p.id !== 'geral'),
  ])
  const [painelAtualId, setPainelAtualId] = useState('geral')
  const [segmento, setSegmento] = useState<SegmentoListaLeituraSimulador>('envios')
  const [statusFiltro, setStatusFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(undefined)
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivosMap>({})
  const [popoverFiltroAberto, setPopoverFiltroAberto] = useState<string | null>(null)
  const [popoverFiltroPos, setPopoverFiltroPos] = useState<{ top: number; left: number } | null>(null)
  const [selecionados, setSelecionados] = useState<TransacaoLeituraSimulador[]>([])
  const [temExpandido, setTemExpandido] = useState(false)
  const [toastDemo, setToastDemo] = useState<{ titulo: string; mensagem: string } | null>(null)
  const [leituraExpandidaId, setLeituraExpandidaId] = useState<string | null>(null)

  const transacoesBase = useMemo(
    () => materializarTransacoesListaSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )

  const transacoesSegmento = useMemo(
    () => filtrarTransacoesPorSegmento(transacoesBase, segmento),
    [transacoesBase, segmento],
  )

  const transacoesStatus = useMemo(() => {
    const filtro = STATUS_FILTRO_LISTA_SMART_DOC_SIMULADOR.find((s) => s.id === statusFiltro)
    if (!filtro?.valor) return transacoesSegmento
    return transacoesSegmento.filter((item) => item.status_leitura === filtro.valor)
  }, [transacoesSegmento, statusFiltro])

  const transacoesFiltradasColuna = useMemo(
    () => filtrarTransacoesListaSimuladorSmartDoc(transacoesStatus, filtrosAtivos),
    [transacoesStatus, filtrosAtivos],
  )

  const transacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return transacoesFiltradasColuna
    return transacoesFiltradasColuna.filter((item) => {
      const texto = [
        item.nome_leitura,
        item.tipos_documento,
        item.nome_empresa,
        item.id_leitura,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return texto.includes(termo)
    })
  }, [transacoesFiltradasColuna, busca])

  const resumoKpi = useMemo(
    () => calcularResumoKpiListaSimulador(transacoesFiltradas),
    [transacoesFiltradas],
  )

  const filtrosAtivosKeys = useMemo(
    () => new Set(Object.keys(filtrosAtivos)),
    [filtrosAtivos],
  )

  const mostrarToastDemo = useCallback((titulo: string, mensagem: string) => {
    setToastDemo({ titulo, mensagem })
  }, [])

  useEffect(() => {
    if (!toastDemo) return
    const timer = window.setTimeout(() => setToastDemo(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toastDemo])

  useEffect(() => {
    onLinhaExpandidaChange?.(leituraExpandidaId)
  }, [leituraExpandidaId, onLinhaExpandidaChange])

  const abrirLeituraDemo = useCallback(
    (idLeitura: string, nome?: string | null) => {
      mostrarToastDemo(
        'Demonstração',
        `No produto real, "${nome ?? idLeitura}" abre a leitura no passo atual (retomar).`,
      )
    },
    [mostrarToastDemo],
  )

  const colunas = useMemo(
    () =>
      criarColunasListaSimuladorSmartDoc(
        (item) => abrirLeituraDemo(item.id_leitura, item.nome_leitura),
        {
          idAlvoNomePrimeiraLinha: 'lista-linha',
          idAlvoStatusPrimeiraLinha: 'lista-status',
        },
      ),
    [abrirLeituraDemo],
  )

  const mapaColunasFilho = useMemo(
    () =>
      criarMapaColunasDocumentoLeituraSimulador((item) =>
        abrirLeituraDemo(item.id_leitura, item.nome_documento),
      ),
    [abrirLeituraDemo],
  )

  useEffect(() => {
    const root = tabelaWrapRef.current
    if (!root) return
    const btn = root.querySelector<HTMLButtonElement>('button[title="Colunas"]')
    btn?.setAttribute('data-sds-tutorial-alvo', 'lista-colunas')
  }, [colunas.length, segmento, statusFiltro])

  const itemId = useCallback((item: TransacaoLeituraSimulador) => item.id_leitura, [])
  const filhoId = useCallback((item: DocumentoLeituraListaSimulador) => item.id_documento_leitura, [])

  const handleCarregarFilhos = useCallback(async (leitura: TransacaoLeituraSimulador) => {
    setLeituraExpandidaId(leitura.id_leitura)
    return montarDocumentosLeituraListaSimulador(leitura)
  }, [])

  const handleExpandidosMudar = useCallback((count: number) => {
    setTemExpandido(count > 0)
    if (count === 0) setLeituraExpandidaId(null)
  }, [])

  const onFiltroColuna = useCallback((key: string, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    setPopoverFiltroPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX })
    setPopoverFiltroAberto(key)
  }, [])

  const handleAplicarFiltroColuna = useCallback((campo: string, filtro: FiltroAtivo) => {
    setFiltrosAtivos((prev) => ({ ...prev, [campo]: filtro }))
    setPopoverFiltroAberto(null)
    setPagina(1)
  }, [])

  const handleLimparFiltroColuna = useCallback((campo: string) => {
    setFiltrosAtivos((prev) => {
      const next = { ...prev }
      delete next[campo]
      return next
    })
    setPopoverFiltroAberto(null)
    setPagina(1)
  }, [])

  const handleLimparTodosFiltros = useCallback(() => {
    setFiltrosAtivos({})
    setBusca('')
    setPagina(1)
  }, [])

  const colunaFiltroAberta = popoverFiltroAberto
    ? colunas.find((c) => c.key === popoverFiltroAberto)
    : undefined

  const totalArquivosRodape = useMemo(
    () => transacoesFiltradas.reduce((soma, item) => soma + item.total_arquivos, 0),
    [transacoesFiltradas],
  )

  const tituloPainel = segmento === 'transacoes-api' ? 'Transações API' : 'Envios'

  const acoesBarra = useMemo(
    () => (
      <div className="sds-lista-acoes-barra">
        <TooltipGlobal descricao={temExpandido ? 'Recolher tudo' : 'Expandir tudo'}>
          <button
            type="button"
            className="sds-lista-btn-expandir-todos"
            data-sds-tutorial-alvo="lista-expandir-todos"
            onClick={() => {
              if (temExpandido) {
                tabelaRef.current?.recolherTodos()
                setLeituraExpandidaId(null)
              } else {
                void tabelaRef.current?.expandirTodos()
              }
            }}
            aria-label={temExpandido ? 'Recolher tudo' : 'Expandir tudo'}
          >
            {temExpandido
              ? <CaretDoubleUp size={12} weight="bold" aria-hidden />
              : <CaretDoubleDown size={12} weight="bold" aria-hidden />}
          </button>
        </TooltipGlobal>

        <TooltipGlobal titulo="+ Novo" descricao="Abre o fluxo Nova Leitura nesta demonstração">
          <BotaoGlobal
            variante="primario"
            tamanho="pequeno"
            icone={<FileText size={14} weight="duotone" />}
            onClick={() => onAbrirNovaLeitura?.()}
            data-sds-tutorial-alvo="lista-novo"
          >
            Novo
          </BotaoGlobal>
        </TooltipGlobal>

        <TooltipGlobal
          titulo={
            selecionados.length > 0
              ? `Excluir · ${selecionados.length} leitura(s)`
              : 'Excluir'
          }
          descricao="Remove leituras selecionadas (demonstração)"
        >
          <BotaoGlobal
            variante="perigo"
            tamanho="pequeno"
            icone={<Trash size={14} weight="duotone" />}
            disabled={selecionados.length === 0}
            onClick={() =>
              mostrarToastDemo(
                'Demonstração',
                selecionados.length === 1
                  ? '1 leitura seria excluída no produto real.'
                  : `${selecionados.length} leituras seriam excluídas no produto real.`,
              )
            }
            data-sds-tutorial-alvo="lista-excluir"
          />
        </TooltipGlobal>

        {onIrInsights && (
          <TooltipGlobal titulo="Ver no Insights" descricao="Volta ao painel de gráficos">
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={onIrInsights}
              data-sds-tutorial-alvo="lista-detalhe-insights"
            >
              Insights
            </BotaoGlobal>
          </TooltipGlobal>
        )}

        {(Object.keys(filtrosAtivos).length > 0 || busca.trim()) && (
          <FiltroChips
            colunas={colunas}
            filtrosAtivos={filtrosAtivos}
            onLimparFiltro={handleLimparFiltroColuna}
            onLimparTodos={handleLimparTodosFiltros}
            onEditarFiltro={onFiltroColuna}
            thresholdConsolidar={2}
            prefixo={
              busca.trim() ? (
                <span className="fc-chip">
                  <span className="fc-chip-label">Busca:</span>
                  <span className="fc-chip-valor">{busca}</span>
                  <button
                    type="button"
                    className="fc-chip-remove"
                    onClick={() => {
                      setBusca('')
                      setPagina(1)
                    }}
                    aria-label="Remover busca"
                  >
                    <X size={10} weight="bold" />
                  </button>
                </span>
              ) : null
            }
          />
        )}
      </div>
    ),
    [
      busca,
      colunas,
      filtrosAtivos,
      handleLimparFiltroColuna,
      handleLimparTodosFiltros,
      mostrarToastDemo,
      onAbrirNovaLeitura,
      onFiltroColuna,
      onIrInsights,
      selecionados.length,
      temExpandido,
    ],
  )

  return (
    <div className="sds-lista pds-lista">
      <div className="lp-stats-row">
        <div className="lp-cards" data-sds-tutorial-alvo="lista-kpis">
          <CardBasicoGlobal
            titulo="Total de leituras"
            icone={<FileText weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
            valor={resumoKpi.totalLeituras}
            subtexto="Leituras no escopo filtrado"
          />
          <CardBasicoGlobal
            titulo="Média de acertos"
            icone={<ChartLineUp weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={formatarPercentualLeituraSimulador(resumoKpi.mediaAcertos)}
            subtexto="Taxa média das leituras visíveis"
          />
          <CardBasicoGlobal
            titulo="Saving (horas)"
            icone={<Timer weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
            valor={formatarSavingHorasLeituraSimulador(resumoKpi.savingMinutos)}
            subtexto="Tempo estimado economizado"
          />
          <CardBasicoGlobal
            titulo="Saving (valor)"
            icone={<ChartLineUp weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={formatarSavingValorLeituraSimulador(resumoKpi.savingBrl)}
            subtexto={`${resumoKpi.camposErrados} campos com divergência`}
          />
        </div>
      </div>

      <div className="sds-lista-segmentos" data-sds-tutorial-alvo="lista-segmentos">
        <div className="sds-lista-segmento-tabs" role="tablist" aria-label="Segmento de envios">
          {SEGMENTOS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={segmento === item.id}
              className={`sds-lista-segmento-tab${segmento === item.id ? ' sds-lista-segmento-tab--ativa' : ''}`}
              onClick={() => {
                setSegmento(item.id)
                setPagina(1)
                setLeituraExpandidaId(null)
              }}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="pds-lista-chrome">
        <div className="pds-lista-faixa">
          <FaixaPaineisListaSimuladorPedido
            paineis={paineisLista}
            painelAtualId={painelAtualId}
            onPaineisChange={setPaineisLista}
            onPainelAtualIdChange={setPainelAtualId}
          />

          <div className="pds-lista-status-bar" data-sds-tutorial-alvo="lista-status-pills">
            <span className="pds-lista-status-label">Status</span>
            <div className="pds-lista-status-pills">
              {STATUS_FILTRO_LISTA_SMART_DOC_SIMULADOR.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`pds-lista-status-chip ${statusFiltro === s.id ? 'pds-lista-status-chip--ativo' : ''}`}
                  style={estiloChipStatusFiltro(s.id, s.cor, statusFiltro === s.id)}
                  onClick={() => {
                    setStatusFiltro(s.id)
                    setPagina(1)
                  }}
                >
                  <span className="pds-lista-status-dot" style={{ background: s.cor }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={tabelaWrapRef}
          className="sds-lista-chrome-tabela sds-lista-tvg-wrap"
          data-sds-tutorial-alvo="lista-tabela"
        >
          {popoverFiltroAberto && colunaFiltroAberta?.key && popoverFiltroPos && (
            <FiltroPopoverColuna
              campo={String(colunaFiltroAberta.key)}
              label={colunaFiltroAberta.label}
              tipo={detectarTipoColunaListaSmartDoc(colunaFiltroAberta)}
              filtroAtual={filtrosAtivos[String(colunaFiltroAberta.key)]}
              valoresUnicos={valoresUnicosColunaTransacaoSimulador(
                transacoesStatus,
                String(colunaFiltroAberta.key),
              )}
              onAplicar={handleAplicarFiltroColuna}
              onLimpar={handleLimparFiltroColuna}
              onFechar={() => setPopoverFiltroAberto(null)}
              anchorPos={popoverFiltroPos}
            />
          )}

          <TabelaVirtualGlobal<TransacaoLeituraSimulador, DocumentoLeituraListaSimulador>
            imperativeRef={tabelaRef}
            dados={transacoesFiltradas}
            colunas={colunas}
            itemId={itemId}
            mapaColunasFilho={mapaColunasFilho}
            onCarregarFilhos={handleCarregarFilhos}
            onExpandidosMudar={handleExpandidosMudar}
            filhoId={filhoId}
            labelPai={['leitura', 'leituras']}
            labelFilho={['documento', 'documentos']}
            itensPorPagina={ITENS_POR_PAGINA}
            totalItens={transacoesFiltradas.length}
            totalFilhos={totalArquivosRodape}
            paginaAtual={pagina}
            onMudarPagina={setPagina}
            acoesBarra={acoesBarra}
            onSelecaoMudar={setSelecionados}
            onBuscar={(termo) => {
              setBusca(termo)
              setPagina(1)
            }}
            onFiltroColuna={onFiltroColuna}
            filtrosAtivosKeys={filtrosAtivosKeys}
            preferencias={preferencias}
            onSalvarPreferencias={setPreferencias}
            colunasPadrao={CHAVES_TODAS_COLUNAS_LISTA_SMART_DOC_SIMULADOR}
            placeholderBusca="Localizar…"
            distribuirLarguraColunas
            ariaLabel={`Lista de ${tituloPainel} Smart Docs`}
            emptyTitle={
              tituloPainel === 'Transações API'
                ? 'Nenhuma transação API encontrada'
                : 'Nenhum envio encontrado'
            }
            emptyDescription={
              busca.trim() || Object.keys(filtrosAtivos).length > 0 || statusFiltro !== 'todas'
                ? 'Ajuste os filtros ou a busca para ver resultados.'
                : 'Inicie uma nova leitura para popular esta lista.'
            }
          />
        </div>
      </div>

      {toastDemo && (
        <div className="sds-lista-toast-demo" role="status">
          <strong>{toastDemo.titulo}</strong>
          {toastDemo.mensagem}
        </div>
      )}
    </div>
  )
}
