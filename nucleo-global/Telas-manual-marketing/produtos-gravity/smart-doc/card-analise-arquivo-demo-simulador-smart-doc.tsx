import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CaretDown,
  CaretUp,
  CheckCircle,
  Eye,
  FilePdf,
  FileText,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import './nova-leitura-simulador-smart-doc.css'
import './card-analise-arquivo-demo-simulador-smart-doc.css'
import {
  DOCUMENTOS_INVOICES_PACKINGS_DEMO,
  NOME_ARQUIVO_DEMO_CARD_ANALISE,
  PASSOS_NARRATIVOS_CARD_ANALISE_DEMO,
  type AlvoDemoCardAnaliseArquivo,
  type FaseNarrativaCardAnaliseDemo,
} from './dados-card-analise-arquivo-demo-smart-doc'
import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import { PreviewDocumentoSimuladorSmartDoc } from './preview-documento-simulador-smart-doc'
import { IndicadorCursorCliqueDemoSmartDoc } from './indicador-cursor-clique-demo-smart-doc'
import {
  CURSOR_CLIQUE_DEMO_INICIAL,
  iniciarMotorAnimacaoCardAnaliseArquivo,
  type EstadoCursorCliqueDemo,
} from './motor-animacao-card-analise-arquivo-demo-smart-doc'

function renderTextoPassoNarrativo(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, indice) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={indice}>{parte.slice(2, -2)}</strong>
    }
    return parte
  })
}

type Props = {
  modoDemonstracao?: boolean
}

