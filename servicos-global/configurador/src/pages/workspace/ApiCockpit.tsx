import React, { useState } from 'react'
import { PlugsConnected, Key, Copy, CheckCircle, BookBookmark, Database, Trash, Target, Plugs, ShieldCheck } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CalendarioCampoGlobal } from '@nucleo/calendario-campo-global'

type ApiStatus = 'Online' | 'Offline' | 'Degradado'

type ApiService = {
  id: string
  produto: string
  baseUrl: string
  tokensAtivos: number
  status: ApiStatus
  tipoCobranca: 'Processo' | 'Documento' | 'Requisição' | 'Fixo'
  consumoAtual: number
  consumoLimite: number | null
}

const services: ApiService[] = [
  { id: 's1', produto: 'Dashboard Global',    baseUrl: 'https://api.gravity.com.br/dashboard/v1',   tokensAtivos: 3, status: 'Online',    tipoCobranca: 'Fixo',       consumoAtual: 0,    consumoLimite: null },
  { id: 's2', produto: 'Gestão de Atividades', baseUrl: 'https://api.gravity.com.br/atividades/v2', tokensAtivos: 1, status: 'Online',    tipoCobranca: 'Processo',   consumoAtual: 1450, consumoLimite: 5000 },
  { id: 's3', produto: 'SimulaCusto',          baseUrl: 'https://api.gravity.com.br/sim-custo/v1',  tokensAtivos: 2, status: 'Online',    tipoCobranca: 'Documento',  consumoAtual: 850,  consumoLimite: 1000 },
  { id: 's4', produto: 'Gabi IA Assistant',    baseUrl: 'https://api.gravity.com.br/gabi/v1',      tokensAtivos: 0, status: 'Degradado', tipoCobranca: 'Requisição', consumoAtual: 9800, consumoLimite: 10000 },
  { id: 's5', produto: 'WhatsApp Business',    baseUrl: 'https://api.gravity.com.br/whatsapp/v1',  tokensAtivos: 0, status: 'Offline',   tipoCobranca: 'Fixo',       consumoAtual: 0,    consumoLimite: null },
]

const statusBadge: Record<ApiStatus, string> = {
  Online:   'ws-badge-success',
  Offline:  'ws-badge-danger',
  Degradado:'ws-badge-warning',
}

const curlExample = `curl -X GET \\
  https://api.gravity.com.br/sim-custo/v1/simulacoes \\
  -H "Authorization: Bearer gv_live_sk_xxxx" \\
  -H "Content-Type: application/json"`

type Token = {
  id: string
  nome: string
  produto: string
  ambiente: 'Live' | 'Sandbox'
  criadoEm: string
  ultimoUso: string
}
const mockTokens: Token[] = [
  { id: 'tk1', nome: 'Integração SAP', produto: 'SimulaCusto', ambiente: 'Live', criadoEm: '10/03/2026', ultimoUso: 'Hoje' },
  { id: 'tk2', nome: 'Testes Locais', produto: 'Dashboard Global', ambiente: 'Sandbox', criadoEm: '20/03/2026', ultimoUso: 'Ontem' },
]

type Webhook = {
  id: string
  url: string
  eventos: number
  status: 'Ativo' | 'Falhando'
}
const mockWebhooks: Webhook[] = [
  { id: 'wh1', url: 'https://api.empresa.com.br/hooks/simulacusto', eventos: 3, status: 'Ativo' },
  { id: 'wh2', url: 'https://erp.empresa.com.br/gravity-sync', eventos: 1, status: 'Falhando' },
]

