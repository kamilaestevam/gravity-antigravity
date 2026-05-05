import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import {
  CheckCircle,
  WarningCircle,
  Pulse,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitTabs } from './ApiCockpitTabs'
import { ApiCockpitKpiCards } from './ApiCockpitKpiCards'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const servicoPlataformaSchema = z.object({
  nome_servico_plataforma:              z.string(),
  status_servico_plataforma:            z.enum(['ONLINE', 'DEGRADADO', 'OFFLINE']),
  latencia_ms_servico_plataforma:       z.number(),
  versao_servico_plataforma:            z.string(),
  data_ultimo_check_servico_plataforma: z.string(),
  tipo_servico_plataforma:              z.enum(['NUCLEO', 'PRODUTO_GRAVITY', 'CONECTOR']),
})

const servicosResponseSchema = z.object({
  servicos: z.array(servicoPlataformaSchema),
  error:    z.string().optional(),
})

const logConsumoSchema = z.object({
  id_log_consumo:                   z.string(),
  id_organizacao:                   z.string(),
  id_produto_gravity:               z.string(),
  id_usuario:                       z.string().nullable(),
  id_correlacao:                    z.string().nullable(),
  endpoint_log_consumo:             z.string(),
  metodo_http_log_consumo:          z.string(),
  codigo_resposta_http_log_consumo: z.number(),
  latencia_ms_log_consumo:          z.number(),
  data_criacao_log_consumo:         z.string(),
  data_log_consumo:                 z.string(),
  hora_log_consumo:                 z.string(),
  resultado_log_consumo:            z.enum(['SUCESSO', 'ERRO_CLIENTE', 'ERRO_SERVIDOR']),
})

const logsResponseSchema = z.object({
  logs: z.array(logConsumoSchema),
  paginacao: z.object({
    pagina:  z.number(),
    limite:  z.number(),
    total:   z.number(),
    paginas: z.number(),
  }),
  error: z.string().optional(),
})

type ServicoPlataforma = z.infer<typeof servicoPlataformaSchema>
type LogConsumo = z.infer<typeof logConsumoSchema>
type TipoServicoPlataforma = ServicoPlataforma['tipo_servico_plataforma']

// Rotulos com ortografia PT-BR — type-safe via Record<TipoServicoPlataforma>
const ROTULO_TIPO_SERVICO: Record<TipoServicoPlataforma, string> = {
  NUCLEO:          'Núcleo',
  PRODUTO_GRAVITY: 'Produto Gravity',
  CONECTOR:        'Conector',
}

export function ApiCockpit() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const abaAtiva: 'inventario' | 'logs' = searchParams.get('aba') === 'logs' ? 'logs' : 'inventario'
  const [servicos, setServicos] = useState<ServicoPlataforma[]>([])
  const [logs, setLogs] = useState<LogConsumo[]>([])

  useEffect(() => {
    const carregarCockpit = async () => {
      try {
        const [svcRes, logsRes] = await Promise.all([
          requisicaoAutenticada('/api/v1/api-cockpit/saude-servicos'),
          requisicaoAutenticada('/api/v1/api-cockpit/log-consumo?limite=50'),
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

        if (logsRes.ok) {
          const logsRaw = await logsRes.json()
          const logsData = logsResponseSchema.safeParse(logsRaw)
          if (logsData.success) {
            setLogs(logsData.data.logs)
          } else {
            console.warn('[ApiCockpit] /log-consumo payload invalido', logsData.error)
          }
        }
      } catch (err) {
        console.warn('[ApiCockpit] falha ao carregar cockpit', err)
      }
    }
    carregarCockpit()
  }, [])

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
    },
  ]

  const colunasLogs: TabelaGlobalColuna<LogConsumo>[] = [
    {
      key: 'data_criacao_log_consumo',
      label: t('admin.cockpit.tabela.data_hora'),
      tipo: 'texto',
      tooltipTitulo: 'Data e Hora',
      tooltipDescricao: 'Momento exato em que a requisição foi registrada',
      render: (_val, row) => `${row.data_log_consumo} ${row.hora_log_consumo}`,
    },
    {
      key: 'metodo_http_log_consumo',
      label: t('admin.cockpit.tabela.metodo'),
      tipo: 'texto',
      tooltipTitulo: 'Método',
      tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE',
      render: (val) => <strong style={{ color: 'var(--brand-primary)' }}>{val as string}</strong>,
    },
    {
      key: 'endpoint_log_consumo',
      label: t('admin.cockpit.tabela.endpoint'),
      tipo: 'texto',
      tooltipTitulo: 'Endpoint',
      tooltipDescricao: 'Rota da API que recebeu a requisição',
    },
    {
      key: 'codigo_resposta_http_log_consumo',
      label: t('admin.cockpit.tabela.status'),
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso',
      render: (val) => (
        <span style={{ color: (val as number) < 400 ? '#10b981' : '#ef4444' }}>{val as number}</span>
      ),
    },
    {
      key: 'id_organizacao',
      label: t('admin.cockpit.tabela.organizacao'),
      tipo: 'texto',
      tooltipTitulo: 'Organização',
      tooltipDescricao: 'Empresa que originou esta requisição à API',
    },
    {
      key: 'id_produto_gravity',
      label: t('admin.cockpit.tabela.produto'),
      tipo: 'texto',
      tooltipTitulo: 'Produto',
      tooltipDescricao: 'Produto Gravity que realizou a chamada',
    },
    {
      key: 'latencia_ms_log_consumo',
      label: t('admin.cockpit.tabela.duracao'),
      tipo: 'texto',
      tooltipTitulo: 'Duração',
      tooltipDescricao: 'Tempo total de processamento da requisição em milissegundos',
      render: (val) => `${val as number}ms`,
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          titulo={t('admin.cockpit.titulo')}
          subtitulo={t('admin.cockpit.subtitulo')}
          icone={<Pulse size={32} weight="duotone" />}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        <ApiCockpitKpiCards />

        {/* Tabs unificadas — 5 pills (Inventario, Logs, Tokens, Webhooks, Consumo) */}
        <ApiCockpitTabs />

        {/* Content da aba ativa (apenas Inventario e Logs ficam nesta rota) */}
        <div style={{ background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          {abaAtiva === 'inventario' ? (
            <TabelaGlobal
              id="cockpit-services"
              colunas={colunasServicos}
              dados={servicos}
              acoesExportacao={getAcoesExportacaoPadrao(colunasServicos, 'inventario-servicos', 'Inventário de Serviços')}
              mensagemVazio={t('admin.cockpit.vazio.sem_servicos')}
            />
          ) : (
            <TabelaGlobal
              id="cockpit-logs"
              colunas={colunasLogs}
              dados={logs}
              acoesExportacao={getAcoesExportacaoPadrao(colunasLogs, 'logs-requisicoes', 'Logs de Requisições')}
              mensagemVazio={t('admin.cockpit.vazio.sem_requisicoes')}
            />
          )}
        </div>
      </div>
    </PaginaGlobal>
  )
}
