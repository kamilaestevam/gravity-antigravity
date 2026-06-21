/**
 * ConferenciaQaNovaLeituraSmartRead — aba Q&A sobre Leitura (paridade UI legado)
 */

import { useState } from 'react'
import { PaperPlaneTilt, Robot } from '@phosphor-icons/react'

const SUGESTOES = [
  'Relatório comparativo dos documentos',
  'Resumo dos dados do exportador',
  'Informações faltando nos documentos',
  'Dados do Importador/consignatário',
  'Campos em conflito entre documentos',
  'Valores totais de cada documento',
  'Comparar datas entre documentos',
  'Resumo geral da operação',
]

export function ConferenciaQaNovaLeituraSmartRead() {
  const [pergunta, setPergunta] = useState('')
  const [historico, setHistorico] = useState<{ pergunta: string; resposta: string }[]>([])

  function enviarPergunta(texto: string) {
    const limpo = texto.trim()
    if (!limpo) return
    setHistorico((prev) => [
      ...prev,
      {
        pergunta: limpo,
        resposta: 'Em breve: respostas da Rafa com base nos documentos desta leitura.',
      },
    ])
    setPergunta('')
  }

  return (
    <div className="sr-conf-qa">
      <p className="sr-conf-qa-subtitulo">Sugestões de perguntas</p>
      <div className="sr-conf-qa-sugestoes">
        {SUGESTOES.map((sugestao) => (
          <button
            key={sugestao}
            type="button"
            className="sr-conf-qa-chip"
            onClick={() => enviarPergunta(sugestao)}
          >
            {sugestao}
          </button>
        ))}
      </div>

      {historico.length === 0 ? (
        <div className="sr-conf-qa-vazio">
          <Robot size={48} weight="duotone" />
          <strong>Faça uma pergunta sobre os documentos da leitura</strong>
          <span>Clique em uma sugestão acima ou digite sua própria pergunta</span>
        </div>
      ) : (
        <ul className="sr-conf-qa-historico">
          {historico.map((item, indice) => (
            <li key={`${item.pergunta}-${indice}`}>
              <p className="sr-conf-qa-pergunta">{item.pergunta}</p>
              <p className="sr-conf-qa-resposta">{item.resposta}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        className="sr-conf-qa-form"
        onSubmit={(e) => {
          e.preventDefault()
          enviarPergunta(pergunta)
        }}
      >
        <input
          type="text"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Pergunte a Rafa sobre seus documentos…"
          aria-label="Pergunta sobre a leitura"
        />
        <button type="submit" aria-label="Enviar pergunta" disabled={!pergunta.trim()}>
          <PaperPlaneTilt size={18} weight="fill" />
        </button>
      </form>
    </div>
  )
}
