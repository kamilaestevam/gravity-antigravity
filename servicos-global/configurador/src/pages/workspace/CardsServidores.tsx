import React from 'react'
import { useTranslation } from 'react-i18next'
import { CardEstatisticaGlobal } from '@nucleo/card-global'

/**
 * CardsServidores — 4 cards da aba Servidores no workspace.
 *
 * Mostra a saude da infraestrutura da plataforma (health checks), nao
 * o consumo da organizacao. Para metricas de consumo per-organizacao,
 * ver ApiCockpitKpiCards (renderizado nas abas Tokens/Webhooks/Consumo).
 *
 * Cards:
 *   1. Status da Plataforma  — rotulo qualitativo: Operacional Pleno / Degradado / Falhando
 *   2. Servidores Online     — contagem X/Y (justifica o rotulo do #1)
 *   3. Latencia Media        — media das latencias dos servicos ONLINE
 *   4. Ultima Verificacao    — health check mais recente, em formato relativo
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

// Formato relativo simples (sem dependencia externa). "ha Xs" / "ha Xm" / "ha Xh".
function formatarRelativo(iso: string | undefined): string {
  if (!iso) return '—'
  const agora = Date.now()
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const segundos = Math.max(0, Math.floor((agora - t) / 1000))
  if (segundos < 60)    return `há ${segundos}s`
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60)     return `há ${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24)       return `há ${horas}h`
  const dias = Math.floor(horas / 24)
  return `há ${dias}d`
}

export function CardsServidores({ servicos }: CardsServidoresProps) {
  const { t } = useTranslation()

  const total       = servicos.length
  const onlineCount = servicos.filter((s) => s.status_servico_plataforma === 'ONLINE').length

  // Status da Plataforma — 3 estados baseados em contagem
  const status: 'pleno' | 'degradado' | 'falhando' | 'sem_dados' =
    total === 0          ? 'sem_dados'
    : onlineCount === total ? 'pleno'
    : onlineCount === 0     ? 'falhando'
    :                         'degradado'

  const statusLabel =
    status === 'pleno'     ? t('workspace.cockpit.status_operacional_pleno')
    : status === 'degradado' ? t('workspace.cockpit.status_degradado')
    : status === 'falhando'  ? t('workspace.cockpit.status_falhando')
    :                          '—'

  const statusVariante: 'sucesso' | 'aviso' | 'perigo' | 'padrao' =
    status === 'pleno'     ? 'sucesso'
    : status === 'degradado' ? 'aviso'
    : status === 'falhando'  ? 'perigo'
    :                          'padrao'

  // Latencia media — apenas dos servicos ONLINE (latencia de OFFLINE e ruido)
  const servicosOnline = servicos.filter((s) => s.status_servico_plataforma === 'ONLINE')
  const latenciaMediaMs = servicosOnline.length > 0
    ? `${Math.round(servicosOnline.reduce((acc, s) => acc + s.latencia_ms_servico_plataforma, 0) / servicosOnline.length)}ms`
    : '—'

  // Ultima verificacao — max das datas (mais recente)
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

  const ttEstados = (itens: readonly { label: string; desc: string; cor: string }[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {itens.map(({ label, desc, cor }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: cor, flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.3 }}>{desc}</span>
        </div>
      ))}
    </div>
  )

  const tooltipStatusPlataforma = (
    <>
      {ttDesc('Saúde geral da infraestrutura. A contagem exata aparece no card "Servidores Online" ao lado.')}
      <div style={{ marginTop: '0.625rem' }}>
        {ttEstados([
          { label: 'Operacional Pleno', desc: 'Todos os servidores respondendo',     cor: '#4ade80' },
          { label: 'Degradado',         desc: 'Pelo menos um servidor fora do ar',   cor: '#fbbf24' },
          { label: 'Falhando',          desc: 'Nenhum servidor respondendo',         cor: '#f87171' },
        ] as const)}
      </div>
    </>
  )

  const tooltipServidoresOnline = ttDesc(
    'Quantos serviços responderam ao último health check da plataforma sobre o total monitorado.'
  )

  const tooltipLatencia = ttDesc(
    'Latência média dos health checks dos serviços ONLINE no momento. Não inclui o tempo das suas próprias chamadas — para isso veja a aba Consumo.'
  )

  const tooltipUltimaVerificacao = ttDesc(
    'Há quanto tempo foi o último health check de qualquer serviço. A plataforma verifica continuamente.'
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      <CardEstatisticaGlobal
        titulo={t('workspace.cockpit.status_plataforma')}
        valor={statusLabel}
        variante={statusVariante}
        tooltip={tooltipStatusPlataforma}
      />
      <CardEstatisticaGlobal
        titulo={t('workspace.cockpit.servidores_online')}
        valor={total === 0 ? '—' : `${onlineCount}/${total}`}
        variante={statusVariante}
        tooltip={tooltipServidoresOnline}
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
