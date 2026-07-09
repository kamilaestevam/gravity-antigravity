/**
 * infografico-checklist-geral-smart-read.tsx — visão geral do checklist (todas as invoices)
 */

import type { ReactNode } from 'react'
import { ROTULO_SECAO_MATRIZ_INVOICE } from '../../../../shared/matriz-validacao-invoice-smart-read'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { ResumoGeralChecklistInvoices, ResumoInvoiceChecklist } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { BarraStatusChecklistSmartRead } from './barra-status-checklist-smart-read'
import { ResumoContagemChecklistSmartRead } from './resumo-contagem-checklist-smart-read'
import { GraficoConferenciaCheckedSmartRead } from './grafico-conferencia-checked-smart-read'
import type { ResumoConferenciaManualChecklist } from '../../shared/checklist-marcacao-usuario-smart-read'

type OpcaoInvoiceChecklist = {
  valor: string
  rotulo: string
}

type Props = {
  resumo: ResumoGeralChecklistInvoices
  onSelecionarInvoice?: (rotulo: string) => void
  documentoDestaque?: ResumoInvoiceChecklist | null
  selecaoInvoice?: {
    id: string
    opcoes: OpcaoInvoiceChecklist[]
    valor: string | null
    aoMudarValor: (valor: string | null) => void
  }
  conferenciaManual?: ResumoConferenciaManualChecklist | null
  children?: ReactNode
}

function classeVeredito(veredito: string): string {
  switch (veredito) {
    case 'CONFORME':
      return 'sr-chk-info-veredito--verde'
    case 'ATENÇÃO':
      return 'sr-chk-info-veredito--amarelo'
    case 'FALHA':
      return 'sr-chk-info-veredito--vermelho'
    default:
      return 'sr-chk-info-veredito--pendente'
  }
}

export function InfograficoChecklistGeralSmartRead({
  resumo,
  onSelecionarInvoice,
  documentoDestaque = null,
  selecaoInvoice,
  conferenciaManual,
  children,
}: Props) {
  const { contagem_global, por_invoice, por_secao, total_invoices } = resumo
  const cardsVisiveis =
    children && documentoDestaque ? [documentoDestaque] : por_invoice
  const rotuloAtivo = selecaoInvoice?.valor ?? null

  const metricasLinhas = (
    <div className="sr-chk-info-metrica-linhas">
      <div className="sr-chk-info-metrica-linha-texto">
        <span className="sr-chk-info-metrica-linha-rotulo">Invoices analisadas</span>
        <strong>{total_invoices}</strong>
      </div>
      <div className="sr-chk-info-metrica-linha-texto">
        <span className="sr-chk-info-metrica-linha-rotulo">Avaliações totais</span>
        <strong>{contagem_global.total}</strong>
      </div>
    </div>
  )

  return (
    <div className="sr-chk-info">
      <section className="sr-chk-info-card-unificado" aria-label="Resumo geral do checklist">
        <div className="sr-chk-info-card-unificado-corpo">
          <div className="sr-chk-info-card-unificado-dir">
            <div className="sr-chk-info-topo-dir">
              <div className="sr-chk-info-invoice-topo-esq">
                {cardsVisiveis.length !== 1 ? metricasLinhas : null}
                {cardsVisiveis.map((inv) => (
                  <button
                    key={inv.rotulo}
                    type="button"
                    className={`sr-chk-info-invoice-card sr-chk-info-invoice-card--interno sr-chk-info-invoice-card--destaque${rotuloAtivo === inv.rotulo ? ' sr-chk-info-invoice-card--ativo' : ''}`}
                    onClick={() => onSelecionarInvoice?.(inv.rotulo)}
                  >
                    <div className="sr-chk-info-invoice-card-topo">
                      <strong className="sr-chk-info-invoice-nome" title={inv.rotulo}>
                        {inv.numero_invoice ?? inv.tipo_documento ?? inv.nome_arquivo}
                      </strong>
                      <span className={`sr-chk-info-veredito ${classeVeredito(inv.veredito)}`}>
                        {inv.veredito}
                      </span>
                    </div>
                    <span className="sr-chk-info-invoice-arquivo">{inv.nome_arquivo}</span>
                    {cardsVisiveis.length === 1 ? metricasLinhas : null}
                    <div className="sr-chk-info-invoice-pct">{inv.percentual_conforme}% conforme</div>
                    <BarraStatusChecklistSmartRead
                      verde={inv.contagem.verde}
                      amarelo={inv.contagem.amarelo}
                      vermelho={inv.contagem.vermelho}
                      pendente={inv.contagem.pendente}
                      na={inv.contagem.na}
                      total={inv.contagem.total}
                    />
                  </button>
                ))}
              </div>

              {conferenciaManual && conferenciaManual.total > 0 ? (
                <GraficoConferenciaCheckedSmartRead
                  resumo={conferenciaManual}
                  classe="sr-chk-info-grafico-conferido"
                />
              ) : null}

              {selecaoInvoice ? (
                <div className="sr-chk-info-invoice-select-centro">
                  <SelectGlobal
                    id={selecaoInvoice.id}
                    opcoes={selecaoInvoice.opcoes}
                    valor={selecaoInvoice.valor}
                    aoMudarValor={(v) =>
                      selecaoInvoice.aoMudarValor(v == null ? null : String(v))
                    }
                    buscavel
                    placeholder="Selecione o documento…"
                    posicao="baixo"
                  />
                </div>
              ) : null}
            </div>

            <div className="sr-chk-info-card-unificado-invoices">
              <div className="sr-chk-info-invoices-linha sr-chk-info-invoices-linha--somente-badges">
                <ResumoContagemChecklistSmartRead
                  verde={contagem_global.verde}
                  amarelo={contagem_global.amarelo}
                  vermelho={contagem_global.vermelho}
                  pendente={contagem_global.pendente}
                  na={contagem_global.na}
                  classe="sr-conf-checklist-resumo--lateral"
                />
              </div>
            </div>
          </div>
        </div>

        {children ? (
          <div className="sr-chk-info-detalhe-invoice">{children}</div>
        ) : (
          <>
            <div className="sr-chk-info-card-unificado-divisor" role="presentation" />

            <div className="sr-chk-info-card-unificado-bloco sr-chk-info-secoes--interno">
              <h3 className="sr-chk-info-secao-titulo">Por seção da matriz</h3>
              <ul className="sr-chk-info-secoes-lista">
                {por_secao.map((sec) => (
                  <li key={sec.secao} className="sr-chk-info-secao-linha">
                    <div className="sr-chk-info-secao-linha-topo">
                      <span className="sr-chk-info-secao-nome">
                        {ROTULO_SECAO_MATRIZ_INVOICE[sec.secao]}
                      </span>
                      <span className={`sr-chk-info-veredito ${classeVeredito(sec.veredito)}`}>
                        {sec.veredito}
                      </span>
                    </div>
                    <BarraStatusChecklistSmartRead
                      verde={sec.verde}
                      amarelo={sec.amarelo}
                      vermelho={sec.vermelho}
                      pendente={sec.pendente}
                      na={sec.na}
                      total={sec.total}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
