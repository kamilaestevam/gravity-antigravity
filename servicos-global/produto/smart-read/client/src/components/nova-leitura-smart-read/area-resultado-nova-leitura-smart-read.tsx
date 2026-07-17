/**
 * AreaResultadoNovaLeituraSmartRead — passo 4: métricas + download via legado DATI.
 * Pacote ZIP gerado pelo motor DATI (download-tasks), não no browser.
 */

import { useMemo, useState, type ReactElement, type ReactNode } from 'react'
import {
  CheckCircle,
  Clock,
  DownloadSimple,
  FileText,
  Spinner,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  extrairDadosArquivoLocal,
  extrairDocumentosArquivoLocal,
  resolverArquivoApiLeitura,
} from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  calcularEstatisticasConferencia,
  extrairSecoesConferenciaLeitura,
} from '../../shared/extrair-secoes-conferencia-leitura-smart-read'
import { compararCamposEdicaoLeituraSmartRead } from '../../shared/comparar-campos-edicao-leitura-smart-read'
import { executarDownloadExportacaoLeituraSmartRead } from '../../shared/executar-download-exportacao-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  tempoTotalMs: number
}

function formatarTempo(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(' : ')
}

function sanitizarNomeArquivo(nome: string): string {
  return nome.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'leitura'
}

function renderTooltipPerformance(
  titulo: string,
  linhas: Array<{ rotulo: string; valor: ReactNode; destaque?: string }>,
  children: ReactElement,
) {
  return (
    <TooltipGlobal
      titulo={titulo}
      interativo
      descricao={
        <>
          {linhas.map((linha) => (
            <div className="cg-tooltip__row" key={linha.rotulo}>
              <span>{linha.rotulo}</span>
              <strong style={linha.destaque ? { color: linha.destaque } : undefined}>{linha.valor}</strong>
            </div>
          ))}
        </>
      }
    >
      {children}
    </TooltipGlobal>
  )
}

function resolverIdLeitura(arquivos: ArquivoLocalNovaLeitura[]): string | null {
  return arquivos.find((item) => item.leitura?.id_leitura)?.leitura?.id_leitura ?? null
}

