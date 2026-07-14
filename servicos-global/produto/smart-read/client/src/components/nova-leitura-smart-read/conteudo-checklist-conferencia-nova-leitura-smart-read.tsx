/**
 * ConteudoChecklistConferenciaNovaLeituraSmartRead — checklist (dt-secao + visão geral unificada)
 */

import { useMemo, useState } from 'react'
import { CaretDown, ClipboardText } from '@phosphor-icons/react'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import {
  agruparChecklistPorSecao,
  listarInvoicesChecklist,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
  VALOR_TODAS_INVOICES_CHECKLIST,
  type ParametrosChecklistMatrizInvoice,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { ChecklistConferenciaCorpoSmartRead } from './checklist-conferencia-corpo-smart-read'
import { InfograficoChecklistGeralSmartRead } from './infografico-checklist-geral-smart-read'
import { ResumoContagemChecklistSmartRead } from './resumo-contagem-checklist-smart-read'

type Props = {
  documentos: DocumentoAnaliseRisco[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  onVerRisco?: (riscoId: string) => void
  idPrefixo?: string
}

export function ConteudoChecklistConferenciaNovaLeituraSmartRead({
  documentos,
  parametrosChecklist,
  onVerRisco,
  idPrefixo = 'sr-chk',
}: Props) {
  const [colapsado, setColapsado] = useState(false)
  const [filtroVisaoGeral, setFiltroVisaoGeral] = useState<string>(VALOR_TODAS_INVOICES_CHECKLIST)

  const invoices = useMemo(() => listarInvoicesChecklist(documentos), [documentos])

  const resumoGeral = useMemo(
    () =>
      montarResumoGeralChecklistInvoices({
        ...parametrosChecklist,
        documentos,
      }),
    [parametrosChecklist, documentos],
  )

  const mostrarDetalheInvoice = filtroVisaoGeral !== VALOR_TODAS_INVOICES_CHECKLIST
  const rotuloChecklistAtivo = mostrarDetalheInvoice ? filtroVisaoGeral : null

  const checklistInvoice = useMemo(() => {
    if (!rotuloChecklistAtivo) return []
    return montarChecklistMatrizInvoice({
      ...parametrosChecklist,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [parametrosChecklist, rotuloChecklistAtivo])

  const secoesInvoice = useMemo(
    () => agruparChecklistPorSecao(checklistInvoice),
    [checklistInvoice],
  )

  const opcoesInvoice = useMemo(
    () =>
      invoices.map((inv) => ({
        valor: inv.rotulo,
        rotulo: inv.numero_invoice
          ? `${inv.numero_invoice} · ${inv.nome_arquivo}`
          : `${inv.nome_arquivo} · ${inv.tipo_documento}`,
      })),
    [invoices],
  )

  const opcoesSelecaoGeral = useMemo(
    () => [{ valor: VALOR_TODAS_INVOICES_CHECKLIST, rotulo: 'Todas' }, ...opcoesInvoice],
    [opcoesInvoice],
  )

  const contagemDetalheInvoice = useMemo(() => {
    if (!rotuloChecklistAtivo) return resumoGeral.contagem_global
    return (
      resumoGeral.por_invoice.find((inv) => inv.rotulo === rotuloChecklistAtivo)?.contagem ??
      resumoGeral.contagem_global
    )
  }, [resumoGeral, rotuloChecklistAtivo])

  function selecionarInvoiceNaVisaoGeral(rotulo: string) {
    setFiltroVisaoGeral(rotulo)
  }

  function aoMudarFiltroVisaoGeral(valor: string | null) {
    setFiltroVisaoGeral(valor ?? VALOR_TODAS_INVOICES_CHECKLIST)
  }

  const contagem = resumoGeral.contagem_global
  const percentual = resumoGeral.percentual_global
  const completo = contagem.vermelho === 0 && contagem.amarelo === 0 && contagem.pendente === 0

  return (
    <section
      className={`dt-secao sr-conf-checklist-painel-secao${colapsado ? ' dt-secao--colapsada' : ''}`}
      aria-label="Checklist de conferência"
    >
      <button
        type="button"
        className="dt-secao-header"
        onClick={() => setColapsado((prev) => !prev)}
        aria-expanded={!colapsado}
        aria-controls={`${idPrefixo}-corpo`}
      >
        <div className="dt-secao-title">
          <CaretDown
            weight="bold"
            size={14}
            className={`dt-caret${colapsado ? ' dt-caret--colapsado' : ''}`}
            aria-hidden
          />
          <span className="dt-secao-icon">
            <ClipboardText weight="duotone" size={18} />
          </span>
          <h2>Checklist de conferência</h2>
        </div>
        <div className="dt-secao-completude">
          <div className="dt-secao-progress">
            <div
              className={`dt-secao-progress-fill${
                completo
                  ? ' dt-secao-progress-fill--conforme'
                  : percentual >= 70
                    ? ' dt-secao-progress-fill--parcial'
                    : ' dt-secao-progress-fill--atencao'
              }`}
              style={{ width: `${percentual}%` }}
            />
          </div>
          <span className="dt-secao-pill">
            {percentual}% · {contagem.verde}/{contagem.total}
          </span>
        </div>
      </button>

      {!colapsado && (
        <div id={`${idPrefixo}-corpo`} className="sr-conf-checklist-painel-corpo">
          <div className="sr-conf-checklist-painel-conteudo">
            {invoices.length === 0 ? (
              <p className="sr-conf-vazio">Nenhuma invoice INVOICE encontrada nesta leitura.</p>
            ) : (
              <InfograficoChecklistGeralSmartRead
                resumo={resumoGeral}
                onSelecionarInvoice={selecionarInvoiceNaVisaoGeral}
                emAnalise={
                  parametrosChecklist.carregando ||
                  Boolean(parametrosChecklist.enriquecimento_ia_em_andamento)
                }
                selecaoInvoice={{
                  id: `${idPrefixo}-select-invoice`,
                  opcoes: opcoesSelecaoGeral,
                  valor: filtroVisaoGeral,
                  aoMudarValor: aoMudarFiltroVisaoGeral,
                }}
              >
                {mostrarDetalheInvoice && rotuloChecklistAtivo ? (
                  <>
                    <ChecklistConferenciaCorpoSmartRead
                      secoes={secoesInvoice}
                      todasSecoesAbertas
                      onVerRisco={onVerRisco}
                      idPrefixo={`${idPrefixo}-geral-inv`}
                      classeCorpo="sr-chk-modal-checklist-corpo"
                    />
                    <ResumoContagemChecklistSmartRead
                      verde={contagemDetalheInvoice.verde}
                      amarelo={contagemDetalheInvoice.amarelo}
                      vermelho={contagemDetalheInvoice.vermelho}
                      pendente={contagemDetalheInvoice.pendente}
                      classe="sr-conf-checklist-resumo--rodape"
                    />
                  </>
                ) : null}
              </InfograficoChecklistGeralSmartRead>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
