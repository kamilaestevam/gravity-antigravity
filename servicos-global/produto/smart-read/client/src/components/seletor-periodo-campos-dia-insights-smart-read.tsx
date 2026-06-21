import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import {
  FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA,
  PRESETS_DIAS_CAMPOS_POR_DIA,
  type FiltroPeriodoCamposPorDiaInsights,
  type PresetDiasCamposPorDiaInsights,
} from '../pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read'

type Props = {
  filtro: FiltroPeriodoCamposPorDiaInsights
  onChangeFiltro: (filtro: FiltroPeriodoCamposPorDiaInsights) => void
  rotuloPeriodo?: string
  compacto?: boolean
}

function calendarioDeFiltro(filtro: FiltroPeriodoCamposPorDiaInsights): {
  inicio: Date | null
  fim: Date | null
} {
  if (filtro.modo !== 'intervalo') {
    return { inicio: null, fim: null }
  }
  return {
    inicio: new Date(`${filtro.data_inicio}T12:00:00.000Z`),
    fim: new Date(`${filtro.data_fim}T12:00:00.000Z`),
  }
}

function presetAtivo(filtro: FiltroPeriodoCamposPorDiaInsights, dias: PresetDiasCamposPorDiaInsights): boolean {
  return filtro.modo === 'preset' && filtro.dias === dias
}

export function SeletorPeriodoCamposDiaInsightsSmartRead({
  filtro,
  onChangeFiltro,
  rotuloPeriodo,
  compacto = false,
}: Props) {
  const intervaloAtivo = filtro.modo === 'intervalo'

  function aoMudarCalendario(valor: { inicio: Date | null; fim: Date | null }) {
    if (!valor.inicio || !valor.fim) {
      onChangeFiltro(FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA)
      return
    }
    onChangeFiltro({
      modo: 'intervalo',
      data_inicio: valor.inicio.toISOString().slice(0, 10),
      data_fim: valor.fim.toISOString().slice(0, 10),
    })
  }

  return (
    <div
      className={`sr-insights-periodo${compacto ? ' sr-insights-periodo--compacto' : ''}`}
      role="group"
      aria-label="Período do gráfico"
    >
      <div className="sr-insights-periodo__presets">
        {PRESETS_DIAS_CAMPOS_POR_DIA.map((dias) => (
          <button
            key={dias}
            type="button"
            className={`sr-insights-periodo__btn${presetAtivo(filtro, dias) ? ' sr-insights-periodo__btn--ativa' : ''}`}
            aria-pressed={presetAtivo(filtro, dias)}
            onClick={() => onChangeFiltro({ modo: 'preset', dias })}
          >
            {dias}d
          </button>
        ))}
      </div>
      {rotuloPeriodo && <span className="sr-insights-chart__subtitle">{rotuloPeriodo}</span>}
      <CampoCalendarioGlobal
        className={`sr-insights-periodo__campo-calendario sr-insights-periodo__campo-calendario--icone${intervaloAtivo ? ' sr-insights-periodo__campo-calendario--ativa' : ''}`}
        valor={calendarioDeFiltro(filtro)}
        aoMudarValor={aoMudarCalendario}
      />
    </div>
  )
}

export { FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA }
