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
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import { montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { CorpoRespostaMarkdownConsultorSmartRead } from '../../shared/corpo-resposta-markdown-consultor-smart-read'
import { NOME_PRODUTO_EXIBICAO } from '../../shared/marca-smart-docs'
import type { MensagemHistoricoQaLeitura } from '../../../../shared/qa-leitura-smart-read'
import type { ResumoUsoLlmLeituraSmartRead, UsoLlmChamadaLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'

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
  arquivoConferencia: ArquivoLocalNovaLeitura | null
  indiceDocumentoConferencia: number
  tituloContextoDocumento?: string
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
  arquivoConferencia,
  indiceDocumentoConferencia,
  tituloContextoDocumento = '',
  idLeituraLegado = null,
  onTokensAtualizados,
  onIaInicio,
  onIaFim,
}: Props) {
  const [pergunta, setPergunta] = useState('')
  const [turnos, setTurnos] = useState<TurnoQaUi[]>([])
  const [enviando, setEnviando] = useState(false)
  const fimThreadRef = useRef<HTMLDivElement>(null)

  const chaveDocumento = `${arquivoConferencia?.id_arquivo_local ?? ''}:${indiceDocumentoConferencia}`

  const documentos = useMemo(
    () =>
      arquivoConferencia
        ? montarDocumentosAnaliseRiscoDeArquivoLocalSelecionado(
            arquivoConferencia,
            indiceDocumentoConferencia,
          )
        : [],
    [arquivoConferencia, indiceDocumentoConferencia],
  )

  const semDocumentos = documentos.length === 0
  const conversaIniciada = turnos.length > 0

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
      {tituloContextoDocumento && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContextoDocumento}</span>
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
                  className={`sr-conf-qa-card${
                    turno.status === 'erro' ? ' sr-conf-qa-card--erro' : ''
                  }`}
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
              <TooltipGlobal key={id} titulo={rotulo} descricao={texto}>
                <button
                  type="button"
                  className="sr-conf-qa-acao"
                  disabled={enviando}
                  aria-label={texto}
                  onClick={() => void enviarPergunta(texto)}
                >
                  <span className="sr-conf-qa-acao-icone" aria-hidden>
                    <Icone size={17} weight="duotone" />
                  </span>
                  <span className="sr-conf-qa-acao-rotulo">{rotulo}</span>
                </button>
              </TooltipGlobal>
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
