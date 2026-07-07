import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Brain,
  CaretDown,
  CaretUp,
  ChartLineUp,
  Check,
  CheckCircle,
  CircleNotch,
  Clock,
  CloudArrowUp,
  Eye,
  FileCode,
  FileCsv,
  FileImage,
  FileMagnifyingGlass,
  FilePdf,
  FileText,
  HardDrives,
  Info,
  Sparkle,
  Table,
  Timer,
  Trash,
  X,
} from '@phosphor-icons/react'
import './nova-leitura-simulador-smart-doc.css'
import { type DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  gerarArquivosDemoIniciais,
  gerarNumeroLeituraAleatorio,
  marcarArquivoDemoAnaliseCompleta,
  resolverDocumentoPadraoArquivoDemo,
  type ArquivoDemoSimulador,
} from './arquivos-demo-simulador-smart-doc'
import { PreviewDocumentoSimuladorSmartDoc } from './preview-documento-simulador-smart-doc'
import { EdicaoNomeLeituraSimuladorSmartDoc } from './edicao-nome-leitura-simulador-smart-doc'
import {
  ConferenciaSimuladorSmartDoc,
  type AbaConferenciaSimulador,
} from './conferencia-simulador-smart-doc'
import { ResultadoSimuladorSmartDoc } from './resultado-simulador-smart-doc'
import {
  resolverIdTelaConferenciaSimulador,
  resolverIdTelaNovaLeituraSimulador,
} from './dados-tutorial-opcional-simulador-smart-doc'
import { TutorialOpcionalSimuladorSmartDoc } from './tutorial-opcional-simulador-smart-doc'
import { useEfeitoDestaqueTutorialSimulador } from './efeito-destaque-tutorial-simulador-smart-doc'

const PASSOS = [
  { id: 1, label: 'Anexar arquivo' },
  { id: 2, label: 'Análise do arquivo' },
  { id: 3, label: 'Conferência' },
  { id: 4, label: 'Resultado das leituras' },
] as const

const FORMATOS = [
  { ext: 'pdf', Icon: FilePdf },
  { ext: 'jpg', Icon: FileImage },
  { ext: 'jpeg', Icon: FileImage },
  { ext: 'png', Icon: FileImage },
  { ext: 'xml', Icon: FileCode },
  { ext: 'csv', Icon: FileCsv },
  { ext: 'xls', Icon: Table },
  { ext: 'xlsx', Icon: Table },
] as const

type PreviewSimulador = {
  tituloArquivo: string
  documento: DocumentoSimulador
}

type ArquivoSimulador = ArquivoDemoSimulador

type EtapaAnalise = {
  id: number
  rotulo: string
  progresso: number
  status: 'pendente' | 'andamento' | 'completo'
}

function formatarTempoAnalise(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(' : ')
}

function progressoLinearEtapa(elapsedSegundos: number, inicioEtapa: number, duracaoEtapa: number): number {
  if (elapsedSegundos <= inicioEtapa) return 0
  const linear = Math.round(((elapsedSegundos - inicioEtapa) / duracaoEtapa) * 100)
  return Math.min(99, linear)
}

function aplicarCreepAposFaseRapida(progresso: number, elapsedSegundos: number): number {
  if (elapsedSegundos <= 16) return progresso
  const extra = elapsedSegundos - 16
  const creep = Math.min(99 - progresso, Math.floor(extra / 8))
  return Math.min(99, progresso + creep)
}

function calcularEtapasAnalise(elapsed: number, completo: boolean): EtapaAnalise[] {
  if (completo) {
    return [
      { id: 1, rotulo: 'Primeira análise', progresso: 100, status: 'completo' },
      { id: 2, rotulo: 'Segunda análise', progresso: 100, status: 'completo' },
      { id: 3, rotulo: 'Terceira análise', progresso: 100, status: 'completo' },
    ]
  }
  const p1 = aplicarCreepAposFaseRapida(progressoLinearEtapa(elapsed, 0, 6), elapsed)
  const p2 = aplicarCreepAposFaseRapida(progressoLinearEtapa(elapsed, 4, 8), elapsed)
  const p3 = aplicarCreepAposFaseRapida(progressoLinearEtapa(elapsed, 10, 6), elapsed)
  const status = (p: number): EtapaAnalise['status'] => (p <= 0 ? 'pendente' : 'andamento')
  return [
    { id: 1, rotulo: 'Primeira análise', progresso: p1, status: status(p1) },
    { id: 2, rotulo: 'Segunda análise', progresso: p2, status: status(p2) },
    { id: 3, rotulo: 'Terceira análise', progresso: p3, status: status(p3) },
  ]
}

