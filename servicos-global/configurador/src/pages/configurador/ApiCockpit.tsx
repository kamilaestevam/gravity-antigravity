import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Navigate } from 'react-router-dom'
import { z } from 'zod'
import {
  CheckCircle,
  WarningCircle,
  Pulse,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitTabs } from './ApiCockpitTabs'
import { CardsServidores, type SerieDiariaPonto } from './CardsServidores'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const servicoPlataformaSchema = z.object({
  nome_servico_plataforma:              z.string(),
  status_servico_plataforma:            z.enum(['ONLINE', 'DEGRADADO', 'OFFLINE']),
  latencia_ms_servico_plataforma:       z.number(),
  versao_servico_plataforma:            z.string(),
  data_ultimo_check_servico_plataforma: z.string(),
  endpoint_publico_servico_plataforma:  z.string().nullable(),
  // Transicao 2026-05-06: backend pode servir 'NUCLEO' legacy ate restart
  tipo_servico_plataforma:              z.enum(['PLATAFORMA', 'NUCLEO', 'PRODUTO_GRAVITY', 'CONECTOR']),
})

const servicosResponseSchema = z.object({
  servicos: z.array(servicoPlataformaSchema),
  error:    z.string().optional(),
})

const serieDiariaPontoSchema = z.object({
  data:       z.string(),
  total:      z.number(),
  sucesso:    z.number(),
  percentual: z.number(),
})

const estatisticasSerieSchema = z.object({
  serie_diaria_log_requisicao_api: z.array(serieDiariaPontoSchema).optional(),
})

type ServicoPlataforma = z.infer<typeof servicoPlataformaSchema>
type TipoServicoPlataforma = ServicoPlataforma['tipo_servico_plataforma']

// Rotulos com ortografia PT-BR — type-safe via Record<TipoServicoPlataforma>
// NUCLEO mantido apenas para compat de transicao — mapeia para 'Plataforma'.
const ROTULO_TIPO_SERVICO: Record<TipoServicoPlataforma, string> = {
  PLATAFORMA:      'Plataforma',
  NUCLEO:          'Plataforma',
  PRODUTO_GRAVITY: 'Produto Gravity',
  CONECTOR:        'Conector',
}

// Ordem padrao dos 15 servicos prioritarios (espelha ApiCockpitAdmin).
// Servicos nao listados caem no final preservando a ordem natural.
const ORDEM_PADRAO_SERVICOS: string[] = [
  'configurador',
  'cadastros',
  'pedido',
  'processo',
  'bid-frete',
  'smart-read',
  'gabi',
  'taxas-moeda',
  'api-cockpit',
]

const POLLING_INTERVAL_MS = 30_000

function formatarRelativo(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const segundos = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (segundos < 60) return `há ${segundos}s`
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `há ${minutos}min`
  const horas = Math.floor(minutos / 60)
  return `há ${horas}h`
}

