import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CaretDown,
  CaretRight,
  ClipboardText,
  Eye,
  MagnifyingGlass,
  ShieldWarning,
  Warning,
  X,
} from '@phosphor-icons/react'
import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  calcularPercentualChecklistVerde,
  calcularPercentualSemCriticosAbertos,
  filtrarRiscosPorBusca,
  montarLegendaSegmentosRisco,
  montarResumoRiscosSimulador,
  obterContagemChecklistSimulador,
  obterRiscosSimulador,
  rotuloSeveridadeRisco,
  type ResumoRiscosSimuladorSmartDoc,
  type RiscoSimuladorSmartDoc,
} from './dados-riscos-simulador-smart-doc'
import {
  ChecklistLinhaRiscoSimuladorSmartDoc,
  ModalChecklistSimuladorSmartDoc,
} from './checklist-simulador-smart-doc'
import { GraficoAprovacaoRiscosSimulador } from './grafico-aprovacao-riscos-simulador'
import {
  TooltipGraficoInsightsSimulador,
  useTooltipFixoInsightsSimulador,
  type ConteudoTooltipInsights,
} from './tooltip-grafico-insights-simulador'
import './checklist-simulador-smart-doc.css'
import '../../../../servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'
import './riscos-simulador-smart-doc.css'

type SegmentoBarraRisco = 'critico' | 'atencao' | 'informativo'

const COR_CRITICO_BARRA = '#f87171'
const COR_ATENCAO_BARRA = '#fbbf24'
const COR_INFORMATIVO_BARRA = '#60a5fa'

function montarBarraTooltipDistribuicaoRiscos(resumo: ResumoRiscosSimuladorSmartDoc) {
  if (resumo.total === 0) return []
  return [
    ...(resumo.criticos > 0
      ? [{ cor: COR_CRITICO_BARRA, pct: (resumo.criticos / resumo.total) * 100 }]
      : []),
    ...(resumo.atencao > 0
      ? [{ cor: COR_ATENCAO_BARRA, pct: (resumo.atencao / resumo.total) * 100 }]
      : []),
    ...(resumo.informativos > 0
      ? [{ cor: COR_INFORMATIVO_BARRA, pct: (resumo.informativos / resumo.total) * 100 }]
      : []),
  ]
}

function montarConteudoTooltipBarraRiscos(
  segmento: SegmentoBarraRisco,
  resumo: ResumoRiscosSimuladorSmartDoc,
): ConteudoTooltipInsights {
  const barra = montarBarraTooltipDistribuicaoRiscos(resumo)
  const total = resumo.total

  if (segmento === 'critico') {
    const pct = total > 0 ? Math.round((resumo.criticos / total) * 100) : 0
    return {
      titulo: 'Crítico',
      subtitulo: `${total} ${total === 1 ? 'risco analisado' : 'riscos analisados'}`,
      total: resumo.criticos,
      totalRotulo: resumo.criticos === 1 ? 'risco' : 'riscos',
      barra,
      linhas: [{ cor: COR_CRITICO_BARRA, rotulo: 'Crítico', valor: resumo.criticos, pct }],
    }
  }

  if (segmento === 'atencao') {
    const pct = total > 0 ? Math.round((resumo.atencao / total) * 100) : 0
    return {
      titulo: 'Atenção',
      subtitulo: `${total} ${total === 1 ? 'risco analisado' : 'riscos analisados'}`,
      total: resumo.atencao,
      totalRotulo: resumo.atencao === 1 ? 'risco' : 'riscos',
      barra,
      linhas: [{ cor: COR_ATENCAO_BARRA, rotulo: 'Atenção', valor: resumo.atencao, pct }],
    }
  }

  const pct = total > 0 ? Math.round((resumo.informativos / total) * 100) : 0
  return {
    titulo: 'Informativo',
    subtitulo: `${total} ${total === 1 ? 'risco analisado' : 'riscos analisados'}`,
    total: resumo.informativos,
    totalRotulo: resumo.informativos === 1 ? 'risco' : 'riscos',
    barra,
    linhas: [{ cor: COR_INFORMATIVO_BARRA, rotulo: 'Informativo', valor: resumo.informativos, pct }],
  }
}

type SelecaoConferencia = {
  idArquivo: string
  idDocumento: string
}

