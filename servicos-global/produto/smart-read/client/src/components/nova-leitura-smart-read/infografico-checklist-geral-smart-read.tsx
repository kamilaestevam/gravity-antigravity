/**
 * infografico-checklist-geral-smart-read.tsx — visão geral do checklist (todas as invoices)
 */

import { ROTULO_SECAO_MATRIZ_INVOICE } from '../../../../shared/matriz-validacao-invoice-smart-read'
import type { ResumoGeralChecklistInvoices } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'

type Props = {
  resumo: ResumoGeralChecklistInvoices
  onSelecionarInvoice?: (rotulo: string) => void
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

function AnelConformidade({ percentual }: { percentual: number }) {
  const raio = 54
  const circ = 2 * Math.PI * raio
  const offset = circ - (percentual / 100) * circ
  return (
    <div className="sr-chk-info-anel" role="img" aria-label={`${percentual}% conforme no conjunto`}>
      <svg viewBox="0 0 128 128" className="sr-chk-info-anel-svg">
        <circle cx="64" cy="64" r={raio} className="sr-chk-info-anel-trilha" />
        <circle
          cx="64"
          cy="64"
          r={raio}
          className="sr-chk-info-anel-progresso"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="sr-chk-info-anel-centro">
        <strong>{percentual}%</strong>
        <span>conforme</span>
      </div>
    </div>
  )
}

function BarraStatus({
  verde,
  amarelo,
  vermelho,
  pendente,
  total,
}: {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  total: number
}) {
  if (total === 0) return <div className="sr-chk-info-barra sr-chk-info-barra--vazia" />
  const pct = (n: number) => `${(n / total) * 100}%`
  return (
    <div className="sr-chk-info-barra" role="presentation">
      {verde > 0 && <span className="sr-chk-info-barra--verde" style={{ width: pct(verde) }} />}
      {amarelo > 0 && <span className="sr-chk-info-barra--amarelo" style={{ width: pct(amarelo) }} />}
      {vermelho > 0 && <span className="sr-chk-info-barra--vermelho" style={{ width: pct(vermelho) }} />}
      {pendente > 0 && <span className="sr-chk-info-barra--pendente" style={{ width: pct(pendente) }} />}
    </div>
  )
}

export function InfograficoChecklistGeralSmartRead({ resumo, onSelecionarInvoice }: Props) {
  const { contagem_global, percentual_global, veredito_global, por_invoice, por_secao, total_invoices } =
    resumo

  return (
    <div className="sr-chk-info">
      <section className="sr-chk-info-topo" aria-label="Resumo geral do checklist">
        <AnelConformidade percentual={percentual_global} />
        <div className="sr-chk-info-metricas">
          <div className="sr-chk-info-metrica-linha">
            <span className="sr-chk-info-metrica-rotulo">Invoices analisadas</span>
            <strong>{total_invoices}</strong>
          </div>
          <div className="sr-chk-info-metrica-linha">
            <span className="sr-chk-info-metrica-rotulo">Avaliações totais</span>
            <strong>{contagem_global.total}</strong>
          </div>
          <div className="sr-chk-info-metrica-linha">
            <span className="sr-chk-info-metrica-rotulo">Veredito geral</span>
            <span className={`sr-chk-info-veredito ${classeVeredito(veredito_global)}`}>
              {veredito_global}
            </span>
          </div>
          <BarraStatus
            verde={contagem_global.verde}
            amarelo={contagem_global.amarelo}
            vermelho={contagem_global.vermelho}
            pendente={contagem_global.pendente}
            total={contagem_global.total}
          />
          <div className="sr-chk-info-legenda">
            <span>{contagem_global.verde} CONFORME</span>
            <span>{contagem_global.amarelo} ATENÇÃO</span>
            <span>{contagem_global.vermelho} FALHA</span>
            <span>{contagem_global.pendente} PENDENTE</span>
          </div>
        </div>
      </section>

      <section className="sr-chk-info-invoices" aria-label="Status por invoice">
        <h3 className="sr-chk-info-secao-titulo">Por invoice</h3>
        <div className="sr-chk-info-invoices-grid">
          {por_invoice.map((inv) => (
            <button
              key={inv.rotulo}
              type="button"
              className="sr-chk-info-invoice-card"
              onClick={() => onSelecionarInvoice?.(inv.rotulo)}
            >
              <div className="sr-chk-info-invoice-card-topo">
                <strong className="sr-chk-info-invoice-nome" title={inv.rotulo}>
                  {inv.numero_invoice ?? inv.nome_arquivo}
                </strong>
                <span className={`sr-chk-info-veredito ${classeVeredito(inv.veredito)}`}>
                  {inv.veredito}
                </span>
              </div>
              <span className="sr-chk-info-invoice-arquivo">{inv.nome_arquivo}</span>
              <div className="sr-chk-info-invoice-pct">{inv.percentual_conforme}% conforme</div>
              <BarraStatus
                verde={inv.contagem.verde}
                amarelo={inv.contagem.amarelo}
                vermelho={inv.contagem.vermelho}
                pendente={inv.contagem.pendente}
                total={inv.contagem.total}
              />
            </button>
          ))}
        </div>
      </section>

      <section className="sr-chk-info-secoes" aria-label="Status por seção da matriz">
        <h3 className="sr-chk-info-secao-titulo">Por seção da matriz</h3>
        <ul className="sr-chk-info-secoes-lista">
          {por_secao.map((sec) => (
            <li key={sec.secao} className="sr-chk-info-secao-linha">
              <div className="sr-chk-info-secao-linha-topo">
                <span className="sr-chk-info-secao-nome">{ROTULO_SECAO_MATRIZ_INVOICE[sec.secao]}</span>
                <span className={`sr-chk-info-veredito ${classeVeredito(sec.veredito)}`}>
                  {sec.veredito}
                </span>
              </div>
              <BarraStatus
                verde={sec.verde}
                amarelo={sec.amarelo}
                vermelho={sec.vermelho}
                pendente={sec.pendente}
                total={sec.total}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
