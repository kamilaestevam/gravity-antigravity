import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import {
  Plus, Trash, Copy, WebhooksLogo, PaperPlaneTilt, ClockCounterClockwise, Info, Pulse,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitAdminTabs } from './ApiCockpitAdminTabs'
import { ApiCockpitAdminKpis } from './ApiCockpitAdminKpis'
import { SeletorOrganizacaoAdmin } from './SeletorOrganizacaoAdmin'

// ─── Schemas Zod (Mandamento 06/09) ──────────────────────────────────────

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

const criarWebhookResponseSchema = webhookConfiguracaoSchema.extend({
  segredo_webhook_configuracao: z.string(),
})

const webhookLogSchema = z.object({
  id_webhook_log:                    z.string(),
  evento_webhook_log:                z.string(),
  codigo_resposta_http_webhook_log:  z.number(),
  latencia_ms_webhook_log:           z.number(),
  quantidade_tentativas_webhook_log: z.number(),
  erro_webhook_log:                  z.string().nullable(),
  data_criacao_webhook_log:          z.string(),
})

const historicoResponseSchema = z.object({
  historico: z.array(webhookLogSchema),
  error:     z.string().optional(),
})

type WebhookConfiguracao = z.infer<typeof webhookConfiguracaoSchema>
type CriarWebhookResponse = z.infer<typeof criarWebhookResponseSchema>
type WebhookLog = z.infer<typeof webhookLogSchema>

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--ws-accent-border, rgba(255,255,255,0.1))',
  background: 'rgba(0,0,0,0.2)',
  color: 'var(--text-primary, #fff)',
  fontSize: '0.875rem',
}

// Eventos canonicos disponiveis no Gravity (paridade com workspace)
const EVENTOS_DISPONIVEIS = [
  'simulacao.criada',
  'simulacao.atualizada',
  'cotacao.aprovada',
  'cotacao.rejeitada',
  'pedido.criado',
  'pedido.atualizado',
  'documento.emitido',
] as const

export function ApiWebhooksAdmin() {
  const [idOrganizacao, setIdOrganizacao] = useState<string>('')
  const [webhooks, setWebhooks] = useState<WebhookConfiguracao[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Modal — criar
  const [modalCriarAberto, setModalCriarAberto] = useState(false)
  const [novaUrl, setNovaUrl] = useState('')
  const [novosEventos, setNovosEventos] = useState<string[]>([])
  const [criando, setCriando] = useState(false)

  // Modal — erro local (visivel dentro do modal)
  const [erroCriar, setErroCriar] = useState<string | null>(null)

  // Modal — exibicao do segredo (uma vez so)
  const [webhookCriado, setWebhookCriado] = useState<CriarWebhookResponse | null>(null)

  // Modal — historico
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [historico, setHistorico] = useState<WebhookLog[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

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
      // Backend pode retornar 200 com error amigavel (proxy resiliente)
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

  const resetForm = () => {
    setNovaUrl('')
    setNovosEventos([])
    setErroCriar(null)
  }

  const toggleEvento = (evento: string) => {
    setNovosEventos((prev) =>
      prev.includes(evento) ? prev.filter((e) => e !== evento) : [...prev, evento],
    )
  }

  const handleCriar = async () => {
    if (!novaUrl.trim() || novosEventos.length === 0 || !idOrganizacao) return
    setCriando(true)
    setErroCriar(null)
    try {
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/admin/webhooks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_organizacao:               idOrganizacao,
          url_webhook_configuracao:     novaUrl.trim(),
          eventos_webhook_configuracao: novosEventos,
          ativo_webhook_configuracao:   true,
        }),
      })
      const raw = await res.json()
      if (!res.ok) {
        throw new Error(raw?.erro || raw?.error || `Falha ao criar webhook: ${res.status}`)
      }
      const parsed = criarWebhookResponseSchema.safeParse(raw)
      if (!parsed.success) throw new Error('Resposta de criacao invalida')
      setWebhookCriado(parsed.data)
      setModalCriarAberto(false)
      resetForm()
      setErroCriar(null)
      await carregar()
    } catch (err) {
      setErroCriar(err instanceof Error ? err.message : 'Falha ao criar webhook')
    } finally {
      setCriando(false)
    }
  }

  const handleExcluir = async (id: string) => {
    if (!idOrganizacao) return
    if (!window.confirm('Excluir este webhook? As entregas pararão imediatamente.')) return
    try {
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/admin/webhooks/${encodeURIComponent(id)}`,
        {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id_organizacao: idOrganizacao }),
        },
      )
      if (!res.ok && res.status !== 204) {
        const raw = await res.json().catch(() => ({}))
        throw new Error(raw?.erro || raw?.error || `Falha ao excluir: ${res.status}`)
      }
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao excluir webhook')
    }
  }

  const handleDispararTeste = async (id: string) => {
    if (!idOrganizacao) return
    try {
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/admin/webhooks/${encodeURIComponent(id)}/disparar-evento-teste`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ id_organizacao: idOrganizacao }),
        },
      )
      const raw = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(raw?.erro || raw?.error || `Falha ao disparar: ${res.status}`)
      const sucesso = raw?.sucesso === true
      const codigo = raw?.codigo_resposta_http_webhook_log ?? '?'
      window.alert(sucesso
        ? `✅ Disparo bem-sucedido (HTTP ${codigo})`
        : `❌ Disparo falhou (HTTP ${codigo})${raw?.erro_webhook_log ? `: ${raw.erro_webhook_log}` : ''}`)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao disparar teste')
    }
  }

  const handleAbrirHistorico = async (id: string) => {
    if (!idOrganizacao) return
    setHistoricoAberto(true)
    setCarregandoHistorico(true)
    try {
      const params = new URLSearchParams({ id_organizacao: idOrganizacao })
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/admin/webhooks/${encodeURIComponent(id)}/historico?${params}`,
      )
      const raw = await res.json()
      const parsed = historicoResponseSchema.safeParse(raw)
      setHistorico(parsed.success ? parsed.data.historico : [])
    } catch {
      setHistorico([])
    } finally {
      setCarregandoHistorico(false)
    }
  }

  const handleCopiar = async (texto: string) => {
    try { await navigator.clipboard.writeText(texto) } catch { /* silencioso */ }
  }

  const colunas: TabelaGlobalColuna<WebhookConfiguracao>[] = [
    {
      key: 'url_webhook_configuracao',
      label: 'URL',
      tipo: 'texto',
      tooltipTitulo: 'URL do Webhook',
      tooltipDescricao: 'Endpoint HTTPS que recebera os eventos',
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
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Se desativado, o webhook nao recebe disparos',
      render: (val) => (val ? 'Sim' : 'Nao'),
    },
    {
      key: 'data_criacao_webhook_configuracao',
      label: 'Criado em',
      tipo: 'texto',
      tooltipTitulo: 'Data de Criacao',
      tooltipDescricao: 'Quando este webhook foi cadastrado',
      render: (val) => new Date(val as string).toLocaleDateString('pt-BR'),
    },
    {
      key: 'id_webhook_configuracao',
      label: 'Acoes',
      tipo: 'texto',
      align: 'center',
      largura: '140px',
      render: (val) => {
        const id = val as string
        return (
          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={() => handleDispararTeste(id)}
              icone={<PaperPlaneTilt size={16} />}
              aria-label="Disparar evento de teste"
              title="Testar"
            />
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={() => handleAbrirHistorico(id)}
              icone={<ClockCounterClockwise size={16} />}
              aria-label="Ver histórico"
              title="Histórico"
            />
            <BotaoGlobal
              variante="perigo"
              tamanho="pequeno"
              onClick={() => handleExcluir(id)}
              icone={<Trash size={16} />}
              aria-label="Excluir webhook"
              title="Excluir"
            />
          </div>
        )
      },
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          titulo="API Cockpit"
          subtitulo="Webhooks por organização — visão administrativa com CRUD completo"
          icone={<Pulse size={24} weight="duotone" />}
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
          {idOrganizacao && (
            <BotaoGlobal
              variante="primario"
              onClick={() => setModalCriarAberto(true)}
              icone={<Plus size={16} />}
            >
              Novo Webhook
            </BotaoGlobal>
          )}
        </div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SeletorOrganizacaoAdmin
          valor={idOrganizacao}
          aoMudar={setIdOrganizacao}
        />

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
              Selecione uma organização para gerenciar seus webhooks
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 480 }}>
              Como admin, você pode listar, criar, testar e excluir webhooks da organização escolhida.
            </div>
          </div>
        ) : (
          <TabelaGlobal
            id="admin-api-webhooks"
            idKey="id_webhook_configuracao"
            colunas={colunas}
            dados={webhooks}
            acoesExportacao={getAcoesExportacaoPadrao(colunas, 'webhooks-admin', 'Webhooks (Admin)')}
            mensagemVazio={loading ? 'Carregando webhooks...' : 'Esta organização não possui webhooks cadastrados. Clique em "Novo Webhook" para criar o primeiro.'}
          />
        )}
      </div>

      {/* Modal — Criar webhook */}
      <ModalFormularioGlobal
        aberto={modalCriarAberto}
        aoFechar={() => { if (!criando) { setModalCriarAberto(false); resetForm() } }}
        aoSalvar={handleCriar}
        icone={<WebhooksLogo size={24} weight="duotone" />}
        titulo="Cadastrar Novo Webhook"
        subtitulo="O segredo HMAC sera exibido apenas uma vez. Copie e guarde em local seguro."
        tamanho="md"
        altura="auto"
        dirty={!!novaUrl.trim() || novosEventos.length > 0}
        podesSalvar={!!novaUrl.trim() && novosEventos.length > 0}
        carregando={criando}
        textoSalvar="Cadastrar Webhook"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 1.5rem' }}>
          {erroCriar && (
            <div role="alert" style={{
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171', fontSize: '0.875rem',
            }}>
              {erroCriar}
            </div>
          )}
          <CampoGeralGlobal label="URL do Webhook" htmlFor="url-webhook-admin" obrigatorio>
            <input
              id="url-webhook-admin"
              type="url"
              style={INPUT_STYLE}
              value={novaUrl}
              onChange={(e) => setNovaUrl(e.target.value)}
              placeholder="https://exemplo.com/webhooks"
            />
          </CampoGeralGlobal>

          <CampoGeralGlobal label="Eventos a receber" htmlFor="eventos-webhook-admin" obrigatorio>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {EVENTOS_DISPONIVEIS.map((evento) => (
                <label
                  key={evento}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem', borderRadius: '6px',
                    background: 'rgba(0,0,0,0.15)', cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={novosEventos.includes(evento)}
                    onChange={() => toggleEvento(evento)}
                  />
                  <code>{evento}</code>
                </label>
              ))}
            </div>
          </CampoGeralGlobal>
        </div>
      </ModalFormularioGlobal>

      {/* Modal — Exibicao unica do segredo */}
      <ModalFormularioGlobal
        aberto={!!webhookCriado}
        aoFechar={() => setWebhookCriado(null)}
        aoSalvar={() => setWebhookCriado(null)}
        icone={<WebhooksLogo size={24} weight="duotone" />}
        titulo="Webhook Cadastrado"
        subtitulo="Este é o ÚNICO momento em que você verá o segredo HMAC. Copie e guarde em local seguro."
        tamanho="md"
        altura="auto"
        dirty
        podesSalvar
        textoSalvar="Já copiei, fechar"
        textoCancelar=""
      >
        {webhookCriado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 1.5rem' }}>
            <div role="alert" style={{
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24', fontSize: '0.875rem',
            }}>
              ⚠️ Após fechar este modal o segredo não poderá mais ser recuperado.
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Segredo HMAC (use para validar a assinatura do header X-Gravity-Signature):
              </div>
              <div style={{
                padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <code style={{ flex: 1, fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--text-primary)' }}>
                  {webhookCriado.segredo_webhook_configuracao}
                </code>
                <BotaoGlobal
                  variante="secundario"
                  tamanho="pequeno"
                  onClick={() => handleCopiar(webhookCriado.segredo_webhook_configuracao)}
                  icone={<Copy size={14} />}
                  aria-label="Copiar segredo"
                >
                  Copiar
                </BotaoGlobal>
              </div>
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
              fontSize: '0.8125rem',
            }}>
              <span style={{
                padding: '0.25rem 0.625rem', borderRadius: '6px',
                background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                color: 'var(--brand-primary, #818cf8)', fontFamily: 'monospace', fontSize: '0.75rem',
              }}>{webhookCriado.url_webhook_configuracao}</span>
              {webhookCriado.eventos_webhook_configuracao.map((ev) => (
                <span key={ev} style={{
                  padding: '0.25rem 0.625rem', borderRadius: '6px',
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                  color: '#34d399',
                }}>{ev}</span>
              ))}
            </div>
          </div>
        )}
      </ModalFormularioGlobal>

      {/* Modal — Historico de entregas */}
      <ModalFormularioGlobal
        aberto={historicoAberto}
        aoFechar={() => setHistoricoAberto(false)}
        aoSalvar={() => setHistoricoAberto(false)}
        icone={<ClockCounterClockwise size={24} weight="duotone" />}
        titulo="Historico de Entregas"
        subtitulo="Ultimas 100 tentativas de disparo deste webhook"
        tamanho="lg"
        altura="auto"
        dirty={false}
        podesSalvar
        textoSalvar="Fechar"
        textoCancelar=""
      >
        <div style={{ padding: '0.5rem 1.5rem' }}>
          {carregandoHistorico ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Carregando historico...
            </div>
          ) : historico.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nenhuma entrega registrada ainda. Use o botao "Testar" para fazer um disparo de teste.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {historico.map((log) => {
                const sucesso = log.codigo_resposta_http_webhook_log >= 200 && log.codigo_resposta_http_webhook_log < 300
                return (
                  <div key={log.id_webhook_log} style={{
                    padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${sucesso ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    fontSize: '0.875rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <code style={{ color: sucesso ? '#4ade80' : '#f87171' }}>
                        HTTP {log.codigo_resposta_http_webhook_log}
                      </code>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {new Date(log.data_criacao_webhook_log).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <strong>Evento:</strong> <code style={{ fontSize: '0.75rem' }}>{log.evento_webhook_log}</code>
                      {' · '}
                      <strong>Latencia:</strong> {log.latencia_ms_webhook_log}ms
                      {' · '}
                      <strong>Tentativas:</strong> {log.quantidade_tentativas_webhook_log}
                    </div>
                    {log.erro_webhook_log && (
                      <div style={{ marginTop: '0.25rem', color: '#f87171', fontSize: '0.75rem' }}>
                        Erro: {log.erro_webhook_log}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ModalFormularioGlobal>
    </PaginaGlobal>
  )
}

export default ApiWebhooksAdmin
