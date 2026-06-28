/**
 * ModalDetalheRiscoNovaLeituraSmartRead — resumo do risco + checklist de conferência
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardText, Eye, X } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import type { ParametrosChecklistMatrizInvoice } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { aplicarCorrecaoSugeridaPadraoRisco } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { RiscoAduaneiroLeitura } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import { DetalheRiscoCorpoNovaLeituraSmartRead } from './detalhe-risco-corpo-nova-leitura-smart-read'
import { ConteudoChecklistConferenciaNovaLeituraSmartRead } from './conteudo-checklist-conferencia-nova-leitura-smart-read'
import { montarFocoConferenciaDeRisco } from '../../shared/foco-conferencia-campos-nova-leitura-smart-read'
import type { FocoConferenciaCamposNovaLeituraSmartRead } from '../../shared/foco-conferencia-campos-nova-leitura-smart-read'

type Props = {
  aberto: boolean
  risco: RiscoAduaneiroLeitura | null
  numero: number
  arquivos: ArquivoLocalNovaLeitura[]
  documentos: DocumentoAnaliseRisco[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  onFechar: () => void
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  onIrConferenciaCampos?: (foco: FocoConferenciaCamposNovaLeituraSmartRead) => void
  onVerRisco?: (riscoId: string) => void
  aguardandoClassificacao?: boolean
}

function rotuloSeveridade(severidade: RiscoAduaneiroLeitura['severidade']): string {
  switch (severidade) {
    case 'critico':
      return 'Crítico'
    case 'atencao':
      return 'Atenção'
    default:
      return 'Informativo'
  }
}

export function ModalDetalheRiscoNovaLeituraSmartRead({
  aberto,
  risco,
  numero,
  arquivos,
  documentos,
  parametrosChecklist,
  onFechar,
  onVerEvidencia,
  onIrConferenciaCampos,
  onVerRisco,
  aguardandoClassificacao = false,
}: Props) {
  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', onKey)
    }
  }, [aberto, onFechar])

  const riscoAplicado = risco ? aplicarCorrecaoSugeridaPadraoRisco(risco) : null
  const focoConferencia = riscoAplicado
    ? montarFocoConferenciaDeRisco(riscoAplicado, arquivos)
    : null
  const evidenciaPrimaria = riscoAplicado?.evidencias[0] ?? null
  const podeVerDocumento = Boolean(
    evidenciaPrimaria && focoConferencia?.id_arquivo_local && onVerEvidencia,
  )
  const podeIrConferencia = Boolean(riscoAplicado?.correcao_sugerida && onIrConferenciaCampos)

  if (!aberto || !risco || !riscoAplicado) return null

  function irConferenciaCampos() {
    if (!focoConferencia) return
    onFechar()
    onIrConferenciaCampos?.(focoConferencia)
  }

  function verDocumento() {
    if (!evidenciaPrimaria || !onVerEvidencia || !focoConferencia?.id_arquivo_local) return
    onVerEvidencia({
      idArquivoLocal: focoConferencia.id_arquivo_local,
      documento: evidenciaPrimaria.documento,
      campo: evidenciaPrimaria.campo,
      valorAtual: evidenciaPrimaria.valor,
      tituloRisco: riscoAplicado.titulo,
      motivo: riscoAplicado.motivo,
      analise: riscoAplicado.analise,
      correcao: riscoAplicado.correcao_sugerida,
    })
  }

  return createPortal(
    <div
      className="sr-chk-modal-overlay sr-risco-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhe do risco: ${risco.titulo}`}
      onClick={onFechar}
    >
      <div className="sr-chk-modal-painel sr-risco-modal-painel" onClick={(e) => e.stopPropagation()}>
        <header className="sr-risco-modal-cabecalho">
          <div className="sr-risco-modal-cabecalho-esq">
            <span className="sr-conf-risco-numero" aria-hidden>
              {String(numero).padStart(2, '0')}
            </span>
            <div className="sr-risco-modal-cabecalho-textos">
              <strong className="sr-risco-modal-titulo">{risco.titulo}</strong>
              <p className="sr-risco-modal-resumo-linha">{risco.motivo}</p>
            </div>
          </div>
          <span className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade}`}>
            {rotuloSeveridade(risco.severidade)}
          </span>

          <div className="sr-risco-modal-acoes">
            {podeVerDocumento && evidenciaPrimaria && (
              <TooltipGlobal
                titulo="Ver no documento"
                descricao={`Abrir ${evidenciaPrimaria.documento} no campo destacado`}
              >
                <button
                  type="button"
                  className="sr-risco-modal-btn-icone"
                  onClick={verDocumento}
                  aria-label="Ver no documento"
                >
                  <Eye size={18} weight="duotone" />
                </button>
              </TooltipGlobal>
            )}
            {podeIrConferencia && (
              <TooltipGlobal
                titulo="Ir para Conferência de Campos"
                descricao="Abrir a aba e destacar o campo relacionado a este risco"
              >
                <button
                  type="button"
                  className="sr-risco-modal-btn-icone sr-risco-modal-btn-icone--primario"
                  onClick={irConferenciaCampos}
                  aria-label="Ir para Conferência de Campos"
                >
                  <ClipboardText size={18} weight="duotone" />
                </button>
              </TooltipGlobal>
            )}
          </div>

          <button type="button" className="sr-chk-modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className="sr-risco-modal-scroll sr-risco-modal-scroll--secoes">
          <DetalheRiscoCorpoNovaLeituraSmartRead
            risco={risco}
            aguardandoClassificacao={aguardandoClassificacao}
          />

          <ConteudoChecklistConferenciaNovaLeituraSmartRead
            documentos={documentos}
            parametrosChecklist={parametrosChecklist}
            onVerRisco={onVerRisco}
            idPrefixo="sr-risco-modal-chk"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
