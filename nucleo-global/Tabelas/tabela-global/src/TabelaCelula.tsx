/**
 * @nucleo/tabela-global — celula
 * Renderizador de célula com suporte a tipos text, number, date, datetime,
 * currency, badge e custom.
 */

import React from 'react'
import type { Coluna, RegistroTabela } from './tipos.js'
import {
  formatarData,
  formatarDataHora,
  formatarMoeda,
  formatarNumero,
} from '@nucleo/utils'

interface CelulaProps<T extends RegistroTabela> {
  coluna: Coluna<T>
  linha: T
}

function BadgeCelula({
  valor,
  badgeConfig,
}: {
  valor: unknown
  badgeConfig: NonNullable<Coluna['badgeConfig']>
}) {
  const chave = String(valor)
  const classeStatus = badgeConfig.mapaClasses[chave] ?? 'default'
  const rotulo = badgeConfig.mapaRotulos?.[chave] ?? chave

  const classeMap: Record<string, string> = {
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    default: 'badge badge-default',
  }

  return <span className={classeMap[classeStatus]}>{rotulo}</span>
}

export function TabelaCelula<T extends RegistroTabela>({ coluna, linha }: CelulaProps<T>) {
  const valor = linha[coluna.key]

  // Renderizador customizado tem prioridade
  if (coluna.renderizar) {
    return (
      <td
        className="tg-td"
        style={{ textAlign: coluna.alinhamento ?? 'left' }}
      >
        {coluna.renderizar(valor, linha)}
      </td>
    )
  }

  let conteudo: React.ReactNode

  switch (coluna.tipo) {
    case 'number':
      conteudo = valor != null ? formatarNumero(Number(valor), 0) : '—'
      break

    case 'currency':
      conteudo = valor != null ? formatarMoeda(Number(valor)) : '—'
      break

    case 'date':
      conteudo = valor != null ? formatarData(valor as string | Date | number) : '—'
      break

    case 'datetime':
      conteudo = valor != null ? formatarDataHora(valor as string | Date | number) : '—'
      break

    case 'badge':
      conteudo =
        valor != null && coluna.badgeConfig ? (
          <BadgeCelula valor={valor} badgeConfig={coluna.badgeConfig} />
        ) : (
          '—'
        )
      break

    default:
      conteudo = valor != null ? String(valor) : '—'
  }

  return (
    <td
      className="tg-td"
      style={{ textAlign: coluna.alinhamento ?? 'left' }}
    >
      {conteudo}
    </td>
  )
}
