import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'

/**
 * ApiCockpitKpiCards — 5 cards de KPI per-organizacao compartilhados pelas
 * 4 paginas do API Cockpit (Inventario/Logs, Tokens, Webhooks, Consumo).
 *
 * Buscam GET /api/v1/api-cockpit/log-consumo/estatisticas (ja filtrado por
 * organizacao do usuario via JWT no proxy do Configurador).
 *
 * Cards:
 *   1. Status da Sua Integracao (OK/Atencao/Falhando/Sem Trafego)
 *   2. Taxa de Sucesso (24h) — % de req 2xx+3xx
 *   3. Latencia Media (24h)
 *   4. Produtos em Uso (24h) — count distinct id_produto_gravity
 *   5. Requisicoes (24h)
 */

const estatisticasLogConsumoSchema = z.object({
  quantidade_requisicoes_log_consumo:        z.number(),
  quantidade_erros_log_consumo:              z.number(),
  latencia_media_log_consumo:                z.number(),
  percentual_uptime_log_consumo:             z.number(),
  quantidade_produtos_distintos_log_consumo: z.number().optional().default(0),
  por_id_produto_gravity:                    z.record(z.number()),
  por_faixa_codigo_resposta_http:            z.record(z.number()),
})

type EstatisticasLogConsumo = z.infer<typeof estatisticasLogConsumoSchema>

export function ApiCockpitKpiCards() {
  const { t } = useTranslation()
  const [estatisticas, setEstatisticas] = useState<EstatisticasLogConsumo | null>(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await requisicaoAutenticada('/api/v1/api-cockpit/log-consumo/estatisticas')
        if (!res.ok) return
        const raw = await res.json()
        const parsed = estatisticasLogConsumoSchema.safeParse(raw)
        if (parsed.success) setEstatisticas(parsed.data)
      } catch (err) {
        console.warn('[ApiCockpitKpiCards] falha ao carregar estatisticas', err)
      }
    }
    void carregar()
  }, [])

  // Derivacao identica a ApiCockpit.tsx — fonte unica de verdade aqui agora.
  const totalReqOrg     = estatisticas?.quantidade_requisicoes_log_consumo ?? 0
  const totalErrosOrg   = estatisticas?.quantidade_erros_log_consumo ?? 0
  const taxaErroPct     = totalReqOrg > 0 ? (totalErrosOrg / totalReqOrg) * 100 : 0
  const taxaSucessoPct  = totalReqOrg > 0 ? 100 - taxaErroPct : 100
  const statusIntegracao: 'OK' | 'Atenção' | 'Falhando' | 'Sem Tráfego' =
    totalReqOrg === 0 ? 'Sem Tráfego'
    : taxaErroPct < 1 ? 'OK'
    : taxaErroPct <= 5 ? 'Atenção'
    : 'Falhando'
  const statusVariante: 'sucesso' | 'aviso' | 'perigo' | 'padrao' =
    statusIntegracao === 'OK'         ? 'sucesso'
    : statusIntegracao === 'Atenção'   ? 'aviso'
    : statusIntegracao === 'Falhando'  ? 'perigo'
    : 'padrao'

  const taxaSucessoLabel    = estatisticas && totalReqOrg > 0 ? `${taxaSucessoPct.toFixed(1)}%` : '—'
  const latenciaMediaMs     = estatisticas ? `${estatisticas.latencia_media_log_consumo}ms` : '—'
  const produtosEmUsoLabel  = estatisticas ? String(estatisticas.quantidade_produtos_distintos_log_consumo) : '—'
  const requisicoes24h      = estatisticas ? String(totalReqOrg) : '—'

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

  const tooltipStatusIntegracao = (
    <>
      {ttDesc('Calculado com base nas últimas 24h de tráfego da sua organização.')}
      <div style={{ marginTop: '0.625rem' }}>
        {ttEstados([
          { label: 'Sem Tráfego', desc: 'Nenhuma chamada registrada',  cor: 'var(--text-secondary, #94a3b8)' },
          { label: 'OK',          desc: 'Taxa de erro abaixo de 1%',   cor: '#4ade80' },
          { label: 'Atenção',     desc: 'Taxa de erro entre 1% e 5%',  cor: '#fbbf24' },
          { label: 'Falhando',    desc: 'Taxa de erro acima de 5%',    cor: '#f87171' },
        ] as const)}
      </div>
    </>
  )

  const tooltipTaxaSucesso = ttDesc(
    'Percentual de requisições com código HTTP abaixo de 400 (2xx e 3xx) nas últimas 24h. Erros 4xx e 5xx reduzem este valor.'
  )

  const tooltipLatencia = ttDesc(
    'Tempo médio de processamento das requisições nas últimas 24h, em milissegundos. Inclui todas as chamadas da sua organização.'
  )

  const tooltipProdutos = ttDesc(
    'Quantidade de produtos Gravity distintos que realizaram ao menos uma chamada à API nas últimas 24h.'
  )

  const tooltipRequisicoes = ttDesc(
    'Total de chamadas à API registradas pela sua organização nas últimas 24h, independente do resultado.'
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      <CardEstatisticaGlobal titulo={t('workspace.cockpit.status_integracao')}  valor={statusIntegracao}    variante={statusVariante} tooltip={tooltipStatusIntegracao} />
      <CardEstatisticaGlobal titulo={t('workspace.cockpit.taxa_sucesso_24h')}   valor={taxaSucessoLabel}    variante="primario"        tooltip={tooltipTaxaSucesso} />
      <CardEstatisticaGlobal titulo={t('workspace.cockpit.latencia_media_24h')} valor={latenciaMediaMs}     variante="padrao"          tooltip={tooltipLatencia} />
      <CardEstatisticaGlobal titulo={t('workspace.cockpit.produtos_em_uso')}    valor={produtosEmUsoLabel}  variante="sucesso"         tooltip={tooltipProdutos} />
      <CardEstatisticaGlobal titulo={t('workspace.cockpit.requisicoes_24h')}    valor={requisicoes24h}      variante="primario"        tooltip={tooltipRequisicoes} />
    </div>
  )
}

export default ApiCockpitKpiCards
