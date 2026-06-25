/**
 * ConferenciaQaNovaLeituraSmartRead — aba Q&A sobre Leitura (Consultor Rafa)
 */

import { useMemo, useState } from 'react'
import { CircleNotch, PaperPlaneTilt, Robot } from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import { montarDocumentosAnaliseRiscoDeArquivosLocais } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { MensagemHistoricoQaLeitura } from '../../../../shared/qa-leitura-smart-read'

const SUGESTOES = [
  'Relatório comparativo dos documentos',
  'Resumo dos dados do exportador',
  'Informações faltando nos documentos',
  'Dados do Importador/consignatário',
  'Campos em conflito entre documentos',
  'Valores totais de cada documento',
  'Comparar datas entre documentos',
  'Resumo geral da operação',
] as const

type ItemHistoricoUi =
  | { id: string; tipo: 'usuario'; texto: string }
  | { id: string; tipo: 'assistente'; texto: string; aviso?: string | null }
  | { id: string; tipo: 'carregando'; pergunta: string }

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
}

function montarHistoricoApi(itens: ItemHistoricoUi[]): MensagemHistoricoQaLeitura[] {
  return itens
    .filter((item): item is Extract<ItemHistoricoUi, { tipo: 'usuario' | 'assistente' }> =>
      item.tipo === 'usuario' || item.tipo === 'assistente',
    )
    .map((item) => ({
      papel: item.tipo === 'usuario' ? 'usuario' : 'assistente',
      conteudo: item.texto,
    }))
}

export function ConferenciaQaNovaLeituraSmartRead({ arquivos }: Props) {
  const [pergunta, setPergunta] = useState('')
  const [historico, setHistorico] = useState<ItemHistoricoUi[]>([])
  const [enviando, setEnviando] = useState(false)

  const documentos = useMemo(
    () => montarDocumentosAnaliseRiscoDeArquivosLocais(arquivos),
    [arquivos],
  )

  const semDocumentos = documentos.length === 0

  async function enviarPergunta(texto: string) {
    const limpo = texto.trim()
    if (!limpo || enviando || semDocumentos) return

    const idCarregando = `carregando-${Date.now()}`
    setEnviando(true)
    setHistorico((prev) => [
      ...prev,
      { id: `usuario-${Date.now()}`, tipo: 'usuario', texto: limpo },
      { id: idCarregando, tipo: 'carregando', pergunta: limpo },
    ])
    setPergunta('')

    try {
      const historicoApi = montarHistoricoApi(historico)
      const resultado = await smartReadApi.perguntarQaLeitura({
        documentos,
        pergunta: limpo,
        historico: historicoApi,
      })
      setHistorico((prev) => [
        ...prev.filter((item) => item.id !== idCarregando),
        {
          id: `assistente-${Date.now()}`,
          tipo: 'assistente',
          texto: resultado.resposta,
          aviso: resultado.aviso,
        },
      ])
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao consultar a Rafa'
      setHistorico((prev) => [
        ...prev.filter((item) => item.id !== idCarregando),
        {
          id: `assistente-${Date.now()}`,
          tipo: 'assistente',
          texto: `Não foi possível obter resposta: ${mensagem}`,
        },
      ])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="sr-conf-qa">
      {semDocumentos && (
        <p className="sr-conf-vazio" role="status">
          Aguardando análise dos arquivos para habilitar perguntas.
        </p>
      )}

      <p className="sr-conf-qa-subtitulo">Sugestões de perguntas</p>
      <div className="sr-conf-qa-sugestoes">
        {SUGESTOES.map((sugestao) => (
          <button
            key={sugestao}
            type="button"
            className="sr-conf-qa-chip"
            disabled={semDocumentos || enviando}
            onClick={() => void enviarPergunta(sugestao)}
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
        <ul className="sr-conf-qa-historico" aria-live="polite">
          {historico.map((item) => {
            if (item.tipo === 'carregando') {
              return (
                <li key={item.id} className="sr-conf-qa-item sr-conf-qa-item--carregando">
                  <p className="sr-conf-qa-pergunta">{item.pergunta}</p>
                  <p className="sr-conf-qa-resposta">
                    <CircleNotch size={16} className="sr-conf-qa-spinner" aria-hidden />
                    Rafa está analisando os documentos…
                  </p>
                </li>
              )
            }
            if (item.tipo === 'usuario') {
              return (
                <li key={item.id} className="sr-conf-qa-item sr-conf-qa-item--usuario">
                  <p className="sr-conf-qa-pergunta">{item.texto}</p>
                </li>
              )
            }
            return (
              <li key={item.id} className="sr-conf-qa-item sr-conf-qa-item--assistente">
                <p className="sr-conf-qa-resposta">{item.texto}</p>
                {item.aviso && <p className="sr-conf-qa-aviso">{item.aviso}</p>}
              </li>
            )
          })}
        </ul>
      )}

      <form
        className="sr-conf-qa-form"
        onSubmit={(e) => {
          e.preventDefault()
          void enviarPergunta(pergunta)
        }}
      >
        <input
          type="text"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Pergunte a Rafa sobre seus documentos…"
          aria-label="Pergunta sobre a leitura"
          disabled={semDocumentos || enviando}
        />
        <button
          type="submit"
          aria-label="Enviar pergunta"
          disabled={!pergunta.trim() || semDocumentos || enviando}
        >
          {enviando ? (
            <CircleNotch size={18} className="sr-conf-qa-spinner" aria-hidden />
          ) : (
            <PaperPlaneTilt size={18} weight="fill" />
          )}
        </button>
      </form>
    </div>
  )
}
