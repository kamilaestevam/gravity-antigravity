import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { ClockCounterClockwise } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'

// ---------------------------------------------------------------------------
// Contrato — mantido em sincronia com a ACL do backend
// servicos-global/configurador/server/routes/historico-organizacao.ts
// ---------------------------------------------------------------------------

const historicoLogSchema = z.object({
  id:           z.string(),
  data_criacao: z.string(),
  acao:         z.string(),
  detalhe_acao: z.string().nullable(),
  tipo_recurso: z.string(),
  id_recurso:   z.string().nullable(),
  nome_ator:    z.string().nullable(),
  tipo_ator:    z.string().nullable(),
  status:       z.string().nullable(),
})

const historicoResponseSchema = z.object({
  page:       z.number(),
  limit:      z.number(),
  logs:       z.array(historicoLogSchema),
  total:      z.number(),
  hasMore:    z.boolean(),
  nextCursor: z.string().nullable().optional(),
})

type HistoricoLog = z.infer<typeof historicoLogSchema>

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

const colunas: TabelaGlobalColuna<HistoricoLog>[] = [
  {
    chave: 'data_criacao',
    rotulo: 'Data/Hora',
    largura: '160px',
    renderizar: (row) => formatarData(row.data_criacao),
  },
  {
    chave: 'acao',
    rotulo: 'Ação',
    largura: '140px',
  },
  {
    chave: 'tipo_recurso',
    rotulo: 'Recurso',
    largura: '140px',
  },
  {
    chave: 'nome_ator',
    rotulo: 'Usuário',
    largura: '180px',
    renderizar: (row) => row.nome_ator ?? row.tipo_ator ?? '—',
  },
  {
    chave: 'detalhe_acao',
    rotulo: 'Detalhes',
    renderizar: (row) => row.detalhe_acao ?? '—',
  },
]

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function HistoricoOrganizacao() {
  const { t } = useTranslation()
  const { getToken } = useAuth()

  const [logs, setLogs] = useState<HistoricoLog[]>([])
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
        console.warn('[HistoricoOrganizacao] resposta não-ok', res.status)
        return
      }

      const raw = await res.json()
      const parsed = historicoResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[HistoricoOrganizacao] payload fora do contrato', parsed.error.issues, raw)
        return
      }
      setLogs(parsed.data.logs)
      setTotal(parsed.data.total)
      setHasMore(parsed.data.hasMore)
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
          subtitulo="Registro de alterações na organização e workspaces"
        />
      }
    >
      <TabelaGlobal<HistoricoLog>
        colunas={colunas}
        dados={logs}
        carregando={carregando}
        chaveId="id"
        mensagemSemFiltro="Nenhum registro de histórico encontrado"
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
