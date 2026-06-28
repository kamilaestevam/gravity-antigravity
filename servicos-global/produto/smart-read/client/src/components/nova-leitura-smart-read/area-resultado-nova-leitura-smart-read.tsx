/**
 * AreaResultadoNovaLeituraSmartRead — passo 4: métricas + download via legado DATI.
 * Pacote ZIP gerado pelo motor DATI (download-tasks), não no browser.
 */

import { useMemo, useState } from 'react'
import {
  CheckCircle,
  Clock,
  DownloadSimple,
  FileText,
  Spinner,
  Timer,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  extrairDadosArquivoLocal,
  extrairDocumentosArquivoLocal,
} from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  calcularEstatisticasConferencia,
  extrairSecoesConferenciaLeitura,
} from '../../shared/extrair-secoes-conferencia-leitura-smart-read'
import { calcularSavingNovaLeituraSmartRead } from '../../shared/calcular-saving-nova-leitura-smart-read'
import {
  formatarSavingHorasLeitura,
  formatarSavingValorLeitura,
} from '../../shared/formatacao-leitura-smart-read'
import { executarDownloadExportacaoLeituraSmartRead } from '../../shared/executar-download-exportacao-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  camposEditados: number
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

function resolverIdLeitura(arquivos: ArquivoLocalNovaLeitura[]): string | null {
  return arquivos.find((item) => item.leitura?.id_leitura)?.leitura?.id_leitura ?? null
}

export function AreaResultadoNovaLeituraSmartRead({ arquivos, camposEditados, tempoTotalMs }: Props) {
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
    for (const item of arquivosCompletos) {
      const docs = extrairDocumentosArquivoLocal(item)
      documentos += docs.length
      for (const doc of docs) {
        const secoes = extrairSecoesConferenciaLeitura(extrairDadosArquivoLocal(item, doc.indice) ?? {})
        const e = calcularEstatisticasConferencia(secoes)
        total += e.total
        preenchidos += e.preenchidos
      }
    }
    const alterados = Math.min(camposEditados, preenchidos)
    const pctAlterados = preenchidos ? Math.round((alterados / preenchidos) * 100) : 0
    const pctValidados = preenchidos ? 100 - pctAlterados : 0
    const segundos = Math.floor(tempoTotalMs / 1000)
    const saving = calcularSavingNovaLeituraSmartRead(arquivosCompletos, {
      tempoLeituraSegundos: segundos,
    })
    return { total, preenchidos, documentos, pctAlterados, pctValidados, segundos, saving }
  }, [arquivosCompletos, camposEditados, tempoTotalMs])

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
      const mensagem = erro instanceof Error ? erro.message : 'Falha ao baixar pacote DATI'
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
        <div className="sr-wizard-metricas">
          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie">
            <header>
              <CheckCircle size={18} weight="duotone" />
              <span>Performance de acertos</span>
            </header>
            <div className="sr-wizard-metrica-valores">
              <div className="sr-res-perf">
                <div className="sr-res-perf-linha sr-res-perf-linha--ok">
                  <strong>{metricas.pctValidados}%</strong>
                  <span>Dados validados</span>
                  <TrendUp size={14} weight="bold" />
                </div>
                <div className="sr-res-perf-linha sr-res-perf-linha--alt">
                  <strong>{metricas.pctAlterados}%</strong>
                  <span>Dados alterados</span>
                  <TrendDown size={14} weight="bold" />
                </div>
              </div>
            </div>
          </article>

          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie">
            <header>
              <Timer size={18} weight="duotone" />
              <span>Recursos reduzidos com a leitura</span>
            </header>
            <div className="sr-wizard-metrica-valores">
              <div className="sr-wizard-recursos">
                <strong>{formatarSavingHorasLeitura(metricas.saving.minutos)}</strong>
              </div>
              {metricas.saving.brl != null && (
                <span className="sr-res-saving-valor">{formatarSavingValorLeitura(metricas.saving.brl)}</span>
              )}
              <small>Base manual do documento − tempo de leitura</small>
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
                      'Baixar pacote DATI',
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