function rotuloStatusEtapa(status: EtapaAnalise['status']): string {
  if (status === 'completo') return 'Completo'
  if (status === 'andamento') return 'Em andamento'
  return 'Aguardando'
}

function classeBarraFillEtapa(status: EtapaAnalise['status']): string {
  if (status === 'completo') return 'completo'
  if (status === 'andamento') return 'andamento'
  return 'pendente'
}

function marcarArquivoAnaliseCompleta(arquivo: ArquivoSimulador): ArquivoSimulador {
  return marcarArquivoDemoAnaliseCompleta(arquivo)
}

type SelecaoConferenciaSimulador = {
  idArquivo: string
  idDocumento: string
}

type Props = {
  aberto: boolean
  onFechar: () => void
  onIrParaLista?: () => void
}

export function NovaLeituraSimuladorSmartDoc({ aberto, onFechar, onIrParaLista }: Props) {
  const [passo, setPasso] = useState(1)
  const [nomeLeitura, setNomeLeitura] = useState('Leitura 448')
  const [arquivos, setArquivos] = useState<ArquivoSimulador[]>([])
  const [enviando, setEnviando] = useState(false)
  const [analiseCompleta, setAnaliseCompleta] = useState(false)
  const [elapsedSegundos, setElapsedSegundos] = useState(0)
  const [preview, setPreview] = useState<PreviewSimulador | null>(null)
  const [selecaoConferencia, setSelecaoConferencia] = useState<SelecaoConferenciaSimulador | null>(null)
  const [abaConferencia, setAbaConferencia] = useState<AbaConferenciaSimulador>('campos')
  const refRaizTutorial = useRef<HTMLDivElement>(null)
  const [alvoTutorialDestacado, setAlvoTutorialDestacado] = useState<string | null>(null)
  useEfeitoDestaqueTutorialSimulador(alvoTutorialDestacado, refRaizTutorial)

  useEffect(() => {
    if (!aberto) {
      setPasso(1)
      setArquivos([])
      setEnviando(false)
      setAnaliseCompleta(false)
      setElapsedSegundos(0)
      setPreview(null)
      setAbaConferencia('campos')
      setSelecaoConferencia(null)
      return
    }
    setNomeLeitura(gerarNumeroLeituraAleatorio())
  }, [aberto])

  useEffect(() => {
    if (passo !== 3) return
    setArquivos((lista) =>
      lista.map((a) =>
        a.status === 'completo' && a.documentosIdentificados.length > 0 && !a.expandido
          ? { ...a, expandido: true }
          : a,
      ),
    )
    setSelecaoConferencia((prev) => {
      if (prev) return prev
      const completos = arquivos.filter((a) => a.status === 'completo')
      const primeiro = completos[0]
      const primeiroDoc = primeiro?.documentosIdentificados[0]
      if (!primeiroDoc) return null
      return { idArquivo: primeiro.id, idDocumento: primeiroDoc.id }
    })
  }, [passo, arquivos])

  useEffect(() => {
    if (passo !== 2 || !analiseCompleta) return
    setArquivos((lista) => {
      const primeiro = lista.find((a) => a.documentosIdentificados.length > 0)
      if (!primeiro || primeiro.expandido) return lista
      return lista.map((a) => (a.id === primeiro.id ? { ...a, expandido: true } : a))
    })
  }, [passo, analiseCompleta])

  useEffect(() => {
    if (passo !== 2 || analiseCompleta) return
    const id = window.setInterval(() => {
      setElapsedSegundos((s) => {
        const next = s + 1
        if (next >= 8) {
          setAnaliseCompleta(true)
          setArquivos((lista) => lista.map(marcarArquivoAnaliseCompleta))
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [passo, analiseCompleta])

  const etapas = useMemo(
    () => calcularEtapasAnalise(elapsedSegundos, analiseCompleta),
    [elapsedSegundos, analiseCompleta],
  )
  const progressoGeral = Math.round(
    etapas.reduce((acc, e) => acc + e.progresso, 0) / etapas.length,
  )

  if (!aberto) return null

  function anexarArquivo() {
    if (arquivos.length > 0) return
    setArquivos(gerarArquivosDemoIniciais())
  }

  function removerArquivo(id: string) {
    setArquivos((lista) => lista.filter((a) => a.id !== id))
  }

  function alternarExpandido(id: string) {
    setArquivos((lista) =>
      lista.map((a) => (a.id === id ? { ...a, expandido: !a.expandido } : a)),
    )
  }

  function visualizarArquivo(arq: ArquivoSimulador) {
    setPreview({
      tituloArquivo: arq.nome,
      documento: resolverDocumentoPadraoArquivoDemo(arq),
    })
  }

  function visualizarDocumento(arq: ArquivoSimulador, doc: DocumentoSimulador) {
    setPreview({ tituloArquivo: arq.nome, documento: doc })
  }

  function rotuloStatusArquivo(arq: ArquivoSimulador): string {
    if (arq.status === 'anexado') return passo === 1 ? 'Arquivo enviado' : 'Aguardando envio'
    if (arq.status === 'analisando') return 'Analisando arquivo...'
    return 'Análise completa'
  }

  function enviar() {
    if (arquivos.length === 0) return
    setEnviando(true)
    window.setTimeout(() => {
      setEnviando(false)
      setPasso(2)
      setArquivos((lista) => lista.map((a) => ({ ...a, status: 'analisando' as const })))
      setElapsedSegundos(0)
    }, 600)
  }

  function renderStepper() {
    return (
      <div className="sds-nl-stepper-wrap">
        <ol className="sds-nl-stepper" role="list">
          {PASSOS.map((p, idx) => {
            const feito = passo > p.id
            const ativo = passo === p.id
            return (
              <li
                key={p.id}
                className={`sds-nl-stepper-item${feito ? ' sds-nl-stepper-item--feito' : ''}${ativo ? ' sds-nl-stepper-item--ativo' : ''}`}
                role="listitem"
              >
                {idx > 0 && (
                  <span
                    className={`sds-nl-stepper-conector${feito ? ' sds-nl-stepper-conector--feito' : ''}`}
                    aria-hidden
                  />
                )}
                <span className="sds-nl-stepper-circulo">
                  {feito ? <Check size={12} weight="bold" /> : p.id}
                </span>
                <span className="sds-nl-stepper-label">{p.label}</span>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  function selecionarDocumentoConferencia(idArquivo: string, idDocumento: string) {
    setSelecaoConferencia({ idArquivo, idDocumento })
  }

  function renderLateral() {
    return (
      <aside className="sds-nl-lateral" data-sds-tutorial-alvo="nl-lateral">
        <div data-sds-tutorial-alvo="nl-nome-leitura">
        <EdicaoNomeLeituraSimuladorSmartDoc
          nomeLeitura={nomeLeitura}
          onConfirmar={setNomeLeitura}
        />
        </div>

        <div className="sds-nl-lateral-secao">
          <span className="sds-nl-lateral-secao-titulo">Arquivos enviados</span>
          <span className="sds-nl-lateral-badge">{arquivos.length}</span>
        </div>

        <div className="sds-nl-lateral-lista" data-sds-tutorial-alvo="nl-arquivos-lateral">
          {arquivos.map((arq, indiceArq) => {
            const qtdDocumentos = arq.documentosIdentificados.length
            const temDocumentos = qtdDocumentos > 0
            const podeExpandir = passo >= 2 && temDocumentos
            const emProcessamento = arq.status === 'analisando'
            const completo = arq.status === 'completo'
            const conferenciaAtiva = passo >= 3

            return (
              <article
                key={arq.id}
                className={`sds-nl-card-arquivo${arq.expandido ? ' sds-nl-card-arquivo--expandido' : ''}`}
              >
                <div className="sds-nl-card-arquivo-cabecalho">
                  <span
                    className="sds-nl-card-arquivo-icone-wrap"
                    {...(passo >= 2 && indiceArq === 0 ? { 'data-sds-tutorial-alvo': 'nl-icone-pdf-arquivo' } : {})}
                  >
                    <FilePdf size={18} weight="duotone" />
                  </span>
                  <div className="sds-nl-card-arquivo-info">
                    <span className="sds-nl-card-arquivo-nome" title={arq.nome}>
                      {arq.nome}
                    </span>
                    <div className="sds-nl-card-arquivo-acoes">
                      <button
                        type="button"
                        className="sds-nl-card-btn-icone"
                        {...(passo >= 2 && indiceArq === 0 ? { 'data-sds-tutorial-alvo': 'nl-visualizar-original' } : {})}
                        title="Visualizar documento original"
                        aria-label={`Visualizar original ${arq.nome}`}
                        onClick={() => visualizarArquivo(arq)}
                      >
                        <Eye size={16} />
                        {temDocumentos && (
                          <span className="sds-nl-card-contagem" aria-label={`${qtdDocumentos} documento(s) identificado(s)`}>
                            {qtdDocumentos}
                          </span>
                        )}
                      </button>

                      {podeExpandir && (
                        <button
                          type="button"
                          className="sds-nl-card-btn-icone"
                          {...(indiceArq === 0 ? { 'data-sds-tutorial-alvo': 'nl-expandir-arquivo' } : {})}
                          title={arq.expandido ? 'Recolher documentos identificados' : 'Expandir documentos identificados'}
                          aria-expanded={arq.expandido}
                          onClick={() => alternarExpandido(arq.id)}
                        >
                          {arq.expandido ? <CaretUp size={16} /> : <CaretDown size={16} />}
                        </button>
                      )}

                      {passo === 1 && (
                        <button
                          type="button"
                          className="sds-nl-card-btn-icone sds-nl-card-btn-remover"
                          aria-label={`Remover ${arq.nome}`}
                          onClick={() => removerArquivo(arq.id)}
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sds-nl-card-arquivo-status">
                  {emProcessamento && <CircleNotch size={14} className="sds-nl-card-spin" />}
                  {completo && <CheckCircle size={14} weight="fill" className="sds-nl-card-ok" />}
                  <span>{rotuloStatusArquivo(arq)}</span>
                </div>

                {temDocumentos && !arq.expandido && (
                  <div className="sds-nl-card-chips" aria-label="Documentos identificados">
                    {arq.documentosIdentificados.map((doc) => (
                      <span key={doc.id} className="sds-nl-card-tag-tipo">
                        {doc.rotulo}
                      </span>
                    ))}
                  </div>
                )}

                {arq.expandido && temDocumentos && (
                  <ul
                    className="sds-nl-card-documentos"
                    {...(conferenciaAtiva ? { 'data-sds-tutorial-alvo': 'conf-documentos-lateral' } : {})}
                  >
                    {arq.documentosIdentificados.map((doc, indiceDoc) => {
                      const ativoConferencia =
                        conferenciaAtiva &&
                        selecaoConferencia?.idArquivo === arq.id &&
                        selecaoConferencia?.idDocumento === doc.id
                      const alvoTutorialPasso2 = passo === 2 && indiceArq === 0 && indiceDoc === 0
                      return (
                      <li
                        key={doc.id}
                        className={ativoConferencia ? 'sds-nl-card-documentos-item--ativo' : undefined}
                        {...(alvoTutorialPasso2 ? { 'data-sds-tutorial-alvo': 'nl-documento-extraido' } : {})}
                      >
                        <button
                          type="button"
                          className="sds-nl-card-doc-selecao"
                          title={`Conferir ${doc.rotulo}`}
                          aria-label={`Conferir ${doc.rotulo}`}
                          aria-current={ativoConferencia ? 'true' : undefined}
                          onClick={() => selecionarDocumentoConferencia(arq.id, doc.id)}
                        >
                          <span className="sds-nl-card-doc-rotulo">
                            <FileText size={14} weight="duotone" />
                            {doc.rotulo}
                            <span className="sds-nl-card-doc-itens">{doc.quantidadeItens} itens</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="sds-nl-card-btn-icone"
                          {...(alvoTutorialPasso2 ? { 'data-sds-tutorial-alvo': 'nl-visualizar-documento' } : {})}
                          title={`Visualizar ${doc.rotulo}`}
                          aria-label={`Visualizar ${doc.rotulo}`}
                          onClick={() => visualizarDocumento(arq, doc)}
                        >
                          <Eye size={14} />
                        </button>
                      </li>
                      )
                    })}
                  </ul>
                )}
              </article>
            )
          })}
        </div>

        <div className="sds-nl-lateral-rodape">
          {passo === 1 && (
            <div className="sds-nl-lateral-botoes">
              <button type="button" className="sds-nl-btn sds-nl-btn--sec" onClick={onFechar}>
                Cancelar
              </button>
              <button
                type="button"
                className="sds-nl-btn sds-nl-btn--prim"
                disabled={arquivos.length === 0 || enviando}
                onClick={enviar}
                data-sds-tutorial-alvo="nl-enviar-lateral"
              >
                {enviando ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          )}
          {passo === 2 && (
            <div className="sds-nl-lateral-botoes">
              <button type="button" className="sds-nl-btn sds-nl-btn--sec" onClick={() => setPasso(1)}>
                Voltar
              </button>
              <button
                type="button"
                className="sds-nl-btn sds-nl-btn--prim"
                disabled={!analiseCompleta}
                onClick={() => setPasso(3)}
                data-sds-tutorial-alvo="nl-continuar-lateral"
              >
                Continuar
              </button>
            </div>
          )}
          {passo === 3 && (
            <div className="sds-nl-lateral-botoes">
              <button type="button" className="sds-nl-btn sds-nl-btn--sec" onClick={() => setPasso(2)}>
                Voltar
              </button>
              <button
                type="button"
                className="sds-nl-btn sds-nl-btn--prim"
                onClick={() => setPasso(4)}
                data-sds-tutorial-alvo="nl-continuar-lateral"
              >
                Continuar
              </button>
            </div>
          )}
          {passo === 4 && (
            <div className="sds-nl-lateral-botoes">
              <button type="button" className="sds-nl-btn sds-nl-btn--sec" onClick={() => setPasso(3)}>
                Voltar
              </button>
              <button
                type="button"
                className="sds-nl-btn sds-nl-btn--prim"
                onClick={() => {
                  onFechar()
                  onIrParaLista?.()
                }}
              >
                Ver na Lista
              </button>
            </div>
          )}
        </div>
      </aside>
    )
  }

  function renderPassoAnexar() {
    return (
      <div className="sds-nl-dropzone">
        <div className="sds-nl-dropzone-inner">
          <div className="sds-nl-dropzone-meio">
            <div className="sds-nl-dropzone-boas-vindas">
              <div className="sds-nl-dropzone-titulo-linha">
                <FileMagnifyingGlass size={20} weight="duotone" className="sds-nl-dropzone-titulo-icone" />
                <h2>Bem-vindo ao Smart Docs</h2>
              </div>
              <p className="sds-nl-dropzone-subtitulo">
                Demonstração interativa — clique abaixo para simular o envio de um PDF.
              </p>
            </div>
            <div
              className={`sds-nl-dropzone-box${alvoTutorialDestacado === 'nl-dropzone' ? ' sds-nl-dropzone-box--guia-ativo' : ''}`}
              data-sds-tutorial-alvo="nl-dropzone"
              role="button"
              tabIndex={0}
              aria-label="Clique aqui para simular o anexo de PDF de demonstração"
              onClick={anexarArquivo}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') anexarArquivo()
              }}
            >
              {alvoTutorialDestacado === 'nl-dropzone' && (
                <span className="sds-nl-dropzone-guia-badge" aria-hidden>
                  Clique aqui
                </span>
              )}
              <span className="sds-nl-dropzone-demo-chip">Demo · sem upload real</span>
              <CloudArrowUp size={36} weight="duotone" />
              <strong>Clique aqui para simular o anexo</strong>
              <span>Um PDF de demonstração será carregado automaticamente. Não é necessário selecionar arquivo.</span>
            </div>
            <section className="sds-nl-formatos" aria-label="Formatos aceitos">
              <p className="sds-nl-formatos-titulo">Formatos aceitos pela plataforma</p>
              <div className="sds-nl-formatos-linha">
                {FORMATOS.map(({ ext, Icon }) => (
                  <div key={ext} className="sds-nl-formatos-item" title={`.${ext}`}>
                    <Icon size={18} weight="duotone" />
                    <span>.{ext}</span>
                  </div>
                ))}
              </div>
            </section>
            <div className="sds-nl-limite">
              <HardDrives size={12} weight="regular" />
              <span>
                Até <strong>50 MB</strong> por arquivo
              </span>
            </div>
          </div>
          <div className="sds-nl-dropzone-aviso" role="note" data-sds-tutorial-alvo="nl-aviso-multidoc">
            <Info size={16} weight="duotone" />
            <p>
              Caso o arquivo tenha mais de um documento, estes serão separados automaticamente e contabilizados de
              forma unitária
            </p>
          </div>
        </div>
      </div>
    )
  }

  function renderPassoAnalise() {
    return (
      <div className="sds-nl-principal-analise">
        <div className="sds-nl-analise-layout">
          <div className="sds-nl-metricas">
            <article className="sds-nl-metrica-card sds-nl-metrica-card--superficie">
              <header>
                <Clock size={18} weight="duotone" />
                <span>Tempo de leitura</span>
              </header>
              <div className="sds-nl-metrica-valores">
                <div className="sds-nl-timer">{formatarTempoAnalise(elapsedSegundos)}</div>
                <small>HH : MM : SS</small>
              </div>
            </article>

            <article className="sds-nl-metrica-card sds-nl-metrica-card--superficie">
              <header>
                <Timer size={18} weight="duotone" />
                <span>Recursos reduzidos com a leitura</span>
              </header>
              <div className="sds-nl-metrica-valores">
                <div className="sds-nl-recursos">
                  <strong>{analiseCompleta ? '12 min' : '…'}</strong>
                </div>
                <small>Base manual do documento − tempo de leitura</small>
              </div>
            </article>

            <article className="sds-nl-metrica-card sds-nl-metrica-card--superficie sds-nl-metrica-card--acumulados">
              <header>
                <ChartLineUp size={18} weight="duotone" />
                <span>Tempo reduzido acumulado</span>
              </header>
              <div className="sds-nl-acumulados-infografico" aria-label="Histórico do workspace">
                <div className="sds-nl-acumulados-col">
                  <span className="sds-nl-acumulados-icone" aria-hidden>
                    <FileText size={16} weight="duotone" />
                  </span>
                  <span className="sds-nl-acumulados-valor">4.012</span>
                  <span className="sds-nl-acumulados-rotulo">Documentos</span>
                </div>
                <div className="sds-nl-acumulados-conector" aria-hidden>
                  <span className="sds-nl-acumulados-barra">
                    <span className="sds-nl-acumulados-barra-fill" style={{ width: '100%' }} />
                  </span>
                </div>
                <div className="sds-nl-acumulados-col">
                  <span className="sds-nl-acumulados-icone sds-nl-acumulados-icone--verde" aria-hidden>
                    <Timer size={16} weight="duotone" />
                  </span>
                  <span className="sds-nl-acumulados-valor">640h</span>
                  <span className="sds-nl-acumulados-rotulo">Saving</span>
                </div>
                <p className="sds-nl-acumulados-rodape">Histórico do workspace</p>
              </div>
            </article>
          </div>

          <section className="sds-nl-analise-painel" aria-label="Progresso das análises" data-sds-tutorial-alvo="nl-analise-progresso">
            <div className="sds-nl-analise-corpo">
              <div className="sds-nl-analise-lista">
                {etapas.map((etapa) => (
                  <div
                    key={etapa.id}
                    className={`sds-nl-etapa-pipeline sds-nl-etapa-pipeline--${etapa.status}`}
                  >
                    <span className="sds-nl-etapa-numero">{etapa.id}</span>
                    <span className="sds-nl-etapa-rotulo">{etapa.rotulo}</span>
                    <div className="sds-nl-etapa-barra">
                      <div
                        className={`sds-nl-etapa-barra-fill sds-nl-etapa-barra-fill--${classeBarraFillEtapa(etapa.status)}`}
                        style={{ width: `${etapa.progresso}%` }}
                      />
                    </div>
                    <span className="sds-nl-etapa-percentual">{etapa.progresso}%</span>
                    <span className={`sds-nl-etapa-pill sds-nl-etapa-pill--${etapa.status}`}>
                      {rotuloStatusEtapa(etapa.status)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={`sds-nl-cerebro-wrap${!analiseCompleta ? ' sds-nl-cerebro-wrap--ativo' : ''}`}
                data-sds-tutorial-alvo="nl-analise-cerebro"
              >
                <svg className="sds-nl-cerebro-anel" viewBox="0 0 200 200" aria-hidden>
                  <circle cx="100" cy="100" r="88" className="sds-nl-cerebro-anel-trilha" />
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    className="sds-nl-cerebro-anel-progresso"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 88}`,
                      strokeDashoffset: `${2 * Math.PI * 88 * (1 - progressoGeral / 100)}`,
                    }}
                  />
                </svg>
                <div className="sds-nl-cerebro-icone">
                  <Brain size={72} weight="duotone" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  function renderPassoConferencia() {
    return (
      <ConferenciaSimuladorSmartDoc
        arquivos={arquivos}
        selecao={selecaoConferencia}
        onAbaChange={setAbaConferencia}
        onCompararArquivo={() => {
          const arq = arquivos.find((a) => a.id === selecaoConferencia?.idArquivo)
          if (arq) visualizarArquivo(arq)
        }}
      />
    )
  }

  function renderPassoResultado() {
    return (
      <ResultadoSimuladorSmartDoc
        arquivos={arquivos}
        tempoSegundos={elapsedSegundos + 120}
        rotuloLeitura={nomeLeitura}
      />
    )
  }

  return (
    <div className="sds-nl-overlay" ref={refRaizTutorial} onClick={onFechar}>
      <div className="sds-nl-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label="Nova Leitura">
        <header className="sds-nl-cabecalho">
          <div className="sds-nl-cabecalho-marca">
            <Sparkle size={20} weight="fill" style={{ color: '#818cf8' }} />
            <div>
              <strong>Smart Docs</strong>
              <span className="sds-nl-cabecalho-sub">{nomeLeitura}</span>
            </div>
          </div>
          <button type="button" className="sds-nl-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        {renderStepper()}

        <div className="sds-nl-corpo">
          {renderLateral()}
          <main className="sds-nl-principal">
            {passo === 1 && renderPassoAnexar()}
            {passo === 2 && renderPassoAnalise()}
            {passo === 3 && renderPassoConferencia()}
            {passo === 4 && renderPassoResultado()}
          </main>
        </div>
      </div>

      {(() => {
        const idTelaTutorial = preview
          ? 'preview-documento'
          : passo === 3
            ? resolverIdTelaConferenciaSimulador(abaConferencia)
            : resolverIdTelaNovaLeituraSimulador({ passo, previewAberto: false })
        if (!idTelaTutorial) return null
        return (
          <TutorialOpcionalSimuladorSmartDoc
            idTela={idTelaTutorial}
            usarAvancarAposAnexo={passo === 1 && arquivos.length > 0}
            onAlvoDestacadoChange={setAlvoTutorialDestacado}
          />
        )
      })()}

      {preview && (
        <div
          className="sds-nl-prev-overlay"
          role="dialog"
          aria-modal
          aria-label={`Visualizar ${preview.tituloArquivo}`}
          onClick={() => setPreview(null)}
        >
          <div className="sds-nl-prev-painel" onClick={(e) => e.stopPropagation()}>
            <header className="sds-nl-prev-cabecalho" data-sds-tutorial-alvo="nl-preview-cabecalho">
              <div className="sds-nl-prev-cabecalho-titulo">
                <Eye size={20} weight="duotone" className="sds-nl-prev-cabecalho-icone" />
                <strong title={preview.tituloArquivo}>{preview.tituloArquivo}</strong>
              </div>
              <div className="sds-nl-prev-cabecalho-acoes">
                <button
                  type="button"
                  className="sds-nl-prev-cabecalho-fechar"
                  onClick={() => setPreview(null)}
                  aria-label="Fechar"
                  data-sds-tutorial-alvo="nl-preview-fechar"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </header>
            <div className="sds-nl-prev-corpo" data-sds-tutorial-alvo="nl-preview-area">
              <PreviewDocumentoSimuladorSmartDoc
                documento={preview.documento}
                nomeArquivo={preview.tituloArquivo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
