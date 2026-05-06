import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { WebhooksLogo, ArrowClockwise, Info } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitAdminTabs } from './ApiCockpitAdminTabs'
import { ApiCockpitAdminKpis } from './ApiCockpitAdminKpis'
import { SeletorOrganizacaoAdmin } from './SeletorOrganizacaoAdmin'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const webhookConfiguracaoSchema = z.object({
  id_webhook_configuracao:               z.string(),
  id_organizacao:                        z.string(),
  id_produto_gravity:                    z.string().nullable(),
  id_usuario:                            z.string().nullable(),
  url_webhook_configuracao:              z.string(),
  eventos_webhook_configuracao:          z.array(z.string()),
  ativo_webhook_configuracao:            z.boolean(),
  data_criacao_webhook_configuracao:     z.string(),
  data_atualizacao_webhook_configuracao: z.string(),
})

const listarWebhooksResponseSchema = z.object({
  webhooks: z.array(webhookConfiguracaoSchema),
  error:    z.string().optional(),
})

type WebhookConfiguracao = z.infer<typeof webhookConfiguracaoSchema>

export function ApiWebhooksAdmin() {
  const [idOrganizacao, setIdOrganizacao] = useState<string>('')
  const [webhooks, setWebhooks] = useState<WebhookConfiguracao[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!idOrganizacao) {
      setWebhooks([])
      return
    }
    try {
      setLoading(true)
      setErro(null)
      const params = new URLSearchParams({ id_organizacao: idOrganizacao })
      const res = await requisicaoAutenticada(`/api/v1/api-cockpit/admin/webhooks?${params}`)
      if (!res.ok) throw new Error(`Falha ao listar webhooks: ${res.status}`)
      const raw = await res.json()
      const parsed = listarWebhooksResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[ApiWebhooksAdmin] payload invalido', parsed.error)
        setWebhooks([])
        return
      }
      // Backend de webhooks ainda nao migrado para padrao S2S — proxy admin retorna
      // {webhooks:[], error:'...'} com status 200. Mostra erro amigavel sem quebrar a UI.
      if (parsed.data.error) {
        setErro(parsed.data.error)
        setWebhooks([])
        return
      }
      setWebhooks(parsed.data.webhooks)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha desconhecida')
      setWebhooks([])
    } finally {
      setLoading(false)
    }
  }, [idOrganizacao])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const colunas: TabelaGlobalColuna<WebhookConfiguracao>[] = [
    {
      key: 'url_webhook_configuracao',
      label: 'URL',
      tipo: 'texto',
      tooltipTitulo: 'URL do Webhook',
      tooltipDescricao: 'Endpoint HTTPS configurado pelo cliente para receber eventos',
      render: (val) => <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{val as string}</code>,
    },
    {
      key: 'eventos_webhook_configuracao',
      label: 'Eventos',
      tipo: 'texto',
      tooltipTitulo: 'Eventos Inscritos',
      tooltipDescricao: 'Lista de eventos que disparam este webhook',
      render: (val) => (val as string[]).join(', '),
    },
    {
      key: 'ativo_webhook_configuracao',
      label: 'Ativo',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Se desativado, o webhook não recebe disparos',
      render: (val) => {
        const ativo = val === true
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: ativo ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            color: ativo ? '#34d399' : '#f87171',
            border: ativo ? '1px solid rgba(52,211,153,0.12)' : '1px solid rgba(248,113,113,0.12)',
          }}>
            {ativo ? 'Sim' : 'Não'}
          </span>
        )
      },
    },
    {
      key: 'data_criacao_webhook_configuracao',
      label: 'Criado em',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Data de Criação',
      tooltipDescricao: 'Quando este webhook foi cadastrado',
      render: (val) => new Date(val as string).toLocaleDateString('pt-BR'),
    },
    {
      key: 'data_atualizacao_webhook_configuracao',
      label: 'Atualizado em',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Data de Atualização',
      tooltipDescricao: 'Última alteração feita neste webhook',
      render: (val) => new Date(val as string).toLocaleDateString('pt-BR'),
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<WebhooksLogo weight="duotone" size={24} />}
          titulo="API Cockpit"
          subtitulo="Webhooks por organização — visão administrativa (somente leitura)"
        />
      }
      stats={<ApiCockpitAdminKpis />}
      toolbar={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <BotaoGlobal
            variante="secundario"
            onClick={() => void carregar()}
            icone={<ArrowClockwise size={16} />}
            aria-label="Atualizar webhooks"
            disabled={!idOrganizacao || loading}
          >
            Atualizar
          </BotaoGlobal>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        <ApiCockpitAdminTabs />

        <SeletorOrganizacaoAdmin
          valor={idOrganizacao}
          aoMudar={setIdOrganizacao}
        />

        {erro && (
          <div role="alert" style={{
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171', fontSize: '0.875rem',
          }}>
            {erro}
          </div>
        )}

        {!idOrganizacao ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.1)',
          }}>
            <Info size={28} weight="duotone" style={{ color: 'var(--brand-primary, #818cf8)' }} />
            <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Selecione uma organização para inspecionar seus webhooks
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 480 }}>
              A visão administrativa mostra os webhooks de uma organização por vez.
              Para cadastrar ou disparar testes, o cliente acessa o painel de workspace dele.
            </div>
          </div>
        ) : (
          <TabelaGlobal
            id="admin-api-webhooks"
            colunas={colunas}
            dados={webhooks}
            acoesExportacao={getAcoesExportacaoPadrao(colunas, 'webhooks-admin', 'Webhooks (Admin)')}
            mensagemVazio={loading ? 'Carregando webhooks...' : 'Esta organização não possui webhooks cadastrados.'}
          />
        )}
      </div>
    </PaginaGlobal>
  )
}

export default ApiWebhooksAdmin
