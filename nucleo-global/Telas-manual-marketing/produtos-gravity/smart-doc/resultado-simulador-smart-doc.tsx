import { useMemo, useState } from 'react'
import {
  CheckCircle,
  Clock,
  DownloadSimple,
  FileText,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react'
import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import {
  calcularEstatisticasConferenciaSimulador,
  obterSecoesConferenciaSimulador,
} from './dados-conferencia-simulador-smart-doc'
import './resultado-simulador-smart-doc.css'

type Props = {
  arquivos: ArquivoDemoSimulador[]
  tempoSegundos: number
}

export function ResultadoSimuladorSmartDoc({ arquivos, tempoSegundos }: Props) {
  const arquivosCompletos = arquivos.filter((a) => a.status === 'completo')
  const [selecionados, setSelecionados] = useState<Set<string>>(() => new Set())

  const metricas = useMemo(() => {
    let total = 0
    let preenchidos = 0
    let documentos = 0
    for (const arq of arquivosCompletos) {
      documentos += arq.documentosIdentificados.length
      for (const doc of arq.documentosIdentificados) {
        const secoes = obterSecoesConferenciaSimulador(doc)
        const stats = calcularEstatisticasConferenciaSimulador(secoes)
        total += stats.total
        preenchidos += stats.preenchidos
      }
    }
    const pctValidados = preenchidos && total ? Math.round((preenchidos / total) * 100) : 0
    const pctAlterados = preenchidos ? Math.max(0, 100 - pctValidados) : 0
    return { total, preenchidos, documentos, pctValidados, pctAlterados }
  }, [arquivosCompletos])

  function formatarTempo(totalSegundos: number): string {
    const horas = Math.floor(totalSegundos / 3600)
    const minutos = Math.floor((totalSegundos % 3600) / 60)
    const segundos = totalSegundos % 60
    return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(' : ')
  }

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
        : new Set(arquivosCompletos.map((a) => a.id)),
    )
  }

  const todosMarcados =
    arquivosCompletos.length > 0 && selecionados.size === arquivosCompletos.length

  return (
    <div className="sds-nl-principal-resultado">
      <div className="sds-nl-resultado-layout">
        <div className="sds-nl-metricas sds-nl-metricas--resultado">
          <article className="sds-nl-metrica-card sds-nl-metrica-card--superficie">
            <header>
              <CheckCircle size={18} weight="duotone" />
              <span>Performance de acertos</span>
            </header>
            <div className="sds-nl-metrica-valores">
              <div className="sds-nl-res-perf">
                <div className="sds-nl-res-perf-linha sds-nl-res-perf-linha--ok">
                  <strong>{metricas.pctValidados}%</strong>
                  <span>Dados validados</span>
                  <TrendUp size={14} weight="bold" />
                </div>
                <div className="sds-nl-res-perf-linha sds-nl-res-perf-linha--alt">
                  <strong>{metricas.pctAlterados}%</strong>
                  <span>Dados alterados</span>
                  <TrendDown size={14} weight="bold" />
                </div>
              </div>
            </div>
          </article>

          <article className="sds-nl-metrica-card sds-nl-metrica-card--superficie">
            <header>
              <Clock size={18} weight="duotone" />
              <span>Tempo total da leitura</span>
            </header>
            <div className="sds-nl-metrica-valores">
              <div className="sds-nl-timer">{formatarTempo(tempoSegundos)}</div>
              <small>
                HH : MM : SS · {metricas.documentos} documento(s) · {metricas.preenchidos}/{metricas.total}{' '}
                campos
              </small>
            </div>
          </article>
        </div>

        <section className="sds-nl-resultado-painel" aria-label="Downloads das leituras">
          <header className="sds-nl-resultado-cabecalho">
            <FileText size={22} weight="duotone" />
            <div>
              <h2>Resultado das leituras</h2>
              <p>Baixe o pacote ZIP gerado pelo legado DATI (demonstração na landing).</p>
            </div>
          </header>

          <div className="sds-nl-res-lista-corpo">
            <div className="sds-nl-res-lista">
              {arquivosCompletos.map((arq) => {
                const selecionado = selecionados.has(arq.id)
                return (
                  <article
                    key={arq.id}
                    className={`sds-nl-res-item${selecionado ? ' sds-nl-res-item--sel' : ''}`}
                  >
                    <label className="sds-nl-res-item-check">
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarSelecao(arq.id)}
                      />
                      <span className="sds-nl-res-item-nome">
                        <FileText size={16} weight="duotone" />
                        {arq.nome}
                      </span>
                    </label>
                    <div className="sds-nl-res-item-docs">
                      {arq.documentosIdentificados.map((doc) => (
                        <span key={doc.id} className="sds-nl-res-doc-chip">
                          {doc.rotulo}
                        </span>
                      ))}
                    </div>
                    <button type="button" className="sds-nl-btn sds-nl-btn--prim sds-nl-btn--sm" disabled>
                      <DownloadSimple size={14} />
                      Baixar pacote DATI
                    </button>
                  </article>
                )
              })}

              {arquivosCompletos.length === 0 && (
                <p className="sds-nl-conf-vazio">Nenhuma leitura concluída para baixar.</p>
              )}
            </div>

            {arquivosCompletos.length > 0 && (
              <div className="sds-nl-res-barra">
                <label className="sds-nl-res-todos">
                  <input type="checkbox" checked={todosMarcados} onChange={alternarTodos} />
                  Selecionar todos
                </label>
                <div className="sds-nl-res-barra-acoes">
                  <span className="sds-nl-res-barra-info">
                    {selecionados.size > 0 ? `${selecionados.size} selecionado(s)` : 'Nenhum selecionado'}
                  </span>
                  <button type="button" className="sds-nl-btn sds-nl-btn--sec sds-nl-btn--sm" disabled>
                    Baixar selecionados
                  </button>
                  <button type="button" className="sds-nl-btn sds-nl-btn--prim sds-nl-btn--sm" disabled>
                    Baixar todos
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