export function ApiCockpit() {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'visao_geral' | 'tokens' | 'webhooks' | 'docs' | 'conectores'>('visao_geral')

  function handleCopy() {
    navigator.clipboard.writeText(curlExample).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const COLUNAS: TabelaGlobalColuna<ApiService>[] = [
    {
      key: 'produto', label: 'Produto', tipo: 'texto',
      render: (v) => <span style={{ fontWeight: 600 }}>{v as string}</span>
    },
    {
      key: 'baseUrl', label: 'Base URL', tipo: 'texto',
      render: (v) => (
        <code style={{
          fontSize: '0.78125rem', color: '#818cf8',
          background: 'rgba(129,140,248,0.07)',
          padding: '0.2rem 0.5rem', borderRadius: '5px',
          display: 'block', maxWidth: '320px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {v as string}
        </code>
      )
    },
    {
      key: 'tokensAtivos', label: 'Tokens Ativos', tipo: 'texto',
      render: (v) => (
        <>
          <span style={{
            fontWeight: 700,
            color: Number(v) > 0 ? 'var(--ws-text)' : 'var(--ws-muted)',
          }}>
            {Number(v)}
          </span>
          {Number(v) === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', marginLeft: '0.375rem' }}>tokens</span>
          )}
        </>
      )
    },
    {
      key: 'consumoAtual', label: 'Volume Consumido', tipo: 'periodo',
      render: (_, item) => {
        if (item.tipoCobranca === 'Fixo') return <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>Ilimitado (Fixo)</span>
        
        const perc = item.consumoLimite ? Math.round((item.consumoAtual / item.consumoLimite) * 100) : 0
        const color = perc > 90 ? '#f87171' : perc > 75 ? '#fbbf24' : '#34d399'
        const sigla = item.tipoCobranca === 'Processo' ? 'procs' : item.tipoCobranca === 'Documento' ? 'docs' : 'reqs'

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{item.consumoAtual.toLocaleString('pt-BR')}</span>
              <span style={{ color: 'var(--ws-muted)' }}>/ {item.consumoLimite?.toLocaleString('pt-BR')} {sigla}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(perc, 100)}%`, background: color }} />
            </div>
          </div>
        )
      }
    },
    {
      key: 'status', label: 'Status da API', tipo: 'texto',
      render: (v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: item.status === 'Online' ? '#34d399' : item.status === 'Offline' ? '#f87171' : '#fbbf24',
            display: 'inline-block',
            boxShadow: `0 0 6px ${item.status === 'Online' ? '#34d39966' : item.status === 'Offline' ? '#f8717166' : '#fbbf2466'}`,
          }} />
          <span className={`ws-badge ${statusBadge[item.status]}`}>{item.status}</span>
        </div>
      )
    },
    {
      key: 'id', label: 'Ações', tipo: 'texto',
      render: () => (
        <BotaoGlobal
          variante="fantasma"
          tamanho="pequeno"
          icone={<Key weight="bold" size={13} />}
          onClick={() => setTab('tokens')}
        >
          Gerenciar Tokens
        </BotaoGlobal>
      )
    }
  ]

  const COLUNAS_TOKENS: TabelaGlobalColuna<Token>[] = [
    { key: 'nome', label: 'Nome', tipo: 'texto', render: (v) => <span style={{ fontWeight: 600 }}>{v as string}</span> },
    { key: 'produto', label: 'Produto', tipo: 'texto' },
    { key: 'ambiente', label: 'Ambiente', tipo: 'texto', render: (v) => <span className={`ws-badge ${v === 'Live' ? 'ws-badge-success' : 'ws-badge-warning'}`}>{v as string}</span> },
    { key: 'criadoEm', label: 'Criado em', tipo: 'texto' },
    { key: 'ultimoUso', label: 'Último Uso', tipo: 'texto' },
    { key: 'id', label: 'Ações', tipo: 'texto', render: () => <BotaoGlobal variante="perigo" tamanho="pequeno" icone={<Trash weight="bold" size={13} />}>Revogar</BotaoGlobal> }
  ]

  const COLUNAS_WEBHOOKS: TabelaGlobalColuna<Webhook>[] = [
    { key: 'url', label: 'URL de Destino', tipo: 'texto', render: (v) => <code style={{ color: '#818cf8', fontSize: '13px' }}>{v as string}</code> },
    { key: 'eventos', label: 'Qtd Eventos', tipo: 'texto' },
    { key: 'status', label: 'Status', tipo: 'texto', render: (v) => <span className={`ws-badge ${v === 'Ativo' ? 'ws-badge-success' : 'ws-badge-danger'}`}>{v as string}</span> },
    { key: 'id', label: 'Ações', tipo: 'texto', render: () => <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Target weight="bold" size={13} />}>Testar</BotaoGlobal> }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} color="#818cf8" />}
          titulo="API Cockpit"
          subtitulo="Central consolidada de todas as suas APIs Gravity com tokens e status em tempo real"
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="APIs Online"
            valor={services.filter(s => s.status === 'Online').length}
            subtexto={`de ${services.length} serviços`}
            variante="sucesso"
          />
          <StatCardGlobal
            titulo="APIs com Problema"
            valor={services.filter(s => s.status !== 'Online').length}
            variante={services.filter(s => s.status !== 'Online').length ? 'perigo' : 'padrao'}
          />
          <StatCardGlobal
            titulo="Tokens Ativos"
            valor={services.reduce((acc, s) => acc + s.tokensAtivos, 0)}
            variante="primario"
          />
          <StatCardGlobal
            titulo="Alertas de Consumo"
            valor={services.filter(s => s.consumoLimite && (s.consumoAtual / s.consumoLimite) > 0.85).length}
            subtexto="Serviços com >85% de uso"
            variante={services.filter(s => s.consumoLimite && (s.consumoAtual / s.consumoLimite) > 0.85).length > 0 ? 'perigo' : 'sucesso'}
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'visao_geral' ? ' active' : ''}`} onClick={() => setTab('visao_geral')}>
            Visão Geral
          </button>
          <button className={`ws-tab${tab === 'tokens' ? ' active' : ''}`} onClick={() => setTab('tokens')}>
            Tokens de Acesso
          </button>
          <button className={`ws-tab${tab === 'webhooks' ? ' active' : ''}`} onClick={() => setTab('webhooks')}>
            Webhooks & Eventos
          </button>
          <button className={`ws-tab${tab === 'docs' ? ' active' : ''}`} onClick={() => setTab('docs')}>
            Documentação & Playground
          </button>
          <button className={`ws-tab${tab === 'conectores' ? ' active' : ''}`} onClick={() => setTab('conectores')}>
            Conectores (ERP/SAP)
          </button>
        </div>
      }
    >
      {tab === 'visao_geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Services table */}
          <div>
            <div className="ws-fade-up ws-fade-up-d2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="ws-section-title" style={{ margin: 0 }}>
                <PlugsConnected weight="duotone" size={14} color="#818cf8" />
                Status dos Serviços
              </p>
            </div>
            <div className="ws-fade-up ws-fade-up-d2" style={{ position: 'relative', zIndex: 10 }}>
              <TabelaGlobal<ApiService>
                dados={services}
                colunas={COLUNAS}
                mensagemVazio="Nenhum serviço encontrado."
                mensagemSemFiltro="Nenhum serviço disponível no momento."
              />
            </div>
          </div>

          {/* How to use */}
          <div>
            <p className="ws-section-title ws-fade-up ws-fade-up-d3">
              Como usar a API Gravity
            </p>
            <div className="ws-fade-up ws-fade-up-d3" style={{
              background: 'var(--ws-surface)',
              border: '1px solid var(--ws-accent-border)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid rgba(129,140,248,0.08)',
                background: 'rgba(129,140,248,0.04)',
              }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-muted)' }}>
                  cURL — Exemplo de requisição autenticada
                </span>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={handleCopy}
                  style={{ gap: '0.375rem' }}
                >
                  {copied
                    ? <><CheckCircle weight="fill" size={13} color="#34d399" /> Copiado!</>
                    : <><Copy weight="bold" size={13} /> Copiar</>
                  }
                </BotaoGlobal>
              </div>
              <pre className="ws-code-block" style={{ borderRadius: 0, border: 'none', margin: 0 }}>
                {curlExample}
              </pre>
            </div>

            {/* Auth info cards */}
            <div className="ws-fade-up ws-fade-up-d4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { title: 'API Key', desc: 'Inclua o token no header Authorization: Bearer <token>. Tokens são gerados por produto e têm escopos específicos.' },
                { title: 'Rate Limits', desc: 'Plano Enterprise: 10.000 req/hora por serviço. Erros 429 indicam throttling — retry com backoff exponencial.' },
                { title: 'Ambientes', desc: 'Prefixo gv_live_sk_ para produção e gv_test_sk_ para sandbox. Todos os endpoints aceitam ambos os prefixos.' },
              ].map(card => (
                <div key={card.title} style={{
                  background: 'rgba(129,140,248,0.04)',
                  border: '1px solid rgba(129,140,248,0.1)',
                  borderRadius: '10px',
                  padding: '1rem 1.125rem',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#818cf8', marginBottom: '0.375rem' }}>{card.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'tokens' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Key weight="duotone" size={14} color="#818cf8" /> Tokens de Acesso
            </p>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Key weight="bold" size={14} />}>Novo Token</BotaoGlobal>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<Token>
              dados={mockTokens}
              colunas={COLUNAS_TOKENS}
              mensagemVazio="Nenhum token encontrado."
              mensagemSemFiltro="Nenhum token criado ainda."
            />
          </div>
        </div>
      )}

      {tab === 'webhooks' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <PlugsConnected weight="duotone" size={14} color="#818cf8" /> Webhooks & Eventos
            </p>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<PlugsConnected weight="bold" size={14} />}>Adicionar Webhook</BotaoGlobal>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<Webhook>
              dados={mockWebhooks}
              colunas={COLUNAS_WEBHOOKS}
              mensagemVazio="Nenhum webhook encontrado."
              mensagemSemFiltro="Nenhum webhook configurado."
            />
          </div>
        </div>
      )}

      {tab === 'docs' && (
        <div className="ws-fade-up" style={{ display: 'flex', gap: '2rem', minHeight: '500px', background: 'var(--ws-surface)', borderRadius: '14px', border: '1px solid var(--ws-accent-border)', padding: '1.5rem' }}>
          <div style={{ width: '250px', borderRight: '1px solid var(--ws-accent-border)', paddingRight: '1.5rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--ws-muted)', fontSize: '0.75rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>SIMULACUSTO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{ textAlign: 'left', padding: '0.625rem 0.875rem', background: 'rgba(129,140,248,0.1)', color: '#818cf8', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.2)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>POST /simulacoes</button>
              <button style={{ textAlign: 'left', padding: '0.625rem 0.875rem', background: 'transparent', color: 'var(--ws-text)', borderRadius: '8px', border: '1px solid transparent', fontSize: '0.8125rem', opacity: 0.7, cursor: 'pointer' }}>GET /simulacoes/:id</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span className="ws-badge ws-badge-success" style={{ fontSize: '0.8125rem' }}>POST</span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ws-text)' }}>Criar Simulação</h2>
            </div>
            <p style={{ color: 'var(--ws-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>Cria uma nova simulação de custos de importação baseada no NCM, origem e valor aduaneiro.</p>
            
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ws-text)', marginBottom: '0.75rem' }}>Body Requisito (JSON)</p>
            <pre className="ws-code-block" style={{ margin: 0, border: '1px solid var(--ws-accent-border)' }}>
{`{
  "titulo": "Importação de Peças",
  "valor": 15000.00,
  "ncm": "84821010",
  "origem": "CN"
}`}
            </pre>
            
            <div style={{ marginTop: '2rem' }}>
              <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Target weight="bold" size={14} />}>Testar no Playground</BotaoGlobal>
            </div>
          </div>
        </div>
      )}

      {tab === 'conectores' && (
        <div className="ws-fade-up">
          <div className="ws-form-card">
            <p className="ws-section-title">
              <Database weight="duotone" size={14} color="#818cf8"/> Configurações do Conector ERP/SAP
            </p>
            <div className="ws-form-row">
              <div className="ws-field">
                <label>Protocolo de Integração</label>
                <select defaultValue="odata">
                  <option value="odata">OData v4 (SAP)</option>
                  <option value="rest">REST API Genérica</option>
                  <option value="jdbc">JDBC/ODBC DB</option>
                </select>
              </div>
              <div className="ws-field">
                <label>Base URL do seu ERP</label>
                <input type="text" placeholder="https://sap.minhaempresa.com.br/odata" />
              </div>
            </div>
            <div className="ws-form-row">
              <div className="ws-field">
                <label>Usuário de Integração</label>
                <input type="text" placeholder="Ex: gravity_sync" />
              </div>
              <div className="ws-field">
                <label>Senha ou Token (Criptografada em AES-256)</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" placeholder="••••••••••••••" style={{ paddingRight: '2.5rem' }} />
                  <ShieldCheck size={18} color="#10b981" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--ws-accent-border)', paddingTop: '1.5rem' }}>
              <BotaoGlobal variante="primario" tamanho="pequeno" icone={<CheckCircle weight="bold" size={14} />}>Salvar Credenciais</BotaoGlobal>
              <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Plugs weight="bold" size={14} />}>Testar Comunicação</BotaoGlobal>
            </div>
          </div>
        </div>
      )}
    </PaginaGlobal>
  )
}
