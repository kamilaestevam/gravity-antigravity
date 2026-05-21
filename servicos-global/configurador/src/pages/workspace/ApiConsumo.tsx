import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Pulse, ArrowClockwise } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitTabs } from './ApiCockpitTabs'
import { ApiCockpitKpiCards } from './ApiCockpitKpiCards'

// ─── Schemas Zod (Mandamento 06/09) ──────────────────────────────────────

const resultadoLogRequisicaoApiEnum = z.enum(['SUCESSO', 'ERRO_CLIENTE', 'ERRO_SERVIDOR'])

const logRequisicaoApiSchema = z.object({
  id_log_requisicao_api:                   z.string(),
  id_organizacao:                   z.string(),
  id_produto_gravity:               z.string().nullable().optional(),
  id_usuario:                       z.string().nullable().optional(),
  id_correlacao:                    z.string().nullable().optional(),
  endpoint_log_requisicao_api:             z.string(),
  metodo_http_log_requisicao_api:          z.string(),
  codigo_resposta_http_log_requisicao_api: z.number(),
  latencia_ms_log_requisicao_api:          z.number(),
  data_criacao_log_requisicao_api:         z.string(),
  data_log_requisicao_api:                 z.string().optional(),
  hora_log_requisicao_api:                 z.string().optional(),
  resultado_log_requisicao_api:            resultadoLogRequisicaoApiEnum,
})

const paginacaoSchema = z.object({
  pagina:  z.number(),
  limite:  z.number(),
  total:   z.number(),
  paginas: z.number(),
})

const logRequisicaoApiResponseSchema = z.object({
  logs:      z.array(logRequisicaoApiSchema),
  paginacao: paginacaoSchema.optional(),
  error:     z.string().optional(),
})

type LogRequisicaoApi = z.infer<typeof logRequisicaoApiSchema>
type Paginacao = z.infer<typeof paginacaoSchema>

export function ApiConsumo() {
  const [logs, setLogs] = useState<LogRequisicaoApi[]>([])
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [pagina, setPagina] = useState(1)
  const [limite] = useState(50)

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      setErro(null)
      const params = new URLSearchParams()
      params.set('pagina', String(pagina))
      params.set('limite', String(limite))

      const res = await requisicaoAutenticada(`/api/v1/api-cockpit/log-requisicao-api?${params}`)
      if (!res.ok) throw new Error(`Falha ao carregar logs: ${res.status}`)
      const raw = await res.json()
      const parsed = logRequisicaoApiResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[ApiConsumo] payload invalido', parsed.error)
        setLogs([])
        setPaginacao(null)
        return
      }
      if (parsed.data.error) throw new Error(parsed.data.error)
      setLogs(parsed.data.logs)
      setPaginacao(parsed.data.paginacao ?? null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha desconhecida')
      setLogs([])
      setPaginacao(null)
    } finally {
      setLoading(false)
    }
  }, [pagina, limite])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const corResultado = (resultado: LogRequisicaoApi['resultado_log_requisicao_api']): string => {
    if (resultado === 'SUCESSO')      return '#4ade80'
    if (resultado === 'ERRO_CLIENTE') return '#fbbf24'
    return '#f87171'
  }

  const colunas: TabelaGlobalColuna<LogRequisicaoApi>[] = [
    {
      key: 'data_criacao_log_requisicao_api',
      label: 'Data/Hora',
      tipo: 'texto',
      tooltipTitulo: 'Quando',
      tooltipDescricao: 'Momento exato da requisicao',
      render: (val) => new Date(val as string).toLocaleString('pt-BR'),
    },
    {
      key: 'metodo_http_log_requisicao_api',
      label: 'Metodo',
      tipo: 'texto',
      tooltipTitulo: 'Metodo HTTP',
      tooltipDescricao: 'GET, POST, PUT, DELETE',
      render: (val) => <code style={{ fontSize: '0.75rem', fontWeight: 600 }}>{val as string}</code>,
    },
    {
      key: 'endpoint_log_requisicao_api',
      label: 'Endpoint',
      tipo: 'texto',
      tooltipTitulo: 'Endpoint',
      tooltipDescricao: 'Caminho da rota chamada',
      render: (val) => <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{val as string}</code>,
    },
    {
      key: 'codigo_resposta_http_log_requisicao_api',
      label: 'Status',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Codigo HTTP',
      tooltipDescricao: 'Codigo de resposta da requisicao',
      render: (val, row) => (
        <code style={{ fontSize: '0.75rem', fontWeight: 600, color: corResultado(row.resultado_log_requisicao_api) }}>
          {val as number}
        </code>
      ),
    },
    {
      key: 'latencia_ms_log_requisicao_api',
      label: 'Latencia',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Latencia',
      tooltipDescricao: 'Tempo total da requisicao em milissegundos',
      render: (val) => `${val as number}ms`,
    },
    {
      key: 'id_produto_gravity',
      label: 'Produto',
      tipo: 'texto',
      tooltipTitulo: 'Produto',
      tooltipDescricao: 'Produto Gravity que recebeu a chamada',
      render: (val) => (val ? <code style={{ fontSize: '0.75rem' }}>{val as string}</code> : '—'),
    },
    {
      key: 'id_correlacao',
      label: 'Correlacao',
      tipo: 'texto',
      tooltipTitulo: 'ID de Correlacao',
      tooltipDescricao: 'Identificador para rastrear a requisicao em logs distribuidos',
      render: (val) => (val ? <code style={{ fontSize: '0.7rem', opacity: 0.7 }}>{(val as string).slice(0, 8)}...</code> : '—'),
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          titulo="Consumo da API"
          subtitulo="Historico detalhado de cada requisicao recebida pela API Gravity desta organizacao"
          icone={<Pulse size={32} weight="duotone" />}
        />
      }
    >
      {erro && (
        <div role="alert" style={{
          padding: '0.75rem 1rem', borderRadius: '8px',
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          color: '#f87171', marginTop: '1rem', fontSize: '0.875rem',
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        <ApiCockpitKpiCards />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <ApiCockpitTabs />
          <BotaoGlobal
            variante="primario"
            onClick={() => { setPagina(1); void carregar() }}
            icone={<ArrowClockwise size={16} />}
          >
            Atualizar
          </BotaoGlobal>
        </div>

        <TabelaGlobal
          id="api-consumo"
          idKey="id_log_requisicao_api"
          colunas={colunas}
          dados={logs}
          acoesExportacao={getAcoesExportacaoPadrao(colunas, 'consumo-api', 'Consumo da API')}
          mensagemVazio={loading ? 'Carregando logs...' : 'Nenhuma requisicao encontrada com os filtros atuais.'}
        />

      {/* Paginacao */}
      {paginacao && paginacao.paginas > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1rem', borderRadius: '8px',
          background: 'var(--ws-bg-card, rgba(30,41,59,0.5))',
          border: '1px solid var(--border-color)',
          fontSize: '0.875rem', color: 'var(--text-secondary)',
        }}>
          <div>
            Pagina <strong style={{ color: 'var(--text-primary)' }}>{paginacao.pagina}</strong> de{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{paginacao.paginas}</strong>
            {' · '}
            <strong style={{ color: 'var(--text-primary)' }}>{paginacao.total}</strong> registros
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina <= 1}
            >
              Anterior
            </BotaoGlobal>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={() => setPagina((p) => Math.min(paginacao.paginas, p + 1))}
              disabled={pagina >= paginacao.paginas}
            >
              Proxima
            </BotaoGlobal>
          </div>
        </div>
      )}
      </div>
    </PaginaGlobal>
  )
}

export default ApiConsumo
