/**
 * PainelDetalheRiscoExpandidoNovaLeituraSmartRead — detalhe inline do risco (sem modal)
 */

import { ClipboardText, Eye } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import type { ParametrosChecklistMatrizInvoice } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { aplicarCorrecaoSugeridaPadraoRisco } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { RiscoAduaneiroLeitura } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import { montarFocoConferenciaDeRisco } from '../../shared/foco-conferencia-campos-nova-leitura-smart-read'
import type { FocoConferenciaCamposNovaLeituraSmartRead } from '../../shared/foco-conferencia-campos-nova-leitura-smart-read'
import { ChecklistLinhaRiscoNovaLeituraSmartRead } from './checklist-linha-risco-nova-leitura-smart-read'
import { DetalheRiscoCorpoNovaLeituraSmartRead } from './detalhe-risco-corpo-nova-leitura-smart-read'

type Props = {
  risco: RiscoAduaneiroLeitura
  arquivos: ArquivoLocalNovaLeitura[]
  documentos: DocumentoAnaliseRisco[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  onIrConferenciaCampos?: (foco: FocoConferenciaCamposNovaLeituraSmartRead) => void
  aguardandoClassificacao?: boolean
}

export function PainelDetalheRiscoExpandidoNovaLeituraSmartRead({
  risco: riscoBruto,
  arquivos,
  documentos,
  parametrosChecklist,
  onVerEvidencia,
  onIrConferenciaCampos,
  aguardandoClassificacao = false,
}: Props) {
  const risco = aplicarCorrecaoSugeridaPadraoRisco(riscoBruto)
  const focoConferencia = montarFocoConferenciaDeRisco(risco, arquivos)
  const evidenciaPrimaria = risco.evidencias[0] ?? null
  const podeVerDocumento = Boolean(
    evidenciaPrimaria && focoConferencia?.id_arquivo_local && onVerEvidencia,
  )
  const podeIrConferencia = Boolean(risco.correcao_sugerida && onIrConferenciaCampos)

  function verDocumento() {
    if (!evidenciaPrimaria || !onVerEvidencia || !focoConferencia?.id_arquivo_local) return
    onVerEvidencia({
      idArquivoLocal: focoConferencia.id_arquivo_local,
      documento: evidenciaPrimaria.documento,
      campo: evidenciaPrimaria.campo,
      valorAtual: evidenciaPrimaria.valor,
      tituloRisco: risco.titulo,
      motivo: risco.motivo,
      analise: risco.analise,
      correcao: risco.correcao_sugerida,
    })
  }

  function irConferenciaCampos() {
    if (!focoConferencia) return
    onIrConferenciaCampos?.(focoConferencia)
  }

  return (
    <div className="sr-risco-inline-painel">
      <div className="sr-risco-inline-cabecalho">
        <p className="sr-risco-modal-resumo-linha">{risco.motivo}</p>
        {(podeVerDocumento || podeIrConferencia) && (
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
        )}
      </div>

      <div className="sr-risco-inline-secoes">
        <DetalheRiscoCorpoNovaLeituraSmartRead
          risco={riscoBruto}
          aguardandoClassificacao={aguardandoClassificacao}
        />

        <ChecklistLinhaRiscoNovaLeituraSmartRead
          risco={riscoBruto}
          documentos={documentos}
          parametrosChecklist={parametrosChecklist}
        />
      </div>
    </div>
  )
}
