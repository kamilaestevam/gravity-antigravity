import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Database, ShieldCheck, ShieldWarning, ArrowsClockwise, Wall,
} from '@phosphor-icons/react'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { getAcoesExportacaoPadrao } from '../../../utils/export-helper'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface CrossOrgAttempt {
  id: string
  id_organizacao: string | null
  id_ator: string
  tipo_ator: string
  acao: string
  severidade: string
  status: string
  descricao: string | null
  ip: string | null
  endpoint: string | null
  data_criacao: string
}

interface IsolamentoMetrics {
  schemas_ativos: number
  tentativas_cross_org_24h: number
  sdk_status: 'ATIVO' | 'INATIVO'
  pool_status: 'SAUDAVEL' | 'DEGRADADO' | 'CRITICO'
  search_path_resets: 'AUTOMATICO' | 'MANUAL'
}

interface IsolamentoResponse {
  tentativas: CrossOrgAttempt[]
  metricas: IsolamentoMetrics
  total_tentativas: number
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

function statusColor(status: string): string {
  switch (status) {
    case 'ATIVO': case 'SAUDAVEL': case 'AUTOMATICO': return '#34d399'
    case 'DEGRADADO': return '#fbbf24'
    case 'INATIVO': case 'CRITICO': case 'MANUAL': return '#f87171'
    default: return '#94a3b8'
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function AbaIsolamento() {
  const { t } = useTranslation()
  const [data, setData] = useState<IsolamentoResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchJSON<IsolamentoResponse>('/isolamento')
      setData(res)
    } catch (err) {
      console.error('[AbaIsolamento] Falha ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const metricas = data?.metricas
  const tentativas = data?.tentativas ?? []

  const colunasTentativas: TabelaGlobalColuna<CrossOrgAttempt>[] = [
    {
      key: 'data_criacao', label: 'Horário', tipo: 'texto', largura: '140px',
      tooltipTitulo: 'Horário', tooltipDescricao: 'Quando a tentativa de acesso cross-organização ocorreu',
      render: (v) => new Date(v as string).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }),
    },
    {
      key: 'severidade', label: 'Severidade', tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Severidade', tooltipDescricao: 'Nível de criticidade da tentativa',
      render: (v) => {
        const sev = v as string
        const bg = sev === 'CRITICAL' ? '#991b1b' : sev === 'WARNING' ? '#92400e' : '#1e3a5f'
        const color = sev === 'CRITICAL' ? '#fecaca' : sev === 'WARNING' ? '#fde68a' : '#93c5fd'
        return <span style={{ background: bg, color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{sev}</span>
      },
    },
    {
      key: 'acao', label: 'Ação', tipo: 'texto', largura: '200px',
      tooltipTitulo: 'Ação', tooltipDescricao: 'Tipo de tentativa de acesso cross-organização',
    },
    {
      key: 'id_organizacao', label: 'Org Origem', tipo: 'texto', largura: '120px',
      tooltipTitulo: 'Organização Origem', tooltipDescricao: 'Organização de onde partiu a tentativa',
      render: (v) => {
        const id = v as string | null
        return id ? <span title={id}>{id.slice(0, 8)}...</span> : '-'
      },
    },
    {
      key: 'id_ator', label: 'Ator', tipo: 'texto', largura: '120px',
      tooltipTitulo: 'Ator', tooltipDescricao: 'Usuário ou serviço que tentou o acesso',
      render: (v) => {
        const id = v as string
        return <span title={id}>{id.slice(0, 8)}...</span>
      },
    },
    {
      key: 'status', label: 'Resultado', tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Resultado', tooltipDescricao: 'Se a tentativa foi bloqueada ou detectada',
      render: (v) => {
        const st = v as string
        const cor = st === 'BLOCKED' ? '#f87171' : st === 'DETECTED' ? '#fbbf24' : '#34d399'
        return <span style={{ color: cor, fontWeight: 600, fontSize: '0.75rem' }}>{st}</span>
      },
    },
    {
      key: 'endpoint', label: 'Endpoint', tipo: 'texto',
      tooltipTitulo: 'Endpoint', tooltipDescricao: 'Rota alvo da tentativa de acesso',
      render: (v) => (v as string | null) ?? '-',
    },
    {
      key: 'ip', label: 'IP', tipo: 'texto', largura: '110px',
      tooltipTitulo: 'IP', tooltipDescricao: 'Endereço de rede de onde partiu a tentativa',
      render: (v) => (v as string | null) ?? '-',
    },
  ]

  return (
    <div>
      {/* F-05: Dashboard de Isolamento de Tenant */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <CardEstatisticaGlobal
          titulo="Schemas Ativos"
          valor={metricas ? String(metricas.schemas_ativos) : '...'}
          icone={<Database weight="fill" size={20} />}
          variante="primario"
        />
        <CardEstatisticaGlobal
          titulo="Tentativas Cross-Org 24h"
          valor={metricas ? String(metricas.tentativas_cross_org_24h) : '...'}
          icone={<Wall weight="fill" size={20} />}
          variante={metricas && metricas.tentativas_cross_org_24h > 0 ? 'perigo' : 'sucesso'}
        />
        <CardEstatisticaGlobal
          titulo="SDK Resolver"
          valor={metricas?.sdk_status ?? '...'}
          icone={<ShieldCheck weight="fill" size={20} />}
          variante="sucesso"
        />
        <CardEstatisticaGlobal
          titulo="Pool PgBouncer"
          valor={metricas?.pool_status ?? '...'}
          icone={<ArrowsClockwise weight="fill" size={20} />}
          variante="sucesso"
        />
        <CardEstatisticaGlobal
          titulo="Search Path Reset"
          valor={metricas?.search_path_resets ?? '...'}
          icone={<ShieldWarning weight="fill" size={20} />}
          variante="sucesso"
        />
      </div>

      {/* Indicadores visuais de saúde */}
      <div style={{
        padding: '0.75rem 1rem', marginBottom: '1rem',
        background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
        border: '1px solid var(--ws-border, #334155)',
        fontSize: '0.82rem', color: 'var(--ws-muted, #94a3b8)',
      }}>
        <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>Arquitetura de Isolamento:</strong>{' '}
        Schema-per-Organização via <code style={{ color: '#10b981' }}>@gravity/resolver-organizacao</code> |{' '}
        <code>SET LOCAL search_path</code> dentro de <code>$transaction</code> |{' '}
        Pool PgBouncer transaction mode |{' '}
        <span style={{ color: statusColor(metricas?.sdk_status ?? ''), fontWeight: 600 }}>
          SDK {metricas?.sdk_status ?? 'verificando...'}
        </span>
      </div>

      {/* F-02: Tabela de tentativas cross-org */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', margin: '0 0 0.5rem 0' }}>
          Tentativas de Acesso Cross-Organização (últimas 24h)
        </h3>
      </div>
      <TabelaGlobal
        dados={tentativas}
        colunas={colunasTentativas}
        idKey="id"
        mensagemVazio={loading ? 'Carregando dados de isolamento...' : 'Nenhuma tentativa de acesso cross-organização nas últimas 24h ✅'}
        acoesExportacao={getAcoesExportacaoPadrao(colunasTentativas, 'isolamento-cross-org', 'Isolamento — Cross-Org')}
      />
    </div>
  )
}
