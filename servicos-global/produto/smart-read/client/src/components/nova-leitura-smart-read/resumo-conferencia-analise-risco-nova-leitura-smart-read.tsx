/**
 * ResumoConferenciaAnaliseRiscoNovaLeituraSmartRead — conferência manual + atalho para riscos
 */

import { useMemo, useState } from 'react'
import { CaretRight, ClipboardText, ShieldWarning } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { resolverArquivoApiLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { extrairSecoesConferenciaLeitura } from '../../shared/extrair-secoes-conferencia-leitura-smart-read'
import {
  chaveCampoConferenciaUsuario,
  contarConferenciaManualChecklist,
  usarCamposMarcacaoConferencia,
} from '../../shared/checklist-marcacao-usuario-smart-read'
import { montarDocumentosAnaliseRiscoDeArquivoLocal } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../../shared/analise-riscos-leitura-smart-read'
import { montarResumoGeralChecklistInvoices } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import {
  montarChaveAnaliseRiscosSessaoSmartRead,
  obterRequisicaoAnaliseRiscosEmVooSmartRead,
} from '../../shared/disparar-analise-riscos-background-smart-read'
import { obterCacheAnaliseRiscosSessaoSmartRead } from '../../shared/cache-analise-riscos-sessao-smart-read'
import { BarraStatusChecklistSmartRead } from './barra-status-checklist-smart-read'
import { ModalChecklistConferenciaNovaLeituraSmartRead } from './modal-checklist-conferencia-nova-leitura-smart-read'

type AbaConferencia = 'campos' | 'qa' | 'riscos'

type Props = {
  arquivo: ArquivoLocalNovaLeitura
  indiceDocumento: number
  abaAtiva: AbaConferencia
  idLeituraLegado?: string | null
  onIrAnaliseRiscos: () => void
  onVerRiscoDoChecklist?: (riscoId: string) => void
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
  const arquivoApi = resolverArquivoApiLeitura(arquivo)
  const extracao = arquivoApi?.resultado_extracao?.[indiceDocumento]

  const secoes = useMemo(
    () => extrairSecoesConferenciaLeitura(extracao?.dados ?? {}),
    [extracao?.dados],
  )

  const chaveMarcacaoCampos = `${arquivo.id_arquivo_local}:${indiceDocumento}`
  const { marcados: camposConferidos } = usarCamposMarcacaoConferencia(chaveMarcacaoCampos)

  const chavesCamposConferencia = useMemo(
    () =>
      secoes.flatMap((secao) =>
        secao.campos.map((campo) => chaveCampoConferenciaUsuario(campo.chave)),
      ),
    [secoes],
  )

  const resumoConferencia = useMemo(
    () => contarConferenciaManualChecklist(camposConferidos, chavesCamposConferencia),
    [camposConferidos, chavesCamposConferencia],
  )

  const documentosRisco = useMemo(() => montarDocumentosAnaliseRiscoDeArquivoLocal(arquivo), [arquivo])

  const documentosRiscoAtivos = useMemo(() => {
    const todos = montarDocumentosAnaliseRiscoDeArquivoLocal(arquivo)
    return todos.filter((doc) => doc.indice === indiceDocumento)
  }, [arquivo, indiceDocumento])

  const chaveAnaliseRiscos = useMemo(
    () => montarChaveAnaliseRiscosSessaoSmartRead(idLeituraLegado, [arquivo]),
    [arquivo, idLeituraLegado],
  )

  const resumoRiscos = useMemo(() => {
    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnaliseRiscos)
    if (emCache?.resumo.total) return emCache.resumo

    if (documentosRiscoAtivos.length === 0) {
      return { total: 0, criticos: 0, atencao: 0, informativos: 0, riscos: [] as const }
    }

    return executarAuditoriaV1AnaliseRiscosLeitura(documentosRiscoAtivos).resumo
  }, [chaveAnaliseRiscos, documentosRiscoAtivos])

  const emCacheRiscos = useMemo(
    () => obterCacheAnaliseRiscosSessaoSmartRead(chaveAnaliseRiscos),
    [chaveAnaliseRiscos],
  )

  const auditoriaV1Arquivo = useMemo(
    () =>
      documentosRisco.length === 0
        ? null
        : executarAuditoriaV1AnaliseRiscosLeitura(documentosRisco),
    [documentosRisco],
  )

  const parametrosChecklist = useMemo(() => {
    const riscosEfetivos =
      emCacheRiscos && emCacheRiscos.resumo.total > 0
        ? emCacheRiscos.resumo.riscos
        : (auditoriaV1Arquivo?.resumo.riscos ?? [])
    const regrasEfetivas = emCacheRiscos?.contexto_v1.regras ?? auditoriaV1Arquivo?.contexto.regras ?? []
    const carregando = Boolean(obterRequisicaoAnaliseRiscosEmVooSmartRead(chaveAnaliseRiscos))

    return {
      regras: regrasEfetivas,
      riscos: riscosEfetivos,
      pipelineConcluido: Boolean(emCacheRiscos),
      llmHabilitado: emCacheRiscos?.llm_ativo ?? false,
      carregando,
      documentos: documentosRisco,
    }
  }, [auditoriaV1Arquivo, chaveAnaliseRiscos, documentosRisco, emCacheRiscos])

  const resumoGeralChecklist = useMemo(
    () =>
      documentosRisco.length === 0
        ? null
        : montarResumoGeralChecklistInvoices(parametrosChecklist),
    [documentosRisco.length, parametrosChecklist],
  )

  const contagemChecklist = resumoGeralChecklist?.contagem_global ?? {
    verde: 0,
    amarelo: 0,
    vermelho: 0,
    pendente: 0,
    na: 0,
    total: 0,
  }

  const percentualChecklistVerde = resumoGeralChecklist?.percentual_global ?? 0

  const carregandoRiscos = Boolean(obterRequisicaoAnaliseRiscosEmVooSmartRead(chaveAnaliseRiscos))

  const percentualSemCriticos =
    resumoRiscos.total === 0
      ? 100
      : Math.round(((resumoRiscos.total - resumoRiscos.criticos) / resumoRiscos.total) * 100)

  const legendaSegmentos = legendaRiscos(resumoRiscos)
  const riscosAtivo = abaAtiva === 'riscos'

  return (
    <>
    <section className="sr-conf-resumo-triplo" aria-label="Resumo de conferência, riscos e checklist">
      <div className="sr-conf-resumo-bloco sr-conf-resumo-bloco--conferencia">
        <TooltipGlobal
          titulo="Conferência"
          descricao="Campos que você marcou como revisados neste documento"
        >
          <span className="sr-conf-resumo-rotulo">Conferência</span>
        </TooltipGlobal>

        <div className="sr-conf-resumo-linha-barra">
          <div
            className="sr-conf-progresso-barra"
            role="progressbar"
            aria-valuenow={resumoConferencia.percentual}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${resumoConferencia.percentual}% dos campos conferidos manualmente`}
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

        <p className="sr-conf-resumo-legenda">
          {resumoConferencia.marcados}/{resumoConferencia.total} campos conferidos
        </p>
      </div>

      <button
        type="button"
        className={`sr-conf-resumo-bloco sr-conf-resumo-bloco--riscos${riscosAtivo ? ' sr-conf-resumo-bloco--riscos-ativo' : ''}`}
        onClick={() => {
          if (!riscosAtivo) onIrAnaliseRiscos()
        }}
        aria-current={riscosAtivo ? 'page' : undefined}
        aria-label={
          riscosAtivo
            ? 'Análise de Risco — aba ativa'
            : 'Abrir aba Análise de Riscos'
        }
      >
        <div className="sr-conf-resumo-riscos-topo">
          <TooltipGlobal
            titulo="Análise de Risco"
            descricao="Alertas fiscais e documentais detectados na leitura — clique para abrir"
          >
            <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">
              <ShieldWarning size={12} weight="duotone" aria-hidden />
              Análise de Risco
            </span>
          </TooltipGlobal>
          {!riscosAtivo && <CaretRight size={12} weight="bold" className="sr-conf-resumo-seta" aria-hidden />}
        </div>

        <p className="sr-conf-resumo-riscos-subtitulo">
          {carregandoRiscos && resumoRiscos.total === 0
            ? 'Analisando documentos…'
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
                {resumoRiscos.total} {resumoRiscos.total === 1 ? 'risco' : 'riscos'} · {legendaSegmentos}
              </p>
            )}
          </>
        )}
      </button>

      <button
        type="button"
        className={`sr-conf-resumo-bloco sr-conf-resumo-bloco--checklist${modalChecklistAberto ? ' sr-conf-resumo-bloco--checklist-ativo' : ''}`}
        onClick={() => setModalChecklistAberto(true)}
        aria-haspopup="dialog"
        aria-label="Abrir checklist matriz de conformidade"
      >
        <div className="sr-conf-resumo-riscos-topo">
          <TooltipGlobal
            titulo="Checklist matriz"
            descricao="Regras de conformidade da invoice — clique para ver o detalhe completo"
          >
            <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">
              <ClipboardText size={12} weight="duotone" aria-hidden />
              Checklist matriz
            </span>
          </TooltipGlobal>
          <CaretRight size={12} weight="bold" className="sr-conf-resumo-seta" aria-hidden />
        </div>

        <div className="sr-conf-resumo-linha-barra">
          <span className="sr-conf-resumo-checklist-pct">{percentualChecklistVerde}%</span>
          <span className="sr-conf-resumo-checklist-conforme">conforme</span>
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
    </section>

    <ModalChecklistConferenciaNovaLeituraSmartRead
      aberto={modalChecklistAberto}
      onFechar={() => setModalChecklistAberto(false)}
      documentos={documentosRisco}
      parametrosChecklist={parametrosChecklist}
      chaveMarcacaoChecklist={chaveAnaliseRiscos}
      onVerRisco={(riscoId) => {
        setModalChecklistAberto(false)
        onIrAnaliseRiscos()
        onVerRiscoDoChecklist?.(riscoId)
      }}
    />
    </>
  )
}