export function ApiCockpit() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [servicos, setServicos] = useState<ServicoPlataforma[]>([])
  const [serieDiaria, setSerieDiaria] = useState<SerieDiariaPonto[] | undefined>(undefined)
  const redirecionarParaConsumo = searchParams.get('aba') === 'logs'

  const carregarServicos = useCallback(async (signal?: AbortSignal) => {
    try {
      const [svcRes, serieRes] = await Promise.all([
        requisicaoAutenticada('/api/v1/api-cockpit/saude-servicos', { signal }),
        requisicaoAutenticada('/api/v1/api-cockpit/log-requisicao-api/estatisticas?serie=diaria&dias=30', { signal }),
      ])
      if (svcRes.ok) {
        const svcRaw = await svcRes.json()
        const svcData = servicosResponseSchema.safeParse(svcRaw)
        if (svcData.success) {
          setServicos(svcData.data.servicos)
        } else {
          console.warn('[ApiCockpit] /saude-servicos payload invalido', svcData.error)
        }
      }
      if (serieRes.ok) {
        const serieRaw = await serieRes.json()
        const parsed = estatisticasSerieSchema.safeParse(serieRaw)
        if (parsed.success && parsed.data.serie_diaria_log_requisicao_api) {
          setSerieDiaria(parsed.data.serie_diaria_log_requisicao_api)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.warn('[ApiCockpit] falha ao carregar cockpit', err)
    }
  }, [])

  useEffect(() => {
    if (redirecionarParaConsumo) return
    const ctrl = new AbortController()
    void carregarServicos(ctrl.signal)
    const interval = setInterval(() => {
      void carregarServicos()
    }, POLLING_INTERVAL_MS)
    return () => {
      ctrl.abort()
      clearInterval(interval)
    }
  }, [redirecionarParaConsumo, carregarServicos])

  const servicosOrdenados = useMemo(() => {
    const total = ORDEM_PADRAO_SERVICOS.length
    return [...servicos].sort((a, b) => {
      const ia = ORDEM_PADRAO_SERVICOS.indexOf(a.nome_servico_plataforma)
      const ib = ORDEM_PADRAO_SERVICOS.indexOf(b.nome_servico_plataforma)
      return (ia === -1 ? total : ia) - (ib === -1 ? total : ib)
    })
  }, [servicos])

  // Compat: ?aba=logs antigo redireciona para /consumo (merge Logs+Consumo, 2026-05-07)
  if (redirecionarParaConsumo) {
    return <Navigate to="/configurador/api-cockpit/consumo" replace />
  }

  const colunasServicos: TabelaGlobalColuna<ServicoPlataforma>[] = [
    {
      key: 'nome_servico_plataforma',
      label: t('admin.cockpit.tabela.servico'),
      tipo: 'texto',
      tooltipTitulo: 'Serviço',
      tooltipDescricao: 'Nome do serviço ou integração monitorada pela plataforma',
    },
    {
      key: 'tipo_servico_plataforma',
      label: t('admin.cockpit.tabela.tipo'),
      tipo: 'texto',
      tooltipTitulo: 'Tipo',
      tooltipDescricao: 'Categoria do serviço: núcleo, produto Gravity ou conector',
      render: (val) => ROTULO_TIPO_SERVICO[val as TipoServicoPlataforma] ?? String(val),
    },
    {
      key: 'status_servico_plataforma',
      label: t('admin.cockpit.tabela.status'),
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Indica se o serviço está respondendo normalmente',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: val === 'ONLINE' ? '#10b981' : '#f59e0b' }}>
          {val === 'ONLINE' ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} weight="fill" />}
          {val as string}
        </div>
      ),
    },
    {
      key: 'endpoint_publico_servico_plataforma',
      label: 'Endpoint produção',
      tipo: 'texto',
      tooltipTitulo: 'Endpoint produção',
      tooltipDescricao: 'URL pública do serviço em usegravity.com.br; sidecars internos não expõem rota browser',
      render: (_val, row) => {
        const url = row.endpoint_publico_servico_plataforma
        if (!url) return <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>Sidecar interno</span>
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ws-accent, #818cf8)', fontSize: '0.8125rem' }}>
            {url}
          </a>
        )
      },
    },
    {
      key: 'latencia_ms_servico_plataforma',
      label: t('admin.cockpit.tabela.latencia'),
      tipo: 'texto',
      tooltipTitulo: 'Latência',
      tooltipDescricao: 'Tempo médio de resposta do serviço na última verificação',
      render: (val) => `${val as number}ms`,
    },
    {
      key: 'versao_servico_plataforma',
      label: t('admin.cockpit.tabela.versao'),
      tipo: 'texto',
      tooltipTitulo: 'Versão',
      tooltipDescricao: 'Versão da API ou serviço atualmente em execução',
    },
    {
      key: 'data_ultimo_check_servico_plataforma',
      label: t('admin.cockpit.tabela.ultimo_check'),
      tipo: 'texto',
      tooltipTitulo: 'Último Check',
      tooltipDescricao: 'Data e hora da última verificação de disponibilidade',
      render: (val) => formatarRelativo(String(val)),
    },
  ]

  return (
    <PaginaGlobal
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        {/* Cards especificos da aba Servidores (saude da infraestrutura) */}
        <CardsServidores servicos={servicos} serieDiaria={serieDiaria} />

        {/* Tabs unificadas — 4 pills (Servidores, Tokens, Webhooks, Consumo) */}
        <ApiCockpitTabs />

        {/* Content da aba Servidores */}
        <div style={{ background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <TabelaGlobal
            id="cockpit-services"
            idKey="nome_servico_plataforma"
            colunas={colunasServicos}
            dados={servicosOrdenados}
            acoesExportacao={getAcoesExportacaoPadrao(colunasServicos, 'servidores-infraestrutura', 'Servidores')}
            mensagemVazio={t('admin.cockpit.vazio.sem_servicos')}
          />
        </div>
      </div>
    </PaginaGlobal>
  )
}
