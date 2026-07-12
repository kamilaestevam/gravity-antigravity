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
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import {
  aplicarCorrecaoSugeridaPadraoRisco,
  montarDocumentosAnaliseRiscoDeArquivoLocal,
  montarDocumentosAnaliseRiscoDeArquivosLocais,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import {
  obterCacheAnaliseRiscosSessaoSmartRead,
  salvarCacheAnaliseRiscosSessaoSmartRead,
} from '../../shared/cache-analise-riscos-sessao-smart-read'
import { persistirCacheAnaliseRiscosProgressoSmartRead } from '../../shared/persistencia-leitura-smart-read'
import { obterRequisicaoAnaliseRiscosEmVooSmartRead, obterFaseEnriquecimentoAnaliseRiscosEmVooSmartRead, dispararAnaliseRiscosBackgroundSmartRead } from '../../shared/disparar-analise-riscos-background-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../../shared/analise-riscos-leitura-smart-read'
import type { RegraAuditoriaV1 } from '../../../../shared/analise-riscos-leitura-smart-read'
import { PainelDetalheRiscoExpandidoNovaLeituraSmartRead } from './painel-detalhe-risco-expandido-nova-leitura-smart-read'
import type { FocoConferenciaCamposNovaLeituraSmartRead } from '../../shared/foco-conferencia-campos-nova-leitura-smart-read'
import type {
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import {
  chaveRiscoConferenciaUsuario,
  usarRiscosMarcacaoConferencia,
} from '../../shared/checklist-marcacao-usuario-smart-read'
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
  conferido,
  onAlternarConferido,
  onToggleExpandir,
  children,
}: {
  risco: RiscoAduaneiroLeitura
  numero: number
  expandido: boolean
  conferido: boolean
  onAlternarConferido: () => void
  onToggleExpandir: (risco: RiscoAduaneiroLeitura) => void
  children?: ReactNode
}) {
  const risco = aplicarCorrecaoSugeridaPadraoRisco(riscoBruto)

  return (
    <section
      id={`sr-risco-${risco.id}`}
      className={`dt-secao sr-conf-risco-item-lista${expandido ? ' sr-conf-risco-item-lista--expandido' : ' dt-secao--colapsada'}${conferido ? ' sr-conf-risco-item-lista--conferido' : ''}`}
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
          <TooltipGlobal
            titulo={conferido ? 'Conferido' : 'Marcar como conferido'}
            descricao={
              conferido
                ? 'Clique para desmarcar este risco'
                : 'Indica que você revisou este risco manualmente'
            }
          >
            <input
              type="checkbox"
              className="sr-conf-chk-checkbox sr-conf-risco-checkbox"
              checked={conferido}
              onClick={(e) => e.stopPropagation()}
              onChange={onAlternarConferido}
              aria-label={
                conferido
                  ? `Desmarcar conferência do risco: ${risco.titulo}`
                  : `Marcar risco como conferido: ${risco.titulo}`
              }
            />
          </TooltipGlobal>
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
  riscoExpandirId?: string | null
  onRiscoExpandirConsumido?: () => void
}

export function ConferenciaRiscosAduaneirosNovaLeituraSmartRead({
  arquivos,
  arquivoConferencia = null,
  indiceDocumentoConferencia = 0,
  tituloContextoDocumento = '',
  onVerEvidencia,
  onIrConferenciaCampos,
  riscoExpandirId = null,
  onRiscoExpandirConsumido,
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
  const [regrasContexto, setRegrasContexto] = useState<RegraAuditoriaV1[]>([])
  const [pipelineConcluido, setPipelineConcluido] = useState(false)
  const [llmHabilitado, setLlmHabilitado] = useState(false)
  const [riscoExpandidoId, setRiscoExpandidoId] = useState<string | null>(null)

  const chaveMarcacaoRiscos =
    arquivoConferencia != null
      ? `${arquivoConferencia.id_arquivo_local}:${indiceDocumentoConferencia}`
      : ''
  const { estaMarcado: riscoEstaConferido, alternarMarcado: alternarRiscoConferido, alternarMarcadosLote: alternarRiscosConferidosLote } =
    usarRiscosMarcacaoConferencia(chaveMarcacaoRiscos)

  const arquivosAnalisaveis = useMemo(
    () => arquivos.filter((a) => a.status_arquivo_local === 'completo'),
    [arquivos],
  )

  const documentos = useMemo(() => {
    if (arquivoConferencia) {
      return montarDocumentosAnaliseRiscoDeArquivoLocal(arquivoConferencia)
    }
    return montarDocumentosAnaliseRiscoDeArquivosLocais(arquivosAnalisaveis)
  }, [arquivoConferencia, arquivosAnalisaveis])

  const chaveDocumento = `${arquivoConferencia?.id_arquivo_local ?? ''}:${indiceDocumentoConferencia}`

  useEffect(() => {
    setRiscoExpandidoId(null)
    setBusca('')
  }, [chaveDocumento])

  useEffect(() => {
    if (!riscoExpandirId) return
    setRiscoExpandidoId(riscoExpandirId)
    window.requestAnimationFrame(() => {
      document.getElementById(`sr-risco-${riscoExpandirId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      onRiscoExpandirConsumido?.()
    })
  }, [riscoExpandirId, onRiscoExpandirConsumido])

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

  const regrasEfetivas = useMemo(() => {
    const passo1 = auditoriaV1Local?.contexto.regras ?? []
    if (regrasContexto.length === 0) return passo1
    const porId = new Map(passo1.map((r) => [r.id, r]))
    for (const r of regrasContexto) porId.set(r.id, r)
    return [...porId.values()]
  }, [auditoriaV1Local, regrasContexto])

  const riscosEfetivos = useMemo(() => {
    if (resumo.total > 0) return resumo.riscos
    return auditoriaV1Local?.resumo.riscos ?? []
  }, [resumo, auditoriaV1Local])

  const resumoExibicao = useMemo(() => {
    if (resumo.total > 0) return resumo
    const v1 = auditoriaV1Local?.resumo
    if (!v1 || v1.total === 0) return resumo
    return v1
  }, [resumo, auditoriaV1Local])

  const parametrosChecklist = useMemo(() => {
    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnalise)
    const carregandoEfetivo =
      carregando || Boolean(obterRequisicaoAnaliseRiscosEmVooSmartRead(chaveAnalise))
    const v1Disponivel = Boolean(auditoriaV1Local?.contexto.regras.length)
    return {
      regras: regrasEfetivas,
      riscos: riscosEfetivos,
      pipelineConcluido: pipelineConcluido || v1Disponivel,
      llmHabilitado,
      carregando: carregandoEfetivo,
      analise_servidor_indisponivel: Boolean(erro) && (pipelineConcluido || v1Disponivel) && !carregandoEfetivo,
      enriquecimento_ia_em_andamento: carregandoEfetivo && !emCache?.llm_ativo,
      fase_enriquecimento_analise: obterFaseEnriquecimentoAnaliseRiscosEmVooSmartRead(chaveAnalise),
      cnpj_oficial: emCache?.contexto_v1.cnpj_oficial ?? null,
      documentos,
    }
  }, [
    regrasEfetivas,
    riscosEfetivos,
    pipelineConcluido,
    llmHabilitado,
    carregando,
    documentos,
    erro,
    chaveAnalise,
    auditoriaV1Local,
  ])

  const riscosVisiveis = useMemo(
    () => filtrarRiscosPorBusca(riscosEfetivos, busca),
    [riscosEfetivos, busca],
  )

  const chavesRiscosVisiveis = useMemo(
    () => riscosVisiveis.map((risco) => chaveRiscoConferenciaUsuario(risco.id)),
    [riscosVisiveis],
  )

  const todosRiscosVisiveisConferidos =
    chavesRiscosVisiveis.length > 0 &&
    chavesRiscosVisiveis.every((chave) => riscoEstaConferido(chave))

  const numeracaoRiscos = useMemo(() => {
    const mapa = new Map<string, number>()
    riscosVisiveis.forEach((risco, indice) => mapa.set(risco.id, indice + 1))
    return mapa
  }, [riscosVisiveis])

  function aplicarRespostaAnaliseRiscos(
    resposta: Awaited<ReturnType<typeof smartReadApi.analisarRiscosLeitura>>,
  ) {
    salvarCacheAnaliseRiscosSessaoSmartRead(chaveAnalise, resposta)
    if (idLeituraLegado) {
      void persistirCacheAnaliseRiscosProgressoSmartRead(idLeituraLegado, chaveAnalise, resposta)
    }
    setResumo(resposta.resumo)
    setRegrasContexto(resposta.contexto_v1.regras)
    setLlmHabilitado(resposta.llm_ativo)
    setAviso(resposta.aviso ?? null)
    setPipelineConcluido(true)
    onTokensAtualizados?.(resposta.uso_llm_leitura, resposta.uso_llm_chamada)
  }

  useEffect(() => {
    if (documentos.length === 0) return

    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnalise)
    if (emCache?.llm_ativo) {
      aplicarRespostaAnaliseRiscos(emCache)
      setCarregando(false)
      return
    }

    if (emCache) {
      aplicarRespostaAnaliseRiscos(emCache)
    }

    // Se já há requisição em voo, o disparo abaixo deduplica e anexa onConcluido à
    // promessa existente — o retorno antecipado deixava a prévia sem resultado final.
    setCarregando(true)
    setErro(null)
    setAviso(null)
    if (!emCache) setPipelineConcluido(false)
    onIaInicio?.()

    dispararAnaliseRiscosBackgroundSmartRead({
      arquivos: arquivosAnalisaveis,
      idLeituraLegado: idLeituraLegado ?? null,
      onParcial: (resposta) => aplicarRespostaAnaliseRiscos(resposta),
      onTokensAtualizados: onTokensAtualizados,
      onConcluido: (resposta) => {
        aplicarRespostaAnaliseRiscos(resposta)
        setCarregando(false)
        onIaFim?.()
      },
      onErro: (ex: unknown) => {
        setErro(ex instanceof Error ? ex.message : 'Falha na análise de riscos')
        setPipelineConcluido(!!auditoriaV1Local)
        setCarregando(false)
        onIaFim?.()
      },
    })
  }, [arquivosAnalisaveis, chaveAnalise, documentos.length, idLeituraLegado, onIaFim, onIaInicio, onTokensAtualizados])

  function toggleExpandirRisco(risco: RiscoAduaneiroLeitura) {
    setRiscoExpandidoId((prev) => (prev === risco.id ? null : risco.id))
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
          {resumoExibicao.total > 0 ? 'Enriquecendo com IA e validação NCM…' : 'Analisando documentos…'}
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

      <section className="sr-conf-riscos-cabecalho" aria-label="Ferramentas da lista de riscos">
        <div className="sr-conf-riscos-cabecalho-principal">
          <div className="sr-conf-progresso-busca sr-conf-progresso-busca--solo">
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
          {riscosVisiveis.length > 0 && (
            <>
              <label className="dt-main-toolbar-btn sr-conf-toolbar-selecionar-conferencia">
                <input
                  type="checkbox"
                  className="sr-conf-chk-checkbox"
                  checked={todosRiscosVisiveisConferidos}
                  onChange={() =>
                    alternarRiscosConferidosLote(
                      chavesRiscosVisiveis,
                      !todosRiscosVisiveisConferidos,
                    )
                  }
                  aria-label="Conferir todos os riscos visíveis"
                />
                <span>Conferir todos ({riscosVisiveis.length})</span>
              </label>
            </>
          )}
          <span className="sr-conf-riscos-disclaimer-compacto">
            V1 + IA + NCM — apoio à conferência
          </span>
        </div>
      </section>

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

        {!carregando && riscosEfetivos.length === 0 && !erro ? (
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
                  conferido={riscoEstaConferido(chaveRiscoConferenciaUsuario(risco.id))}
                  onAlternarConferido={() =>
                    alternarRiscoConferido(chaveRiscoConferenciaUsuario(risco.id))
                  }
                  expandido={expandido}
                  onToggleExpandir={toggleExpandirRisco}
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
