/**
 * ResumoConferenciaAnaliseRiscoNovaLeituraSmartRead — conferência usuária, Gravity e riscos
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretRight, ClipboardText, ShieldWarning, UserCheck } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { extrairDocumentosArquivoLocal } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { useConferenciaUsuarioDocumentoSmartRead } from '../../shared/use-conferencia-usuario-documento-smart-read'
import { montarDocumentosAnaliseRiscoDeArquivoLocal } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../../shared/analise-riscos-leitura-smart-read'
import type {
  ResumoRiscosAduaneirosLeitura,
  RiscoAduaneiroLeitura,
} from '../../../../shared/analise-riscos-leitura-smart-read'
import {
  aplicarFalhasMatrizAoResumoRiscos,
  contarChecklistPorStatus,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import {
  combinarResumoGeralComPackingLists,
  montarChecklistMatrizPackingList,
  montarResumoChecklistPackingLists,
  percentualConformeChecklistPackingList,
} from '../../../../shared/montar-checklist-matriz-packing-list-smart-read'
import {
  dispararAnaliseRiscosBackgroundSmartRead,
  montarChaveAnaliseRiscosSessaoSmartRead,
  obterFaseEnriquecimentoAnaliseRiscosEmVooSmartRead,
  obterRequisicaoAnaliseRiscosEmVooSmartRead,
} from '../../shared/disparar-analise-riscos-background-smart-read'
import { obterCacheAnaliseRiscosSessaoSmartRead } from '../../shared/cache-analise-riscos-sessao-smart-read'
import { BarraStatusChecklistSmartRead } from './barra-status-checklist-smart-read'
import { ModalChecklistConferenciaNovaLeituraSmartRead } from './modal-checklist-conferencia-nova-leitura-smart-read'

type AbaConferencia = 'campos' | 'qa' | 'riscos' | 'comunicacao'

type Props = {
  arquivo: ArquivoLocalNovaLeitura
  indiceDocumento: number
  abaAtiva: AbaConferencia
  idLeituraLegado?: string | null
  onIrAnaliseRiscos: () => void
  onVerRiscoDoChecklist?: (riscoId: string) => void
}

function filtrarRiscosPorRotuloDocumento(
  riscos: readonly RiscoAduaneiroLeitura[],
  rotulo: string | null,
): RiscoAduaneiroLeitura[] {
  if (!rotulo) return [...riscos]
  return riscos.filter((risco) => risco.evidencias.some((evidencia) => evidencia.documento === rotulo))
}

function montarResumoRiscosFiltrados(
  riscos: readonly RiscoAduaneiroLeitura[],
): ResumoRiscosAduaneirosLeitura {
  const criticos = riscos.filter((risco) => risco.severidade === 'critico').length
  const atencao = riscos.filter((risco) => risco.severidade === 'atencao').length
  const informativos = riscos.filter((risco) => risco.severidade === 'informativo').length
  return {
    riscos: [...riscos],
    total: riscos.length,
    criticos,
    atencao,
    informativos,
  }
}

function legendaRiscos(resumo: {
  total: number
  criticos: number
  atencao: number
  informativos: number
}): string | null {
  if (resumo.total === 0) return null
  return [
    resumo.criticos > 0 ? `${resumo.criticos} crítico${resumo.criticos === 1 ? '' : 's'}` : null,
    resumo.atencao > 0 ? `${resumo.atencao} atenção` : null,
    resumo.informativos > 0
      ? `${resumo.informativos} informativo${resumo.informativos === 1 ? '' : 's'}`
      : null,
  ]
    .filter((parte): parte is string => parte !== null)
    .join(' · ')
}

export function ResumoConferenciaAnaliseRiscoNovaLeituraSmartRead({
  arquivo,
  indiceDocumento,
  abaAtiva,
  idLeituraLegado = null,
  onIrAnaliseRiscos,
  onVerRiscoDoChecklist,
}: Props) {
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)

  const { resumoConferencia } = useConferenciaUsuarioDocumentoSmartRead(
    arquivo,
    indiceDocumento,
    idLeituraLegado,
  )

  const documentosRisco = useMemo(() => montarDocumentosAnaliseRiscoDeArquivoLocal(arquivo), [arquivo])

  const documentosRiscoAtivos = useMemo(() => {
    const todos = montarDocumentosAnaliseRiscoDeArquivoLocal(arquivo)
    return todos.filter((doc) => doc.indice === indiceDocumento)
  }, [arquivo, indiceDocumento])

  const rotuloDocumentoAtual = useMemo(() => {
    const documentos = extrairDocumentosArquivoLocal(arquivo)
    const documentoAtual = documentos[indiceDocumento]
    if (!documentoAtual) return null
    const tipoNorm = documentoAtual.tipo_documento.trim() || `Documento ${indiceDocumento + 1}`
    return `${arquivo.arquivo.name} · ${tipoNorm}`
  }, [arquivo, indiceDocumento])

  const documentoAtualEhPackingList = useMemo(() => {
    const documentos = extrairDocumentosArquivoLocal(arquivo)
    const documentoAtual = documentos[indiceDocumento]
    return Boolean(documentoAtual?.tipo_documento.toUpperCase().includes('PACKING'))
  }, [arquivo, indiceDocumento])

  const chaveAnaliseRiscos = useMemo(
    () => montarChaveAnaliseRiscosSessaoSmartRead(idLeituraLegado, [arquivo]),
    [arquivo, idLeituraLegado],
  )

  // Redispara a análise quando não há cache (ex.: leitura retomada ou falha anterior)
  // e força re-render quando a resposta chega — sem isso o checklist fica pendente para sempre.
  const [versaoAnalise, setVersaoAnalise] = useState(0)
  const [analiseEncerrada, setAnaliseEncerrada] = useState(false)
  const [avisoAnalise, setAvisoAnalise] = useState<string | null>(null)
  const tentativasAnaliseRef = useRef(0)
  const chaveAnaliseTentadaRef = useRef<string | null>(null)

  const emCacheRiscos = useMemo(
    () => obterCacheAnaliseRiscosSessaoSmartRead(chaveAnaliseRiscos),
    [chaveAnaliseRiscos, versaoAnalise],
  )

  useEffect(() => {
    tentativasAnaliseRef.current = 0
    setAnaliseEncerrada(false)
    setAvisoAnalise(null)
    chaveAnaliseTentadaRef.current = null
  }, [chaveAnaliseRiscos])

  useEffect(() => {
    if (emCacheRiscos) {
      setAnaliseEncerrada(true)
      setAvisoAnalise(emCacheRiscos.aviso ?? null)
      return
    }
    if (analiseEncerrada) return
    // Não retornar cedo se já há requisição em voo: dispararAnaliseRiscosBackgroundSmartRead
    // deduplica e anexa os callbacks à promessa existente — sem isso a prévia nunca é substituída.

    const disparar = () => {
      dispararAnaliseRiscosBackgroundSmartRead({
        arquivos: [arquivo],
        idLeituraLegado,
        onInicio: () => setVersaoAnalise((v) => v + 1),
        onConcluido: (resposta) => {
          setAnaliseEncerrada(true)
          setAvisoAnalise(resposta.aviso ?? null)
          setVersaoAnalise((v) => v + 1)
        },
        onParcial: () => setVersaoAnalise((v) => v + 1),
        onErro: () => {
          if (tentativasAnaliseRef.current < 2) {
            tentativasAnaliseRef.current += 1
            chaveAnaliseTentadaRef.current = null
            window.setTimeout(disparar, 1_500)
          } else {
            setAnaliseEncerrada(true)
            setAvisoAnalise('Análise interrompida — tempo limite ou falha de rede. Regras de código já avaliadas.')
          }
          setVersaoAnalise((v) => v + 1)
        },
      })
    }

    if (chaveAnaliseTentadaRef.current === chaveAnaliseRiscos) return
    chaveAnaliseTentadaRef.current = chaveAnaliseRiscos
    tentativasAnaliseRef.current = 1
    disparar()
  }, [analiseEncerrada, arquivo, chaveAnaliseRiscos, emCacheRiscos, idLeituraLegado])

  const resumoRiscos = useMemo(() => {
    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnaliseRiscos)
    if (emCache?.resumo.total) {
      const riscosDocumento = filtrarRiscosPorRotuloDocumento(
        emCache.resumo.riscos,
        rotuloDocumentoAtual,
      )
      return montarResumoRiscosFiltrados(riscosDocumento)
    }

    if (documentosRiscoAtivos.length === 0) {
      return { total: 0, criticos: 0, atencao: 0, informativos: 0, riscos: [] as const }
    }

    return executarAuditoriaV1AnaliseRiscosLeitura(documentosRiscoAtivos).resumo
  }, [chaveAnaliseRiscos, documentosRiscoAtivos, rotuloDocumentoAtual, versaoAnalise])

  const auditoriaV1Arquivo = useMemo(
    () =>
      documentosRisco.length === 0
        ? null
        : executarAuditoriaV1AnaliseRiscosLeitura(documentosRisco),
    [documentosRisco],
  )

  const parametrosChecklist = useMemo(() => {
    const regrasEfetivas = emCacheRiscos?.contexto_v1.regras ?? auditoriaV1Arquivo?.contexto.regras ?? []
    const riscosBrutos =
      emCacheRiscos && emCacheRiscos.resumo.total > 0
        ? emCacheRiscos.resumo.riscos
        : (auditoriaV1Arquivo?.resumo.riscos ?? [])
    const resumoRiscosEfetivo = aplicarFalhasMatrizAoResumoRiscos(regrasEfetivas, {
      riscos: riscosBrutos,
      total: riscosBrutos.length,
      criticos: riscosBrutos.filter((r) => r.severidade === 'critico').length,
      atencao: riscosBrutos.filter((r) => r.severidade === 'atencao').length,
      informativos: riscosBrutos.filter((r) => r.severidade === 'informativo').length,
    })
    const carregando = Boolean(obterRequisicaoAnaliseRiscosEmVooSmartRead(chaveAnaliseRiscos))
    const v1Disponivel = Boolean(auditoriaV1Arquivo?.contexto.regras.length)
    const pipelineConcluido =
      v1Disponivel || Boolean(emCacheRiscos) || (analiseEncerrada && !carregando)
    const enriquecimento_ia_em_andamento = carregando && !emCacheRiscos?.llm_ativo
    const fase_enriquecimento_analise = obterFaseEnriquecimentoAnaliseRiscosEmVooSmartRead(
      chaveAnaliseRiscos,
    )
    const analiseServidorIndisponivel = analiseEncerrada && !carregando && !emCacheRiscos?.llm_ativo

    return {
      regras: regrasEfetivas,
      riscos: resumoRiscosEfetivo.riscos,
      pipelineConcluido,
      llmHabilitado: emCacheRiscos?.llm_ativo ?? false,
      carregando,
      analise_servidor_indisponivel: analiseServidorIndisponivel,
      enriquecimento_ia_em_andamento,
      fase_enriquecimento_analise,
      cnpj_oficial: emCacheRiscos?.contexto_v1.cnpj_oficial ?? null,
      documentos: documentosRisco,
    }
  }, [
    analiseEncerrada,
    auditoriaV1Arquivo,
    chaveAnaliseRiscos,
    documentosRisco,
    emCacheRiscos,
    versaoAnalise,
  ])

  const subdocumentosSidebar = useMemo(
    () =>
      extrairDocumentosArquivoLocal(arquivo).map((doc) => ({
        indice: doc.indice,
        tipo_documento: doc.tipo_documento,
      })),
    [arquivo],
  )

  const resumoGeralChecklist = useMemo(() => {
    if (documentosRisco.length === 0) return null
    const resumoInvoices = montarResumoGeralChecklistInvoices(parametrosChecklist)
    const resumosPackingList = montarResumoChecklistPackingLists({
      ...parametrosChecklist,
      documentos: documentosRisco,
    })
    return combinarResumoGeralComPackingLists(resumoInvoices, resumosPackingList)
  }, [documentosRisco, parametrosChecklist])

  const resumoChecklistDocumentoAtual = useMemo(() => {
    if (!rotuloDocumentoAtual || documentosRisco.length === 0) return null
    const porInvoice = resumoGeralChecklist?.por_invoice.find(
      (inv) => inv.rotulo === rotuloDocumentoAtual,
    )
    if (porInvoice) {
      return {
        contagem: porInvoice.contagem,
        percentual: porInvoice.percentual_conforme,
      }
    }
    if (documentoAtualEhPackingList) {
      const itensPl = montarChecklistMatrizPackingList({
        ...parametrosChecklist,
        rotulo_documento: rotuloDocumentoAtual,
      })
      const contagemPl = contarChecklistPorStatus(itensPl)
      return { contagem: contagemPl, percentual: percentualConformeChecklistPackingList(contagemPl) }
    }
    const itens = montarChecklistMatrizInvoice({
      ...parametrosChecklist,
      rotulo_documento: rotuloDocumentoAtual,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual =
      contagem.total === 0
        ? 0
        : Math.round(((contagem.verde + contagem.na) / contagem.total) * 100)
    return { contagem, percentual }
  }, [
    documentoAtualEhPackingList,
    documentosRisco.length,
    parametrosChecklist,
    resumoGeralChecklist?.por_invoice,
    rotuloDocumentoAtual,
  ])

  const contagemChecklist = resumoChecklistDocumentoAtual?.contagem ??
    resumoGeralChecklist?.contagem_global ?? {
      verde: 0,
      amarelo: 0,
      vermelho: 0,
      pendente: 0,
      na: 0,
      total: 0,
    }

  const percentualChecklistVerde =
    resumoChecklistDocumentoAtual?.percentual ?? resumoGeralChecklist?.percentual_global ?? 0

  const carregandoRiscos = Boolean(obterRequisicaoAnaliseRiscosEmVooSmartRead(chaveAnaliseRiscos))

  const percentualSemCriticos =
    resumoRiscos.total === 0
      ? 100
      : Math.round(((resumoRiscos.total - resumoRiscos.criticos) / resumoRiscos.total) * 100)

  const legendaSegmentos = legendaRiscos(resumoRiscos)
  const riscosAtivo = abaAtiva === 'riscos'
  const usuarioAtivo = abaAtiva === 'campos' || abaAtiva === 'qa'

  const legendaConferenciaUsuario = useMemo(() => {
    if (resumoConferencia.total === 0) return 'Nenhum item para conferir neste documento'
    const partes: string[] = []
    if (resumoConferencia.totalCampos > 0) {
      partes.push(
        `${resumoConferencia.marcadosCampos}/${resumoConferencia.totalCampos} campo${resumoConferencia.totalCampos === 1 ? '' : 's'}`,
      )
    }
    if (resumoConferencia.totalRiscos > 0) {
      partes.push(
        `${resumoConferencia.marcadosRiscos}/${resumoConferencia.totalRiscos} risco${resumoConferencia.totalRiscos === 1 ? '' : 's'}`,
      )
    }
    return `${resumoConferencia.marcados}/${resumoConferencia.total} conferidos por você (${partes.join(' · ')})`
  }, [resumoConferencia])

  return (
    <>
    <section
      className="sr-conf-resumo-triplo"
      aria-label="Resumo de conferência usuário, conformidade Gravity e análise de risco"
    >
      <div
        className={`sr-conf-resumo-bloco sr-conf-resumo-bloco--conferencia${usuarioAtivo ? ' sr-conf-resumo-bloco--conferencia-ativo' : ''}`}
      >
        <div className="sr-conf-resumo-bloco-topo">
          <span className="sr-conf-resumo-icone-bloco sr-conf-resumo-icone-bloco--usuario" aria-hidden>
            <UserCheck size={14} weight="duotone" />
          </span>
          <TooltipGlobal
            titulo="Conferência usuário"
            descricao="Campos e riscos que você marcou como revisados neste documento"
          >
            <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">
              Conferência usuário
            </span>
          </TooltipGlobal>
        </div>

        <div className="sr-conf-resumo-linha-barra">
          <div
            className="sr-conf-progresso-barra"
            role="progressbar"
            aria-valuenow={resumoConferencia.percentual}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${resumoConferencia.percentual}% dos itens conferidos manualmente`}
          >
            <div
              className="sr-conf-progresso-barra-fill sr-conf-progresso-barra-fill--conferencia"
              style={{ width: `${resumoConferencia.percentual}%` }}
            />
          </div>
          <span className="sr-conf-progresso-pct sr-conf-progresso-pct--conferencia">
            {resumoConferencia.percentual}%
          </span>
        </div>

        <p className="sr-conf-resumo-legenda">{legendaConferenciaUsuario}</p>
      </div>

      <button
        type="button"
        className={`sr-conf-resumo-bloco sr-conf-resumo-bloco--checklist${modalChecklistAberto ? ' sr-conf-resumo-bloco--checklist-ativo' : ''}`}
        onClick={() => setModalChecklistAberto(true)}
        aria-haspopup="dialog"
        aria-label="Abrir conformidade Gravity — checklist matriz completo"
      >
        <div className="sr-conf-resumo-riscos-topo">
          <TooltipGlobal
            titulo="Conformidade Gravity"
            descricao="Percentual de conformidade da matriz Gravity — clique para ver o detalhe"
          >
            <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">
              <ClipboardText size={12} weight="duotone" aria-hidden />
              Conformidade Gravity
            </span>
          </TooltipGlobal>
          <CaretRight size={12} weight="bold" className="sr-conf-resumo-seta" aria-hidden />
        </div>

        <div className="sr-conf-resumo-linha-barra">
          <span className="sr-conf-resumo-checklist-pct">{percentualChecklistVerde}%</span>
          <span className="sr-conf-resumo-checklist-conforme">de conformidade</span>
        </div>

        <BarraStatusChecklistSmartRead
          verde={contagemChecklist.verde}
          amarelo={contagemChecklist.amarelo}
          vermelho={contagemChecklist.vermelho}
          pendente={contagemChecklist.pendente}
          na={contagemChecklist.na}
          total={contagemChecklist.total}
          classe="sr-conf-resumo-checklist-barra"
        />

        <p className="sr-conf-resumo-legenda">
          {contagemChecklist.verde} ok · {contagemChecklist.amarelo} atenção ·{' '}
          {contagemChecklist.vermelho} falha · {contagemChecklist.pendente} pendente
        </p>
      </button>

      <button
        type="button"
        className={`sr-conf-resumo-bloco sr-conf-resumo-bloco--riscos${riscosAtivo ? ' sr-conf-resumo-bloco--riscos-ativo' : ''}`}
        onClick={() => {
          if (!riscosAtivo) onIrAnaliseRiscos()
        }}
        aria-current={riscosAtivo ? 'page' : undefined}
        aria-label={
          riscosAtivo
            ? 'Análise de risco — aba ativa'
            : 'Abrir análise de risco — problemas detectados'
        }
      >
        <div className="sr-conf-resumo-riscos-topo">
          <TooltipGlobal
            titulo="Análise de risco"
            descricao="Problemas acionáveis que a Gravity detectou — clique para ver a lista"
          >
            <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">
              <ShieldWarning size={12} weight="duotone" aria-hidden />
              Análise de risco
            </span>
          </TooltipGlobal>
          {!riscosAtivo && <CaretRight size={12} weight="bold" className="sr-conf-resumo-seta" aria-hidden />}
        </div>

        <p className="sr-conf-resumo-riscos-subtitulo">
          {carregandoRiscos && resumoRiscos.total === 0
            ? 'Analisando documentos…'
            : resumoRiscos.total === 0
              ? 'Nenhum problema detectado'
              : `${percentualSemCriticos}% sem críticos abertos`}
        </p>

        {resumoRiscos.total > 0 && (
          <>
            <div
              className="sr-conf-riscos-seg-bar sr-conf-riscos-seg-bar--compacta"
              role="img"
              aria-label={`Distribuição: ${legendaSegmentos ?? ''}`}
            >
              {resumoRiscos.criticos > 0 && (
                <span
                  className="sr-conf-riscos-seg-bar__critico"
                  style={{ width: `${(resumoRiscos.criticos / resumoRiscos.total) * 100}%` }}
                />
              )}
              {resumoRiscos.atencao > 0 && (
                <span
                  className="sr-conf-riscos-seg-bar__atencao"
                  style={{ width: `${(resumoRiscos.atencao / resumoRiscos.total) * 100}%` }}
                />
              )}
              {resumoRiscos.informativos > 0 && (
                <span
                  className="sr-conf-riscos-seg-bar__informativo"
                  style={{ width: `${(resumoRiscos.informativos / resumoRiscos.total) * 100}%` }}
                />
              )}
            </div>
            {legendaSegmentos && (
              <p className="sr-conf-resumo-legenda">
                {resumoRiscos.total} {resumoRiscos.total === 1 ? 'problema' : 'problemas'} · {legendaSegmentos}
              </p>
            )}
          </>
        )}
      </button>
    </section>

    <ModalChecklistConferenciaNovaLeituraSmartRead
      aberto={modalChecklistAberto}
      onFechar={() => setModalChecklistAberto(false)}
      documentos={documentosRisco}
      nomeArquivo={arquivo.arquivo.name}
      subdocumentosSidebar={subdocumentosSidebar}
      parametrosChecklist={parametrosChecklist}
      avisoAnalise={emCacheRiscos?.aviso ?? avisoAnalise}
      rotuloDocumentoInicial={rotuloDocumentoAtual}
      indiceDocumentoInicial={indiceDocumento}
      onVerRisco={(riscoId) => {
        setModalChecklistAberto(false)
        onIrAnaliseRiscos()
        onVerRiscoDoChecklist?.(riscoId)
      }}
    />
    </>
  )
}
