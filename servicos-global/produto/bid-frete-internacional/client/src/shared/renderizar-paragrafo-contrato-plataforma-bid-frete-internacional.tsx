import React from 'react'

const MARCADORES_PARAGRAFO_CONTRATO = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*/g

/** Renderiza parágrafos do contrato: ***negrito+sublinhado*** ou **negrito**. */
export function renderizarParagrafoContratoPlataformaBidFreteInternacional(texto: string): React.ReactNode {
  if (!/(\*\*\*|\*\*)/.test(texto)) return texto

  const nodes: React.ReactNode[] = []
  let ultimoIndice = 0
  let chave = 0
  let correspondencia: RegExpExecArray | null

  MARCADORES_PARAGRAFO_CONTRATO.lastIndex = 0
  while ((correspondencia = MARCADORES_PARAGRAFO_CONTRATO.exec(texto)) !== null) {
    if (correspondencia.index > ultimoIndice) {
      nodes.push(texto.slice(ultimoIndice, correspondencia.index))
    }
    if (correspondencia[1]) {
      nodes.push(
        <strong key={chave++} className="bf-contrato-enfase-sublinhado">
          {correspondencia[1]}
        </strong>,
      )
    } else if (correspondencia[2]) {
      nodes.push(<strong key={chave++}>{correspondencia[2]}</strong>)
    }
    ultimoIndice = MARCADORES_PARAGRAFO_CONTRATO.lastIndex
  }

  if (ultimoIndice < texto.length) {
    nodes.push(texto.slice(ultimoIndice))
  }

  return nodes
}
