import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Plus, Trash, Copy, WebhooksLogo, PaperPlaneTilt, ClockCounterClockwise } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitTabs } from './ApiCockpitTabs'
import { ApiCockpitKpiCards } from './ApiCockpitKpiCards'

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

// Eventos canonicos disponiveis no Gravity
const EVENTOS_DISPONIVEIS = [
  'simulacao.criada',
  'simulacao.atualizada',
  'cotacao.aprovada',
  'cotacao.rejeitada',
  'pedido.criado',
  'pedido.atualizado',
  'documento.emitido',
] as const

export function ApiWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfiguracao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Modal — criar
  const [modalCriarAberto, setModalCriarAberto] = useState(false)
  const [novaUrl, setNovaUrl] = useState('')
  const [novosEventos, setNovosEventos] = useState<string[]>([])
  const [criando, setCriando] = useState(false)

  // Modal — exibicao do segredo (uma vez so)
  const [webhookCriado, setWebhookCriado] = useState<CriarWebhookResponse | null>(null)

  // Modal — historico
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [historico, setHistorico] = useState<WebhookLog[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      setErro(null)
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/webhooks')
      if (!res.ok) throw new Error(`Falha ao listar webhooks: ${res.status}`)
      const raw = await res.json()
      const parsed = listarWebhooksResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[ApiWebhooks] payload invalido', parsed.error)
        setWebhooks([])
        return
      }
      if (parsed.data.error) throw new Error(parsed.data.error)
      setWebhooks(parsed.data.webhooks)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha desconhecida')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const resetForm = () => {
    setNovaUrl('')
    setNovosEventos([])
  }

  const toggleEvento = (evento: string) => {
    setNovosEventos((prev) =>
      prev.includes(evento) ? prev.filter((e) => e !== evento) : [...prev, evento],
    )
  }

  const handleCriar = async () => {
    if (!novaUrl.trim() || novosEventos.length === 0) return
    setCriando(true)
    setErro(null)
    try {
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/webhooks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao criar webhook')
    } finally {
      setCriando(false)
    }
  }

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Excluir este webhook? As entregas pararão imediatamente.')) return
    try {
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/webhooks/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
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
    try {
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/webhooks/${encodeURIComponent(id)}/disparar-evento-teste`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
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
    setHistoricoAberto(true)
    setCarregandoHistorico(true)
    try {
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/webhooks/${encodeURIComponent(id)}/historico`,
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
      render: (val) => {
        const id = val as string
        return (
          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={() => handleDispararTeste(id)}
              icone={<PaperPlaneTilt size={14} />}
              aria-label="Disparar evento de teste"
            >
              Testar
            </BotaoGlobal>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              onClick={() => handleAbrirHistorico(id)}
              icone={<ClockCounterClockwise size={14} />}
              aria-label="Ver historico"
            >
              Historico
            </BotaoGlobal>
            <BotaoGlobal
              variante="perigo"
              tamanho="pequeno"
              onClick={() => handleExcluir(id)}
              icone={<Trash size={14} />}
              aria-label="Excluir webhook"
            >
              Excluir
            </BotaoGlobal>
          </div>
        )
      },
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          titulo="Webhooks"
          subtitulo="Receba notificacoes em tempo real dos eventos do Gravity em sua aplicacao"
          icone={<WebhooksLogo size={32} weight="duotone" />}
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
            onClick={() => setModalCriarAberto(true)}
            icone={<Plus size={16} />}
          >
            Novo Webhook
          </BotaoGlobal>
        </div>

        <TabelaGlobal
          id="api-webhooks"
          colunas={colunas}
          dados={webhooks}
          acoesExportacao={getAcoesExportacaoPadrao(colunas, 'webhooks', 'Webhooks')}
          mensagemVazio={loading ? 'Carregando webhooks...' : 'Nenhum webhook cadastrado. Clique em "Novo Webhook" para criar o primeiro.'}
        />
      </div>

      {/* Modal — Criar webhook */}
      <ModalFormularioGlobal
        aberto={modalCriarAberto}
        aoFechar={() => !criando && setModalCriarAberto(false)}
        aoSalvar={handleCriar}
        icone={<WebhooksLogo size={24} weight="duotone" />}
        titulo="Cadastrar Novo Webhook"
        subtitulo="O segredo HMAC sera exibido apenas uma vez. Copie e guarde em local seguro."
        tamanho="md"
        altura="auto"
        dirty={!!novaUrl.trim() || novosEventos.length > 0}
        podesSalvar={!!novaUrl.trim() && novosEventos.length > 0 && !criando}
        textoSalvar={criando ? 'Cadastrando...' : 'Cadastrar Webhook'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 1.5rem' }}>
          <CampoGeralGlobal label="URL do Webhook" htmlFor="url-webhook" obrigatorio>
            <input
              id="url-webhook"
              type="url"
              style={INPUT_STYLE}
              value={novaUrl}
              onChange={(e) => setNovaUrl(e.target.value)}
              placeholder="https://seu-sistema.com/webhooks/gravity"
            />
          </CampoGeralGlobal>

          <CampoGeralGlobal label="Eventos a receber" htmlFor="eventos-webhook" obrigatorio>
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
        subtitulo="Este e o UNICO momento em que voce vera o segredo HMAC. Copie e guarde em local seguro."
        tamanho="md"
        altura="auto"
        dirty={false}
        podesSalvar
        textoSalvar="Ja copiei, fechar"
        textoCancelar=""
      >
        {webhookCriado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 1.5rem' }}>
            <div role="alert" style={{
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24', fontSize: '0.875rem',
            }}>
              ⚠️ Apos fechar este modal o segredo nao podera mais ser recuperado.
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
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <strong>URL:</strong> <code style={{ fontSize: '0.75rem' }}>{webhookCriado.url_webhook_configuracao}</code><br />
              <strong>Eventos:</strong> {webhookCriado.eventos_webhook_configuracao.join(', ')}
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

export default ApiWebhooks
