/**
 * ConferenciaRiscosAduaneirosNovaLeituraSmartRead — V1 + LLM + Cadastros (piloto)
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CaretDown,
  CaretRight,
  CircleNotch,
  MagnifyingGlass,
  Warning,
  X,
} from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import {
  aplicarCorrecaoSugeridaPadraoRisco,
  montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado,
  montarDocumentosAnaliseRiscoDeArquivosLocais,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import {
  obterCacheAnaliseRiscosSessaoSmartRead,
  salvarCacheAnaliseRiscosSessaoSmartRead,
} from '../../shared/cache-analise-riscos-sessao-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../../shared/analise-riscos-leitura-smart-read'
import type { RegraAuditoriaV1 } from '../../../../shared/analise-riscos-leitura-smart-read'
import { montarResumoGeralChecklistInvoices } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { ModalChecklistConferenciaNovaLeituraSmartRead } from './modal-checklist-conferencia-nova-leitura-smart-read'
import { PainelDetalheRiscoExpandidoNovaLeituraSmartRead } from './painel-detalhe-risco-expandido-nova-leitura-smart-read'
import type { FocoConferenciaCamposNovaLeituraSmartRead } from '../../shared/foco-conferencia-campos-nova-leitura-smart-read'
import type {
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { AcoesCorrecaoRiscoNovaLeituraSmartRead } from './acoes-correcao-risco-nova-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import '../../../../../../../nucleo-global/Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import '../../../../../processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'

import type { ResumoUsoLlmLeituraSmartRead, UsoLlmChamadaLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  arquivoConferencia?: ArquivoLocalNovaLeitura | null
  indiceDocumentoConferencia?: number
  tituloContextoDocumento?: string
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  idLeituraLegado?: string | null
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
  onIaInicio?: () => void
  onIaFim?: () => void
}

function rotuloSeveridade(severidade: SeveridadeRiscoAduaneiro): string {
  switch (severidade) {
    case 'critico':
      return 'Crítico'
    case 'atencao':
      return 'Atenção'
    default:
      return 'Informativo'
  }
}

function filtrarRiscosPorBusca(riscos: RiscoAduaneiroLeitura[], busca: string): RiscoAduaneiroLeitura[] {
  const buscaNorm = busca.trim().toLowerCase()
  if (!buscaNorm) return riscos
  return riscos.filter(
    (risco) =>
      risco.titulo.toLowerCase().includes(buscaNorm) ||
      risco.motivo.toLowerCase().includes(buscaNorm) ||
      risco.analise.toLowerCase().includes(buscaNorm) ||
      (risco.correcao_sugerida?.toLowerCase().includes(buscaNorm) ?? false) ||
      risco.evidencias.some(
        (ev) =>
          ev.documento.toLowerCase().includes(buscaNorm) ||
          (ev.campo?.toLowerCase().includes(buscaNorm) ?? false) ||
          (ev.valor?.toLowerCase().includes(buscaNorm) ?? false),
      ),
  )
}

function ItemListaRisco({
  risco: riscoBruto,
  numero,
  expandido,
  selecionado,
  onToggleExpandir,
  onToggleSelecao,
  children,
}: {
  risco: RiscoAduaneiroLeitura
  numero: number
  expandido: boolean
  selecionado: boolean
  onToggleExpandir: (risco: RiscoAduaneiroLeitura) => void
  onToggleSelecao: (id: string) => void
  children?: ReactNode
}) {
  const risco = aplicarCorrecaoSugeridaPadraoRisco(riscoBruto)

  return (
    <section
      id={`sr-risco-${risco.id}`}
      className={`dt-secao sr-conf-risco-item-lista${expandido ? ' sr-conf-risco-item-lista--expandido' : ' dt-secao--colapsada'}${selecionado ? ' sr-conf-risco-item-lista--selecionado' : ''}`}
    >
      <div className="dt-secao-header sr-conf-risco-item-lista-cabecalho">
        <button
          type="button"
          className="sr-conf-risco-item-lista-botao"
          onClick={() => onToggleExpandir(riscoBruto)}
          aria-expanded={expandido}
          aria-controls={`sr-risco-corpo-${risco.id}`}
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
            {rotuloSeveridade(risco.severidade)}
          </span>
          <label
            className="sr-conf-riscos-secao-selecionar sr-conf-risco-item-lista-selecao"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selecionado}
              onChange={() => onToggleSelecao(risco.id)}
              aria-label={`Selecionar risco: ${risco.titulo}`}
            />
          </label>
        </div>
      </div>

      {expandido && children ? (
        <div id={`sr-risco-corpo-${risco.id}`} className="sr-conf-risco-item-lista-corpo">
          {children}
        </div>
      ) : null}
    </section>
  )
}

type PropsComNavegacao = Props & {
  onIrConferenciaCampos?: (foco: FocoConferenciaCamposNovaLeituraSmartRead) => void
}

export function ConferenciaRiscosAduaneirosNovaLeituraSmartRead({
  arquivos,
  arquivoConferencia = null,
  indiceDocumentoConferencia = 0,
  tituloContextoDocumento = '',
  onVerEvidencia,
  onIrConferenciaCampos,
  idLeituraLegado = null,
  onTokensAtualizados,
  onIaInicio,
  onIaFim,
}: PropsComNavegacao) {
  const requisicaoSeq = useRef(0)
  const [resumo, setResumo] = useState({
    riscos: [] as RiscoAduaneiroLeitura[],
    total: 0,
    criticos: 0,
    atencao: 0,
    informativos: 0,
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [riscosSelecionados, setRiscosSelecionados] = useState<Set<string>>(() => new Set())
  const [regrasContexto, setRegrasContexto] = useState<RegraAuditoriaV1[]>([])
  const [pipelineConcluido, setPipelineConcluido] = useState(false)
  const [llmHabilitado, setLlmHabilitado] = useState(false)
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)
  const [riscoExpandidoId, setRiscoExpandidoId] = useState<string | null>(null)

  const arquivosAnalisaveis = useMemo(
    () => arquivos.filter((a) => a.status_arquivo_local === 'completo'),
    [arquivos],
  )

  const documentos = useMemo(() => {
    if (arquivoConferencia) {
      return montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado(
        arquivoConferencia,
        indiceDocumentoConferencia,
      )
    }
    return montarDocumentosAnaliseRiscoDeArquivosLocais(arquivosAnalisaveis)
  }, [arquivoConferencia, indiceDocumentoConferencia, arquivosAnalisaveis])

  const chaveDocumento = `${arquivoConferencia?.id_arquivo_local ?? ''}:${indiceDocumentoConferencia}`

  useEffect(() => {
    setRiscosSelecionados(new Set())
    setRiscoExpandidoId(null)
    setBusca('')
  }, [chaveDocumento])

  const chaveAnalise = useMemo(
    () =>
      `${idLeituraLegado ?? ''}|${documentos.map((d) => `${d.nome_arquivo}:${d.indice}:${d.tipo_documento}`).join('|')}`,
    [documentos, idLeituraLegado],
  )

  const auditoriaV1Local = useMemo(
    () =>
      documentos.length === 0
        ? null
        : executarAuditoriaV1AnaliseRiscosLeitura(documentos),
    [documentos, chaveAnalise],
  )

  const parametrosChecklist = useMemo(
    () => ({
      regras: regrasContexto,
      riscos: resumo.riscos,
      pipelineConcluido,
      llmHabilitado,
      carregando,
    }),
    [regrasContexto, resumo.riscos, pipelineConcluido, llmHabilitado, carregando],
  )

  const resumoGeralChecklist = useMemo(
    () =>
      documentos.length === 0
        ? null
        : montarResumoGeralChecklistInvoices({ ...parametrosChecklist, documentos }),
    [parametrosChecklist, documentos],
  )

  const contagemChecklist = resumoGeralChecklist?.contagem_global ?? {
    verde: 0,
    amarelo: 0,
    vermelho: 0,
    pendente: 0,
    total: 0,
  }

  const percentualChecklistVerde = resumoGeralChecklist?.percentual_global ?? 0

  const percentualConformidade = useMemo(() => {
    if (resumo.total === 0) return 100
    return Math.round(((resumo.total - resumo.criticos) / resumo.total) * 100)
  }, [resumo.total, resumo.criticos])

  const riscosVisiveis = useMemo(
    () => filtrarRiscosPorBusca(resumo.riscos, busca),
    [resumo.riscos, busca],
  )

  const riscosSelecionadosLista = useMemo(
    () =>
      resumo.riscos
        .filter((r) => riscosSelecionados.has(r.id))
        .map(aplicarCorrecaoSugeridaPadraoRisco),
    [resumo.riscos, riscosSelecionados],
  )

  const todosVisiveisSelecionados =
    riscosVisiveis.length > 0 && riscosVisiveis.every((r) => riscosSelecionados.has(r.id))

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
      const next = new Set(prev)
      if (todosVisiveisSelecionados) {
        for (const r of riscosVisiveis) next.delete(r.id)
      } else {
        for (const r of riscosVisiveis) next.add(r.id)
      }
      return next
    })
  }

  const numeracaoRiscos = useMemo(() => {
    const mapa = new Map<string, number>()
    riscosVisiveis.forEach((risco, indice) => mapa.set(risco.id, indice + 1))
    return mapa
  }, [riscosVisiveis])

  const legendaSegmentosRisco =
    resumo.total === 0
      ? null
      : [
          resumo.criticos > 0 ? `${resumo.criticos} crítico${resumo.criticos === 1 ? '' : 's'}` : null,
          resumo.atencao > 0 ? `${resumo.atencao} atenção` : null,
          resumo.informativos > 0
            ? `${resumo.informativos} informativo${resumo.informativos === 1 ? '' : 's'}`
            : null,
        ]
          .filter((parte): parte is string => parte !== null)
          .join(' · ')

  useEffect(() => {
    if (auditoriaV1Local) {
      setResumo(auditoriaV1Local.resumo)
      setRegrasContexto(auditoriaV1Local.contexto.regras)
      setPipelineConcluido(false)
      setLlmHabilitado(false)
    }
  }, [auditoriaV1Local])

  useEffect(() => {
    if (documentos.length === 0) return

    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnalise)
    if (emCache) {
      setResumo(emCache.resumo)
      setRegrasContexto(emCache.contexto_v1.regras)
      setLlmHabilitado(emCache.llm_ativo)
      setAviso(emCache.aviso ?? null)
      setPipelineConcluido(true)
      setCarregando(false)
      onTokensAtualizados?.(emCache.uso_llm_leitura, emCache.uso_llm_chamada)
      return
    }

    const seq = ++requisicaoSeq.current
    setCarregando(true)
    setErro(null)
    setAviso(null)
    setPipelineConcluido(false)
    onIaInicio?.()

    smartReadApi
      .analisarRiscosLeitura({
        documentos,
        incluir_llm: true,
        id_leitura_legado: idLeituraLegado ?? undefined,
      })
      .then((resposta) => {
        if (requisicaoSeq.current !== seq) return
        salvarCacheAnaliseRiscosSessaoSmartRead(chaveAnalise, resposta)
        setResumo(resposta.resumo)
        setRegrasContexto(resposta.contexto_v1.regras)
        setLlmHabilitado(resposta.llm_ativo)
        setAviso(resposta.aviso ?? null)
        setPipelineConcluido(true)
        onTokensAtualizados?.(resposta.uso_llm_leitura, resposta.uso_llm_chamada)
      })
      .catch((ex: unknown) => {
        if (requisicaoSeq.current !== seq) return
        setErro(ex instanceof Error ? ex.message : 'Falha na análise de riscos')
        setPipelineConcluido(!!auditoriaV1Local)
      })
      .finally(() => {
        if (requisicaoSeq.current === seq) {
          setCarregando(false)
          onIaFim?.()
        }
      })
  }, [chaveAnalise, documentos, idLeituraLegado, onTokensAtualizados, onIaInicio, onIaFim, auditoriaV1Local])

  function toggleExpandirRisco(risco: RiscoAduaneiroLeitura) {
    setRiscoExpandidoId((prev) => (prev === risco.id ? null : risco.id))
  }

  function expandirRisco(riscoId: string) {
    setRiscoExpandidoId(riscoId)
    window.requestAnimationFrame(() => {
      document.getElementById(`sr-risco-${riscoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function verRiscoDoChecklist(riscoId: string) {
    setModalChecklistAberto(false)
    window.requestAnimationFrame(() => expandirRisco(riscoId))
  }

  if (arquivosAnalisaveis.length === 0) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Aguardando análise dos arquivos para calcular riscos.</p>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Selecione um documento na sidebar para analisar riscos.</p>
      </div>
    )
  }

  return (
    <div className="sr-conf-riscos">
      {tituloContextoDocumento && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContextoDocumento}</span>
        </div>
      )}

      {carregando && (
        <p className="sr-conf-riscos-carregando" role="status">
          <CircleNotch size={18} className="sr-wizard-analise-arquivo-spin" aria-hidden />
          {resumo.total > 0 ? 'Enriquecendo com IA e validação NCM…' : 'Analisando documentos…'}
        </p>
      )}

      {erro && (
        <p className="sr-conf-riscos-erro" role="alert">
          {erro}
        </p>
      )}

      {aviso && !erro && (
        <p className="sr-conf-riscos-aviso" role="status">
          {aviso}
        </p>
      )}

      <section className="sr-conf-riscos-cabecalho" aria-label="Resumo da análise de riscos">
        <div className="sr-conf-riscos-cabecalho-principal">
          <div className="sr-conf-riscos-cabecalho-resumo">
            <div className="sr-conf-riscos-cabecalho-titulo-linha">
              <strong className="sr-conf-riscos-cabecalho-titulo">Análise de riscos</strong>
              <span className="sr-conf-riscos-cabecalho-subtitulo">
                {percentualConformidade}% sem críticos abertos
              </span>
            </div>

            {resumo.total > 0 && (
              <>
                <div
                  className="sr-conf-riscos-seg-bar"
                  role="img"
                  aria-label={`Distribuição: ${legendaSegmentosRisco ?? ''}`}
                >
                  {resumo.criticos > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__critico"
                      style={{ width: `${(resumo.criticos / resumo.total) * 100}%` }}
                    />
                  )}
                  {resumo.atencao > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__atencao"
                      style={{ width: `${(resumo.atencao / resumo.total) * 100}%` }}
                    />
                  )}
                  {resumo.informativos > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__informativo"
                      style={{ width: `${(resumo.informativos / resumo.total) * 100}%` }}
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

          <div className="sr-conf-progresso-busca">
            <div className="dt-header-busca">
              <MagnifyingGlass weight="duotone" size={14} className="dt-toc-busca-icon" />
              <input
                type="search"
                className="dt-toc-busca-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Localizar riscos"
                aria-label="Localizar riscos"
              />
              {busca && (
                <button
                  type="button"
                  className="dt-toc-busca-limpar"
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                >
                  <X size={12} weight="bold" />
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
            {contagemChecklist.verde} ok · {contagemChecklist.amarelo} atenção ·{' '}
            {contagemChecklist.vermelho} falha · {contagemChecklist.pendente} pendente
          </span>
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
          {riscosSelecionadosLista.length > 0 && (
            <AcoesCorrecaoRiscoNovaLeituraSmartRead riscos={riscosSelecionadosLista} />
          )}
          <span className="sr-conf-riscos-disclaimer-compacto">
            V1 + IA + NCM — apoio à conferência
          </span>
        </div>
      </section>

      <ModalChecklistConferenciaNovaLeituraSmartRead
        aberto={modalChecklistAberto}
        onFechar={() => setModalChecklistAberto(false)}
        documentos={documentos}
        parametrosChecklist={parametrosChecklist}
        onVerRisco={verRiscoDoChecklist}
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

        {!carregando && resumo.riscos.length === 0 && !erro ? (
          <p className="sr-conf-riscos-ok">Nenhum risco identificado na leitura atual.</p>
        ) : riscosVisiveis.length === 0 ? (
          <p className="sr-conf-vazio">Nenhum risco encontrado para a busca atual.</p>
        ) : (
          <div className="sr-conf-riscos-lista sr-conf-riscos-lista-plana">
            {riscosVisiveis.map((risco) => {
              const expandido = riscoExpandidoId === risco.id
              return (
                <ItemListaRisco
                  key={risco.id}
                  risco={risco}
                  selecionado={riscosSelecionados.has(risco.id)}
                  expandido={expandido}
                  onToggleExpandir={toggleExpandirRisco}
                  onToggleSelecao={toggleSelecaoRisco}
                  numero={numeracaoRiscos.get(risco.id) ?? 0}
                >
                  {expandido ? (
                    <PainelDetalheRiscoExpandidoNovaLeituraSmartRead
                      risco={risco}
                      arquivos={arquivos}
                      documentos={documentos}
                      parametrosChecklist={parametrosChecklist}
                      onVerEvidencia={onVerEvidencia}
                      onIrConferenciaCampos={onIrConferenciaCampos}
                      aguardandoClassificacao={carregando}
                    />
                  ) : null}
                </ItemListaRisco>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
