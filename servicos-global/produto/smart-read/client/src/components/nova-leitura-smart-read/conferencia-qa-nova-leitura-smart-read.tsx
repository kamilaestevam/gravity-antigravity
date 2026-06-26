/**
 * ConferenciaQaNovaLeituraSmartRead — aba Consultor Inteligente (Rafa)
 */

import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
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
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import { montarDocumentosAnaliseRiscoDeArquivosLocais } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { CorpoRespostaMarkdownConsultorSmartRead } from '../../shared/corpo-resposta-markdown-consultor-smart-read'
import { NOME_PRODUTO_EXIBICAO } from '../../shared/marca-smart-docs'
import type { MensagemHistoricoQaLeitura } from '../../../../shared/qa-leitura-smart-read'
import type { ResumoUsoLlmLeituraSmartRead, UsoLlmChamadaLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'

type SugestaoQa = {
  id: string
  texto: string
  Icone: ComponentType<IconProps>
}

const SUGESTOES: SugestaoQa[] = [
  { id: 'comparativo', texto: 'Relatório comparativo dos documentos', Icone: Scales },
  { id: 'exportador', texto: 'Resumo dos dados do exportador', Icone: Factory },
  { id: 'faltando', texto: 'Informações faltando nos documentos', Icone: WarningCircle },
  { id: 'importador', texto: 'Dados do Importador/consignatário', Icone: BuildingOffice },
  { id: 'conflito', texto: 'Campos em conflito entre documentos', Icone: GitDiff },
  { id: 'valores', texto: 'Valores totais de cada documento', Icone: CurrencyDollar },
  { id: 'datas', texto: 'Comparar datas entre documentos', Icone: CalendarBlank },
  { id: 'resumo', texto: 'Resumo geral da operação', Icone: ClipboardText },
]

type TurnoQaUi = {
  id: string
  pergunta: string
  status: 'carregando' | 'ok' | 'erro'
  resposta?: string
  aviso?: string | null
}

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  idLeituraLegado?: string | null
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
  onIaInicio?: () => void
  onIaFim?: () => void
}

function montarHistoricoApi(turnos: TurnoQaUi[]): MensagemHistoricoQaLeitura[] {
  const saida: MensagemHistoricoQaLeitura[] = []
  for (const turno of turnos) {
    if (turno.status !== 'ok' || !turno.resposta) continue
    saida.push({ papel: 'usuario', conteudo: turno.pergunta })
    saida.push({ papel: 'assistente', conteudo: turno.resposta })
  }
  return saida
}

export function ConferenciaQaNovaLeituraSmartRead({
  arquivos,
  idLeituraLegado = null,
  onTokensAtualizados,
  onIaInicio,
  onIaFim,
}: Props) {
  const [pergunta, setPergunta] = useState('')
  const [turnos, setTurnos] = useState<TurnoQaUi[]>([])
  const [enviando, setEnviando] = useState(false)
  const fimThreadRef = useRef<HTMLDivElement>(null)

  const documentos = useMemo(
    () => montarDocumentosAnaliseRiscoDeArquivosLocais(arquivos),
    [arquivos],
  )

  const semDocumentos = documentos.length === 0

  useEffect(() => {
    fimThreadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [turnos])

  async function enviarPergunta(texto: string) {
    const limpo = texto.trim()
    if (!limpo || enviando || semDocumentos) return

    const idTurno = `turno-${Date.now()}`
    setEnviando(true)
    onIaInicio?.()
    setTurnos((prev) => [...prev, { id: idTurno, pergunta: limpo, status: 'carregando' }])
    setPergunta('')

    const historicoAnterior = montarHistoricoApi(turnos)

    try {
      const resultado = await smartReadApi.perguntarQaLeitura({
        documentos,
        pergunta: limpo,
        historico: historicoAnterior,
        id_leitura_legado: idLeituraLegado ?? undefined,
      })
      onTokensAtualizados?.(resultado.uso_llm_leitura, resultado.uso_llm_chamada)
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
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao consultar a Rafa'
      setTurnos((prev) =>
        prev.map((turno) =>
          turno.id === idTurno
            ? {
                ...turno,
                status: 'erro',
                resposta: `Não foi possível obter resposta: ${mensagem}`,
              }
            : turno,
        ),
      )
    } finally {
      setEnviando(false)
      onIaFim?.()
    }
  }

  return (
    <div className="sr-conf-qa">
      {semDocumentos && (
        <p className="sr-conf-vazio" role="status">
          Aguardando análise dos arquivos para habilitar perguntas.
        </p>
      )}

      <section className="sr-conf-qa-bloco" aria-labelledby="sr-conf-qa-sugestoes-titulo">
        <header className="sr-conf-qa-bloco-header" id="sr-conf-qa-sugestoes-titulo">
          <Sparkle size={16} weight="fill" aria-hidden />
          <span>Sugestões de perguntas</span>
        </header>
        <div className="sr-conf-qa-sugestoes">
          {SUGESTOES.map(({ id, texto, Icone }) => (
            <button
              key={id}
              type="button"
              className="sr-conf-qa-chip"
              disabled={semDocumentos || enviando}
              onClick={() => void enviarPergunta(texto)}
            >
              <span className="sr-conf-qa-chip-icone" aria-hidden>
                <Icone size={15} weight="duotone" />
              </span>
              <span className="sr-conf-qa-chip-texto">{texto}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="sr-conf-qa-thread" aria-live="polite">
        {turnos.length === 0 ? (
          <div className="sr-conf-qa-vazio">
            <div className="sr-conf-qa-vazio-icone" aria-hidden>
              <Sparkle size={28} weight="fill" />
            </div>
            <strong>Consultor inteligente sobre os documentos</strong>
            <span>Clique em uma sugestão ou digite sua pergunta abaixo.</span>
            <p className="sr-conf-qa-disclaimer">
              Apoio à conferência — não substitui parecer jurídico nem despacho aduaneiro.
            </p>
          </div>
        ) : (
          <ul className="sr-conf-qa-turnos">
            {turnos.map((turno) => (
              <li key={turno.id} className="sr-conf-qa-turno">
                <div className="sr-conf-qa-turno-pergunta">
                  <User size={14} weight="fill" aria-hidden />
                  <span>{turno.pergunta}</span>
                </div>
                <article
                  className={`sr-conf-qa-card${
                    turno.status === 'erro' ? ' sr-conf-qa-card--erro' : ''
                  }`}
                >
                  <header className="sr-conf-qa-card-header">
                    <span className="sr-conf-qa-card-avatar" aria-hidden>
                      <Sparkle size={14} weight="fill" />
                    </span>
                    <div className="sr-conf-qa-card-titulos">
                      <h3>Rafa</h3>
                      <span className="sr-conf-qa-card-subtitulo">Consultor {NOME_PRODUTO_EXIBICAO}</span>
                    </div>
                  </header>
                  {turno.status === 'carregando' ? (
                    <p className="sr-conf-qa-card-corpo sr-conf-qa-card-corpo--carregando">
                      <CircleNotch size={16} className="sr-conf-qa-spinner" aria-hidden />
                      Analisando os documentos da leitura…
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

      <form
        className="sr-conf-qa-composer"
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
          className="sr-conf-qa-composer-enviar"
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
