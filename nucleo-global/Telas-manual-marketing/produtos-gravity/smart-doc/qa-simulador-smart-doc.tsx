import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  BuildingOffice,
  CalendarBlank,
  CircleNotch,
  ClipboardText,
  CurrencyDollar,
  Factory,
  GitDiff,
  PaperPlaneTilt,
  Scales,
  Sparkle,
  User,
  WarningCircle,
} from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  ATRASO_RESPOSTA_QA_MS,
  resolverRespostaQaSimulador,
} from './dados-qa-simulador-smart-doc'
import { CorpoRespostaMarkdownConsultorSmartRead } from '../../../../servicos-global/produto/smart-read/client/src/shared/corpo-resposta-markdown-consultor-smart-read'
import './qa-simulador-smart-doc.css'

const NOME_PRODUTO_EXIBICAO = 'Smart Docs'

type SugestaoQa = {
  id: string
  rotulo: string
  texto: string
  Icone: ComponentType<IconProps>
}

const SUGESTOES: SugestaoQa[] = [
  { id: 'comparativo', rotulo: 'Comparativo', texto: 'Relatório comparativo dos documentos', Icone: Scales },
  { id: 'exportador', rotulo: 'Exportador', texto: 'Resumo dos dados do exportador', Icone: Factory },
  { id: 'faltando', rotulo: 'Faltando', texto: 'Informações faltando nos documentos', Icone: WarningCircle },
  { id: 'importador', rotulo: 'Importador', texto: 'Dados do Importador/consignatário', Icone: BuildingOffice },
  { id: 'conflito', rotulo: 'Conflitos', texto: 'Campos em conflito entre documentos', Icone: GitDiff },
  { id: 'valores', rotulo: 'Valores', texto: 'Valores totais de cada documento', Icone: CurrencyDollar },
  { id: 'datas', rotulo: 'Datas', texto: 'Comparar datas entre documentos', Icone: CalendarBlank },
  { id: 'resumo', rotulo: 'Resumo', texto: 'Resumo geral da operação', Icone: ClipboardText },
]

type TurnoQaUi = {
  id: string
  pergunta: string
  status: 'carregando' | 'ok' | 'erro'
  resposta?: string
  aviso?: string | null
}

type Props = {
  arquivos: ArquivoDemoSimulador[]
  documentoAtual: DocumentoSimulador | null
  tituloContexto?: string
}

export function QaSimuladorSmartDoc({
  arquivos,
  documentoAtual,
  tituloContexto = '',
}: Props) {
  const [pergunta, setPergunta] = useState('')
  const [turnos, setTurnos] = useState<TurnoQaUi[]>([])
  const [enviando, setEnviando] = useState(false)
  const fimThreadRef = useRef<HTMLDivElement>(null)

  const arquivosCompletos = arquivos.filter((a) => a.status === 'completo')
  const semDocumentos = arquivosCompletos.length === 0
  const conversaIniciada = turnos.length > 0
  const chaveDocumento = `${documentoAtual?.id ?? ''}:${tituloContexto}`

  useEffect(() => {
    setTurnos([])
    setPergunta('')
  }, [chaveDocumento])

  useEffect(() => {
    fimThreadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [turnos])

  async function enviarPergunta(texto: string) {
    const limpo = texto.trim()
    if (!limpo || enviando || semDocumentos) return

    const idTurno = `turno-${Date.now()}`
    setEnviando(true)
    setTurnos((prev) => [...prev, { id: idTurno, pergunta: limpo, status: 'carregando' }])
    setPergunta('')

    await new Promise((resolve) => setTimeout(resolve, ATRASO_RESPOSTA_QA_MS))

    const resultado = resolverRespostaQaSimulador(limpo, {
      arquivos: arquivosCompletos,
      documentoAtual,
      tituloContexto,
    })

    setTurnos((prev) =>
      prev.map((turno) =>
        turno.id === idTurno
          ? {
              ...turno,
              status: 'ok',
              resposta: resultado.resposta,
              aviso: resultado.aviso,
            }
          : turno,
      ),
    )
    setEnviando(false)
  }

  return (
    <div className="sr-conf-qa">
      {tituloContexto && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContexto}</span>
        </div>
      )}

      {semDocumentos && (
        <p className="sr-conf-vazio sr-conf-vazio--inline" role="status">
          Aguardando análise dos arquivos para habilitar perguntas.
        </p>
      )}

      <div
        className={`sr-conf-qa-thread${conversaIniciada ? ' sr-conf-qa-thread--ativa' : ''}`}
        aria-live="polite"
      >
        {conversaIniciada && (
          <ul className="sr-conf-qa-turnos">
            {turnos.map((turno) => (
              <li key={turno.id} className="sr-conf-qa-turno">
                <div className="sr-conf-qa-turno-pergunta">
                  <User size={13} weight="fill" aria-hidden />
                  <span>{turno.pergunta}</span>
                </div>
                <article
                  className={`sr-conf-qa-card${turno.status === 'erro' ? ' sr-conf-qa-card--erro' : ''}`}
                >
                  <header className="sr-conf-qa-card-header">
                    <Sparkle size={13} weight="fill" aria-hidden />
                    <h3>Rafa</h3>
                    <span className="sr-conf-qa-card-subtitulo">{NOME_PRODUTO_EXIBICAO}</span>
                  </header>
                  {turno.status === 'carregando' ? (
                    <p className="sr-conf-qa-card-corpo sr-conf-qa-card-corpo--carregando">
                      <CircleNotch size={15} className="sr-conf-qa-spinner" aria-hidden />
                      Analisando…
                    </p>
                  ) : (
                    <>
                      <div className="sr-conf-qa-card-corpo">
                        <CorpoRespostaMarkdownConsultorSmartRead texto={turno.resposta ?? ''} />
                      </div>
                      {turno.aviso && <p className="sr-conf-qa-aviso">{turno.aviso}</p>}
                    </>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
        <div ref={fimThreadRef} />
      </div>

      <div className="sr-conf-qa-dock">
        {!semDocumentos && (
          <div className="sr-conf-qa-acoes" role="group" aria-label="Sugestões de perguntas">
            {SUGESTOES.map(({ id, rotulo, texto, Icone }) => (
              <button
                key={id}
                type="button"
                className="sr-conf-qa-acao"
                disabled={enviando}
                aria-label={texto}
                title={texto}
                onClick={() => void enviarPergunta(texto)}
              >
                <span className="sr-conf-qa-acao-icone" aria-hidden>
                  <Icone size={17} weight="duotone" />
                </span>
                <span className="sr-conf-qa-acao-rotulo">{rotulo}</span>
              </button>
            ))}
          </div>
        )}

        <form
          className="sr-conf-qa-composer"
          onSubmit={(e) => {
            e.preventDefault()
            void enviarPergunta(pergunta)
          }}
        >
          <Sparkle size={16} weight="fill" className="sr-conf-qa-composer-icone" aria-hidden />
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Pergunte à Rafa…"
            aria-label="Pergunta sobre a leitura"
            disabled={semDocumentos || enviando}
          />
          <button
            type="submit"
            className="sr-conf-qa-composer-enviar"
            aria-label="Enviar pergunta"
            disabled={!pergunta.trim() || semDocumentos || enviando}
          >
            {enviando ? (
              <CircleNotch size={17} className="sr-conf-qa-spinner" aria-hidden />
            ) : (
              <PaperPlaneTilt size={17} weight="fill" />
            )}
          </button>
        </form>

        <p className="sr-conf-qa-disclaimer">
          Apoio à conferência — não substitui parecer jurídico nem despacho aduaneiro.
        </p>
      </div>
    </div>
  )
}
