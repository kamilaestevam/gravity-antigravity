import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CaretDown,
  CaretRight,
  ClipboardText,
  Eye,
  MagnifyingGlass,
  ShieldWarning,
  Warning,
  X,
} from '@phosphor-icons/react'
import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  calcularPercentualChecklistVerde,
  calcularPercentualConformidade,
  filtrarRiscosPorBusca,
  montarLegendaSegmentosRisco,
  montarResumoRiscosSimulador,
  obterContagemChecklistSimulador,
  obterRiscosSimulador,
  rotuloSeveridadeRisco,
  type RiscoSimuladorSmartDoc,
} from './dados-riscos-simulador-smart-doc'
import '../../../../servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'
import './riscos-simulador-smart-doc.css'

type SelecaoConferencia = {
  idArquivo: string
  idDocumento: string
}

type Props = {
  arquivos: ArquivoDemoSimulador[]
  selecao: SelecaoConferencia | null
  onCompararArquivo?: () => void
  onIrConferenciaCampos?: () => void
}

function PainelDetalheRiscoSimulador({
  risco,
  onCompararArquivo,
  onIrConferenciaCampos,
}: {
  risco: RiscoSimuladorSmartDoc
  onCompararArquivo?: () => void
  onIrConferenciaCampos?: () => void
}) {
  const [colapsado, setColapsado] = useState(false)

  return (
    <div className="sr-risco-inline-painel">
      <div className="sr-risco-inline-cabecalho">
        <p className="sr-risco-modal-resumo-linha">{risco.motivo}</p>
        {(onCompararArquivo || onIrConferenciaCampos) && (
          <div className="sr-risco-modal-acoes">
            {onCompararArquivo && (
              <button
                type="button"
                className="sr-risco-modal-btn-icone"
                onClick={onCompararArquivo}
                aria-label="Ver no documento"
                title="Ver no documento"
              >
                <Eye size={18} weight="duotone" />
              </button>
            )}
            {risco.correcao_sugerida && onIrConferenciaCampos && (
              <button
                type="button"
                className="sr-risco-modal-btn-icone sr-risco-modal-btn-icone--primario"
                onClick={onIrConferenciaCampos}
                aria-label="Ir para Conferência de Campos"
                title="Ir para Conferência de Campos"
              >
                <ClipboardText size={18} weight="duotone" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="sr-risco-inline-secoes">
        <section
          className={`dt-secao sr-conf-risco-painel-secao${colapsado ? ' dt-secao--colapsada' : ''}`}
          aria-label="Risco, análise e correção"
        >
          <button
            type="button"
            className="dt-secao-header"
            onClick={() => setColapsado((p) => !p)}
            aria-expanded={!colapsado}
          >
            <div className="dt-secao-title">
              <CaretDown
                weight="bold"
                size={14}
                className={`dt-caret${colapsado ? ' dt-caret--colapsado' : ''}`}
                aria-hidden
              />
              <span className="dt-secao-icon">
                <ShieldWarning weight="duotone" size={18} />
              </span>
              <h2>Risco, análise e correção</h2>
            </div>
          </button>

          {!colapsado && (
            <div className="sr-conf-risco-painel-corpo">
              <div className="sr-conf-risco-painel-principal">
                <div className="sr-conf-risco-campo">
                  <span className="sr-conf-risco-campo-rotulo">Risco</span>
                  <p>{risco.motivo}</p>
                </div>
                <div className="sr-conf-risco-campo">
                  <span className="sr-conf-risco-campo-rotulo">Análise</span>
                  <p>{risco.analise}</p>
                </div>
                {risco.correcao_sugerida && (
                  <>
                    <div className="sr-conf-risco-painel-divisor" role="presentation" />
                    <div className="sr-conf-risco-campo sr-conf-risco-campo--correcao">
                      <span className="sr-conf-risco-campo-rotulo">Correção</span>
                      <p>{risco.correcao_sugerida}</p>
                    </div>
                  </>
                )}
              </div>

              {risco.evidencias.length > 0 && (
                <div className="sr-conf-risco-evidencias sr-conf-risco-evidencias--compacto">
                  <strong>Evidências</strong>
                  <ul>
                    {risco.evidencias.map((ev, idx) => (
                      <li key={`${risco.id}-ev-${idx}`}>
                        <span className="sr-conf-risco-ev-campo">{ev.campo ?? ev.documento}</span>
                        {ev.valor && <span className="sr-conf-risco-ev-valor">{ev.valor}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ItemListaRiscoSimulador({
  risco,
  numero,
  expandido,
  selecionado,
  onToggleExpandir,
  onToggleSelecao,
  children,
}: {
  risco: RiscoSimuladorSmartDoc
  numero: number
  expandido: boolean
  selecionado: boolean
  onToggleExpandir: () => void
  onToggleSelecao: () => void
  children?: ReactNode
}) {
  return (
    <section
      id={`sds-risco-${risco.id}`}
      className={`dt-secao sr-conf-risco-item-lista${expandido ? ' sr-conf-risco-item-lista--expandido' : ' dt-secao--colapsada'}${selecionado ? ' sr-conf-risco-item-lista--selecionado' : ''}`}
    >
      <div className="dt-secao-header sr-conf-risco-item-lista-cabecalho">
        <button
          type="button"
          className="sr-conf-risco-item-lista-botao"
          onClick={onToggleExpandir}
          aria-expanded={expandido}
          aria-label={`${expandido ? 'Recolher' : 'Expandir'} detalhe do risco: ${risco.titulo}`}
        >
          <div className="dt-secao-title">
            {expandido ? (
              <CaretDown weight="bold" size={14} className="dt-caret" aria-hidden />
            ) : (
              <CaretRight weight="bold" size={14} className="dt-caret" aria-hidden />
            )}
            <span className="dt-secao-icon sr-conf-risco-item-lista-icone" aria-hidden>
              <Warning weight="duotone" size={18} />
              <span className="sr-conf-risco-item-lista-numero">{String(numero).padStart(2, '0')}</span>
            </span>
            <h2>{risco.titulo}</h2>
          </div>
        </button>
        <div className="dt-secao-completude sr-conf-risco-item-lista-direita">
          <span
            className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade} sr-conf-risco-item-lista-badge`}
            aria-hidden
          >
            {rotuloSeveridadeRisco(risco.severidade)}
          </span>
          <label
            className="sr-conf-riscos-secao-selecionar sr-conf-risco-item-lista-selecao"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selecionado}
              onChange={onToggleSelecao}
              aria-label={`Selecionar risco: ${risco.titulo}`}
            />
          </label>
        </div>
      </div>

      {expandido && children ? (
        <div className="sr-conf-risco-item-lista-corpo">{children}</div>
      ) : null}
    </section>
  )
}

function ModalChecklistSimulador({
  aberto,
  onFechar,
  percentualVerde,
  contagem,
}: {
  aberto: boolean
  onFechar: () => void
  percentualVerde: number
  contagem: ReturnType<typeof obterContagemChecklistSimulador>
}) {
  if (!aberto) return null

  const itens = [
    { id: 'M1', regra: 'Dados gerais', item: 'Número da invoice preenchido', resultado: 'INV-2026-4482', status: 'verde' },
    { id: 'M2', regra: 'Importador', item: 'CNPJ válido e ativo', resultado: '47.829.103/0001-56', status: 'verde' },
    { id: 'M3', regra: 'Mercadoria', item: 'Peso líquido conferido', resultado: 'Divergência detectada', status: 'vermelho' },
    { id: 'M4', regra: 'Mercadoria', item: 'NCM por item', resultado: 'Item 12 pendente IA', status: 'amarelo' },
    { id: 'M5', regra: 'Valores', item: 'Moeda declarada', resultado: 'USD', status: 'verde' },
    { id: 'M6', regra: 'Embarque', item: 'Incoterm x porto', resultado: 'FOB Hamburg', status: 'amarelo' },
  ] as const

  return (
    <div className="sds-nl-riscos-modal-overlay" role="dialog" aria-modal aria-label="Checklist matriz" onClick={onFechar}>
      <div className="sds-nl-riscos-modal-painel" onClick={(e) => e.stopPropagation()}>
        <header className="sds-nl-riscos-modal-cabecalho">
          <div>
            <strong>Checklist matriz</strong>
            <span>{percentualVerde}% conforme · {contagem.verde} ok · {contagem.amarelo} atenção · {contagem.vermelho} falha</span>
          </div>
          <button type="button" className="sds-nl-riscos-modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </header>
        <div className="sds-nl-riscos-modal-corpo">
          <table className="sr-conf-chk-tabela">
            <thead>
              <tr>
                <th scope="col">Regra</th>
                <th scope="col">Item</th>
                <th scope="col">Resultado</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className={`sr-conf-chk-linha sr-conf-chk-linha--${item.status}`}>
                  <td><span className="sr-conf-chk-regra-id">{item.id}</span></td>
                  <td>
                    <span className="sr-conf-chk-item-nome">{item.item}</span>
                    <span className="sr-conf-chk-item-motor">{item.regra}</span>
                  </td>
                  <td><span className="sr-conf-chk-resultado">{item.resultado}</span></td>
                  <td>
                    <span className={`sr-conf-chk-veredito sr-conf-chk-veredito--${item.status === 'verde' ? 'verde' : item.status === 'amarelo' ? 'amarelo' : 'vermelho'}`}>
                      {item.status === 'verde' ? 'Conforme' : item.status === 'amarelo' ? 'Atenção' : 'Falha'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function RiscosSimuladorSmartDoc({
  arquivos,
  selecao,
  onCompararArquivo,
  onIrConferenciaCampos,
}: Props) {
  const [busca, setBusca] = useState('')
  const [riscosSelecionados, setRiscosSelecionados] = useState<Set<string>>(() => new Set())
  const [riscoExpandidoId, setRiscoExpandidoId] = useState<string | null>(null)
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const arquivosCompletos = arquivos.filter((a) => a.status === 'completo')

  const arquivoAtual = useMemo(() => {
    if (selecao) {
      return arquivosCompletos.find((a) => a.id === selecao.idArquivo) ?? arquivosCompletos[0]
    }
    return arquivosCompletos[0]
  }, [arquivosCompletos, selecao])

  const documentoAtual: DocumentoSimulador | null = useMemo(() => {
    if (!arquivoAtual) return null
    if (selecao?.idDocumento) {
      return (
        arquivoAtual.documentosIdentificados.find((d) => d.id === selecao.idDocumento) ??
        arquivoAtual.documentosIdentificados[0] ??
        null
      )
    }
    return arquivoAtual.documentosIdentificados[0] ?? null
  }, [arquivoAtual, selecao])

  const chaveDocumento = `${arquivoAtual?.id ?? ''}:${documentoAtual?.id ?? ''}`

  useEffect(() => {
    setRiscosSelecionados(new Set())
    setRiscoExpandidoId(null)
    setBusca('')
    setCarregando(true)
    const id = window.setTimeout(() => setCarregando(false), 1200)
    return () => window.clearTimeout(id)
  }, [chaveDocumento])

  const riscosBase = useMemo(
    () => (documentoAtual ? obterRiscosSimulador(documentoAtual.tipo) : []),
    [documentoAtual],
  )

  const resumo = useMemo(() => montarResumoRiscosSimulador(riscosBase), [riscosBase])
  const riscosVisiveis = useMemo(() => filtrarRiscosPorBusca(riscosBase, busca), [riscosBase, busca])
  const legendaSegmentos = montarLegendaSegmentosRisco(resumo)
  const percentualConformidade = calcularPercentualConformidade(resumo)

  const contagemChecklist = useMemo(
    () => (documentoAtual ? obterContagemChecklistSimulador(documentoAtual.tipo) : { verde: 0, amarelo: 0, vermelho: 0, pendente: 0 }),
    [documentoAtual],
  )
  const percentualChecklistVerde = calcularPercentualChecklistVerde(contagemChecklist)

  const tituloContexto = arquivoAtual
    ? `${arquivoAtual.nome}${documentoAtual ? ` | ${documentoAtual.rotulo}` : ''}`
    : ''

  const todosVisiveisSelecionados =
    riscosVisiveis.length > 0 && riscosVisiveis.every((r) => riscosSelecionados.has(r.id))

  function toggleSelecaoRisco(id: string) {
    setRiscosSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelecionarTodosVisiveis() {
    setRiscosSelecionados((prev) => {
      if (todosVisiveisSelecionados) {
        const next = new Set(prev)
        for (const r of riscosVisiveis) next.delete(r.id)
        return next
      }
      const next = new Set(prev)
      for (const r of riscosVisiveis) next.add(r.id)
      return next
    })
  }

  if (arquivosCompletos.length === 0) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Aguardando análise dos arquivos para calcular riscos.</p>
      </div>
    )
  }

  if (!documentoAtual) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Selecione um documento na sidebar para analisar riscos.</p>
      </div>
    )
  }

  return (
    <div className="sr-conf-riscos">
      {tituloContexto && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContexto}</span>
        </div>
      )}

      {carregando && (
        <p className="sr-conf-riscos-carregando" role="status">
          Analisando documentos…
        </p>
      )}

      <section className="sr-conf-riscos-cabecalho" aria-label="Resumo da análise de riscos">
        <div className="sr-conf-riscos-cabecalho-principal">
          <div className="sr-conf-riscos-cabecalho-resumo">
            <div className="sr-conf-riscos-cabecalho-titulo-linha">
              <strong className="sr-conf-riscos-cabecalho-titulo">Análise de riscos</strong>
              <span className="sr-conf-riscos-cabecalho-subtitulo">
                {percentualConformidade}% sem críticos abertos
              </span>
            </div>

            {resumo.total > 0 && (
              <>
                <div className="sr-conf-riscos-seg-bar" role="img" aria-label={`Distribuição: ${legendaSegmentos ?? ''}`}>
                  {resumo.criticos > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__critico"
                      style={{ width: `${(resumo.criticos / resumo.total) * 100}%` }}
                    />
                  )}
                  {resumo.atencao > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__atencao"
                      style={{ width: `${(resumo.atencao / resumo.total) * 100}%` }}
                    />
                  )}
                  {resumo.informativos > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__informativo"
                      style={{ width: `${(resumo.informativos / resumo.total) * 100}%` }}
                    />
                  )}
                </div>
                {legendaSegmentos && (
                  <p className="sr-conf-riscos-seg-legenda">
                    {resumo.total} {resumo.total === 1 ? 'risco' : 'riscos'} · {legendaSegmentos}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="sr-conf-progresso-busca">
            <div className="dt-header-busca">
              <MagnifyingGlass weight="duotone" size={14} className="dt-toc-busca-icon" />
              <input
                type="search"
                className="dt-toc-busca-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Localizar riscos"
                aria-label="Localizar riscos"
              />
              {busca && (
                <button type="button" className="dt-toc-busca-limpar" onClick={() => setBusca('')} aria-label="Limpar busca">
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sr-conf-riscos-cabecalho-rodape">
          <button
            type="button"
            className="sr-conf-riscos-checklist-link"
            onClick={() => setModalChecklistAberto(true)}
            aria-haspopup="dialog"
          >
            Checklist matriz · {percentualChecklistVerde}% conforme
          </button>
          <span className="sr-conf-riscos-checklist-resumo-compacto">
            {contagemChecklist.verde} ok · {contagemChecklist.amarelo} atenção · {contagemChecklist.vermelho} falha ·{' '}
            {contagemChecklist.pendente} pendente
          </span>
          {riscosVisiveis.length > 0 && (
            <label className="sr-conf-riscos-selecionar-compacto">
              <input
                type="checkbox"
                checked={todosVisiveisSelecionados}
                onChange={toggleSelecionarTodosVisiveis}
                aria-label="Selecionar todos os riscos visíveis"
              />
              <span>Selecionar ({riscosVisiveis.length})</span>
            </label>
          )}
          <span className="sr-conf-riscos-disclaimer-compacto">V1 + IA + NCM — apoio à conferência</span>
        </div>
      </section>

      <ModalChecklistSimulador
        aberto={modalChecklistAberto}
        onFechar={() => setModalChecklistAberto(false)}
        percentualVerde={percentualChecklistVerde}
        contagem={contagemChecklist}
      />

      <main className="dt-main sr-conf-riscos-main">
        {busca.trim() && (
          <div className="dt-main-toolbar sr-conf-secoes-toolbar">
            <div className="dt-chips sr-conf-chips">
              <span className="fc-chip" role="status" aria-live="polite">
                <span className="fc-chip-label">Busca:</span>
                <span className="fc-chip-valor">{busca.trim()}</span>
                <button
                  type="button"
                  className="fc-chip-remove"
                  onClick={() => setBusca('')}
                  title="Remover busca"
                  aria-label="Remover busca"
                >
                  <X size={10} weight="bold" />
                </button>
              </span>
            </div>
          </div>
        )}

        {!carregando && resumo.riscos.length === 0 ? (
          <p className="sr-conf-riscos-ok">Nenhum risco identificado na leitura atual.</p>
        ) : riscosVisiveis.length === 0 ? (
          <p className="sr-conf-vazio">Nenhum risco encontrado para a busca atual.</p>
        ) : (
          <div className="sr-conf-riscos-lista sr-conf-riscos-lista-plana">
            {riscosVisiveis.map((risco, idx) => {
              const expandido = riscoExpandidoId === risco.id
              return (
                <ItemListaRiscoSimulador
                  key={risco.id}
                  risco={risco}
                  numero={idx + 1}
                  selecionado={riscosSelecionados.has(risco.id)}
                  expandido={expandido}
                  onToggleExpandir={() => setRiscoExpandidoId((prev) => (prev === risco.id ? null : risco.id))}
                  onToggleSelecao={() => toggleSelecaoRisco(risco.id)}
                >
                  {expandido ? (
                    <PainelDetalheRiscoSimulador
                      risco={risco}
                      onCompararArquivo={onCompararArquivo}
                      onIrConferenciaCampos={onIrConferenciaCampos}
                    />
                  ) : null}
                </ItemListaRiscoSimulador>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
