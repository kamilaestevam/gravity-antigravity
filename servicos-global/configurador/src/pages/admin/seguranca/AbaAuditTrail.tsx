import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ClockCounterClockwise, UserCircle, ShieldStar, ArrowsLeftRight,
} from '@phosphor-icons/react'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { getAcoesExportacaoPadrao } from '../../../utils/export-helper'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AuditEntry {
  id: string
  id_organizacao: string | null
  tipo_ator: string
  id_ator: string
  nome_ator: string | null
  ip_ator: string | null
  modulo: string | null
  tipo_recurso: string | null
  id_recurso: string | null
  acao: string
  detalhe_acao: string | null
  estado_anterior: unknown
  estado_posterior: unknown
  status: string
  metadata_ator: unknown
  data_criacao: string
}

interface AuditTrailResponse {
  data: AuditEntry[]
  paginacao: { total: number; limite: number; offset: number }
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

function getStatusAcaoStyle(acao: string) {
  if (acao.includes('IMPERSONACAO') || acao.includes('IMPERSONATION')) return { background: '#7f1d1d', color: '#fca5a5' }
  if (acao.includes('PERMISSION') || acao.includes('ROLE')) return { background: '#78350f', color: '#fcd34d' }
  if (acao.includes('DELETE') || acao.includes('REMOVE')) return { background: '#991b1b', color: '#fecaca' }
  return { background: '#1e3a5f', color: '#93c5fd' }
}

// ─── Filtros rápidos ─────────────────────────────────────────────────────────

type FiltroRapido = 'TODOS' | 'IMPERSONACAO' | 'PERMISSAO' | 'ADMIN'

// ─── Componente ──────────────────────────────────────────────────────────────

export function AbaAuditTrail() {
  const { t } = useTranslation()
  const [dados, setDados] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('TODOS')
  const [filtroTipoAtor, setFiltroTipoAtor] = useState<string>('TODOS')
  const [filtroEntidade, setFiltroEntidade] = useState<string>('TODOS')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '50' })

      // Filtros rápidos (F-03, F-08)
      if (filtroRapido === 'IMPERSONACAO') params.set('acao', 'IMPERSONACAO')
      if (filtroRapido === 'PERMISSAO') params.set('acao', 'PERMISSION_CHANGED')
      if (filtroRapido === 'ADMIN') params.set('tipo_ator', 'ADMIN')

      if (filtroTipoAtor !== 'TODOS') params.set('tipo_ator', filtroTipoAtor)
      if (filtroEntidade !== 'TODOS') params.set('entidade', filtroEntidade)

      const res = await fetchJSON<AuditTrailResponse>(`/audit-trail?${params.toString()}`)
      setDados(res.data)
      setTotal(res.paginacao.total)
    } catch (err) {
      console.error('[AbaAuditTrail] Falha ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }, [filtroRapido, filtroTipoAtor, filtroEntidade])

  useEffect(() => { void loadData() }, [loadData])

  // Stats computados
  const totalImpersonacoes = dados.filter(d => d.acao.includes('IMPERSONACAO') || d.acao.includes('IMPERSONATION')).length
  const totalPermissoes = dados.filter(d => d.acao.includes('PERMISSION') || d.acao.includes('ROLE')).length
  const totalAdmin = dados.filter(d => d.tipo_ator === 'ADMIN' || d.tipo_ator === 'gravity_admin').length

  // Entidades únicas para filtro
  const entidadesUnicas = ['TODOS', ...new Set(dados.map(d => d.tipo_recurso).filter(Boolean) as string[])]

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
      {/* Stat Cards — F-01, F-03, F-08 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <TooltipGlobal titulo="Total Auditado" descricao="Quantidade total de registros de auditoria no período">
          <div><CardEstatisticaGlobal titulo="Total Auditado" valor={String(total)} icone={<ClockCounterClockwise weight="fill" size={20} />} variante="primario" /></div>
        </TooltipGlobal>
        <TooltipGlobal titulo="Impersonações" descricao="Vezes que um admin acessou o sistema como outro usuário">
          <div><CardEstatisticaGlobal titulo="Impersonações (F-03)" valor={String(totalImpersonacoes)} icone={<UserCircle weight="fill" size={20} />} variante={totalImpersonacoes > 0 ? 'aviso' : 'sucesso'} /></div>
        </TooltipGlobal>
        <TooltipGlobal titulo="Mudanças de Permissão" descricao="Alterações em tipo_usuario ou tipo_usuario_workspace">
          <div><CardEstatisticaGlobal titulo="Mudanças de Permissão (F-08)" valor={String(totalPermissoes)} icone={<ArrowsLeftRight weight="fill" size={20} />} variante={totalPermissoes > 0 ? 'aviso' : 'sucesso'} /></div>
        </TooltipGlobal>
        <TooltipGlobal titulo="Ações Admin" descricao="Ações executadas por gravity_admin ou ADMIN no painel">
          <div><CardEstatisticaGlobal titulo="Ações Admin" valor={String(totalAdmin)} icone={<ShieldStar weight="fill" size={20} />} variante="primario" /></div>
        </TooltipGlobal>
      </div>

      {/* Filtros rápidos — F-03 (Impersonação), F-08 (Permissões) */}
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

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <SelectGlobal
            valor={filtroTipoAtor}
            aoMudarValor={(v) => setFiltroTipoAtor(String(v ?? 'TODOS'))}
            opcoes={[
              { valor: 'TODOS', rotulo: 'Tipo ator: Todos' },
              { valor: 'USUARIO', rotulo: 'Usuário' },
              { valor: 'ADMIN', rotulo: 'Admin' },
              { valor: 'SYSTEM', rotulo: 'Sistema' },
              { valor: 'GABI_IA', rotulo: 'Gabi IA' },
            ]}
            placeholder="Tipo ator"
          />
          <SelectGlobal
            valor={filtroEntidade}
            aoMudarValor={(v) => setFiltroEntidade(String(v ?? 'TODOS'))}
            opcoes={entidadesUnicas.map(e => ({ valor: e, rotulo: e }))}
            placeholder="Entidade"
            buscavel
          />
        </div>
      </div>

      {/* Tabela */}
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
