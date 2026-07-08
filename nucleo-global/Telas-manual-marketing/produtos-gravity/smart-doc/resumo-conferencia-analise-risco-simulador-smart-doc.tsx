import { useMemo, useState } from 'react'
import { CaretRight, ClipboardText, ShieldWarning, UserCheck } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  calcularPercentualChecklistVerde,
  calcularPercentualSemCriticosAbertos,
  montarLegendaSegmentosRisco,
  montarResumoRiscosSimulador,
  obterContagemChecklistSimulador,
  obterRiscosSimulador,
} from './dados-riscos-simulador-smart-doc'
import { obterItensChecklistSimulador } from './dados-checklist-simulador-smart-doc'
import { BarraStatusChecklistSimulador, ModalChecklistSimuladorSmartDoc } from './checklist-simulador-smart-doc'

type AbaConferenciaResumoSimulador = 'campos' | 'qa' | 'riscos'

export type ResumoConferenciaUsuarioSimulador = {
  marcados: number
  total: number
  percentual: number
  marcadosCampos: number
  totalCampos: number
  marcadosRiscos: number
  totalRiscos: number
  marcadosChecklist: number
  totalChecklist: number
}

type Props = {
  arquivoAtual: ArquivoDemoSimulador | null
  documentoAtual: DocumentoSimulador | null
  abaAtiva: AbaConferenciaResumoSimulador
  resumoConferenciaUsuario: ResumoConferenciaUsuarioSimulador
  onIrAnaliseRiscos: () => void
}

