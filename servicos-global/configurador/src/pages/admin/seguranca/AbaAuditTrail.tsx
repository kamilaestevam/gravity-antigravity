import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { z } from 'zod'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'

import { TooltipGlobal } from '@nucleo/tooltip-global'
import { getAcoesExportacaoPadrao } from '../../../utils/export-helper'

// ─── Zod Schema (Mandamento 06) ────────────────────────────────────────────

const AuditEntrySchema = z.object({
  id: z.string(),
  id_organizacao: z.string().nullable(),
  tipo_ator: z.string(),
  id_ator: z.string(),
  nome_ator: z.string().nullable(),
  ip_ator: z.string().nullable(),
  modulo: z.string().nullable(),
  tipo_recurso: z.string().nullable(),
  id_recurso: z.string().nullable(),
  acao: z.string(),
  detalhe_acao: z.string().nullable(),
  estado_anterior: z.unknown(),
  estado_posterior: z.unknown(),
  status: z.string(),
  metadata_ator: z.unknown(),
  data_criacao: z.string(),
})

type AuditEntry = z.infer<typeof AuditEntrySchema>

const AuditTrailResponseSchema = z.object({
  data: z.array(AuditEntrySchema),
  paginacao: z.object({ total: z.number(), limite: z.number(), offset: z.number() }),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = '/api/v1/admin/eventos-seguranca'

function getStatusAcaoStyle(acao: string) {
  if (acao.includes('IMPERSONACAO') || acao.includes('IMPERSONATION')) return { background: '#7f1d1d', color: '#fca5a5' }
  if (acao.includes('PERMISSION') || acao.includes('ROLE')) return { background: '#78350f', color: '#fcd34d' }
  if (acao.includes('DELETE') || acao.includes('REMOVE')) return { background: '#991b1b', color: '#fecaca' }
  return { background: '#1e3a5f', color: '#93c5fd' }
}

// ─── Filtros rápidos ─────────────────────────────────────────────────────────

type FiltroRapido = 'TODOS' | 'IMPERSONACAO' | 'PERMISSAO' | 'ADMIN'

// ─── Tipos públicos ─────────────────────────────────────────────────────────

export interface AuditTrailStats {
  total: number
  totalImpersonacoes: number
  totalPermissoes: number
  totalAdmin: number
}

interface AbaAuditTrailProps {
  onStatsCarregados?: (stats: AuditTrailStats) => void
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function AbaAuditTrail({ onStatsCarregados }: AbaAuditTrailProps) {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const [dados, setDados] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('TODOS')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '50' })

      if (filtroRapido === 'IMPERSONACAO') params.set('acao', 'IMPERSONACAO')
      if (filtroRapido === 'PERMISSAO') params.set('acao', 'PERMISSION_CHANGED')
      if (filtroRapido === 'ADMIN') params.set('tipo_ator', 'ADMIN')

      const token = await getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_BASE}/audit-trail?${params.toString()}`, {
        credentials: 'include',
        headers,
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

      const raw = await res.json()
      const parsed = AuditTrailResponseSchema.parse(raw)
      setDados(parsed.data)
      setTotal(parsed.paginacao.total)
    } catch (err) {
      console.error('[AbaAuditTrail] Falha ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [filtroRapido, getToken])

  useEffect(() => { void loadData() }, [loadData])

  const totalImpersonacoes = dados.filter(d => d.acao.includes('IMPERSONACAO') || d.acao.includes('IMPERSONATION')).length
  const totalPermissoes = dados.filter(d => d.acao.includes('PERMISSION') || d.acao.includes('ROLE')).length
  const totalAdmin = dados.filter(d => d.tipo_ator === 'ADMIN' || d.tipo_ator === 'gravity_admin').length

  useEffect(() => {
    onStatsCarregados?.({ total, totalImpersonacoes, totalPermissoes, totalAdmin })
  }, [total, totalImpersonacoes, totalPermissoes, totalAdmin, onStatsCarregados])

  const colunas: TabelaGlobalColuna<AuditEntry>[] = [
    {
      key: 'data_criacao', label: 'Horário', tipo: 'texto', largura: '140px',
      tooltipTitulo: 'Horário', tooltipDescricao: 'Data e hora da ação registrada',
      render: (v) => new Date(v as string).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }),
    },
    {
      key: 'acao', label: 'Ação', tipo: 'texto', largura: '180px',
      tooltipTitulo: 'Ação', tooltipDescricao: 'Tipo de ação auditada no sistema',
      render: (v) => {
        const acao = v as string
        return (
          <span style={{ ...getStatusAcaoStyle(acao), padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
            {acao.replace(/_/g, ' ')}
          </span>
        )
      },
    },
    {
      key: 'tipo_ator', label: 'Tipo Ator', tipo: 'texto', largura: '100px',
      tooltipTitulo: 'Tipo de Ator', tooltipDescricao: 'Quem executou a ação: usuário, sistema, admin ou IA',
    },
    {
      key: 'nome_ator', label: 'Ator', tipo: 'texto', largura: '150px',
      tooltipTitulo: 'Ator', tooltipDescricao: 'Nome do usuário ou serviço que executou a ação',
      render: (v) => (v as string | null) ?? '-',
    },
    {
      key: 'tipo_recurso', label: 'Entidade', tipo: 'texto', largura: '120px',
      tooltipTitulo: 'Entidade', tooltipDescricao: 'Tipo de recurso afetado pela ação',
      render: (v) => (v as string | null) ?? '-',
    },
    {
      key: 'id_organizacao', label: 'Organização', tipo: 'texto', largura: '120px',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Organização onde a ação ocorreu',
      render: (v) => {
        const id = v as string | null
        return id ? <span title={id}>{id.slice(0, 8)}...</span> : '-'
      },
    },
    {
      key: 'detalhe_acao', label: 'Detalhe', tipo: 'texto',
      tooltipTitulo: 'Detalhe', tooltipDescricao: 'Descrição detalhada da ação realizada',
      render: (v) => {
        const desc = (v as string | null) ?? ''
        return <span title={desc}>{desc.slice(0, 80)}{desc.length > 80 ? '...' : ''}</span>
      },
    },
    {
      key: 'status', label: 'Status', tipo: 'texto', largura: '90px',
      tooltipTitulo: 'Status', tooltipDescricao: 'Resultado da ação: sucesso ou falha',
      render: (v) => {
        const st = v as string
        const cor = st === 'SUCESSO' ? '#34d399' : st === 'FALHA' ? '#f87171' : '#94a3b8'
        return <span style={{ color: cor, fontWeight: 600, fontSize: '0.75rem' }}>{st}</span>
      },
    },
    {
      key: 'ip_ator', label: 'IP', tipo: 'texto', largura: '110px',
      tooltipTitulo: 'IP', tooltipDescricao: 'Endereço IP de onde a ação foi executada',
      render: (v) => (v as string | null) ?? '-',
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {([
          { key: 'TODOS', label: 'Todos', desc: 'Exibir todos os registros de auditoria' },
          { key: 'IMPERSONACAO', label: '👤 Impersonações (F-03)', desc: 'Filtrar por acessos como outro usuário (impersonação)' },
          { key: 'PERMISSAO', label: '🔑 Mudanças Permissão (F-08)', desc: 'Filtrar por alterações de tipo_usuario' },
          { key: 'ADMIN', label: '🛡️ Ações Admin', desc: 'Filtrar por ações de gravity_admin' },
        ] as const).map(f => (
          <TooltipGlobal key={f.key} titulo={f.label.replace(/👤|🔑|🛡️/g, '').trim()} descricao={f.desc}>
            <button
              onClick={() => setFiltroRapido(f.key)}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600,
                border: filtroRapido === f.key ? '1px solid #10b981' : '1px solid var(--ws-border, #334155)',
                background: filtroRapido === f.key ? 'rgba(16,185,129,0.12)' : 'transparent',
                color: filtroRapido === f.key ? '#10b981' : 'var(--ws-muted, #94a3b8)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          </TooltipGlobal>
        ))}
      </div>

      <TabelaGlobal
        dados={dados}
        colunas={colunas}
        idKey="id"
        mensagemVazio={loading ? 'Carregando audit trail...' : 'Nenhum registro de auditoria encontrado'}
        acoesExportacao={getAcoesExportacaoPadrao(colunas, 'audit-trail', 'Audit Trail')}
      />
    </div>
  )
}
