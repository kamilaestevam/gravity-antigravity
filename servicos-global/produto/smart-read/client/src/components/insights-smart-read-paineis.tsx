import { useState } from 'react'
import {
  ChartDonut,
  Clock,
  Files,
  ListChecks,
  Timer,
  TrendUp,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { formatarPercentualLeitura } from '../shared/formatacao-leitura-smart-read'
import type {
  MetricasInsightsLeituraSmartRead,
  RankingEntidadeInsightsSmartRead,
} from '../pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read'
import {
  formatarMinutosInsightsSmartRead,
  formatarMoedaInsightsSmartRead,
} from '../pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read'

type Props = {
  metricas: MetricasInsightsLeituraSmartRead
  carregando?: boolean
}

type TipoFornecedorInsights = 'exportador' | 'importador'

function resolverRankingsFornecedor(
  metricas: MetricasInsightsLeituraSmartRead,
  tipo: TipoFornecedorInsights,
): { acertos: RankingEntidadeInsightsSmartRead[]; erros: RankingEntidadeInsightsSmartRead[] } {
  if (tipo === 'exportador') {
    return {
      acertos: metricas.rankingsExportadorAcerto,
      erros: metricas.rankingsExportador,
    }
  }
  return {
    acertos: metricas.rankingsImportadorAcerto,
    erros: metricas.rankingsImportador,
  }
}

export function KpiGridInsightsLeituraSmartRead({ metricas, carregando }: Props) {
  const placeholder = carregando ? '…' : '—'
  const savingTotalMin = metricas.savingDigitaçãoMinutos + metricas.savingErrosMinutos
  const savingTotalBrl = metricas.savingDigitaçãoCustoBrl + metricas.savingErrosCustoBrl

  return (
    <div className="sr-insights-kpi-grid" aria-label="Indicadores principais Smart Read">
      <CardBasicoGlobal
        titulo="DOCUMENTOS LIDOS"
        icone={<Files weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
        valor={carregando ? placeholder : metricas.totalDocumentos}
        subtexto={`${metricas.amostraLeituras} leitura(s) na amostra`}
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Documentos extraídos</span>
              <strong>{metricas.totalDocumentos}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Leituras na amostra</span>
              <strong>{metricas.amostraLeituras}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Tipos distintos</span>
              <strong>{metricas.porTipoDocumento.length}</strong>
            </p>
          </>
        }
      />
      <CardBasicoGlobal
        titulo="CAMPOS LIDOS"
        icone={<ListChecks weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
        valor={carregando ? placeholder : metricas.totalCampos}
        subtexto={
          carregando
            ? 'Calculando…'
            : `${metricas.camposCorretos} corretos · ${metricas.camposErrados} errados`
        }
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Total de campos</span>
              <strong>{metricas.totalCampos}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Corretos</span>
              <strong>{metricas.camposCorretos}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Errados</span>
              <strong>{metricas.camposErrados}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Taxa de acerto</span>
              <strong>{formatarPercentualLeitura(metricas.taxaAcertoCampos)}</strong>
            </p>
          </>
        }
      />
      <CardBasicoGlobal
        titulo="SAVING DIGITAÇÃO"
        icone={<Timer weight="duotone" size={16} style={{ color: '#34d399' }} />}
        valor={carregando ? placeholder : formatarMinutosInsightsSmartRead(metricas.savingDigitaçãoMinutos)}
        variante="sucesso"
        subtexto={
          carregando
            ? 'Base produto'
            : `≈ ${formatarMoedaInsightsSmartRead(metricas.savingDigitaçãoCustoBrl)} estimados`
        }
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Tempo economizado</span>
              <strong>{formatarMinutosInsightsSmartRead(metricas.savingDigitaçãoMinutos)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Custo evitado (est.)</span>
              <strong>{formatarMoedaInsightsSmartRead(metricas.savingDigitaçãoCustoBrl)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Base</span>
              <strong>Manual vs Smart Read por tipo</strong>
            </p>
          </>
        }
      />
      <CardBasicoGlobal
        titulo="SAVING EM ERROS"
        icone={<TrendUp weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
        valor={carregando ? placeholder : formatarMinutosInsightsSmartRead(metricas.savingErrosMinutos)}
        subtexto={
          carregando
            ? 'Base produto'
            : `${metricas.camposErrados} campos · ${formatarMoedaInsightsSmartRead(metricas.savingErrosCustoBrl)}`
        }
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Campos com erro</span>
              <strong>{metricas.camposErrados}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Tempo economizado</span>
              <strong>{formatarMinutosInsightsSmartRead(metricas.savingErrosMinutos)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Custo evitado (est.)</span>
              <strong>{formatarMoedaInsightsSmartRead(metricas.savingErrosCustoBrl)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Total saving</span>
              <strong>
                {formatarMinutosInsightsSmartRead(savingTotalMin)} ·{' '}
                {formatarMoedaInsightsSmartRead(savingTotalBrl)}
              </strong>
            </p>
          </>
        }
      />
    </div>
  )
}

export function PainelCamposAcertosInsightsSmartRead({ metricas }: { metricas: MetricasInsightsLeituraSmartRead }) {
  const total = metricas.camposCorretos + metricas.camposErrados
  const pctCorretos = total > 0 ? (metricas.camposCorretos / total) * 100 : 0
  const pctErrados = total > 0 ? 100 - pctCorretos : 0
  const circ = 2 * Math.PI * 42
  const offsetCorretos = circ - (pctCorretos / 100) * circ

  return (
    <section className="sr-insights-card">
      <h2 className="sr-insights-card__titulo">Campos lidos — corretos × errados</h2>
      <p className="sr-insights-card__subtitulo">Distribuição na amostra de extrações concluídas</p>

      <div className="sr-insights-campos-resumo">
        <div className="sr-insights-campos-box sr-insights-campos-box--ok">
          <p className="sr-insights-campos-box__rotulo">Corretos</p>
          <p className="sr-insights-campos-box__valor" style={{ color: '#34d399' }}>
            {metricas.camposCorretos}
          </p>
        </div>
        <div className="sr-insights-campos-box sr-insights-campos-box--erro">
          <p className="sr-insights-campos-box__rotulo">Errados</p>
          <p className="sr-insights-campos-box__valor" style={{ color: '#f87171' }}>
            {metricas.camposErrados}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p className="sr-insights-vazio">Sem campos classificados na amostra.</p>
      ) : (
        <div className="sr-insights-donut-wrap">
          <svg viewBox="0 0 100 100" className="sr-insights-donut" aria-hidden>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(248,113,113,0.35)" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#34d399"
              strokeWidth="12"
              strokeDasharray={circ}
              strokeDashoffset={offsetCorretos}
              strokeLinecap="round"
            />
          </svg>
          <div className="sr-insights-donut-legenda">
            <span>
              <i className="sr-insights-donut-dot" style={{ background: '#34d399' }} />
              Corretos {pctCorretos.toFixed(0)}%
            </span>
            <span>
              <i className="sr-insights-donut-dot" style={{ background: '#f87171' }} />
              Errados {pctErrados.toFixed(0)}%
            </span>
            <span style={{ marginTop: '0.25rem', fontWeight: 600, color: '#fff' }}>
              {formatarPercentualLeitura(metricas.taxaAcertoCampos)} acerto
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

export function PainelTiposDocumentoInsightsSmartRead({ metricas }: { metricas: MetricasInsightsLeituraSmartRead }) {
  const max = Math.max(...metricas.porTipoDocumento.map((t) => t.quantidade), 1)

  return (
    <section className="sr-insights-card">
      <h2 className="sr-insights-card__titulo">Tipos de documento</h2>
      <p className="sr-insights-card__subtitulo">Invoice, Packing List, BL, AWB e demais</p>

      {metricas.porTipoDocumento.length === 0 ? (
        <p className="sr-insights-vazio">Nenhum documento extraído na amostra.</p>
      ) : (
        metricas.porTipoDocumento.map((item) => {
          const pct = Math.round((item.quantidade / max) * 100)
          const totalPct = metricas.totalDocumentos
            ? Math.round((item.quantidade / metricas.totalDocumentos) * 100)
            : 0
          return (
            <div key={item.tipo} className="sr-insights-funil__row">
              <span className="sr-insights-funil__label">{item.rotulo}</span>
              <div className="sr-insights-funil__bar-wrap">
                <div
                  className="sr-insights-funil__bar"
                  style={{ width: `${pct}%`, background: '#818cf8' }}
                />
              </div>
              <span className="sr-insights-funil__count">{item.quantidade}</span>
              <span className="sr-insights-funil__pct">{totalPct}%</span>
            </div>
          )
        })
      )}
    </section>
  )
}

export function PainelBlAwbInsightsSmartRead({ metricas }: { metricas: MetricasInsightsLeituraSmartRead }) {
  const { bl, awb } = metricas.blAwb

  return (
    <section className="sr-insights-card">
      <h2 className="sr-insights-card__titulo">BL e AWB</h2>
      <p className="sr-insights-card__subtitulo">Performance de extração nos conhecimentos</p>
      <div className="sr-insights-bl-awb-grid">
        <div className="sr-insights-bl-awb-item">
          <p className="sr-insights-campos-box__rotulo">Bill of Lading</p>
          <p className="sr-insights-campos-box__valor">{bl.documentos}</p>
          <p className="sr-insights-ranking-meta">
            {formatarPercentualLeitura(bl.mediaAcertos)} acerto · {bl.camposCorretos}✓ {bl.camposErrados}✗
          </p>
        </div>
        <div className="sr-insights-bl-awb-item">
          <p className="sr-insights-campos-box__rotulo">AWB</p>
          <p className="sr-insights-campos-box__valor">{awb.documentos}</p>
          <p className="sr-insights-ranking-meta">
            {formatarPercentualLeitura(awb.mediaAcertos)} acerto · {awb.camposCorretos}✓ {awb.camposErrados}✗
          </p>
        </div>
      </div>
    </section>
  )
}

export function PainelRankingsEntidadeInsightsSmartRead({
  metricas,
}: {
  metricas: MetricasInsightsLeituraSmartRead
}) {
  const [tipoFornecedor, setTipoFornecedor] = useState<TipoFornecedorInsights>('exportador')
  const { acertos, erros } = resolverRankingsFornecedor(metricas, tipoFornecedor)
  const rotuloTipo = tipoFornecedor === 'exportador' ? 'Exportador' : 'Importador'

  return (
    <section className="sr-insights-card sr-insights-card--rankings">
      <h2 className="sr-insights-card__titulo">Fornecedores na extração</h2>
      <p className="sr-insights-card__subtitulo">
        Top 5 maiores acertos e maiores erros por {rotuloTipo.toLowerCase()}
      </p>

      <div className="sr-insights-tabs" role="tablist" aria-label="Tipo de fornecedor">
        {(['exportador', 'importador'] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            role="tab"
            aria-selected={tipoFornecedor === tipo}
            className={`sr-insights-tab${tipoFornecedor === tipo ? ' sr-insights-tab--ativa' : ''}`}
            onClick={() => setTipoFornecedor(tipo)}
          >
            {tipo === 'exportador' ? 'Exportadores' : 'Importadores'}
          </button>
        ))}
      </div>

      <div className="sr-insights-rankings-duplo">
        <RankingColuna
          titulo="Maiores acertos"
          itens={acertos}
          metrica="acerto"
          vazio={`Nenhum ${rotuloTipo.toLowerCase()} com acerto na amostra.`}
        />
        <RankingColuna
          titulo="Maiores erros"
          itens={erros}
          metrica="erro"
          vazio={`Nenhum ${rotuloTipo.toLowerCase()} com erro na amostra.`}
        />
      </div>
    </section>
  )
}

function RankingColuna({
  titulo,
  itens,
  metrica,
  vazio,
}: {
  titulo: string
  itens: RankingEntidadeInsightsSmartRead[]
  metrica: 'erro' | 'acerto'
  vazio: string
}) {
  const maxErros = Math.max(...itens.map((i) => i.campos_errados), 1)
  const maxAcerto = Math.max(...itens.map((i) => i.media_acertos ?? 0), 0.01)

  return (
    <div className="sr-insights-ranking-coluna">
      <h3 className="sr-insights-ranking-coluna__titulo">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="sr-insights-vazio">{vazio}</p>
      ) : (
        <ul className="sr-insights-ranking-lista">
          {itens.map((item, idx) => {
            const barPct =
              metrica === 'erro'
                ? Math.round((item.campos_errados / maxErros) * 100)
                : Math.round(((item.media_acertos ?? 0) / maxAcerto) * 100)
            return (
              <li key={`${titulo}-${item.nome}`} className="sr-insights-ranking-item sr-insights-ranking-item--card">
                <span className="sr-insights-ranking-pos">{idx + 1}</span>
                <div className="sr-insights-ranking-corpo">
                  <div className="sr-insights-ranking-topo">
                    <p className="sr-insights-ranking-nome">{item.nome}</p>
                    <span
                      className="sr-insights-ranking-valor"
                      style={{ color: metrica === 'erro' ? '#f87171' : '#34d399' }}
                    >
                      {metrica === 'erro'
                        ? `${item.campos_errados} err.`
                        : formatarPercentualLeitura(item.media_acertos)}
                    </span>
                  </div>
                  <p className="sr-insights-ranking-meta">
                    {item.documentos} doc. · {item.campos_corretos}✓ · {item.campos_errados}✗
                  </p>
                  <div className="sr-insights-funil__bar-wrap sr-insights-ranking-bar">
                    <div
                      className="sr-insights-funil__bar"
                      style={{
                        width: `${barPct}%`,
                        background: metrica === 'erro' ? '#f87171' : '#34d399',
                      }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function PainelSavingDetalheInsightsSmartRead({ metricas }: { metricas: MetricasInsightsLeituraSmartRead }) {
  return (
    <section className="sr-insights-card">
      <h2 className="sr-insights-card__titulo">Economia estimada</h2>
      <p className="sr-insights-card__subtitulo">
        Tempos comparativos — base DOCS BASE PRODUTO (substituível)
      </p>
      <div className="sr-insights-campos-resumo">
        <div className="sr-insights-campos-box sr-insights-campos-box--ok">
          <p className="sr-insights-campos-box__rotulo">
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Digitação evitada
          </p>
          <p className="sr-insights-campos-box__valor" style={{ color: '#34d399', fontSize: '1.25rem' }}>
            {formatarMinutosInsightsSmartRead(metricas.savingDigitaçãoMinutos)}
          </p>
        </div>
        <div className="sr-insights-campos-box sr-insights-campos-box--erro">
          <p className="sr-insights-campos-box__rotulo">
            <ChartDonut size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Correção de erros
          </p>
          <p className="sr-insights-campos-box__valor" style={{ color: '#a78bfa', fontSize: '1.25rem' }}>
            {formatarMinutosInsightsSmartRead(metricas.savingErrosMinutos)}
          </p>
        </div>
      </div>
      <p className="sr-insights-nota-base">
        Estimativas com tempos médios por tipo de documento (base DOCS BASE PRODUTO).
      </p>
    </section>
  )
}
