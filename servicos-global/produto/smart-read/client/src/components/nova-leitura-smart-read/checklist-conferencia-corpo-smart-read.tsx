/**
 * checklist-conferencia-corpo-smart-read.tsx — corpo tabular do checklist (inline ou modal)
 */

import { CaretDown } from '@phosphor-icons/react'
import type { SecaoMatrizInvoice } from '../../../../shared/matriz-validacao-invoice-smart-read'
import { ROTULO_SECAO_MATRIZ_INVOICE } from '../../../../shared/matriz-validacao-invoice-smart-read'
import {
  contarChecklistPorStatus,
  vereditoSecaoChecklist,
  type ItemChecklistMatrizInvoice,
  type RotuloStatusChecklistInvoice,
  type StatusChecklistMatrizInvoice,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { BarraStatusChecklistSmartRead } from './barra-status-checklist-smart-read'
import { ClassificacaoProdutoChecklistSmartRead } from './classificacao-produto-checklist-smart-read'
import type { LinhaClassificacaoProdutoChecklist } from '../../../../shared/montar-classificacao-produto-checklist-smart-read'
import {
  chaveItemChecklistUsuario,
} from '../../shared/checklist-marcacao-usuario-smart-read'

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
    case 'N/A':
      return 'sr-conf-chk-veredito--na'
    default:
      return 'sr-conf-chk-veredito--pendente'
  }
}

function LinhaChecklistAviacao({
  item,
  rotuloInvoice,
  onVerRisco,
  estaMarcado,
  alternarMarcado,
}: {
  item: ItemChecklistMatrizInvoice
  rotuloInvoice?: string | null
  onVerRisco?: (riscoId: string) => void
  estaMarcado?: (chave: string) => boolean
  alternarMarcado?: (chave: string) => void
}) {
  const chaveMarcacao = chaveItemChecklistUsuario(item.regra.id, rotuloInvoice)
  const marcado = estaMarcado?.(chaveMarcacao) ?? false

  return (
    <tr
      className={`sr-conf-chk-linha sr-conf-chk-linha--${item.status}${marcado ? ' sr-conf-chk-linha--marcada' : ''}`}
    >
      <td className="sr-conf-chk-col-check">
        <input
          type="checkbox"
          className="sr-conf-chk-checkbox"
          checked={marcado}
          onChange={() => alternarMarcado?.(chaveMarcacao)}
          aria-label={`Conferido: ${item.regra.id} ${item.regra.item}`}
        />
      </td>
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
  rotuloInvoice?: string | null
  estaMarcado?: (chave: string) => boolean
  alternarMarcado?: (chave: string) => void
  idPrefixo?: string
  classeCorpo?: string
  classificacaoProduto?: LinhaClassificacaoProdutoChecklist[]
}

export function ChecklistConferenciaCorpoSmartRead({
  secoes,
  todasSecoesAbertas = false,
  secoesColapsadas,
  onToggleSecao,
  onVerRisco,
  rotuloInvoice,
  estaMarcado,
  alternarMarcado,
  idPrefixo = 'sr-checklist',
  classeCorpo = 'sr-conf-checklist-corpo',
  classificacaoProduto,
}: Props) {
  return (
    <div className={classeCorpo}>
      {secoes.map(({ secao, itens }) => {
        const secaoId = `${idPrefixo}-secao-${secao}`
        const colapsada = !todasSecoesAbertas && (secoesColapsadas?.has(secaoId) ?? false)
        const veredito = vereditoSecaoChecklist(itens)
        const falhas = itens.filter((i) => i.status === 'vermelho' || i.status === 'amarelo').length
        const contagemSecao = contarChecklistPorStatus(itens)

        const cabecalhoConteudo = (
          <>
            {!todasSecoesAbertas && (
              <CaretDown
                weight="bold"
                size={12}
                className={`dt-caret${colapsada ? ' dt-caret--colapsado' : ''}`}
              />
            )}
            <span className="sr-conf-checklist-secao-titulo">
              {ROTULO_SECAO_MATRIZ_INVOICE[secao]}
            </span>
            <BarraStatusChecklistSmartRead
              verde={contagemSecao.verde}
              amarelo={contagemSecao.amarelo}
              vermelho={contagemSecao.vermelho}
              pendente={contagemSecao.pendente}
              na={contagemSecao.na}
              total={contagemSecao.total}
              classe="sr-conf-checklist-secao-barra"
            />
            <span className={`sr-conf-chk-veredito-secao ${classeVereditoSecao(veredito)}`}>
              {veredito}
            </span>
            {falhas > 0 && (
              <span className="sr-conf-checklist-secao-falhas">{falhas} item(ns)</span>
            )}
          </>
        )

        return (
          <section
            key={secaoId}
            className={`sr-conf-checklist-secao${colapsada ? ' sr-conf-checklist-secao--colapsada' : ''}`}
          >
            {todasSecoesAbertas ? (
              <div className="sr-conf-checklist-secao-header sr-conf-checklist-secao-header--fixo sr-conf-checklist-secao-header--com-barra">
                {cabecalhoConteudo}
              </div>
            ) : (
              <button
                type="button"
                className="sr-conf-checklist-secao-header sr-conf-checklist-secao-header--com-barra"
                onClick={() => onToggleSecao?.(secaoId)}
                aria-expanded={!colapsada}
                aria-controls={`${secaoId}-tabela`}
              >
                {cabecalhoConteudo}
              </button>
            )}

            {!colapsada && (
              <div className="sr-conf-chk-tabela-wrap">
                <table id={`${secaoId}-tabela`} className="sr-conf-chk-tabela">
                  <thead>
                    <tr>
                      <th scope="col" className="sr-conf-chk-col-check">
                        <span className="sr-conf-chk-th-check">✓</span>
                      </th>
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
                        rotuloInvoice={rotuloInvoice}
                        onVerRisco={onVerRisco}
                        estaMarcado={estaMarcado}
                        alternarMarcado={alternarMarcado}
                      />
                    ))}
                  </tbody>
                </table>
                {secao === 'itens_fiscais' && classificacaoProduto && classificacaoProduto.length > 0 ? (
                  <ClassificacaoProdutoChecklistSmartRead
                    linhas={classificacaoProduto}
                    onVerRisco={onVerRisco}
                  />
                ) : null}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