export function AreaResultadoNovaLeituraSmartRead({ arquivos, tempoTotalMs }: Props) {
  const arquivosCompletos = useMemo(
    () => arquivos.filter((item) => item.status_arquivo_local === 'completo' && item.leitura),
    [arquivos],
  )

  const [selecionados, setSelecionados] = useState<Set<string>>(() => new Set())
  const [baixando, setBaixando] = useState(false)
  const [erroDownload, setErroDownload] = useState<string | null>(null)

  const idLeitura = useMemo(() => resolverIdLeitura(arquivosCompletos), [arquivosCompletos])

  const metricas = useMemo(() => {
    let total = 0
    let preenchidos = 0
    let documentos = 0
    let validados = 0
    let ajustesForma = 0
    let corrigidos = 0
    let comparados = 0

    for (const item of arquivosCompletos) {
      const docs = extrairDocumentosArquivoLocal(item)
      documentos += docs.length
      const arquivoApi = resolverArquivoApiLeitura(item)
      for (const doc of docs) {
        const secoes = extrairSecoesConferenciaLeitura(extrairDadosArquivoLocal(item, doc.indice) ?? {})
        const e = calcularEstatisticasConferencia(secoes)
        total += e.total
        preenchidos += e.preenchidos

        const extracao = arquivoApi?.resultado_extracao?.[doc.indice]
        if (!extracao?.dados) continue
        const comparacao = compararCamposEdicaoLeituraSmartRead(
          extracao.dados_original,
          extracao.dados,
        )
        comparados += comparacao.total
        validados += comparacao.campos.filter((campo) => campo.classificacao === 'validado').length
        ajustesForma += comparacao.ajustes_forma
        corrigidos += comparacao.errados
      }
    }

    const base = comparados > 0 ? comparados : preenchidos
    const pctValidados = base ? Math.round((validados / base) * 100) : 0
    const pctAjustes = base ? Math.round((ajustesForma / base) * 100) : 0
    const pctCorrigidos = base ? Math.round((corrigidos / base) * 100) : 0
    const segundos = Math.floor(tempoTotalMs / 1000)
    return {
      total,
      preenchidos,
      documentos,
      comparados: base,
      validados,
      ajustesForma,
      corrigidos,
      pctValidados,
      pctAjustes,
      pctCorrigidos,
      segundos,
    }
  }, [arquivosCompletos, tempoTotalMs])

  function alternarSelecao(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function alternarTodos() {
    setSelecionados((prev) =>
      prev.size === arquivosCompletos.length
        ? new Set()
        : new Set(arquivosCompletos.map((a) => a.id_arquivo_local)),
    )
  }

  async function baixarPacoteDati(alvo: ArquivoLocalNovaLeitura[], nomeZip?: string) {
    if (!idLeitura) {
      setErroDownload('Leitura sem identificador legado para exportar')
      return
    }
    setErroDownload(null)
    setBaixando(true)
    try {
      await executarDownloadExportacaoLeituraSmartRead({
        idLeitura,
        arquivos: alvo,
        nomeArquivoZip: nomeZip,
      })
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Falha ao baixar pacote docs'
      setErroDownload(mensagem)
    } finally {
      setBaixando(false)
    }
  }

  const arquivosSelecionados = arquivosCompletos.filter((a) => selecionados.has(a.id_arquivo_local))
  const todosMarcados =
    arquivosCompletos.length > 0 && selecionados.size === arquivosCompletos.length

  function renderBotaoDownload(
    alvo: ArquivoLocalNovaLeitura[],
    rotulo: string,
    variante: 'primario' | 'secundario' = 'primario',
    nomeZip?: string,
  ) {
    return (
      <BotaoGlobal
        variante={variante}
        tamanho="pequeno"
        icone={baixando ? <Spinner size={14} className="sr-res-spinner" /> : <DownloadSimple size={14} />}
        onClick={() => void baixarPacoteDati(alvo, nomeZip)}
        disabled={alvo.length === 0 || baixando}
      >
        {rotulo}
      </BotaoGlobal>
    )
  }

  return (
    <div className="sr-wizard-principal sr-wizard-principal--resultado">
      <div className="sr-wizard-resultado-layout">
        <div className="sr-wizard-metricas sr-wizard-metricas--resultado">
          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie sr-wizard-metrica-card--performance-resultado">
            <header>
              <CheckCircle size={18} weight="duotone" />
              <span>Performance de acertos</span>
            </header>
            <div className="sr-wizard-metrica-valores">
              <div className="sr-res-perf-infografico" aria-label="Distribuição de campos preenchidos">
                <div className="sr-res-perf-barra">
                  <span
                    className="sr-res-perf-barra-validados"
                    style={{ width: `${metricas.pctValidados}%` }}
                    title={`${metricas.validados} validados`}
                  />
                  <span
                    className="sr-res-perf-barra-ajustes"
                    style={{ width: `${metricas.pctAjustes}%` }}
                    title={`${metricas.ajustesForma} ajustes de forma`}
                  />
                  <span
                    className="sr-res-perf-barra-corrigidos"
                    style={{ width: `${metricas.pctCorrigidos}%` }}
                    title={`${metricas.corrigidos} corrigidos`}
                  />
                </div>
                <div className="sr-res-perf-legenda">
                  <span className="sr-res-perf-legenda-item sr-res-perf-legenda-item--ok">
                    <i aria-hidden />
                    Validados
                  </span>
                  <span className="sr-res-perf-legenda-item sr-res-perf-legenda-item--ajuste">
                    <i aria-hidden />
                    Ajustes de forma
                  </span>
                  <span className="sr-res-perf-legenda-item sr-res-perf-legenda-item--alt">
                    <i aria-hidden />
                    Corrigidos
                  </span>
                </div>
              </div>
              <div className="sr-res-perf-grid sr-res-perf-grid--tres">
                {renderTooltipPerformance(
                  'Dados validados',
                  [
                    { rotulo: 'Campos conferidos', valor: metricas.validados, destaque: '#22c55e' },
                    { rotulo: 'Participação', valor: `${metricas.pctValidados}%`, destaque: '#22c55e' },
                    { rotulo: 'Base comparada', valor: `${metricas.comparados} campos` },
                  ],
                  <div className="sr-res-perf-bloco sr-res-perf-bloco--ok">
                    <span className="sr-res-perf-bloco-quantidade">{metricas.validados}</span>
                    <span className="sr-res-perf-bloco-rotulo">Dados validados</span>
                    <span className="sr-res-perf-bloco-detalhe">
                      {metricas.pctValidados}% · {metricas.validados} de {metricas.comparados}
                    </span>
                    <TrendUp size={16} weight="bold" className="sr-res-perf-bloco-icone" />
                  </div>,
                )}
                {renderTooltipPerformance(
                  'Ajustes de forma',
                  [
                    { rotulo: 'Campos ajustados', valor: metricas.ajustesForma, destaque: '#fbbf24' },
                    { rotulo: 'Participação', valor: `${metricas.pctAjustes}%`, destaque: '#fbbf24' },
                    { rotulo: 'Base comparada', valor: `${metricas.comparados} campos` },
                  ],
                  <div className="sr-res-perf-bloco sr-res-perf-bloco--ajuste">
                    <span className="sr-res-perf-bloco-quantidade">{metricas.ajustesForma}</span>
                    <span className="sr-res-perf-bloco-rotulo">Ajustes de forma</span>
                    <span className="sr-res-perf-bloco-detalhe">
                      {metricas.pctAjustes}% · {metricas.ajustesForma} de {metricas.comparados}
                    </span>
                  </div>,
                )}
                {renderTooltipPerformance(
                  'Corrigidos (IA)',
                  [
                    { rotulo: 'Correções reais', valor: metricas.corrigidos, destaque: '#f87171' },
                    { rotulo: 'Participação', valor: `${metricas.pctCorrigidos}%`, destaque: '#f87171' },
                    { rotulo: 'Base comparada', valor: `${metricas.comparados} campos` },
                  ],
                  <div className="sr-res-perf-bloco sr-res-perf-bloco--alt">
                    <span className="sr-res-perf-bloco-quantidade">{metricas.corrigidos}</span>
                    <span className="sr-res-perf-bloco-rotulo">Corrigidos (IA)</span>
                    <span className="sr-res-perf-bloco-detalhe">
                      {metricas.pctCorrigidos}% · {metricas.corrigidos} de {metricas.comparados}
                    </span>
                    <TrendDown size={16} weight="bold" className="sr-res-perf-bloco-icone" />
                  </div>,
                )}
              </div>
            </div>
          </article>

          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie">
            <header>
              <Clock size={18} weight="duotone" />
              <span>Tempo total da leitura</span>
            </header>
            <div className="sr-wizard-metrica-valores">
              <div className="sr-wizard-timer">{formatarTempo(metricas.segundos)}</div>
              <small>
                HH : MM : SS · {metricas.documentos} documento(s) · {metricas.preenchidos}/{metricas.total}{' '}
                campos
              </small>
            </div>
          </article>
        </div>

        <section className="sr-wizard-resultado-painel" aria-label="Downloads das leituras">
          <header className="sr-wizard-resultado-cabecalho">
            <FileText size={22} weight="duotone" />
            <div>
              <h2>Resultado das leituras</h2>
              <p>
                Baixe o pacote ZIP gerado pelo legado DATI (mesmo formato usado pelos clientes no Smart Docs
                original).
              </p>
            </div>
          </header>

          {erroDownload && (
            <p className="sr-res-erro" role="alert">
              {erroDownload}
            </p>
          )}

          <div className="sr-res-lista-corpo">
            <div className="sr-res-lista">
              {arquivosCompletos.map((item) => {
                const documentos = extrairDocumentosArquivoLocal(item)
                const selecionado = selecionados.has(item.id_arquivo_local)
                return (
                  <article
                    key={item.id_arquivo_local}
                    className={`sr-res-item${selecionado ? ' sr-res-item--sel' : ''}`}
                  >
                    <label className="sr-res-item-check">
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarSelecao(item.id_arquivo_local)}
                      />
                      <span className="sr-res-item-nome">
                        <FileText size={16} weight="duotone" />
                        {item.arquivo.name}
                      </span>
                    </label>
                    <div className="sr-res-item-docs">
                      {documentos.map((doc) => (
                        <span key={doc.id_documento} className="sr-res-doc-chip">
                          {doc.tipo_documento}
                        </span>
                      ))}
                    </div>
                    {renderBotaoDownload(
                      [item],
                      'Baixar pacote docs',
                      'primario',
                      `${sanitizarNomeArquivo(item.arquivo.name)}-dati.zip`,
                    )}
                  </article>
                )
              })}

              {arquivosCompletos.length === 0 && (
                <p className="sr-conf-vazio">Nenhuma leitura concluída para baixar.</p>
              )}
            </div>

            {arquivosCompletos.length > 0 && (
              <div className="sr-res-barra">
                <label className="sr-res-todos">
                  <input type="checkbox" checked={todosMarcados} onChange={alternarTodos} />
                  Selecionar todos
                </label>
                <div className="sr-res-barra-acoes">
                  <span className="sr-res-barra-info">
                    {selecionados.size > 0 ? `${selecionados.size} selecionado(s)` : 'Nenhum selecionado'}
                  </span>
                  {renderBotaoDownload(arquivosSelecionados, 'Baixar selecionados', 'secundario')}
                  {renderBotaoDownload(arquivosCompletos, 'Baixar todos')}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
