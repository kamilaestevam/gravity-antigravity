import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle, Warning, XCircle, Certificate, ShieldCheck,
  CaretDown, CaretRight, Lightning, Clock,
} from '@phosphor-icons/react'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

// ─── Tipos (espelhados do backend verificacao-owasp-service.ts) ─────────────

interface VerificacaoDetalhe {
  check: string
  passou: boolean
  detalhe: string
}

interface OwaspItem {
  id: string
  nome: string
  status: 'CONFORME' | 'PENDENTE' | 'FALHA'
  detalhe: string
  verificacoes: VerificacaoDetalhe[]
  ultima_verificacao: string
}

interface CertificadoItem {
  dominio: string
  tipo: string
  emitido_por: string
  status: 'VALIDO' | 'EXPIRANDO' | 'EXPIRADO' | 'ERRO'
  dias_restantes: number
  data_expiracao: string
}

interface OwaspResumo {
  conformes: number
  pendentes: number
  falhas: number
  total: number
  score: number
}

interface OwaspResponse {
  itens: OwaspItem[]
  resumo: OwaspResumo
  fonte: 'CACHE' | 'VERIFICACAO_REAL'
  cache_expira_em: string | null
}

interface ComplianceResponse {
  owasp: OwaspResponse
  certificados: CertificadoItem[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const API_BASE = '/api/v1/admin/eventos-seguranca'

async function getClerkBearerToken(): Promise<string | null> {
  try {
    const w = window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }
    return (await w.Clerk?.session?.getToken()) ?? null
  } catch { return null }
}

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getClerkBearerToken()
  const headers: Record<string, string> = { ...(options?.headers as Record<string, string> || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options, headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

function getOwaspStatusIcon(status: OwaspItem['status']) {
  switch (status) {
    case 'CONFORME': return <CheckCircle weight="fill" size={18} style={{ color: '#34d399' }} />
    case 'PENDENTE': return <Warning weight="fill" size={18} style={{ color: '#fbbf24' }} />
    case 'FALHA': return <XCircle weight="fill" size={18} style={{ color: '#f87171' }} />
  }
}

function getCertStatusColor(status: CertificadoItem['status']) {
  switch (status) {
    case 'VALIDO': return '#34d399'
    case 'EXPIRANDO': return '#fbbf24'
    case 'EXPIRADO': return '#f87171'
    case 'ERRO': return '#94a3b8'
  }
}

function certStatusTooltip(status: CertificadoItem['status']): string {
  switch (status) {
    case 'VALIDO': return 'Certificado válido e dentro do prazo'
    case 'EXPIRANDO': return 'Certificado expira em menos de 30 dias — renovar'
    case 'EXPIRADO': return 'Certificado expirado — site pode ficar inacessível'
    case 'ERRO': return 'Não foi possível verificar — domínio inacessível'
  }
}

function owaspStatusTooltip(status: OwaspItem['status']): string {
  switch (status) {
    case 'CONFORME': return 'Todas as verificações passaram para este item'
    case 'PENDENTE': return 'Algumas verificações ainda não foram implementadas'
    case 'FALHA': return 'Uma ou mais verificações falharam — requer ação'
  }
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function AbaCompliance() {
  const { t } = useTranslation()
  const [data, setData] = useState<ComplianceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<Record<string, boolean>>({})

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchJSON<ComplianceResponse>('/compliance')
      setData(res)
    } catch (err) {
      console.error('[AbaCompliance] Falha ao carregar:', err)
    } finally {
      setLoading(false)
  useEffect(() => { void loadData() }, [loadData])

  const toggleExpandir = (id: string) => {
    setExpandido(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resumo = data?.owasp.resumo
  const itens = data?.owasp.itens ?? []
  const certificados = data?.certificados ?? []
  const fonte = data?.owasp.fonte
  const cacheExpira = data?.owasp.cache_expira_em

  return (
    <div>
      {/* KPI Cards OWASP */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TooltipGlobal titulo="Score OWASP" descricao="Percentual de itens OWASP Top 10 em conformidade">
          <CardEstatisticaGlobal
            titulo="Score OWASP"
            valor={resumo ? `${resumo.score}%` : '...'}
            icone={<ShieldCheck weight="fill" size={20} />}
            variante={resumo && resumo.score >= 80 ? 'sucesso' : resumo && resumo.score >= 60 ? 'aviso' : 'perigo'}
          />
        </TooltipGlobal>
        <TooltipGlobal titulo="Conformes" descricao="Itens OWASP que passaram em todas as verificações">
          <CardEstatisticaGlobal
            titulo="Conformes"
            valor={String(resumo?.conformes ?? 0)}
            icone={<CheckCircle weight="fill" size={20} />}
            variante="sucesso"
          />
        </TooltipGlobal>
        <TooltipGlobal titulo="Pendentes" descricao="Itens com verificações parciais ou não implementadas">
          <CardEstatisticaGlobal
            titulo="Pendentes"
            valor={String(resumo?.pendentes ?? 0)}
            icone={<Warning weight="fill" size={20} />}
            variante={resumo && resumo.pendentes > 0 ? 'aviso' : 'sucesso'}
          />
        </TooltipGlobal>
        <TooltipGlobal titulo="Falhas" descricao="Itens com verificações que falharam — requer correção">
          <CardEstatisticaGlobal
            titulo="Falhas"
            valor={String(resumo?.falhas ?? 0)}
            icone={<XCircle weight="fill" size={20} />}
            variante={resumo && resumo.falhas > 0 ? 'perigo' : 'sucesso'}
          />
        </TooltipGlobal>
      </div>

      {/* Header com indicador de fonte */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TooltipGlobal titulo="OWASP Top 10" descricao="Checklist das 10 vulnerabilidades web mais críticas segundo a OWASP">
            <span style={{ cursor: 'help' }}>OWASP Top 10 — Verificação Dinâmica</span>
          </TooltipGlobal>
          {fonte && (
            <TooltipGlobal
              titulo={fonte === 'CACHE' ? 'Cache' : 'Verificação Real'}
              descricao={fonte === 'CACHE'
                ? `Resultado cacheado. Expira em ${cacheExpira ? new Date(cacheExpira).toLocaleTimeString('pt-BR') : '?'}`
                : 'Verificação executada agora contra o código e infraestrutura reais'
              }
            >
              <span style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
                background: fonte === 'CACHE' ? '#1e3a5f' : '#14532d',
                color: fonte === 'CACHE' ? '#93c5fd' : '#86efac',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}>
                {fonte === 'CACHE' ? <Clock size={10} /> : <Lightning size={10} />}
                {fonte === 'CACHE' ? 'CACHE' : 'REAL'}
              </span>
            </TooltipGlobal>
          )}
        </h3>
      </div>

      {/* Checklist OWASP Top 10 com verificações expansíveis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {loading && itens.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
            Executando verificações OWASP...
          </div>
        )}
        {itens.map((item) => {
          const isExpanded = expandido[item.id] ?? false
          const verificacoes = item.verificacoes ?? []
          const temVerificacoes = verificacoes.length > 0
          const checksPassed = verificacoes.filter(v => v.passou).length
          const checksTotal = verificacoes.length

          return (
            <div key={item.id}>
              {/* Linha principal do item OWASP */}
              <div
                onClick={() => temVerificacoes && toggleExpandir(item.id)}
                role={temVerificacoes ? 'button' : undefined}
                aria-expanded={temVerificacoes ? isExpanded : undefined}
                tabIndex={temVerificacoes ? 0 : undefined}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); temVerificacoes && toggleExpandir(item.id) } }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--ws-surface, #1e293b)', borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                  border: `1px solid ${item.status === 'FALHA' ? '#7f1d1d' : item.status === 'PENDENTE' ? '#78350f' : 'var(--ws-border, #334155)'}`,
                  borderBottom: isExpanded ? 'none' : undefined,
                  cursor: temVerificacoes ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
              >
                {/* Seta de expansão */}
                {temVerificacoes && (
                  <TooltipGlobal titulo="Expandir" descricao="Clique para ver as verificações detalhadas">
                    <div style={{ marginTop: '3px', flexShrink: 0, color: 'var(--ws-muted, #64748b)' }}>
                      {isExpanded ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                    </div>
                  </TooltipGlobal>
                )}

                <div style={{ marginTop: '2px', flexShrink: 0 }}>{getOwaspStatusIcon(item.status)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <TooltipGlobal titulo={`OWASP ${item.id}`} descricao={`Categoria ${item.id} do OWASP Top 10 — ${item.nome}`}>
                      <span style={{
                        padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                        background: '#1e3a5f', color: '#93c5fd', cursor: 'help',
                      }}>
                        {item.id}
                      </span>
                    </TooltipGlobal>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)' }}>
                      {item.nome}
                    </span>
                    {/* Badge de checks */}
                    {temVerificacoes && (
                      <TooltipGlobal titulo="Verificações" descricao={`${checksPassed} de ${checksTotal} verificações passaram`}>
                        <span style={{
                          padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'help',
                          background: checksPassed === checksTotal ? '#14532d' : '#78350f',
                          color: checksPassed === checksTotal ? '#86efac' : '#fcd34d',
                        }}>
                          {checksPassed}/{checksTotal} checks
                        </span>
                      </TooltipGlobal>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ws-muted, #94a3b8)', lineHeight: '1.4' }}>
                    {item.detalhe}
                  </div>
                </div>
                <TooltipGlobal titulo={item.status} descricao={owaspStatusTooltip(item.status)}>
                  <div style={{
                    padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'help',
                    background: item.status === 'CONFORME' ? '#14532d' : item.status === 'PENDENTE' ? '#78350f' : '#7f1d1d',
                    color: item.status === 'CONFORME' ? '#86efac' : item.status === 'PENDENTE' ? '#fcd34d' : '#fca5a5',
                    flexShrink: 0, alignSelf: 'center',
                  }}>
                    {item.status}
                  </div>
                </TooltipGlobal>
              </div>

              {/* Painel expansível com verificações detalhadas */}
              {isExpanded && temVerificacoes && (
                <div style={{
                  padding: '0.5rem 1rem 0.75rem',
                  background: 'var(--ws-base, #0f172a)',
                  borderRadius: '0 0 8px 8px',
                  border: `1px solid ${item.status === 'FALHA' ? '#7f1d1d' : item.status === 'PENDENTE' ? '#78350f' : 'var(--ws-border, #334155)'}`,
                  borderTop: '1px solid var(--ws-border, #334155)',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ws-muted, #64748b)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Verificações executadas
                  </div>
                  {verificacoes.map((check, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '4px',
                        background: check.passou ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)',
                        marginBottom: idx < verificacoes.length - 1 ? '0.35rem' : 0,
                      }}
                    >
                      <TooltipGlobal titulo={check.passou ? 'Passou' : 'Falhou'} descricao={check.passou ? 'Esta verificação passou com sucesso' : 'Esta verificação falhou — requer correção'}>
                        <div style={{ cursor: 'help' }}>
                          {check.passou
                            ? <CheckCircle weight="fill" size={14} style={{ color: '#34d399', marginTop: '1px', flexShrink: 0 }} />
                            : <XCircle weight="fill" size={14} style={{ color: '#f87171', marginTop: '1px', flexShrink: 0 }} />
                          }
                        </div>
                      </TooltipGlobal>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: check.passou ? '#34d399' : '#f87171' }}>
                          {check.check}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '1px', lineHeight: '1.3' }}>
                          {check.detalhe}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: '0.68rem', color: 'var(--ws-muted, #64748b)', marginTop: '0.5rem', textAlign: 'right' }}>
                    Verificado em {new Date(item.ultima_verificacao).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Certificados Digitais */}
      <div>
        <TooltipGlobal titulo="Certificados SSL/TLS" descricao="Monitoramento de validade dos certificados digitais dos domínios">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'help' }}>
            <Certificate weight="duotone" size={20} color="#6366f1" />
            Certificados Digitais (SSL/TLS)
          </h3>
        </TooltipGlobal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {certificados.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)' }}>
              Nenhum certificado monitorado
            </div>
          )}
          {certificados.map((cert, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1rem',
                background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
                border: `1px solid ${cert.dias_restantes < 30 ? '#7f1d1d' : 'var(--ws-border, #334155)'}`,
              }}
            >
              <Certificate weight="duotone" size={20} style={{ color: getCertStatusColor(cert.status), flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <TooltipGlobal titulo={cert.dominio} descricao={`Certificado ${cert.tipo} emitido por ${cert.emitido_por}`}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', cursor: 'help' }}>
                    {cert.dominio}
                  </div>
                </TooltipGlobal>
                <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '2px' }}>
                  {cert.tipo} — {cert.emitido_por} — Expira em {new Date(cert.data_expiracao).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <TooltipGlobal titulo="Dias restantes" descricao={`Faltam ${cert.dias_restantes} dias para este certificado expirar`}>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'help',
                    color: cert.dias_restantes > 60 ? '#34d399' : cert.dias_restantes > 30 ? '#fbbf24' : '#f87171',
                  }}>
                    {cert.dias_restantes}d
                  </span>
                </TooltipGlobal>
                <TooltipGlobal titulo={cert.status} descricao={certStatusTooltip(cert.status)}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'help',
                    background: cert.status === 'VALIDO' ? '#14532d' : cert.status === 'EXPIRANDO' ? '#78350f' : cert.status === 'ERRO' ? '#1e293b' : '#7f1d1d',
                    color: cert.status === 'VALIDO' ? '#86efac' : cert.status === 'EXPIRANDO' ? '#fcd34d' : cert.status === 'ERRO' ? '#94a3b8' : '#fca5a5',
                  }}>
                    {cert.status}
                  </span>
                </TooltipGlobal>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS para animação do spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