export function CardAnaliseArquivoDemoSimuladorSmartDoc({ modoDemonstracao = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [expandido, setExpandido] = useState(false)
  const [preview, setPreview] = useState<DocumentoSimulador | null>(null)
  const [faseNarrativa, setFaseNarrativa] = useState<FaseNarrativaCardAnaliseDemo>(1)
  const [cursor, setCursor] = useState<EstadoCursorCliqueDemo>(CURSOR_CLIQUE_DEMO_INICIAL)
  const [alvoDestacado, setAlvoDestacado] = useState<AlvoDemoCardAnaliseArquivo | null>(null)

  const reiniciar = useCallback(() => {
    setExpandido(false)
    setPreview(null)
    setFaseNarrativa(1)
  }, [])

  const expandirCard = useCallback(() => {
    setExpandido(true)
  }, [])

  const visualizarDocumento = useCallback((indice: number) => {
    setPreview(DOCUMENTOS_INVOICES_PACKINGS_DEMO[indice] ?? null)
  }, [])

  const fecharPreview = useCallback(() => {
    setPreview(null)
  }, [])

  useEffect(() => {
    if (!modoDemonstracao) return undefined

    return iniciarMotorAnimacaoCardAnaliseArquivo({
      ativo: true,
      containerRef,
      aoAtualizarCursor: setCursor,
      aoDestacarAlvo: setAlvoDestacado,
      aoAtualizarFaseNarrativa: setFaseNarrativa,
      aoExpandirCard: expandirCard,
      aoVisualizarDocumento: visualizarDocumento,
      aoFecharPreview: fecharPreview,
      aoReiniciar: reiniciar,
    })
  }, [expandirCard, fecharPreview, modoDemonstracao, reiniciar, visualizarDocumento])

  function classeAlvo(alvo: AlvoDemoCardAnaliseArquivo): string {
    return alvoDestacado === alvo ? ' sds-card-analise-demo__alvo--pulso' : ''
  }

  function classeFasePasso(fase: FaseNarrativaCardAnaliseDemo): string {
    if (faseNarrativa === fase) return ' sds-card-analise-demo__passo--ativo'
    if (faseNarrativa > fase) return ' sds-card-analise-demo__passo--feito'
    return ''
  }

  return (
    <div
      ref={containerRef}
      className={[
        'sds-card-analise-demo',
        modoDemonstracao ? 'sds-card-analise-demo--somente-visualizacao' : '',
      ].filter(Boolean).join(' ')}
      role={modoDemonstracao ? 'img' : undefined}
      aria-label={
        modoDemonstracao
          ? 'Demonstração — Smart Doc identifica, separa e permite visualizar documentos do arquivo'
          : undefined
      }
    >
      <ol className="sds-card-analise-demo__passos" aria-label="Etapas da demonstração">
        {PASSOS_NARRATIVOS_CARD_ANALISE_DEMO.map((passo) => (
          <li
            key={passo.fase}
            className={`sds-card-analise-demo__passo${classeFasePasso(passo.fase)}`}
          >
            <span className="sds-card-analise-demo__passo-num">
              {String(passo.fase).padStart(2, '0')}
            </span>
            <div className="sds-card-analise-demo__passo-textos">
              <span className="sds-card-analise-demo__passo-rotulo">{passo.rotulo}</span>
              <p>{renderTextoPassoNarrativo(passo.texto)}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="sds-card-analise-demo__shell sds-card-analise-demo__shell--focado">
        <header className="sds-card-analise-demo__cena-titulo">
          <Sparkle size={16} weight="fill" style={{ color: '#818cf8' }} aria-hidden />
          <span>Sidebar · arquivo analisado</span>
        </header>

        <div
          className={[
            'sds-card-analise-demo__cena',
            faseNarrativa >= 2 && expandido ? 'sds-card-analise-demo__cena--separado' : '',
            faseNarrativa >= 3 ? 'sds-card-analise-demo__cena--visualizar' : '',
          ].filter(Boolean).join(' ')}
        >
          <div className="sds-card-analise-demo__painel-lateral">
            <div className="sds-nl-lateral-secao">
              <span className="sds-nl-lateral-secao-titulo">Arquivos enviados</span>
              <span className="sds-nl-lateral-badge">1</span>
            </div>

            <div className="sds-nl-lateral-lista">
              <article
                className={`sds-nl-card-arquivo${expandido ? ' sds-nl-card-arquivo--expandido' : ''}${faseNarrativa === 1 ? ' sds-card-analise-demo__card--identificado' : ''}`}
              >
                <div className="sds-nl-card-arquivo-cabecalho">
                  <span className="sds-nl-card-arquivo-icone-wrap">
                    <FilePdf size={18} weight="duotone" />
                  </span>
                  <div className="sds-nl-card-arquivo-info">
                    <span className="sds-nl-card-arquivo-nome" title={NOME_ARQUIVO_DEMO_CARD_ANALISE}>
                      {NOME_ARQUIVO_DEMO_CARD_ANALISE}
                    </span>
                    <div className="sds-nl-card-arquivo-acoes">
                      <button
                        type="button"
                        className="sds-nl-card-btn-icone"
                        title="Documentos identificados no arquivo"
                        aria-label={`${DOCUMENTOS_INVOICES_PACKINGS_DEMO.length} documentos identificados`}
                      >
                        <Eye size={16} />
                        <span className="sds-nl-card-contagem">
                          {DOCUMENTOS_INVOICES_PACKINGS_DEMO.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        className={`sds-nl-card-btn-icone${classeAlvo('expandir')}`}
                        data-sds-demo-alvo="expandir"
                        title={expandido ? 'Recolher documentos identificados' : 'Expandir documentos identificados'}
                        aria-expanded={expandido}
                        onClick={() => setExpandido((atual) => !atual)}
                      >
                        {expandido ? <CaretUp size={16} /> : <CaretDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sds-nl-card-arquivo-status">
                  <CheckCircle size={14} weight="fill" className="sds-nl-card-ok" />
                  <span>Análise completa · {DOCUMENTOS_INVOICES_PACKINGS_DEMO.length} documentos</span>
                </div>

                {!expandido ? (
                  <div className="sds-nl-card-chips" aria-label="Tipos identificados no arquivo">
                    {DOCUMENTOS_INVOICES_PACKINGS_DEMO.map((doc) => (
                      <span key={doc.id} className="sds-nl-card-tag-tipo">
                        {doc.rotulo}
                      </span>
                    ))}
                  </div>
                ) : (
                  <ul
                    className={`sds-nl-card-documentos${faseNarrativa >= 2 ? ' sds-card-analise-demo__lista--separada' : ''}`}
                    aria-label="Documentos separados"
                  >
                    {DOCUMENTOS_INVOICES_PACKINGS_DEMO.map((doc, indiceDoc) => (
                      <li key={doc.id}>
                        <button type="button" className="sds-nl-card-doc-selecao" title={`Conferir ${doc.rotulo}`}>
                          <span className="sds-nl-card-doc-rotulo">
                            <FileText size={14} weight="duotone" />
                            {doc.rotulo}
                            <span className="sds-nl-card-doc-itens">{doc.quantidadeItens} itens</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`sds-nl-card-btn-icone${classeAlvo(`visualizar-doc-${indiceDoc}`)}`}
                          data-sds-demo-alvo={`visualizar-doc-${indiceDoc}`}
                          title={`Visualizar ${doc.rotulo}`}
                          aria-label={`Visualizar ${doc.rotulo}`}
                          onClick={() => setPreview(doc)}
                        >
                          <Eye size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </div>
        </div>

        {preview ? (
          <div className="sds-card-analise-demo__prev" role="dialog" aria-label={`Visualizar ${preview.rotulo}`}>
            <div className="sds-nl-prev-painel">
              <header className="sds-nl-prev-cabecalho">
                <div className="sds-nl-prev-cabecalho-titulo">
                  <Eye size={20} weight="duotone" className="sds-nl-prev-cabecalho-icone" />
                  <strong title={preview.rotulo}>{preview.rotulo}</strong>
                </div>
                <button
                  type="button"
                  className={`sds-nl-prev-cabecalho-fechar${classeAlvo('fechar-preview')}`}
                  data-sds-demo-alvo="fechar-preview"
                  onClick={() => setPreview(null)}
                  aria-label="Fechar"
                >
                  <X size={18} weight="bold" />
                </button>
              </header>
              <div className="sds-nl-prev-corpo">
                <PreviewDocumentoSimuladorSmartDoc documento={preview} nomeArquivo={NOME_ARQUIVO_DEMO_CARD_ANALISE} />
              </div>
            </div>
          </div>
        ) : null}

        {modoDemonstracao ? (
          <div className="sds-card-analise-demo__camada-cursor" aria-hidden>
            <IndicadorCursorCliqueDemoSmartDoc estado={cursor} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
