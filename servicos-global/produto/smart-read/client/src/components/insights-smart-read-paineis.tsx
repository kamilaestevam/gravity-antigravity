import { useMemo, useState, type ReactNode } from 'react'
import {
  ChartBar,
  ChartDonut,
  ChartPie,
  Clock,
  CurrencyDollar,
  Files,
  ListChecks,
  Timer,
  TrendUp,
  UsersThree,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { GraficoCamposPorDiaInsightsSmartRead } from './grafico-campos-por-dia-insights-smart-read'
import {
  FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA,
  SeletorPeriodoCamposDiaInsightsSmartRead,
} from './seletor-periodo-campos-dia-insights-smart-read'
import { SeletorTipoParticipanteRankingInsightsSmartRead } from './seletor-tipo-participante-ranking-insights-smart-read'
import { formatarPercentualLeitura } from '../shared/formatacao-leitura-smart-read'
import type { TransacaoLeitura } from '../shared/schemas'
import {
  PARTICIPANTES_RANKING_INSIGHTS_SMART_READ,
} from '../pages/insights-smart-read/mapear-participante-insights-smart-read'
import {
  montarSerieCamposPorDiaInsights,
  rotuloPeriodoCamposPorDiaInsights,
  serieTemporalTemDados,
  METRICA_SERIE_TEMPORAL_PADRAO,
  type FiltroPeriodoCamposPorDiaInsights,
  type MetricaSerieTemporalInsightsSmartRead,
} from '../pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read'
import type {
  MetricasInsightsLeituraSmartRead,
  RankingEntidadeInsightsSmartRead,
  TipoParticipanteRankingInsightsSmartRead,
} from '../pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read'
import {
  formatarMinutosInsightsSmartRead,
  resolverRankingsParticipanteInsights,
} from '../pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read'
import { formatarErrosEvitadosEstudoSmartRead } from '../../../shared/dados-base-produto-tempo-smart-read'
import {
  LinkMetodologiaSavingInsightsSmartRead,
} from '../pages/insights-smart-read/metodologia-saving-insights-smart-read'

type Props = {
  metricas: MetricasInsightsLeituraSmartRead
  carregando?: boolean
}

type CabecalhoPainelProps = {
  icone: ReactNode
  titulo: string
  complemento?: ReactNode
}

function CabecalhoPainelInsightsSmartRead({ icone, titulo, complemento }: CabecalhoPainelProps) {
  return (
    <header
      className={`sr-insights-card__cabecalho${complemento ? ' sr-insights-card__cabecalho--com-complemento' : ''}`}
    >
      <div className="sr-insights-card__cabecalho-texto">
        <div className="cg-card__header">
          <div className="cg-card__icon-wrap">{icone}</div>
          <p className="cg-card__label">{titulo}</p>
        </div>
      </div>
      {complemento}
    </header>
  )
}

export function KpiGridInsightsLeituraSmartRead({ metricas, carregando }: Props) {
  const placeholder = carregando ? '…' : '—'

  return (
    <>
      <CardBasicoGlobal
        className="sr-insights-grid__kpi"
        titulo="DOCUMENTOS LIDOS"
        icone={<Files weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
        valor={carregando ? placeholder : metricas.totalDocumentos}
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
        className="sr-insights-grid__kpi"
        titulo="CAMPOS LIDOS"
        icone={<ListChecks weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
        valor={carregando ? placeholder : metricas.totalCampos}
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
              <strong>{formatarErrosEvitadosEstudoSmartRead(metricas.camposErrados)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Taxa de acerto</span>
              <strong>{formatarPercentualLeitura(metricas.taxaAcertoCampos)}</strong>
            </p>
          </>
        }
      />
      <CardBasicoGlobal
        className="sr-insights-grid__kpi"
        titulo="SAVING DIGITAÇÃO"
        icone={<Timer weight="duotone" size={16} style={{ color: '#34d399' }} />}
        valor={carregando ? placeholder : formatarMinutosInsightsSmartRead(metricas.savingDigitaçãoMinutos)}
        variante="sucesso"
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Tempo economizado</span>
              <strong>{formatarMinutosInsightsSmartRead(metricas.savingDigitaçãoMinutos)}</strong>
            </p>
            <p className="cg-tooltip__row cg-tooltip__row--link-only">
              <LinkMetodologiaSavingInsightsSmartRead>Base de cálculo →</LinkMetodologiaSavingInsightsSmartRead>
            </p>
          </>
        }
      />
      <CardBasicoGlobal
        className="sr-insights-grid__kpi"
        titulo="SAVING EM ERROS"
        icone={<TrendUp weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
        valor={carregando ? placeholder : formatarErrosEvitadosEstudoSmartRead(metricas.camposErrados)}
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Erros evitados (estudo)</span>
              <strong>{formatarErrosEvitadosEstudoSmartRead(metricas.camposErrados)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Tempo economizado</span>
              <strong>{formatarMinutosInsightsSmartRead(metricas.savingErrosMinutos)}</strong>
            </p>
            <p className="cg-tooltip__row cg-tooltip__row--link-only">
              <LinkMetodologiaSavingInsightsSmartRead>Base de cálculo →</LinkMetodologiaSavingInsightsSmartRead>
            </p>
          </>
        }
      />
    </>
  )
}

export function PainelGraficoCamposPorDiaInsightsSmartRead({
  metricas,
  transacoes,
  className = '',
}: {
  metricas: MetricasInsightsLeituraSmartRead
  transacoes: TransacaoLeitura[]
  className?: string
}) {
  const [filtro, setFiltro] = useState<FiltroPeriodoCamposPorDiaInsights>(FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA)
  const metrica = METRICA_SERIE_TEMPORAL_PADRAO

  const serie = useMemo(
    () => montarSerieCamposPorDiaInsights(metricas.documentos, transacoes, filtro),
    [metricas.documentos, transacoes, filtro],
  )

  const rotuloPeriodo = rotuloPeriodoCamposPorDiaInsights(filtro)
  const semDados = !serieTemporalTemDados(serie, metrica)

  return (
    <section className={`sr-insights-card sr-insights-card--grafico-temporal ${className}`.trim()}>
      <CabecalhoPainelInsightsSmartRead
        icone={<ChartBar weight="duotone" size={16} style={{ color: '#3b82f6' }} />}
        titulo="EVOLUÇÃO DIÁRIA"
        complemento={
          <div className="sr-insights-grafico-controles">
            <SeletorPeriodoCamposDiaInsightsSmartRead
              filtro={filtro}
              onChangeFiltro={setFiltro}
              rotuloPeriodo={rotuloPeriodo}
              compacto
            />
          </div>
        }
      />
      <div className="sr-insights-card__corpo">
        {semDados ? (
          <p className="sr-insights-vazio">Sem extrações no período selecionado.</p>
        ) : (
          <GraficoCamposPorDiaInsightsSmartRead serie={serie} metrica={metrica} />
        )}
      </div>
    </section>
  )
}

export function PainelCamposAcertosInsightsSmartRead({
  metricas,
  className = '',
}: {
  metricas: MetricasInsightsLeituraSmartRead
  className?: string
}) {
  const total = metricas.camposCorretos + metricas.camposErrados
  const pctCorretos = total > 0 ? (metricas.camposCorretos / total) * 100 : 0
  const pctErrados = total > 0 ? 100 - pctCorretos : 0
  const circ = 2 * Math.PI * 42
  const offsetCorretos = circ - (pctCorretos / 100) * circ

  return (
    <section className={`sr-insights-card sr-insights-card--campos-acertos ${className}`.trim()}>
      <CabecalhoPainelInsightsSmartRead
        icone={<ChartPie weight="duotone" size={16} style={{ color: '#34d399' }} />}
        titulo="CAMPOS LIDOS — CORRETOS × ERRADOS"
      />

      <div className="sr-insights-card__corpo">
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
            {formatarErrosEvitadosEstudoSmartRead(metricas.camposErrados)}
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
      </div>
    </section>
  )
}

export function PainelTiposDocumentoInsightsSmartRead({
  metricas,
  className = '',
}: {
  metricas: MetricasInsightsLeituraSmartRead
  className?: string
}) {
  const max = Math.max(...metricas.porTipoDocumento.map((t) => t.quantidade), 1)

  return (
    <section className={`sr-insights-card sr-insights-card--tipos ${className}`.trim()}>
      <CabecalhoPainelInsightsSmartRead
        icone={<Files weight="duotone" size={16} style={{ color: '#818cf8' }} />}
        titulo="TIPOS DE DOCUMENTO"
      />

      <div className="sr-insights-card__corpo">
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
      </div>
    </section>
  )
}

export function PainelRankingsEntidadeInsightsSmartRead({
  metricas,
  className = '',
}: {
  metricas: MetricasInsightsLeituraSmartRead
  className?: string
}) {
  const [tipoParticipante, setTipoParticipante] = useState<TipoParticipanteRankingInsightsSmartRead>('exportador')
  const definicao = PARTICIPANTES_RANKING_INSIGHTS_SMART_READ.find((p) => p.tipo === tipoParticipante)!
  const { acertos, erros } = resolverRankingsParticipanteInsights(metricas, tipoParticipante)

  return (
    <section className={`sr-insights-card sr-insights-card--rankings ${className}`.trim()}>
      <CabecalhoPainelInsightsSmartRead
        icone={<UsersThree weight="duotone" size={16} style={{ color: '#f59e0b' }} />}
        titulo="RESULTADO POR TIPO DE FORNECEDOR"
      />

      <div className="sr-insights-card__corpo">
      <SeletorTipoParticipanteRankingInsightsSmartRead
        tipoAtivo={tipoParticipante}
        onChangeTipo={setTipoParticipante}
      />

      <div className="sr-insights-rankings-duplo">
        <RankingColuna
          titulo="Maiores acertos"
          itens={acertos}
          metrica="acerto"
          vazio={`Nenhum ${definicao.rotulo.toLowerCase()} com acerto na amostra.`}
        />
        <RankingColuna
          titulo="Maiores erros"
          itens={erros}
          metrica="erro"
          vazio={`Nenhum ${definicao.rotulo.toLowerCase()} com erro na amostra.`}
        />
      </div>
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

export function PainelSavingDetalheInsightsSmartRead({
  metricas,
  className = '',
}: {
  metricas: MetricasInsightsLeituraSmartRead
  className?: string
}) {
  return (
    <section className={`sr-insights-card sr-insights-card--saving ${className}`.trim()}>
      <CabecalhoPainelInsightsSmartRead
        icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#f59e0b' }} />}
        titulo="ECONOMIA ESTIMADA"
      />
      <div className="sr-insights-card__corpo">
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
            {formatarErrosEvitadosEstudoSmartRead(metricas.camposErrados)}{' '}
            <span className="sr-insights-campos-box__unidade">campos</span>
          </p>
          <p className="sr-insights-campos-box__detalhe">
            {formatarMinutosInsightsSmartRead(metricas.savingErrosMinutos)} economizados
          </p>
        </div>
      </div>
      <p className="sr-insights-economia-base-calculo">
        <LinkMetodologiaSavingInsightsSmartRead>Base de cálculo →</LinkMetodologiaSavingInsightsSmartRead>
      </p>
      </div>
    </section>
  )
}