export function ResumoConferenciaAnaliseRiscoSimuladorSmartDoc({
  arquivoAtual,
  documentoAtual,
  abaAtiva,
  resumoConferenciaUsuario,
  onIrAnaliseRiscos,
}: Props) {
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)

  const tipoDocumento = documentoAtual?.tipo ?? 'invoice'

  const contagemChecklist = useMemo(() => {
    const contagem = obterContagemChecklistSimulador(tipoDocumento)
    const total = contagem.verde + contagem.amarelo + contagem.vermelho + contagem.pendente
    return { ...contagem, total }
  }, [tipoDocumento])

  const percentualChecklistVerde = useMemo(
    () => calcularPercentualChecklistVerde(obterContagemChecklistSimulador(tipoDocumento)),
    [tipoDocumento],
  )

  const resumoRiscos = useMemo(() => {
    const riscos = obterRiscosSimulador(tipoDocumento)
    if (!documentoAtual) return montarResumoRiscosSimulador([])
    const rotulo = `${arquivoAtual?.nome ?? ''} · ${documentoAtual.rotulo}`
    const filtrados = riscos.filter((risco) =>
      risco.evidencias.some((evidencia) => evidencia.documento.includes(documentoAtual.rotulo) || evidencia.documento === rotulo),
    )
    return montarResumoRiscosSimulador(filtrados.length > 0 ? filtrados : riscos)
  }, [arquivoAtual?.nome, documentoAtual, tipoDocumento])

  const percentualSemCriticos = calcularPercentualSemCriticosAbertos(resumoRiscos)
  const legendaSegmentos = montarLegendaSegmentosRisco(resumoRiscos)

  const usuarioAtivo = abaAtiva === 'campos' || abaAtiva === 'qa'
  const riscosAtivo = abaAtiva === 'riscos'

  const legendaConferenciaUsuario = useMemo(() => {
    const resumo = resumoConferenciaUsuario
    if (resumo.total === 0) return 'Nenhum item para conferir neste documento'
    const partes: string[] = []
    if (resumo.totalCampos > 0) {
      partes.push(`${resumo.marcadosCampos}/${resumo.totalCampos} campo${resumo.totalCampos === 1 ? '' : 's'}`)
    }
    if (resumo.totalRiscos > 0) {
      partes.push(`${resumo.marcadosRiscos}/${resumo.totalRiscos} risco${resumo.totalRiscos === 1 ? '' : 's'}`)
    }
    if (resumo.totalChecklist > 0) {
      partes.push(`${resumo.marcadosChecklist}/${resumo.totalChecklist} matriz`)
    }
    return `${resumo.marcados}/${resumo.total} conferidos por você (${partes.join(' · ')})`
  }, [resumoConferenciaUsuario])

  const itensChecklistTipo = obterItensChecklistSimulador(tipoDocumento)

  if (!arquivoAtual || !documentoAtual) return null

  return (
    <>
      <section
        className="sr-conf-resumo-triplo"
        aria-label="Resumo de conferência usuário, conferência Gravity e análise de risco"
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
              descricao="Campos, riscos e regras Gravity que você marcou como revisados neste documento"
            >
              <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">Conferência usuário</span>
            </TooltipGlobal>
          </div>

          <div className="sr-conf-resumo-linha-barra">
            <div
              className="sr-conf-progresso-barra"
              role="progressbar"
              aria-valuenow={resumoConferenciaUsuario.percentual}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${resumoConferenciaUsuario.percentual}% dos itens conferidos manualmente`}
            >
              <div
                className="sr-conf-progresso-barra-fill sr-conf-progresso-barra-fill--conferencia"
                style={{ width: `${resumoConferenciaUsuario.percentual}%` }}
              />
            </div>
            <span className="sr-conf-progresso-pct sr-conf-progresso-pct--conferencia">
              {resumoConferenciaUsuario.percentual}%
            </span>
          </div>

          <p className="sr-conf-resumo-legenda">{legendaConferenciaUsuario}</p>
        </div>

        <button
          type="button"
          className={`sr-conf-resumo-bloco sr-conf-resumo-bloco--checklist${modalChecklistAberto ? ' sr-conf-resumo-bloco--checklist-ativo' : ''}`}
          onClick={() => setModalChecklistAberto(true)}
          aria-haspopup="dialog"
          aria-label="Abrir conferência Gravity — checklist matriz completo"
          disabled={itensChecklistTipo.length === 0}
        >
          <div className="sr-conf-resumo-riscos-topo">
            <TooltipGlobal
              titulo="Conferência Gravity"
              descricao="Resultado total da Gravity sobre todas as regras da matriz — clique para ver o detalhe"
            >
              <span className="sr-conf-resumo-rotulo sr-conf-resumo-rotulo--com-icone">
                <ClipboardText size={12} weight="duotone" aria-hidden />
                Conferência Gravity
              </span>
            </TooltipGlobal>
            <CaretRight size={12} weight="bold" className="sr-conf-resumo-seta" aria-hidden />
          </div>

          <div className="sr-conf-resumo-linha-barra">
            <span className="sr-conf-resumo-checklist-pct">{percentualChecklistVerde}%</span>
            <span className="sr-conf-resumo-checklist-conforme">conforme na matriz</span>
          </div>

          <BarraStatusChecklistSimulador
            verde={contagemChecklist.verde}
            amarelo={contagemChecklist.amarelo}
            vermelho={contagemChecklist.vermelho}
            pendente={contagemChecklist.pendente}
            total={contagemChecklist.total}
            classe="sr-conf-resumo-checklist-barra"
          />

          <p className="sr-conf-resumo-legenda">
            {contagemChecklist.verde} ok · {contagemChecklist.amarelo} atenção · {contagemChecklist.vermelho} falha ·{' '}
            {contagemChecklist.pendente} pendente
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
            riscosAtivo ? 'Análise de risco — aba ativa' : 'Abrir análise de risco — problemas detectados'
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
            {resumoRiscos.total === 0
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

      <ModalChecklistSimuladorSmartDoc
        aberto={modalChecklistAberto}
        onFechar={() => setModalChecklistAberto(false)}
        tipo={tipoDocumento}
        rotuloDocumento={documentoAtual.rotulo}
        nomeArquivo={arquivoAtual.nome}
      />
    </>
  )
}
