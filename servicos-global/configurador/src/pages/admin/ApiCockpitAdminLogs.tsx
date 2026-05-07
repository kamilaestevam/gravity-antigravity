import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ListBullets, ArrowClockwise } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitAdminTabs } from './ApiCockpitAdminTabs'
import { ApiCockpitAdminKpis } from './ApiCockpitAdminKpis'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const logRequisicaoApiSchema = z.object({
  id_log_requisicao_api:                   z.string(),
  id_organizacao:                   z.string(),
  id_produto_gravity:               z.string(),
  id_usuario:                       z.string().nullable(),
  id_correlacao:                    z.string().nullable(),
  endpoint_log_requisicao_api:             z.string(),
  metodo_http_log_requisicao_api:          z.string(),
  codigo_resposta_http_log_requisicao_api: z.number(),
  latencia_ms_log_requisicao_api:          z.number(),
  data_criacao_log_requisicao_api:         z.string(),
  data_log_requisicao_api:                 z.string(),
  hora_log_requisicao_api:                 z.string(),
  resultado_log_requisicao_api:            z.enum(['SUCESSO', 'ERRO_CLIENTE', 'ERRO_SERVIDOR']),
})

const logsResponseSchema = z.object({
  logs: z.array(logRequisicaoApiSchema),
  paginacao: z.object({
    pagina:  z.number(),
    limite:  z.number(),
    total:   z.number(),
    paginas: z.number(),
  }),
  error: z.string().optional(),
})

type LogRequisicaoApi = z.infer<typeof logRequisicaoApiSchema>

export function ApiCockpitAdminLogs() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const [logs, setLogs] = useState<LogRequisicaoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setErro(null)
      const res = await requisicaoAutenticada(
        '/api/v1/api-cockpit/admin/log-requisicao-api?limite=100',
        { signal },
      )
      if (!res.ok) throw new Error(`log-requisicao-api ${res.status} ${res.statusText}`)
      const raw = await res.json()
      if (raw.error) throw new Error(raw.error)
      const parsed = logsResponseSchema.safeParse(raw)
      if (!parsed.success) throw new Error('Payload de log-requisicao-api invalido')
      setLogs(parsed.data.logs)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      setErro(msg)
      addNotification({
        type: 'error',
        message: `Falha ao carregar logs globais: ${msg}`,
      })
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    const ctrl = new AbortController()
    void carregar(ctrl.signal)
    return () => ctrl.abort()
  }, [carregar])

  const colunas: TabelaGlobalColuna<LogRequisicaoApi>[] = [
    {
      key: 'data_log_requisicao_api',
      label: t('admin.api-cockpit.tabela.data'),
      tipo: 'texto',
      tooltipTitulo: 'Data',
      tooltipDescricao: 'Data em que a requisição foi registrada',
    },
    {
      key: 'hora_log_requisicao_api',
      label: t('admin.api-cockpit.tabela.hora'),
      tipo: 'texto',
      tooltipTitulo: 'Hora',
      tooltipDescricao: 'Hora exata em que a requisição ocorreu',
    },
    {
      key: 'id_organizacao',
      label: t('admin.api-cockpit.tabela.organizacao'),
      tipo: 'texto',
      tooltipTitulo: 'Organização',
      tooltipDescricao: 'Empresa que originou esta chamada à API',
      render: (val) => <code style={{ fontSize: '0.75rem' }}>{val as string}</code>,
    },
    {
      key: 'metodo_http_log_requisicao_api',
      label: t('admin.api-cockpit.tabela.metodo'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Método',
      tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE',
      render: (val) => <strong style={{ color: 'var(--brand-primary)' }}>{val as string}</strong>,
    },
    {
      key: 'endpoint_log_requisicao_api',
      label: t('admin.api-cockpit.tabela.endpoint'),
      tipo: 'texto',
      tooltipTitulo: 'Endpoint',
      tooltipDescricao: 'Rota da API que recebeu a chamada',
      render: (val) => <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{val as string}</code>,
    },
    {
      key: 'codigo_resposta_http_log_requisicao_api',
      label: t('admin.api-cockpit.tabela.status'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Status HTTP',
      tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso',
      render: (val) => (
        <code style={{ color: (val as number) < 400 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
          {val as number}
        </code>
      ),
    },
    {
      key: 'latencia_ms_log_requisicao_api',
      label: t('admin.api-cockpit.tabela.latencia'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Latência',
      tooltipDescricao: 'Tempo total de processamento em milissegundos',
      render: (val) => `${val as number}ms`,
    },
    {
      key: 'id_produto_gravity',
      label: t('admin.api-cockpit.tabela.produto'),
      tipo: 'texto',
      tooltipTitulo: 'Produto',
      tooltipDescricao: 'Produto Gravity que realizou a chamada',
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<ListBullets weight="duotone" size={24} />}
          titulo={t('admin.api-cockpit.titulo')}
          subtitulo={t('admin.api-cockpit.subtitulo')}
        />
      }
      stats={<ApiCockpitAdminKpis />}
      toolbar={
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.25rem 0 0.5rem',  // respiro vs stats acima e conteudo abaixo (padrao cga-tabs)
        }}>
          <ApiCockpitAdminTabs />
          <BotaoGlobal
            variante="secundario"
            onClick={() => void carregar()}
            icone={<ArrowClockwise size={16} />}
            aria-label="Atualizar logs globais"
          >
            Atualizar
          </BotaoGlobal>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {erro && (
          <div role="alert" style={{
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171', fontSize: '0.875rem',
          }}>
            {erro}
          </div>
        )}

        <TabelaGlobal
          id="admin-logs-globais"
          colunas={colunas}
          dados={logs}
          acoesExportacao={getAcoesExportacaoPadrao(colunas, 'logs-globais', 'Logs Globais (Admin)')}
          mensagemVazio={loading ? 'Carregando logs globais...' : t('admin.api-cockpit.vazio.sem_trafego')}
        />
      </div>
    </PaginaGlobal>
  )
}

export default ApiCockpitAdminLogs
