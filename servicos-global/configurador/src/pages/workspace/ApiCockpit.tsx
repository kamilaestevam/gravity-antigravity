import React, { useState } from 'react'
import { PlugsConnected, Key, Copy, CheckCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'

type ApiStatus = 'Online' | 'Offline' | 'Degradado'

type ApiService = {
  id: string
  produto: string
  baseUrl: string
  tokensAtivos: number
  status: ApiStatus
}

const services: ApiService[] = [
  { id: 's1', produto: 'Dashboard Global',    baseUrl: 'https://api.gravity.com.br/dashboard/v1',   tokensAtivos: 3, status: 'Online'   },
  { id: 's2', produto: 'Gestão de Atividades', baseUrl: 'https://api.gravity.com.br/atividades/v2', tokensAtivos: 1, status: 'Online'   },
  { id: 's3', produto: 'SimulaCusto',          baseUrl: 'https://api.gravity.com.br/sim-custo/v1',  tokensAtivos: 2, status: 'Online'   },
  { id: 's4', produto: 'Gabi IA Assistant',    baseUrl: 'https://api.gravity.com.br/gabi/v1',      tokensAtivos: 0, status: 'Degradado' },
  { id: 's5', produto: 'WhatsApp Business',    baseUrl: 'https://api.gravity.com.br/whatsapp/v1',  tokensAtivos: 0, status: 'Offline'   },
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

export function ApiCockpit() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(curlExample).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="ws-fade-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--ws-text)', marginBottom: '0.25rem' }}>
          API Cockpit
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--ws-muted)' }}>
          Central consolidada de todas as suas APIs Gravity com tokens e status em tempo real.
        </p>
      </div>

      {/* Status overview */}
      <div className="ws-stats ws-fade-up ws-fade-up-d1">
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
          titulo="Tokens Ativos (total)"
          valor={services.reduce((acc, s) => acc + s.tokensAtivos, 0)}
          variante="primario"
        />
      </div>

      {/* Services table */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2">
        <PlugsConnected weight="duotone" size={14} color="#38bdf8" />
        Status dos Serviços
      </p>
      <div className="ws-table-wrap ws-fade-up ws-fade-up-d2" style={{ marginBottom: '2rem' }}>
        <table className="ws-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Base URL</th>
              <th>Tokens Ativos</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.produto}</td>
                <td>
                  <code style={{
                    fontSize: '0.78125rem', color: '#38bdf8',
                    background: 'rgba(56,189,248,0.07)',
                    padding: '0.2rem 0.5rem', borderRadius: '5px',
                    display: 'block', maxWidth: '320px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.baseUrl}
                  </code>
                </td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: s.tokensAtivos > 0 ? 'var(--ws-text)' : 'var(--ws-muted)',
                  }}>
                    {s.tokensAtivos}
                  </span>
                  {s.tokensAtivos === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', marginLeft: '0.375rem' }}>tokens</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: s.status === 'Online' ? '#34d399' : s.status === 'Offline' ? '#f87171' : '#fbbf24',
                      display: 'inline-block',
                      boxShadow: `0 0 6px ${s.status === 'Online' ? '#34d39966' : s.status === 'Offline' ? '#f8717166' : '#fbbf2466'}`,
                    }} />
                    <span className={`ws-badge ${statusBadge[s.status]}`}>{s.status}</span>
                  </div>
                </td>
                <td>
                  <BotaoGlobal
                    variante="fantasma"
                    tamanho="pequeno"
                    icone={<Key weight="bold" size={13} />}
                    disabled
                    data-tooltip="Disponível em breve"
                  >
                    Gerenciar Tokens
                  </BotaoGlobal>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How to use */}
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
          borderBottom: '1px solid rgba(56,189,248,0.08)',
          background: 'rgba(56,189,248,0.04)',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        {[
          { title: 'API Key', desc: 'Inclua o token no header Authorization: Bearer <token>. Tokens são gerados por produto e têm escopos específicos.' },
          { title: 'Rate Limits', desc: 'Plano Enterprise: 10.000 req/hora por serviço. Erros 429 indicam throttling — retry com backoff exponencial.' },
          { title: 'Ambientes', desc: 'Prefixo gv_live_sk_ para produção e gv_test_sk_ para sandbox. Todos os endpoints aceitam ambos os prefixos.' },
        ].map(card => (
          <div key={card.title} style={{
            background: 'rgba(56,189,248,0.04)',
            border: '1px solid rgba(56,189,248,0.1)',
            borderRadius: '10px',
            padding: '1rem 1.125rem',
          }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#38bdf8', marginBottom: '0.375rem' }}>{card.title}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
