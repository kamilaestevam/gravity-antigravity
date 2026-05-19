import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HardDrives, Timer, CloudArrowUp, CheckCircle, Warning, ArrowsClockwise,
} from '@phosphor-icons/react'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface BackupInfo {
  data: string
  tipo: string
  tamanho_mb: number
  status: string
}

interface MetaStatus {
  meta_horas?: number
  atual_horas?: number
  meta_minutos?: number
  estimado_minutos?: number
  status: 'DENTRO_META' | 'ALERTA'
}

interface TesteRestauracao {
  data: string
  status: string
  duracao_minutos: number
}

interface CenarioDR {
  nome: string
  status: 'COBERTO' | 'PARCIAL' | 'NAO_COBERTO'
  ultimo_teste: string | null
}

interface CamadaLatencia {
  nome: string
  budget_ms: number
  atual_ms: number
  status: 'OK' | 'ALERTA'
}

interface InfraResponse {
  backup: {
    ultimo_backup: BackupInfo
    rpo: MetaStatus
    rto: MetaStatus
    ultimo_teste_restauracao: TesteRestauracao
    cenarios_dr: CenarioDR[]
  }
  latencia: {
    budget_total_ms: number
    camadas: CamadaLatencia[]
    p50_ms: number
    p95_ms: number
    p99_ms: number
    sla_uptime: {
      meta_percentual: number
      atual_percentual: number
      status: 'DENTRO_META' | 'ALERTA'
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = '/api/v1/admin/eventos-seguranca'

async function getClerkBearerToken(): Promise<string | null> {
  try {
    const w = window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }
    return (await w.Clerk?.session?.getToken()) ?? null
  } catch { return null }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const token = await getClerkBearerToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

function drStatusColor(status: CenarioDR['status']): string {
  switch (status) {
    case 'COBERTO': return '#34d399'
    case 'PARCIAL': return '#fbbf24'
    case 'NAO_COBERTO': return '#f87171'
  }
}

function drStatusBg(status: CenarioDR['status']): string {
  switch (status) {
    case 'COBERTO': return '#14532d'
    case 'PARCIAL': return '#78350f'
    case 'NAO_COBERTO': return '#7f1d1d'
  }
}

function drStatusTooltip(status: CenarioDR['status']): string {
  switch (status) {
    case 'COBERTO': return 'Plano de recuperação testado e validado'
    case 'PARCIAL': return 'Plano existe mas não foi testado por completo'
    case 'NAO_COBERTO': return 'Sem plano de recuperação para este cenário'
  }
}

const TOOLTIP_CAMADAS: Record<string, string> = {
  'Rede (DNS + TCP + TLS)': 'Tempo de resolução DNS, handshake TCP e negociação TLS',
  'Autenticação (JWT)': 'Validação do token JWT pelo Clerk e extração de claims',
  'Middleware (Zod + RBAC)': 'Validação do payload via Zod e verificação de permissões',
  'Query (Prisma + DB)': 'Execução da query no banco via Prisma (inclui rede até o DB)',
  'Serialização (JSON)': 'Transformação do resultado em JSON para envio ao client',
  'TOTAL': 'Soma de todas as camadas — deve ficar abaixo de 200ms',
}

// ─── Barra de progresso visual ───────────────────────────────────────────────

function BarraProgresso({ atual, budget, label }: { atual: number; budget: number; label: string }) {
  const pct = Math.min((atual / budget) * 100, 100)
  const cor = pct > 90 ? '#f87171' : pct > 70 ? '#fbbf24' : '#34d399'
  const tooltipDesc = TOOLTIP_CAMADAS[label] ?? `Budget: ${budget}ms para esta camada`
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
        <TooltipGlobal titulo={label} descricao={tooltipDesc}>
          <span style={{ color: 'var(--ws-text, #f1f5f9)', fontWeight: 500, cursor: 'help' }}>{label}</span>
        </TooltipGlobal>
        <TooltipGlobal titulo="Uso do budget" descricao={`${Math.round(pct)}% do budget consumido (${atual}ms de ${budget}ms)`}>
          <span style={{ color: cor, fontWeight: 600, cursor: 'help' }}>{atual}ms / {budget}ms</span>
        </TooltipGlobal>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--ws-surface, #1e293b)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: cor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function AbaInfra() {
  const { t } = useTranslation()
  const [data, setData] = useState<InfraResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchJSON<InfraResponse>('/infra')
      setData(res)
    } catch (err) {
      console.error('[AbaInfra] Falha ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const backup = data?.backup
  const latencia = data?.latencia

  if (loading && !data) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>Carregando dados de infraestrutura...</div>
  }

  return (
    <div>
      {/* F-11: Backup & DR Status */}
      <TooltipGlobal titulo="Backup & DR" descricao="Status dos backups automáticos e planos de recuperação de desastres">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'help' }}>
          <HardDrives weight="duotone" size={20} color="#6366f1" />
          Backup & Disaster Recovery
        </h3>
      </TooltipGlobal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <TooltipGlobal titulo="Último Backup" descricao="Data e hora do backup automático mais recente do banco de dados">
          <div>
            <CardEstatisticaGlobal
              titulo="Último Backup"
              valor={backup ? new Date(backup.ultimo_backup.data).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '...'}
              icone={<CloudArrowUp weight="fill" size={20} />}
              variante={backup?.ultimo_backup.status === 'SUCESSO' ? 'sucesso' : 'perigo'}
            />
          </div>
        </TooltipGlobal>
        <TooltipGlobal titulo="RPO" descricao="Recovery Point Objective: máximo de dados que pode ser perdido em caso de falha">
          <div>
            <CardEstatisticaGlobal
              titulo="RPO (Meta: 24h)"
              valor={backup ? `${backup.rpo.atual_horas}h` : '...'}
              icone={<Timer weight="fill" size={20} />}
              variante={backup?.rpo.status === 'DENTRO_META' ? 'sucesso' : 'perigo'}
            />
          </div>
        </TooltipGlobal>
        <TooltipGlobal titulo="RTO" descricao="Recovery Time Objective: tempo máximo para restaurar o sistema após uma falha">
          <div>
            <CardEstatisticaGlobal
              titulo="RTO (Meta: 60min)"
              valor={backup ? `${backup.rto.estimado_minutos}min` : '...'}
              icone={<ArrowsClockwise weight="fill" size={20} />}
              variante={backup?.rto.status === 'DENTRO_META' ? 'sucesso' : 'perigo'}
            />
          </div>
        </TooltipGlobal>
        <TooltipGlobal titulo="Teste de Restauração" descricao="Último teste real de restauração do backup — valida que o backup funciona">
          <div>
            <CardEstatisticaGlobal
              titulo="Último Teste Restauração"
              valor={backup ? new Date(backup.ultimo_teste_restauracao.data).toLocaleDateString('pt-BR') : '...'}
              icone={<CheckCircle weight="fill" size={20} />}
              variante={backup?.ultimo_teste_restauracao.status === 'SUCESSO' ? 'sucesso' : 'aviso'}
            />
          </div>
        </TooltipGlobal>
      </div>

      {/* Cenários de DR */}
      <div style={{
        padding: '0.75rem 1rem', marginBottom: '1.5rem',
        background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
        border: '1px solid var(--ws-border, #334155)',
      }}>
        <TooltipGlobal titulo="Cenários de DR" descricao="Planos de recuperação para diferentes tipos de desastre">
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', marginBottom: '0.5rem', cursor: 'help' }}>
            Cenários de Disaster Recovery
          </div>
        </TooltipGlobal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {(backup?.cenarios_dr ?? []).map((cenario, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.75rem', borderRadius: '6px',
                background: 'var(--ws-base, #0f172a)',
                border: '1px solid var(--ws-border, #334155)',
              }}
            >
              <TooltipGlobal titulo={cenario.nome} descricao={`Cenário: o que acontece se ${cenario.nome.toLowerCase()} ocorrer`}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ws-text, #f1f5f9)', cursor: 'help' }}>{cenario.nome}</span>
              </TooltipGlobal>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {cenario.ultimo_teste && (
                  <TooltipGlobal titulo="Último teste" descricao="Data em que este cenário foi simulado pela última vez">
                    <span style={{ fontSize: '0.7rem', color: 'var(--ws-muted, #94a3b8)', cursor: 'help' }}>
                      Teste: {new Date(cenario.ultimo_teste).toLocaleDateString('pt-BR')}
                    </span>
                  </TooltipGlobal>
                )}
                <TooltipGlobal titulo={cenario.status} descricao={drStatusTooltip(cenario.status)}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, cursor: 'help',
                    background: drStatusBg(cenario.status),
                    color: drStatusColor(cenario.status),
                  }}>
                    {cenario.status}
                  </span>
                </TooltipGlobal>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* F-12: Métricas de Latência por Camada / SLA */}
      <TooltipGlobal titulo="Budget de Latência" descricao="Cada camada do request tem um tempo máximo permitido (budget)">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'help' }}>
          <Timer weight="duotone" size={20} color="#6366f1" />
          Budget de Latência por Camada (SLA: ≤200ms p95)
        </h3>
      </TooltipGlobal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', marginBottom: '1rem' }}>
        {/* Barras de progresso por camada */}
        <div style={{
          padding: '1rem',
          background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
          border: '1px solid var(--ws-border, #334155)',
        }}>
          {(latencia?.camadas ?? []).map((camada, idx) => (
            <BarraProgresso key={idx} atual={camada.atual_ms} budget={camada.budget_ms} label={camada.nome} />
          ))}
          <div style={{ borderTop: '1px solid var(--ws-border, #334155)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <BarraProgresso
              atual={latencia ? latencia.camadas.reduce((s, c) => s + c.atual_ms, 0) : 0}
              budget={latencia?.budget_total_ms ?? 200}
              label="TOTAL"
            />
          </div>
        </div>

        {/* Painel lateral: percentis + SLA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Percentis */}
          <div style={{
            padding: '1rem',
            background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
          }}>
            <TooltipGlobal titulo="Percentis" descricao="Distribuição real da latência: p50=metade, p95=quase todos, p99=pior caso">
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ws-muted, #94a3b8)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'help' }}>
                Percentis de Latência
              </div>
            </TooltipGlobal>
            {[
              { label: 'p50', valor: latencia?.p50_ms ?? 0, meta: 100, desc: 'Metade dos requests completam neste tempo ou menos' },
              { label: 'p95', valor: latencia?.p95_ms ?? 0, meta: 200, desc: '95% dos requests completam neste tempo — é a métrica do SLA' },
              { label: 'p99', valor: latencia?.p99_ms ?? 0, meta: 500, desc: '99% dos requests — indica o pior caso típico' },
            ].map((p) => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--ws-border, #334155)' }}>
                <TooltipGlobal titulo={p.label} descricao={p.desc}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', cursor: 'help' }}>{p.label}</span>
                </TooltipGlobal>
                <TooltipGlobal titulo={`${p.valor}ms`} descricao={`Meta: até ${p.meta}ms — ${p.valor <= p.meta ? 'dentro da meta' : 'acima da meta!'}`}>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 700, cursor: 'help',
                    color: p.valor > p.meta ? '#f87171' : p.valor > p.meta * 0.8 ? '#fbbf24' : '#34d399',
                  }}>
                    {p.valor}ms
                    <span style={{ fontSize: '0.68rem', color: 'var(--ws-muted)', fontWeight: 400, marginLeft: '4px' }}>/ {p.meta}ms</span>
                  </span>
                </TooltipGlobal>
              </div>
            ))}
          </div>

          {/* SLA Uptime */}
          <div style={{
            padding: '1rem',
            background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
            border: `1px solid ${latencia?.sla_uptime.status === 'DENTRO_META' ? 'var(--ws-border, #334155)' : '#7f1d1d'}`,
          }}>
            <TooltipGlobal titulo="SLA Uptime" descricao="Percentual do tempo que o sistema ficou disponível (meta: 99.9%)">
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ws-muted, #94a3b8)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'help' }}>
                SLA Uptime
              </div>
            </TooltipGlobal>
            <TooltipGlobal titulo="Uptime atual" descricao={`O sistema esteve disponível ${latencia?.sla_uptime.atual_percentual ?? 0}% do tempo`}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: latencia?.sla_uptime.status === 'DENTRO_META' ? '#34d399' : '#f87171', cursor: 'help' }}>
                {latencia?.sla_uptime.atual_percentual ?? 0}%
              </div>
            </TooltipGlobal>
            <TooltipGlobal titulo="Meta SLA" descricao="Percentual mínimo de disponibilidade prometido no acordo de nível de serviço">
              <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '2px', cursor: 'help' }}>
                Meta: {latencia?.sla_uptime.meta_percentual ?? 99.9}%
              </div>
            </TooltipGlobal>
            <TooltipGlobal
              titulo={latencia?.sla_uptime.status === 'DENTRO_META' ? 'Dentro da meta' : 'Alerta'}
              descricao={latencia?.sla_uptime.status === 'DENTRO_META' ? 'Uptime atual está acima da meta definida no SLA' : 'Uptime abaixo da meta — investigar causa da indisponibilidade'}
            >
              <div style={{
                marginTop: '0.5rem', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-block', cursor: 'help',
                background: latencia?.sla_uptime.status === 'DENTRO_META' ? '#14532d' : '#7f1d1d',
                color: latencia?.sla_uptime.status === 'DENTRO_META' ? '#86efac' : '#fca5a5',
              }}>
                {latencia?.sla_uptime.status ?? 'VERIFICANDO'}
              </div>
            </TooltipGlobal>
          </div>
        </div>
      </div>
    </div>
  )
}
