/**
 * checklist-conferencia-corpo-smart-read.tsx — corpo tabular do checklist (inline ou modal)
 */

import { CaretDown } from '@phosphor-icons/react'
import type { SecaoMatrizInvoice } from '../../../../shared/matriz-validacao-invoice-smart-read'
import { ROTULO_SECAO_MATRIZ_INVOICE } from '../../../../shared/matriz-validacao-invoice-smart-read'
import {
  vereditoSecaoChecklist,
  type ItemChecklistMatrizInvoice,
  type RotuloStatusChecklistInvoice,
  type StatusChecklistMatrizInvoice,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'

export type SecaoChecklistConferenciaSmartRead = {
  secao: SecaoMatrizInvoice
  itens: ItemChecklistMatrizInvoice[]
}

const ROTULO_MOTOR_MATRIZ: Record<ItemChecklistMatrizInvoice['regra']['motor'], string> = {
  codigo: 'Código',
  api: 'API',
  llm: 'IA',
  rag: 'RAG',
}

function classeStatusChecklistAviacao(status: StatusChecklistMatrizInvoice): string {
  return `sr-conf-chk-status sr-conf-chk-status--${status}`
}

function classeVereditoSecao(veredito: RotuloStatusChecklistInvoice): string {
  switch (veredito) {
    case 'CONFORME':
      return 'sr-conf-chk-veredito--verde'
    case 'ATENÇÃO':
      return 'sr-conf-chk-veredito--amarelo'
    case 'FALHA':
      return 'sr-conf-chk-veredito--vermelho'
    case 'PENDENTE':
      return 'sr-conf-chk-veredito--pendente'
    default:
      return 'sr-conf-chk-veredito--pendente'
  }
}

function LinhaChecklistAviacao({
  item,
  onVerRisco,
}: {
  item: ItemChecklistMatrizInvoice
  onVerRisco?: (riscoId: string) => void
}) {
  return (
    <tr className={`sr-conf-chk-linha sr-conf-chk-linha--${item.status}`}>
      <td className="sr-conf-chk-col-regra">
        <span className="sr-conf-chk-regra-id">{item.regra.id}</span>
      </td>
      <td className="sr-conf-chk-col-item">
        <span className="sr-conf-chk-item-nome">{item.regra.item}</span>
        <span className="sr-conf-chk-item-motor" title={item.regra.descricao}>
          {ROTULO_MOTOR_MATRIZ[item.regra.motor]}
        </span>
      </td>
      <td className="sr-conf-chk-col-resultado" title={item.detalhe ?? undefined}>
        <span className="sr-conf-chk-resultado">{item.resultado}</span>
      </td>
      <td className="sr-conf-chk-col-status">
        <span className={classeStatusChecklistAviacao(item.status)}>{item.rotulo_status}</span>
        {item.risco_id && onVerRisco && (
          <button
            type="button"
            className="sr-conf-chk-ver-risco"
            onClick={() => onVerRisco(item.risco_id!)}
          >
            Ver risco
          </button>
        )}
      </td>
    </tr>
  )
}

type Props = {
  secoes: SecaoChecklistConferenciaSmartRead[]
  todasSecoesAbertas?: boolean
  secoesColapsadas?: Set<string>
  onToggleSecao?: (secaoId: string) => void
  onVerRisco?: (riscoId: string) => void
  idPrefixo?: string
  classeCorpo?: string
}

export function ChecklistConferenciaCorpoSmartRead({
  secoes,
  todasSecoesAbertas = false,
  secoesColapsadas,
  onToggleSecao,
  onVerRisco,
  idPrefixo = 'sr-checklist',
  classeCorpo = 'sr-conf-checklist-corpo',
}: Props) {
  return (
    <div className={classeCorpo}>
      {secoes.map(({ secao, itens }) => {
        const secaoId = `${idPrefixo}-secao-${secao}`
        const colapsada = !todasSecoesAbertas && (secoesColapsadas?.has(secaoId) ?? false)
        const veredito = vereditoSecaoChecklist(itens)
        const falhas = itens.filter((i) => i.status === 'vermelho' || i.status === 'amarelo').length

        return (
          <section
            key={secaoId}
            className={`sr-conf-checklist-secao${colapsada ? ' sr-conf-checklist-secao--colapsada' : ''}`}
          >
            {todasSecoesAbertas ? (
              <div className="sr-conf-checklist-secao-header sr-conf-checklist-secao-header--fixo">
                <span className="sr-conf-checklist-secao-titulo">
                  {ROTULO_SECAO_MATRIZ_INVOICE[secao]}
                </span>
                <span className={`sr-conf-chk-veredito-secao ${classeVereditoSecao(veredito)}`}>
                  {veredito}
                </span>
                {falhas > 0 && (
                  <span className="sr-conf-checklist-secao-falhas">{falhas} item(ns)</span>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="sr-conf-checklist-secao-header"
                onClick={() => onToggleSecao?.(secaoId)}
                aria-expanded={!colapsada}
                aria-controls={`${secaoId}-tabela`}
              >
                <CaretDown
                  weight="bold"
                  size={12}
                  className={`dt-caret${colapsada ? ' dt-caret--colapsado' : ''}`}
                />
                <span className="sr-conf-checklist-secao-titulo">
                  {ROTULO_SECAO_MATRIZ_INVOICE[secao]}
                </span>
                <span className={`sr-conf-chk-veredito-secao ${classeVereditoSecao(veredito)}`}>
                  {veredito}
                </span>
                {falhas > 0 && (
                  <span className="sr-conf-checklist-secao-falhas">{falhas} item(ns)</span>
                )}
              </button>
            )}

            {!colapsada && (
              <div className="sr-conf-chk-tabela-wrap">
                <table id={`${secaoId}-tabela`} className="sr-conf-chk-tabela">
                  <thead>
                    <tr>
                      <th scope="col" className="sr-conf-chk-col-regra">
                        Regra
                      </th>
                      <th scope="col" className="sr-conf-chk-col-item">
                        Item verificado
                      </th>
                      <th scope="col" className="sr-conf-chk-col-resultado">
                        Resultado
                      </th>
                      <th scope="col" className="sr-conf-chk-col-status">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item) => (
                      <LinhaChecklistAviacao
                        key={item.regra.id}
                        item={item}
                        onVerRisco={onVerRisco}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
