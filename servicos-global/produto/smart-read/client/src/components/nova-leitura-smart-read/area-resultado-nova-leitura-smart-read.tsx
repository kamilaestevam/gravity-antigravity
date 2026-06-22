/**
 * AreaResultadoNovaLeituraSmartRead — passo 4: métricas + download multi-formato.
 * Cards: performance de acertos (validados/alterados), saving e tempo total bruto.
 * Downloads: por arquivo, selecionados ou todos, em JSON/Excel/PDF/CSV/TXT/XML.
 */

import { useMemo, useState } from 'react'
import {
  CaretDown,
  CheckCircle,
  Clock,
  DownloadSimple,
  FileText,
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
import {
  FORMATOS_DOWNLOAD_LEITURA,
  TODOS_FORMATOS_DOWNLOAD,
  baixarLeituras,
  type FormatoDownloadLeitura,
} from '../../shared/gerar-downloads-leitura-smart-read'

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

export function AreaResultadoNovaLeituraSmartRead({ arquivos, camposEditados, tempoTotalMs }: Props) {
  const arquivosCompletos = useMemo(
    () => arquivos.filter((item) => item.status_arquivo_local === 'completo' && item.leitura),
    [arquivos],
  )

  const [selecionados, setSelecionados] = useState<Set<string>>(() => new Set())
  const [menuAberto, setMenuAberto] = useState<string | null>(null)

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
    const horasSaving = Math.max(1, Math.round(segundos / 14) || 1)
    return { total, preenchidos, documentos, pctAlterados, pctValidados, segundos, horasSaving }
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

  function baixar(alvo: ArquivoLocalNovaLeitura[], formatos: FormatoDownloadLeitura[]) {
    baixarLeituras(alvo, formatos)
    setMenuAberto(null)
  }

  const arquivosSelecionados = arquivosCompletos.filter((a) => selecionados.has(a.id_arquivo_local))
  const todosMarcados =
    arquivosCompletos.length > 0 && selecionados.size === arquivosCompletos.length

  function renderMenu(
    id: string,
    alvo: ArquivoLocalNovaLeitura[],
    rotulo = 'Download',
    variante: 'primario' | 'secundario' = 'primario',
  ) {
    return (
      <div className="sr-res-menu-wrap">
        <BotaoGlobal
          variante={variante}
          tamanho="pequeno"
          icone={<DownloadSimple size={14} />}
          onClick={() => setMenuAberto((m) => (m === id ? null : id))}
          disabled={alvo.length === 0}
        >
          {rotulo}
          <CaretDown size={12} weight="bold" />
        </BotaoGlobal>
        {menuAberto === id && alvo.length > 0 && (
          <div className="sr-res-menu" role="menu">
            {FORMATOS_DOWNLOAD_LEITURA.map((f) => (
              <button
                key={f.id}
                type="button"
                role="menuitem"
                className="sr-res-menu-item"
                onClick={() => baixar(alvo, [f.id])}
              >
                {f.rotulo}
              </button>
            ))}
            <div className="sr-res-menu-sep" />
            <button
              type="button"
              role="menuitem"
              className="sr-res-menu-item sr-res-menu-item--destaque"
              onClick={() => baixar(alvo, TODOS_FORMATOS_DOWNLOAD)}
            >
              Pacote (ZIP) — todos os formatos
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sr-wizard-principal sr-wizard-principal--resultado">
      <header className="sr-wizard-resultado-cabecalho">
        <FileText size={28} weight="duotone" />
        <div>
          <h2>Resultado das leituras</h2>
          <p>Baixe suas leituras no formato desejado.</p>
        </div>
      </header>

      <div className="sr-res-metricas">
        <article className="sr-res-card">
          <header>
            <CheckCircle size={16} weight="duotone" />
            <span>Performance de acertos</span>
          </header>
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
        </article>

        <article className="sr-res-card">
          <header>
            <Timer size={16} weight="duotone" />
            <span>Recursos reduzidos com a leitura</span>
          </header>
          <div className="sr-res-saving">
            <strong>{metricas.horasSaving} Horas</strong>
            <span className="sr-res-saving-valor">BLR 362.777,20</span>
            <span className="sr-res-saving-badge">+12%</span>
          </div>
        </article>

        <article className="sr-res-card">
          <header>
            <Clock size={16} weight="duotone" />
            <span>Tempo total da leitura</span>
          </header>
          <div className="sr-res-timer">{formatarTempo(metricas.segundos)}</div>
          <small>
            HH : MM : SS · {metricas.documentos} documento(s) · {metricas.preenchidos}/{metricas.total} campos
          </small>
        </article>
      </div>

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
              {renderMenu(`file:${item.id_arquivo_local}`, [item])}
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
            {renderMenu('selecionados', arquivosSelecionados, 'Baixar selecionados', 'secundario')}
            {renderMenu('todos', arquivosCompletos, 'Baixar todos')}
          </div>
        </div>
      )}
    </div>
  )
}
