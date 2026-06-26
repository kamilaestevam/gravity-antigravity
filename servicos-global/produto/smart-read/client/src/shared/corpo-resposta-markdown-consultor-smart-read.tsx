/**
 * CorpoRespostaMarkdownConsultorSmartRead — markdown leve para respostas da Rafa
 */

import type { ReactNode } from 'react'

function renderInline(texto: string, prefixo: string): ReactNode[] {
  const partes: ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  let ultimo = 0
  let indice = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(texto.slice(ultimo, match.index))
    }
    const token = match[0]
    const chave = `${prefixo}-${indice++}`
    if (token.startsWith('**')) {
      partes.push(<strong key={chave}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      partes.push(<code key={chave}>{token.slice(1, -1)}</code>)
    } else {
      partes.push(<em key={chave}>{token.slice(1, -1)}</em>)
    }
    ultimo = match.index + token.length
  }

  if (ultimo < texto.length) {
    partes.push(texto.slice(ultimo))
  }

  return partes
}

function renderBlocos(texto: string): ReactNode[] {
  const linhas = texto.replace(/\r\n/g, '\n').split('\n')
  const nos: ReactNode[] = []
  let i = 0

  while (i < linhas.length) {
    const linha = linhas[i]
    if (!linha.trim()) {
      i += 1
      continue
    }

    if (linha.startsWith('### ')) {
      nos.push(
        <h4 key={`h4-${i}`} className="sr-conf-qa-md-h4">
          {renderInline(linha.slice(4), `h4-${i}`)}
        </h4>,
      )
      i += 1
      continue
    }

    if (linha.startsWith('## ')) {
      nos.push(
        <h3 key={`h3-${i}`} className="sr-conf-qa-md-h3">
          {renderInline(linha.slice(3), `h3-${i}`)}
        </h3>,
      )
      i += 1
      continue
    }

    if (/^[*\-]\s+/.test(linha)) {
      const itens: ReactNode[] = []
      while (i < linhas.length && /^[*\-]\s+/.test(linhas[i])) {
        itens.push(
          <li key={`li-${i}`}>{renderInline(linhas[i].replace(/^[*\-]\s+/, ''), `li-${i}`)}</li>,
        )
        i += 1
      }
      nos.push(
        <ul key={`ul-${i}`} className="sr-conf-qa-md-list">
          {itens}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(linha)) {
      const itens: ReactNode[] = []
      while (i < linhas.length && /^\d+\.\s+/.test(linhas[i])) {
        itens.push(
          <li key={`li-${i}`}>{renderInline(linhas[i].replace(/^\d+\.\s+/, ''), `li-${i}`)}</li>,
        )
        i += 1
      }
      nos.push(
        <ol key={`ol-${i}`} className="sr-conf-qa-md-list sr-conf-qa-md-list--ordenada">
          {itens}
        </ol>,
      )
      continue
    }

    const paragrafo: string[] = []
    while (
      i < linhas.length &&
      linhas[i].trim() &&
      !linhas[i].startsWith('### ') &&
      !/^## /.test(linhas[i]) &&
      !/^[*\-]\s+/.test(linhas[i]) &&
      !/^\d+\.\s+/.test(linhas[i])
    ) {
      paragrafo.push(linhas[i])
      i += 1
    }

    nos.push(
      <p key={`p-${i}`} className="sr-conf-qa-md-paragrafo">
        {renderInline(paragrafo.join(' '), `p-${i}`)}
      </p>,
    )
  }

  return nos
}

export function CorpoRespostaMarkdownConsultorSmartRead({ texto }: { texto: string }) {
  return <div className="sr-conf-qa-md">{renderBlocos(texto)}</div>
}
