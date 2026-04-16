import React, { useState, useEffect, useCallback } from 'react'
import { ClockCounterClockwise } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface LogItem {
  id: string
  created_at: string
  action: string
  action_detail: string | null
  resource_type: string
  resource_id: string | null
  actor_name: string | null
  actor_type: string | null
  status: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// ---------------------------------------------------------------------------
// Colunas
// ---------------------------------------------------------------------------

const colunas: TabelaGlobalColuna<LogItem>[] = [
  {
    chave: 'created_at',
    rotulo: 'Data/Hora',
    largura: '160px',
    renderizar: (row) => formatarData(row.created_at),
  },
  {
    chave: 'action',
    rotulo: 'Acao',
    largura: '140px',
  },
  {
    chave: 'resource_type',
    rotulo: 'Recurso',
    largura: '140px',
  },
  {
    chave: 'actor_name',
    rotulo: 'Usuario',
    largura: '180px',
    renderizar: (row) => row.actor_name ?? row.actor_type ?? '—',
  },
  {
    chave: 'action_detail',
    rotulo: 'Detalhes',
    renderizar: (row) => row.action_detail ?? '—',
  },
]

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function HistoricoOrganizacao() {
  const { t } = useTranslation()
  const { getToken } = useAuth()

  const [logs, setLogs] = useState<LogItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 25

  const fetchLogs = useCallback(async (pageNum: number) => {
    try {
      setCarregando(true)
      const token = await getToken()
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(limit),
      })

      const res = await fetch(`/api/v1/historico-organizacao?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        console.error('[HistoricoOrganizacao] Erro:', res.status)
        return
      }

      const data = await res.json()
      setLogs(data.logs ?? [])
      setTotal(data.total ?? 0)
      setHasMore(data.hasMore ?? false)
    } catch (err) {
      console.error('[HistoricoOrganizacao] Erro ao buscar logs:', err)
    } finally {
      setCarregando(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchLogs(page)
  }, [page, fetchLogs])

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="tabela"
      cabecalho={
        <CabecalhoGlobal
          icone={<ClockCounterClockwise weight="duotone" size={22} />}
          titulo={t('workspace.layout.historico-organizacao')}
          subtitulo="Registro de alteracoes na organizacao e workspaces"
        />
      }
    >
      <TabelaGlobal<LogItem>
        colunas={colunas}
        dados={logs}
        carregando={carregando}
        chaveId="id"
        semDados="Nenhum registro de historico encontrado"
      />

      {/* Paginacao simples */}
      {total > limit && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 0',
          color: 'var(--color-text-muted)',
          fontSize: '0.8125rem',
        }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--bg-elevated)',
              background: 'var(--bg-surface)',
              color: 'var(--color-text-secondary)',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Anterior
          </button>
          <span>
            Pagina {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={!hasMore && page >= Math.ceil(total / limit)}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--bg-elevated)',
              background: 'var(--bg-surface)',
              color: 'var(--color-text-secondary)',
              cursor: !hasMore && page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
              opacity: !hasMore && page >= Math.ceil(total / limit) ? 0.5 : 1,
            }}
          >
            Proxima
          </button>
        </div>
      )}
    </PaginaGlobal>
  )
}