type Props = {
  arquivos: ArquivoDemoSimulador[]
  selecao: SelecaoConferencia | null
  onCompararArquivo?: () => void
}

function PainelDetalheRiscoSimulador({
  risco,
  tipoDocumento,
  onCompararArquivo,
}: {
  risco: RiscoSimuladorSmartDoc
  tipoDocumento: DocumentoSimulador['tipo']
  onCompararArquivo?: () => void
}) {
  const [colapsado, setColapsado] = useState(false)
  const checklistRef = useRef<HTMLDivElement>(null)
  const painelCorpoId = `sds-risco-painel-corpo-${risco.id}`

  useEffect(() => {
    setColapsado(false)
  }, [risco.id])

  function irConferenciaChecklist() {
    checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div className="sr-risco-inline-painel">
      <div className="sr-risco-inline-cabecalho">
        <p className="sr-risco-modal-resumo-linha">{risco.motivo}</p>
        <div className="sr-risco-modal-acoes">
          <button
            type="button"
            className="sr-risco-modal-btn-icone"
            onClick={onCompararArquivo}
            aria-label="Ver no documento"
            title="Ver no documento"
          >
            <Eye size={18} weight="duotone" />
          </button>
          <button
            type="button"
            className="sr-risco-modal-btn-icone sr-risco-modal-btn-icone--primario"
            onClick={irConferenciaChecklist}
            aria-label="Conferência checklist"
            title="Conferência checklist"
          >
            <ClipboardText size={18} weight="duotone" />
          </button>
        </div>
      </div>

      <div className="sr-risco-inline-secoes">
        <section
          className={`dt-secao sr-conf-risco-painel-secao${colapsado ? ' dt-secao--colapsada' : ''}`}
          aria-label="Risco, análise e correção"
        >
          <button
            type="button"
            className="dt-secao-header"
            onClick={() => setColapsado((p) => !p)}
            aria-expanded={!colapsado}
            aria-controls={painelCorpoId}
          >
            <div className="dt-secao-title">
              <CaretDown
                weight="bold"
                size={14}
                className={`dt-caret${colapsado ? ' dt-caret--colapsado' : ''}`}
                aria-hidden
              />
              <span className="dt-secao-icon">
                <ShieldWarning weight="duotone" size={18} />
              </span>
              <h2>Risco, análise e correção</h2>
              <span
                className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade} sr-conf-risco-painel-badge`}
              >
                {rotuloSeveridadeRisco(risco.severidade)}
              </span>
            </div>
          </button>

          {!colapsado && (
            <div id={painelCorpoId} className="sr-conf-risco-painel-corpo">
              <div className="sr-conf-risco-painel-principal">
                <div className="sr-conf-risco-campo">
                  <span className="sr-conf-risco-campo-rotulo">Risco</span>
                  <p>{risco.motivo}</p>
                </div>
                <div className="sr-conf-risco-campo">
                  <span className="sr-conf-risco-campo-rotulo">Análise</span>
                  <p>{risco.analise}</p>
                </div>
                {risco.correcao_sugerida && (
                  <>
                    <div className="sr-conf-risco-painel-divisor" role="presentation" />
                    <div className="sr-conf-risco-campo sr-conf-risco-campo--correcao">
                      <span className="sr-conf-risco-campo-rotulo">Correção</span>
                      <p>{risco.correcao_sugerida}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>

        <ChecklistLinhaRiscoSimuladorSmartDoc
          tipo={tipoDocumento}
          riscoId={risco.id}
          anchorRef={checklistRef}
        />
      </div>
    </div>
  )
}

function ItemListaRiscoSimulador({
  risco,
  numero,
  expandido,
  selecionado,
  onToggleExpandir,
  onToggleSelecao,
  children,
}: {
  risco: RiscoSimuladorSmartDoc
  numero: number
  expandido: boolean
  selecionado: boolean
  onToggleExpandir: () => void
  onToggleSelecao: () => void
  children?: ReactNode
}) {
  return (
    <section
      id={`sds-risco-${risco.id}`}
      className={`dt-secao sr-conf-risco-item-lista${expandido ? ' sr-conf-risco-item-lista--expandido' : ' dt-secao--colapsada'}${selecionado ? ' sr-conf-risco-item-lista--selecionado' : ''}`}
    >
      <div className="dt-secao-header sr-conf-risco-item-lista-cabecalho">
        <button
          type="button"
          className="sr-conf-risco-item-lista-botao"
          onClick={onToggleExpandir}
          aria-expanded={expandido}
          aria-controls={`sds-risco-corpo-${risco.id}`}
          aria-label={`${expandido ? 'Recolher' : 'Expandir'} detalhe do risco: ${risco.titulo}`}
        >
          <div className="dt-secao-title">
            {expandido ? (
              <CaretDown weight="bold" size={14} className="dt-caret" aria-hidden />
            ) : (
              <CaretRight weight="bold" size={14} className="dt-caret" aria-hidden />
            )}
            <span className="dt-secao-icon sr-conf-risco-item-lista-icone" aria-hidden>
              <Warning weight="duotone" size={18} />
              <span className="sr-conf-risco-item-lista-numero">{String(numero).padStart(2, '0')}</span>
            </span>
            <h2>{risco.titulo}</h2>
          </div>
        </button>
        <div className="dt-secao-completude sr-conf-risco-item-lista-direita">
          <span
            className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade} sr-conf-risco-item-lista-badge`}
            aria-hidden
          >
            {rotuloSeveridadeRisco(risco.severidade)}
          </span>
          <label
            className="sr-conf-riscos-secao-selecionar sr-conf-risco-item-lista-selecao"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selecionado}
              onChange={onToggleSelecao}
              aria-label={`Selecionar risco: ${risco.titulo}`}
            />
          </label>
        </div>
      </div>

      {expandido && children ? (
        <div id={`sds-risco-corpo-${risco.id}`} className="sr-conf-risco-item-lista-corpo">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export function RiscosSimuladorSmartDoc({
  arquivos,
  selecao,
  onCompararArquivo,
}: Props) {
  const [busca, setBusca] = useState('')
  const [riscosSelecionados, setRiscosSelecionados] = useState<Set<string>>(() => new Set())
  const [riscoExpandidoId, setRiscoExpandidoId] = useState<string | null>(null)
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const arquivosCompletos = arquivos.filter((a) => a.status === 'completo')

  const arquivoAtual = useMemo(() => {
    if (selecao) {
      return arquivosCompletos.find((a) => a.id === selecao.idArquivo) ?? arquivosCompletos[0]
    }
    return arquivosCompletos[0]
  }, [arquivosCompletos, selecao])

  const documentoAtual: DocumentoSimulador | null = useMemo(() => {
    if (!arquivoAtual) return null
    if (selecao?.idDocumento) {
      return (
        arquivoAtual.documentosIdentificados.find((d) => d.id === selecao.idDocumento) ??
        arquivoAtual.documentosIdentificados[0] ??
        null
      )
    }
    return arquivoAtual.documentosIdentificados[0] ?? null
  }, [arquivoAtual, selecao])

  const chaveDocumento = `${arquivoAtual?.id ?? ''}:${documentoAtual?.id ?? ''}`

  useEffect(() => {
    setRiscosSelecionados(new Set())
    setRiscoExpandidoId(null)
    setBusca('')
    setCarregando(true)
    const id = window.setTimeout(() => setCarregando(false), 1200)
    return () => window.clearTimeout(id)
  }, [chaveDocumento])

  const riscosBase = useMemo(
    () => (documentoAtual ? obterRiscosSimulador(documentoAtual.tipo) : []),
    [documentoAtual],
  )

  const resumo = useMemo(() => montarResumoRiscosSimulador(riscosBase), [riscosBase])
  const riscosVisiveis = useMemo(() => filtrarRiscosPorBusca(riscosBase, busca), [riscosBase, busca])
  const percentualSemCriticos = useMemo(() => calcularPercentualSemCriticosAbertos(resumo), [resumo])
  const legendaSegmentosRisco = useMemo(() => montarLegendaSegmentosRisco(resumo), [resumo])
  const barraTooltip = useTooltipFixoInsightsSimulador<SegmentoBarraRisco>()

  const numeracaoRiscos = useMemo(() => {
    const mapa = new Map<string, number>()
    riscosVisiveis.forEach((risco, indice) => mapa.set(risco.id, indice + 1))
    return mapa
  }, [riscosVisiveis])

  const riscosConferidos = riscosSelecionados.size

  const contagemChecklist = useMemo(
    () => (documentoAtual ? obterContagemChecklistSimulador(documentoAtual.tipo) : { verde: 0, amarelo: 0, vermelho: 0, pendente: 0 }),
    [documentoAtual],
  )
  const percentualChecklistVerde = calcularPercentualChecklistVerde(contagemChecklist)

  const tituloContexto = arquivoAtual
    ? `${arquivoAtual.nome}${documentoAtual ? ` | ${documentoAtual.rotulo}` : ''}`
    : ''

  const todosVisiveisSelecionados =
    riscosVisiveis.length > 0 && riscosVisiveis.every((r) => riscosSelecionados.has(r.id))

  function toggleExpandirRisco(riscoId: string) {
    setRiscoExpandidoId((prev) => (prev === riscoId ? null : riscoId))
  }

  function toggleSelecaoRisco(id: string) {
    setRiscosSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelecionarTodosVisiveis() {
    setRiscosSelecionados((prev) => {
      if (todosVisiveisSelecionados) {
        const next = new Set(prev)
        for (const r of riscosVisiveis) next.delete(r.id)
        return next
      }
      const next = new Set(prev)
      for (const r of riscosVisiveis) next.add(r.id)
      return next
    })
  }

  if (arquivosCompletos.length === 0) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Aguardando análise dos arquivos para calcular riscos.</p>
      </div>
    )
  }

  if (!documentoAtual) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Selecione um documento na sidebar para analisar riscos.</p>
      </div>
    )
  }

  return (
    <div className="sr-conf-riscos">
      {tituloContexto && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContexto}</span>
        </div>
      )}

      {carregando && (
        <p className="sr-conf-riscos-carregando" role="status">
          Analisando documentos…
        </p>
      )}

      <section className="sr-conf-riscos-cabecalho" aria-label="Resumo da análise de riscos">
        <div className="sr-conf-riscos-cabecalho-principal">
          <div className="sr-conf-riscos-cabecalho-resumo">
            <div className="sr-conf-riscos-cabecalho-titulo-linha">
              <strong className="sr-conf-riscos-cabecalho-titulo">Análise de riscos</strong>
              <span className="sr-conf-riscos-cabecalho-subtitulo">
                {percentualSemCriticos}% sem críticos abertos
              </span>
            </div>

            {resumo.total > 0 && (
              <>
                <div className="sr-insights-tt-host sds-riscos-barra-tt-host" ref={barraTooltip.containerRef}>
                  <div
                    className="sr-conf-riscos-seg-bar"
                    role="img"
                    aria-label={`Distribuição: ${legendaSegmentosRisco ?? ''}`}
                  >
                    {resumo.criticos > 0 && (
                      <span
                        className="sr-conf-riscos-seg-bar__critico"
                        style={{ width: `${(resumo.criticos / resumo.total) * 100}%` }}
                        role="button"
                        tabIndex={0}
                        aria-label="Ver detalhe dos riscos críticos"
                        onClick={(e) => barraTooltip.aoClicar(e, 'critico')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            barraTooltip.aoClicar(e, 'critico')
                          }
                        }}
                      />
                    )}
                    {resumo.atencao > 0 && (
                      <span
                        className="sr-conf-riscos-seg-bar__atencao"
                        style={{ width: `${(resumo.atencao / resumo.total) * 100}%` }}
                        role="button"
                        tabIndex={0}
                        aria-label="Ver detalhe dos riscos de atenção"
                        onClick={(e) => barraTooltip.aoClicar(e, 'atencao')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            barraTooltip.aoClicar(e, 'atencao')
                          }
                        }}
                      />
                    )}
                    {resumo.informativos > 0 && (
                      <span
                        className="sr-conf-riscos-seg-bar__informativo"
                        style={{ width: `${(resumo.informativos / resumo.total) * 100}%` }}
                        role="button"
                        tabIndex={0}
                        aria-label="Ver detalhe dos riscos informativos"
                        onClick={(e) => barraTooltip.aoClicar(e, 'informativo')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            barraTooltip.aoClicar(e, 'informativo')
                          }
                        }}
                      />
                    )}
                  </div>
                  {barraTooltip.estado && (
                    <TooltipGraficoInsightsSimulador
                      ancora={barraTooltip.estado.ancora}
                      containerRef={barraTooltip.containerRef}
                      conteudo={montarConteudoTooltipBarraRiscos(barraTooltip.estado.dados, resumo)}
                      onFechar={barraTooltip.fechar}
                    />
                  )}
                </div>
                {legendaSegmentosRisco && (
                  <p className="sr-conf-riscos-seg-legenda">
                    {resumo.total} {resumo.total === 1 ? 'risco' : 'riscos'} · {legendaSegmentosRisco}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="sr-conf-progresso-busca sds-riscos-busca">
            <div className="sds-riscos-busca-campo">
              <MagnifyingGlass weight="duotone" size={13} className="sds-riscos-busca-icone" aria-hidden />
              <input
                type="search"
                className="sds-riscos-busca-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Localizar riscos"
                aria-label="Localizar riscos"
              />
              {busca && (
                <button
                  type="button"
                  className="sds-riscos-busca-limpar"
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                >
                  <X size={11} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sr-conf-riscos-cabecalho-rodape">
          <button
            type="button"
            className="sr-conf-riscos-checklist-link"
            onClick={() => setModalChecklistAberto(true)}
            aria-haspopup="dialog"
          >
            Checklist matriz · {percentualChecklistVerde}% conforme
          </button>
          <span className="sr-conf-riscos-checklist-resumo-compacto">
            {contagemChecklist.verde} ok · {contagemChecklist.amarelo} atenção · {contagemChecklist.vermelho} falha ·{' '}
            {contagemChecklist.pendente} pendente
          </span>
          {riscosConferidos > 0 && (
            <GraficoAprovacaoRiscosSimulador
              marcados={riscosConferidos}
              total={riscosBase.length}
              classe="sds-riscos-grafico-aprovacao--cabecalho"
            />
          )}
          {riscosVisiveis.length > 0 && (
            <label className="sr-conf-riscos-selecionar-compacto">
              <input
                type="checkbox"
                checked={todosVisiveisSelecionados}
                onChange={toggleSelecionarTodosVisiveis}
                aria-label="Selecionar todos os riscos visíveis"
              />
              <span>Selecionar ({riscosVisiveis.length})</span>
            </label>
          )}
          <span className="sr-conf-riscos-disclaimer-compacto">V1 + IA + NCM — apoio à conferência</span>
        </div>
      </section>

      <ModalChecklistSimuladorSmartDoc
        aberto={modalChecklistAberto}
        onFechar={() => setModalChecklistAberto(false)}
        tipo={documentoAtual.tipo}
        rotuloDocumento={documentoAtual.rotulo}
        nomeArquivo={arquivoAtual?.nome ?? ''}
      />

      <main className="dt-main sr-conf-riscos-main">
        {busca.trim() && (
          <div className="dt-main-toolbar sr-conf-secoes-toolbar">
            <div className="dt-chips sr-conf-chips">
              <span className="fc-chip" role="status" aria-live="polite">
                <span className="fc-chip-label">Busca:</span>
                <span className="fc-chip-valor">{busca.trim()}</span>
                <button
                  type="button"
                  className="fc-chip-remove"
                  onClick={() => setBusca('')}
                  title="Remover busca"
                  aria-label="Remover busca"
                >
                  <X size={10} weight="bold" />
                </button>
              </span>
            </div>
          </div>
        )}

        {!carregando && resumo.riscos.length === 0 ? (
          <p className="sr-conf-riscos-ok">Nenhum risco identificado na leitura atual.</p>
        ) : riscosVisiveis.length === 0 ? (
          <p className="sr-conf-vazio">Nenhum risco encontrado para a busca atual.</p>
        ) : (
          <div className="sr-conf-riscos-lista sr-conf-riscos-lista-plana">
            {riscosVisiveis.map((risco) => {
              const expandido = riscoExpandidoId === risco.id
              return (
                <ItemListaRiscoSimulador
                  key={risco.id}
                  risco={risco}
                  numero={numeracaoRiscos.get(risco.id) ?? 0}
                  expandido={expandido}
                  selecionado={riscosSelecionados.has(risco.id)}
                  onToggleExpandir={() => toggleExpandirRisco(risco.id)}
                  onToggleSelecao={() => toggleSelecaoRisco(risco.id)}
                >
                  {expandido ? (
                    <PainelDetalheRiscoSimulador
                      risco={risco}
                      tipoDocumento={documentoAtual.tipo}
                      onCompararArquivo={onCompararArquivo}
                    />
                  ) : null}
                </ItemListaRiscoSimulador>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
