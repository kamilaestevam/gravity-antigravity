import React from 'react'
import { useTranslation } from 'react-i18next'
import { ChartPieSlice } from '@phosphor-icons/react'
import { CardEstatisticaGlobal, CardGraficoGlobal } from '@nucleo/card-global'

/**
 * CardsServidores — cards da aba Servidores no workspace.
 *
 * Mostra a saude da infraestrutura da plataforma (health checks), nao
 * o consumo da organizacao. Para metricas de consumo per-organizacao,
 * ver ApiCockpitKpiCards (renderizado nas abas Tokens/Webhooks/Consumo).
 *
 * Cards:
 *   1. Status da Plataforma (gauge) — % online no anel + legenda Online/Degradado/Offline
 *   2. Latencia Media — media das latencias dos servicos ONLINE
 *   3. Ultima Verificacao — health check mais recente, formato relativo
 */

interface ServicoPlataforma {
  nome_servico_plataforma: string
  status_servico_plataforma: 'ONLINE' | 'DEGRADADO' | 'OFFLINE'
  latencia_ms_servico_plataforma: number
  data_ultimo_check_servico_plataforma: string
}

interface CardsServidoresProps {
  servicos: ServicoPlataforma[]
}

function formatarRelativo(iso: string | undefined): string {
  if (!iso) return '—'
  const agora = Date.now()
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const segundos = Math.max(0, Math.floor((agora - t) / 1000))
  if (segundos < 60)  return `há ${segundos}s`
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60)   return `há ${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24)     return `há ${horas}h`
  const dias = Math.floor(horas / 24)
  return `há ${dias}d`
}

export function CardsServidores({ servicos }: CardsServidoresProps) {
  const { t } = useTranslation()

  const total       = servicos.length
  const onlineCount    = servicos.filter((s) => s.status_servico_plataforma === 'ONLINE').length
  const degradadoCount = servicos.filter((s) => s.status_servico_plataforma === 'DEGRADADO').length
  const offlineCount   = servicos.filter((s) => s.status_servico_plataforma === 'OFFLINE').length

  // Status da Plataforma — define cor do gauge
  const status: 'pleno' | 'degradado' | 'falhando' | 'sem_dados' =
    total === 0          ? 'sem_dados'
    : onlineCount === total ? 'pleno'
    : onlineCount === 0     ? 'falhando'
    :                         'degradado'

  const corGauge =
    status === 'pleno'     ? '#34d399'
    : status === 'degradado' ? '#fbbf24'
    : status === 'falhando'  ? '#f87171'
    :                          '#94a3b8'

  // Latencia media — apenas dos servicos ONLINE
  const servicosOnline = servicos.filter((s) => s.status_servico_plataforma === 'ONLINE')
  const latenciaMediaMs = servicosOnline.length > 0
    ? `${Math.round(servicosOnline.reduce((acc, s) => acc + s.latencia_ms_servico_plataforma, 0) / servicosOnline.length)}ms`
    : '—'

  // Ultima verificacao
  const ultimaIso = servicos.reduce<string | undefined>((acc, s) => {
    const d = s.data_ultimo_check_servico_plataforma
    if (!acc) return d
    return new Date(d).getTime() > new Date(acc).getTime() ? d : acc
  }, undefined)
  const ultimaLabel = formatarRelativo(ultimaIso)

  // ── Tooltips ────────────────────────────────────────────────────────────

  const ttDesc = (texto: string) => (
    <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', lineHeight: 1.45 }}>{texto}</p>
  )

  const tooltipStatusPlataforma = (
    <>
      <div className="cg-tooltip__row">
        <span>Online</span>
        <strong style={{ color: '#34d399' }}>{onlineCount}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>Degradado</span>
        <strong style={{ color: '#fbbf24' }}>{degradadoCount}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>Offline</span>
        <strong style={{ color: '#f87171' }}>{offlineCount}</strong>
      </div>
      <div className="cg-tooltip__divider" />
      <div className="cg-tooltip__row">
        <span>Total</span>
        <strong>{total}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>Disponibilidade</span>
        <strong style={{ color: corGauge }}>{total > 0 ? Math.round((onlineCount / total) * 100) : 0}%</strong>
      </div>
    </>
  )

  const tooltipLatencia = ttDesc(
    'Latência média dos health checks dos serviços ONLINE no momento. Não inclui o tempo das suas próprias chamadas — para isso veja a aba Consumo.'
  )

  const tooltipUltimaVerificacao = ttDesc(
    'Há quanto tempo foi o último health check de qualquer serviço. A plataforma verifica continuamente.'
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      <CardGraficoGlobal
        titulo={t('workspace.cockpit.status_plataforma')}
        icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
        total={total}
        valorPrincipal={onlineCount}
        corGauge={corGauge}
        legenda={[
          { label: t('workspace.cockpit.legenda_online'),    valor: onlineCount,    cor: 'green'  },
          { label: t('workspace.cockpit.legenda_degradado'), valor: degradadoCount, cor: 'yellow' },
          { label: t('workspace.cockpit.legenda_offline'),   valor: offlineCount,   cor: 'red'    },
        ]}
        tooltip={tooltipStatusPlataforma}
      />
      <CardEstatisticaGlobal
        titulo={t('workspace.cockpit.latencia_plataforma')}
        valor={latenciaMediaMs}
        variante="padrao"
        tooltip={tooltipLatencia}
      />
      <CardEstatisticaGlobal
        titulo={t('workspace.cockpit.ultima_verificacao')}
        valor={ultimaLabel}
        variante="padrao"
        tooltip={tooltipUltimaVerificacao}
      />
    </div>
  )
}

export default CardsServidores
