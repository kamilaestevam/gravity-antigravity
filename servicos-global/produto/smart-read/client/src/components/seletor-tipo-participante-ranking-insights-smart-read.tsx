import type { CSSProperties, ReactNode } from 'react'
import {
  Package,
  ShieldStar,
  Truck,
  TruckTrailer,
  UserGear,
  Warehouse,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  PARTICIPANTES_INSIGHTS_SMART_READ,
  PARTICIPANTES_RANKING_INSIGHTS_SMART_READ,
  type DefinicaoParticipanteInsights,
  type TipoParticipanteInsightsSmartRead,
} from '../pages/insights-smart-read/mapear-participante-insights-smart-read'

type Props = {
  tipoAtivo: TipoParticipanteInsightsSmartRead
  onChangeTipo: (tipo: TipoParticipanteInsightsSmartRead) => void
  tipos?: TipoParticipanteInsightsSmartRead[]
}

type IconeParticipanteRanking = {
  cor: string
  descricao: string
  render: () => ReactNode
}

const ICONES_PARTICIPANTE_RANKING_INSIGHTS: Record<
  TipoParticipanteInsightsSmartRead,
  IconeParticipanteRanking
> = {
  exportador: {
    cor: '#34d399',
    descricao: 'Emissor em Invoice, Packing e documentos comerciais',
    render: () => <Truck weight="duotone" size={16} aria-hidden />,
  },
  importador: {
    cor: '#60a5fa',
    descricao: 'Importador ou consignatário do embarque',
    render: () => <Package weight="duotone" size={16} aria-hidden />,
  },
  agente_carga: {
    cor: '#c084fc',
    descricao: 'Emissor em BL, AWB e conhecimentos de transporte',
    render: () => <UserGear weight="duotone" size={16} aria-hidden />,
  },
  transportadora_rodoviaria: {
    cor: '#a3e635',
    descricao: 'Transportadora do trecho rodoviário na operação',
    render: () => <TruckTrailer weight="duotone" size={16} aria-hidden />,
  },
  armazem_alfandegado: {
    cor: '#fb923c',
    descricao: 'Recinto alfandegado ou terminal de armazenagem',
    render: () => <Warehouse weight="duotone" size={16} aria-hidden />,
  },
  despachante_aduaneiro: {
    cor: '#f472b6',
    descricao: 'Despachante responsável pelo desembaraço aduaneiro',
    render: () => <ShieldStar weight="duotone" size={16} aria-hidden />,
  },
}

function listarParticipantesSeletor(
  tipos?: TipoParticipanteInsightsSmartRead[],
): DefinicaoParticipanteInsights[] {
  if (!tipos) return PARTICIPANTES_RANKING_INSIGHTS_SMART_READ
  return tipos
    .map((tipo) => PARTICIPANTES_INSIGHTS_SMART_READ.find((p) => p.tipo === tipo))
    .filter((p): p is DefinicaoParticipanteInsights => p != null)
}

export function SeletorTipoParticipanteRankingInsightsSmartRead({
  tipoAtivo,
  onChangeTipo,
  tipos,
}: Props) {
  const lista = listarParticipantesSeletor(tipos)

  return (
    <div className="sr-insights-tabs sr-insights-tabs--icones" role="tablist" aria-label="Tipo de emissor">
      {lista.map((participante) => {
        const icone = ICONES_PARTICIPANTE_RANKING_INSIGHTS[participante.tipo]
        const ativo = tipoAtivo === participante.tipo

        return (
          <TooltipGlobal key={participante.tipo} titulo={participante.rotulo} descricao={icone.descricao}>
            <button
              type="button"
              role="tab"
              aria-selected={ativo}
              aria-label={participante.rotulo}
              className={`sr-insights-tab-icone${ativo ? ' sr-insights-tab-icone--ativa' : ''}`}
              style={{ '--sr-tab-icone-cor': icone.cor } as CSSProperties}
              onClick={() => onChangeTipo(participante.tipo)}
            >
              <span className="sr-insights-tab-icone__glyph" style={{ color: icone.cor }}>
                {icone.render()}
              </span>
            </button>
          </TooltipGlobal>
        )
      })}
    </div>
  )
}
