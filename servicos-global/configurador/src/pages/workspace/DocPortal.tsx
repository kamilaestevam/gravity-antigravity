/**
 * DocPortal.tsx
 *
 * Developer Portal — padrão Thomson Reuters.
 * Layout de 3 painéis:
 *   1. Sidebar de Endpoints (agrupados por produto)
 *   2. Painel Central com documentação request/response
 *   3. Playground de execução interativo
 *
 * Os produtos exibidos são derivados do array `produtosAssinados`
 * (IDs dos produtos com status Ativo ou Trial em Assinaturas.tsx).
 */
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookBookmark, Target, Copy, CheckCircle,
  CaretRight, ArrowSquareOut, SealCheck,
  Play, Lightning, Timer, ShieldCheck,
  Code, FileCode, ArrowClockwise, CaretDown,
  Warning, Spinner, ArrowRight,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  CATALOGO_PRODUTOS,
  type ProdutoDoc,
  type DocEndpoint,
  type HttpMethod,
} from '../../services/produto-catalogo'
import type { Produto } from './Assinaturas'

// ─── Tipos e helpers ─────────────────────────────────────────────────────────

const METHOD_COLOR: Record<HttpMethod, { bg: string; color: string; label: string }> = {
  GET:    { bg: 'rgba(52,211,153,0.15)',  color: '#34d399', label: 'GET' },
  POST:   { bg: 'rgba(129,140,248,0.15)', color: '#818cf8', label: 'POST' },
  PUT:    { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', label: 'PUT' },
  PATCH:  { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c', label: 'PATCH' },
  DELETE: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', label: 'DELETE' },
}

function MethodBadge({ method, size = 'normal' }: { method: HttpMethod; size?: 'normal' | 'small' }) {
  const c = METHOD_COLOR[method]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'small' ? '0.125rem 0.4rem' : '0.2rem 0.6rem',
      borderRadius: '6px',
      fontSize: size === 'small' ? '0.5625rem' : '0.6875rem',
      fontWeight: 800,
      letterSpacing: '0.06em', fontFamily: 'monospace',
      background: c.bg, color: c.color,
    }}>
      {method}
    </span>
  )
}

// ─── JSON com syntax highlight simples ───────────────────────────────────────

function CodeBlock({ code, label, maxHeight, editable, onChange, id }: {
  code: string
  label?: string
  maxHeight?: string
  editable?: boolean
  onChange?: (v: string) => void
  id?: string
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div style={{
      borderRadius: '10px', overflow: 'hidden',
      border: '1px solid rgba(129,140,248,0.12)',
      background: 'rgba(10,10,20,0.6)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.4rem 0.875rem',
        borderBottom: '1px solid rgba(129,140,248,0.08)',
        background: 'rgba(129,140,248,0.04)',
      }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', fontWeight: 600 }}>
          {label ?? 'JSON'}
        </span>
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: copied ? '#34d399' : 'var(--ws-muted)',
            fontSize: '0.6875rem', transition: 'color 0.2s',
            fontFamily: 'var(--font)',
          }}
        >
          {copied
            ? <><CheckCircle weight="fill" size={12} /> {t('workspace.docportal.copiado')}</>
            : <><Copy weight="bold" size={12} /> {t('workspace.docportal.copiar')}</>}
        </button>
      </div>
      {editable ? (
        <textarea
          id={id}
          value={code}
          onChange={e => onChange?.(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%', margin: 0, padding: '0.875rem',
            fontSize: '0.78125rem', lineHeight: 1.7,
            color: '#c4b5fd', overflow: 'auto',
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            background: 'transparent', border: 'none',
            resize: 'vertical', outline: 'none',
            minHeight: '80px',
            maxHeight: maxHeight ?? '200px',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <pre style={{
          margin: 0, padding: '0.875rem',
          fontSize: '0.78125rem', lineHeight: 1.7,
          color: '#c4b5fd', overflow: 'auto',
          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          maxHeight: maxHeight ?? 'none',
        }}>
          {code}
        </pre>
      )}
    </div>
  )
}

// ─── Playground Panel ─────────────────────────────────────────────────────────

function PlaygroundPanel({ ep, baseUrl, cor }: {
  ep: DocEndpoint
  baseUrl: string
  cor: string
}) {
  const [body, setBody] = useState(ep.requestBody ?? '')
  const [env, setEnv] = useState<'sandbox' | 'live'>('sandbox')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ status: number; body: string; time: number } | null>(null)
  const [showEnvDrop, setShowEnvDrop] = useState(false)
  const envRef = useRef<HTMLDivElement>(null)

  // Reset when endpoint changes
  useEffect(() => {
    setBody(ep.requestBody ?? '')
    setResult(null)
    setLoading(false)
  }, [ep.path, ep.method])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (envRef.current && !envRef.current.contains(e.target as Node)) setShowEnvDrop(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function executar() {
    setLoading(true)
    setResult(null)
    const start = performance.now()
    setTimeout(() => {
      const time = Math.round(performance.now() - start)
      setResult({
        status: 200,
        body: ep.responseBody ?? '{\n  "status": "ok"\n}',
        time,
      })
      setLoading(false)
    }, 600 + Math.random() * 500)
  }

  const tokenPrefix = env === 'sandbox' ? 'gv_test_sk_' : 'gv_live_sk_'

  const curlSnippet = `curl -X ${ep.method} \\
  ${baseUrl}${ep.path} \\
  -H "Authorization: Bearer ${tokenPrefix}xxxxxxxxxxxx" \\
  -H "Content-Type: application/json"${body ? ` \\
  -d '${body.replace(/\n/g, '\\n')}'` : ''}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Playground Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(129,140,248,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightning weight="fill" size={14} color={cor} />
          <span style={{
            fontSize: '0.6875rem', fontWeight: 800,
            letterSpacing: '0.08em', color: 'var(--ws-muted)',
          }}>
            PLAYGROUND
          </span>
        </div>

        {/* Environment selector */}
        <div ref={envRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowEnvDrop(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.3rem 0.75rem', borderRadius: '999px',
              background: env === 'sandbox'
                ? 'rgba(251,191,36,0.1)'
                : 'rgba(52,211,153,0.1)',
              border: `1px solid ${env === 'sandbox'
                ? 'rgba(251,191,36,0.25)'
                : 'rgba(52,211,153,0.25)'}`,
              color: env === 'sandbox' ? '#fbbf24' : '#34d399',
              fontSize: '0.6875rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font)',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: env === 'sandbox' ? '#fbbf24' : '#34d399',
            }} />
            {env === 'sandbox' ? 'Sandbox' : 'Live'}
            <CaretDown weight="bold" size={10} />
          </button>
          {showEnvDrop && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0,
              background: 'var(--ws-surface)', border: '1px solid var(--ws-accent-border)',
              borderRadius: '8px', overflow: 'hidden', zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              minWidth: '140px',
            }}>
              {(['sandbox', 'live'] as const).map(e => (
                <button
                  key={e}
                  onClick={() => { setEnv(e); setShowEnvDrop(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    width: '100%', padding: '0.5rem 0.75rem',
                    background: env === e ? 'rgba(129,140,248,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--ws-text)', fontSize: '0.78125rem',
                    fontFamily: 'var(--font)',
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: e === 'sandbox' ? '#fbbf24' : '#34d399',
                  }} />
                  {e === 'sandbox' ? 'Sandbox' : 'Live (Produção)'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* URL Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(10,10,20,0.5)',
        border: '1px solid rgba(129,140,248,0.12)',
        borderRadius: '8px', padding: '0.5rem 0.75rem',
      }}>
        <MethodBadge method={ep.method} size="small" />
        <code style={{
          flex: 1, fontSize: '0.75rem', color: cor,
          fontFamily: "'Fira Code', monospace",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {baseUrl}{ep.path}
        </code>
        <button
          onClick={executar}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            background: loading ? 'rgba(129,140,248,0.1)' : 'linear-gradient(135deg, #6366f1, #818cf8)',
            border: 'none', borderRadius: '6px',
            color: loading ? 'var(--ws-muted)' : '#fff',
            fontSize: '0.6875rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font)',
            transition: 'all 0.2s',
          }}
        >
          {loading
            ? <><ArrowClockwise weight="bold" size={12} className="dp-spin" /> Enviando...</>
            : <><Play weight="fill" size={11} /> Enviar</>
          }
        </button>
      </div>

      {/* Auth Header (read-only) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        background: 'rgba(129,140,248,0.03)',
        border: '1px solid rgba(129,140,248,0.08)',
        borderRadius: '6px', fontSize: '0.6875rem',
      }}>
        <ShieldCheck weight="duotone" size={13} color={env === 'live' ? '#34d399' : '#fbbf24'} />
        <span style={{ color: 'var(--ws-muted)' }}>Authorization:</span>
        <code style={{ color: 'var(--ws-text)', fontFamily: "'Fira Code', monospace", fontSize: '0.6875rem' }}>
          Bearer {tokenPrefix}••••••••••••
        </code>
      </div>

      {/* Request Body (editable) */}
      {(ep.method === 'POST' || ep.method === 'PUT' || ep.method === 'PATCH') && (
        <div style={{ flex: body ? undefined : 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.375rem',
          }}>
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700,
              color: 'var(--ws-muted)', letterSpacing: '0.04em',
            }}>
              REQUEST BODY
            </span>
            {ep.requestBody && body !== ep.requestBody && (
              <button
                onClick={() => setBody(ep.requestBody ?? '')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  background: 'transparent', border: 'none',
                  color: 'var(--ws-muted)', fontSize: '0.625rem',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                <ArrowClockwise size={10} /> Reset
              </button>
            )}
          </div>
          <CodeBlock
            code={body}
            label="application/json"
            editable
            onChange={setBody}
            maxHeight="160px"
            id="playground-request-body"
          />
        </div>
      )}

      {/* Response */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '0.375rem',
        }}>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700,
            color: 'var(--ws-muted)', letterSpacing: '0.04em',
          }}>
            RESPONSE
          </span>
          {result && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                fontSize: '0.6875rem', fontWeight: 700,
                color: result.status === 200 ? '#34d399' : '#f87171',
              }}>
                <SealCheck weight="fill" size={12} />
                {result.status} OK
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                fontSize: '0.625rem', color: 'var(--ws-muted)',
              }}>
                <Timer weight="bold" size={10} />
                {result.time}ms
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,20,0.4)', borderRadius: '10px',
            border: '1px solid rgba(129,140,248,0.08)',
            gap: '0.5rem', color: 'var(--ws-muted)', fontSize: '0.8125rem',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#818cf8', animation: 'docsPulse 1s infinite',
              display: 'inline-block',
            }} />
            Processando requisição…
          </div>
        ) : result ? (
          <CodeBlock code={result.body} label={`Response · ${result.time}ms`} maxHeight="240px" />
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,20,0.3)', borderRadius: '10px',
            border: '1px dashed rgba(129,140,248,0.15)',
            gap: '0.5rem', color: 'var(--ws-muted)',
            minHeight: '100px',
          }}>
            <Play weight="duotone" size={24} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.78125rem' }}>Clique em "Enviar" para testar</span>
          </div>
        )}
      </div>

      {/* cURL Snippet */}
      <details style={{ marginTop: 'auto' }}>
        <summary style={{
          fontSize: '0.6875rem', color: 'var(--ws-muted)', cursor: 'pointer',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem',
          userSelect: 'none', listStyle: 'none',
        }}>
          <Code weight="bold" size={12} />
          Ver cURL equivalente
          <CaretRight size={10} weight="bold" style={{ transition: 'transform 0.15s' }} />
        </summary>
        <div style={{ marginTop: '0.5rem' }}>
          <CodeBlock code={curlSnippet} label="cURL" maxHeight="120px" />
        </div>
      </details>
    </div>
  )
}

// ─── Detalhe de endpoint (painel central) ─────────────────────────────────────

function EndpointDetail({ ep, cor, baseUrl }: { ep: DocEndpoint; cor: string; baseUrl: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <MethodBadge method={ep.method} />
          <code style={{ fontSize: '0.9375rem', color: cor, fontWeight: 700 }}>{ep.path}</code>
        </div>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', color: 'var(--ws-text)' }}>
          {ep.titulo}
        </h3>
        <p style={{ margin: 0, color: 'var(--ws-muted)', fontSize: '0.8125rem', lineHeight: 1.65 }}>
          {ep.descricao}
        </p>
      </div>

      {/* Base URL */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        background: 'rgba(129,140,248,0.04)',
        borderRadius: '6px', border: '1px solid rgba(129,140,248,0.1)',
      }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', fontWeight: 600 }}>Endpoint:</span>
        <code style={{
          fontSize: '0.75rem', color: cor,
          fontFamily: "'Fira Code', monospace",
        }}>
          {baseUrl}{ep.path}
        </code>
      </div>

      {/* Parâmetros */}
      {ep.params && ep.params.length > 0 && (
        <div>
          <p style={{
            fontWeight: 700, fontSize: '0.78125rem',
            color: 'var(--ws-text)', marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            <FileCode weight="duotone" size={14} color={cor} />
            Parâmetros
          </p>
          <div style={{
            border: '1px solid rgba(129,140,248,0.1)',
            borderRadius: '8px', overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '120px 80px 1fr 80px',
              alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              background: 'rgba(129,140,248,0.06)',
              fontSize: '0.625rem', fontWeight: 700,
              color: 'var(--ws-muted)', letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              <span>Nome</span>
              <span>Tipo</span>
              <span>Descrição</span>
              <span style={{ textAlign: 'right' }}>Requerido</span>
            </div>
            {ep.params.map((param, i) => (
              <div key={param.nome} style={{
                display: 'grid', gridTemplateColumns: '120px 80px 1fr 80px',
                alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderTop: i > 0 ? '1px solid rgba(129,140,248,0.06)' : undefined,
                fontSize: '0.78125rem',
              }}>
                <code style={{ color: cor, fontWeight: 700, fontSize: '0.75rem' }}>{param.nome}</code>
                <span style={{ color: 'var(--ws-muted)', fontSize: '0.6875rem' }}>{param.tipo}</span>
                <span style={{ color: 'var(--ws-text)', opacity: 0.85, fontSize: '0.75rem' }}>{param.descricao}</span>
                <span style={{
                  textAlign: 'right',
                  padding: '0.125rem 0.4rem', borderRadius: '999px',
                  fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.04em',
                  background: param.obrigatorio ? 'rgba(248,113,113,0.12)' : 'rgba(100,116,139,0.12)',
                  color: param.obrigatorio ? '#f87171' : '#64748b',
                  whiteSpace: 'nowrap', display: 'inline-block',
                }}>
                  {param.obrigatorio ? 'obrigatório' : 'opcional'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request body */}
      {ep.requestBody && (
        <div>
          <p style={{
            fontWeight: 700, fontSize: '0.78125rem',
            color: 'var(--ws-text)', marginBottom: '0.5rem',
          }}>
            Request Body
          </p>
          <CodeBlock code={ep.requestBody} label="application/json" maxHeight="200px" />
        </div>
      )}

      {/* Response */}
      {ep.responseBody && (
        <div>
          <p style={{
            fontWeight: 700, fontSize: '0.78125rem',
            color: 'var(--ws-text)', marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}>
            Resposta de Exemplo
            <span style={{
              padding: '0.1rem 0.4rem', borderRadius: '4px',
              background: 'rgba(52,211,153,0.12)', color: '#34d399',
              fontSize: '0.625rem', fontWeight: 700,
            }}>
              200 OK
            </span>
          </p>
          <CodeBlock code={ep.responseBody} label="Response Body" maxHeight="220px" />
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface DocPortalProps {
  /** IDs dos produtos assinados (Ativo | Trial) — vêm de Assinaturas */
  produtosAssinados: Produto[]
}

export function DocPortal({ produtosAssinados }: DocPortalProps) {
  const { t } = useTranslation()
  const assinadosIds = new Set(
    produtosAssinados
      .filter(p => p.status === 'Ativo' || p.status === 'Trial')
      .map(p => p.id)
  )

  const produtosDisponiveis: ProdutoDoc[] = CATALOGO_PRODUTOS.filter(p =>
    assinadosIds.has(p.id)
  )

  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoDoc | null>(
    produtosDisponiveis[0] ?? null
  )
  const [endpointSelecionado, setEndpointSelecionado] = useState<DocEndpoint | null>(
    produtosDisponiveis[0]?.endpoints[0] ?? null
  )

  function selecionarProduto(p: ProdutoDoc) {
    setProdutoSelecionado(p)
    setEndpointSelecionado(p.endpoints[0] ?? null)
  }

  if (produtosDisponiveis.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '400px', gap: '1rem', color: 'var(--ws-muted)',
      }}>
        <BookBookmark weight="duotone" size={40} />
        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Nenhum produto assinado com documentação disponível.</p>
        <p style={{ fontSize: '0.8125rem', opacity: 0.7 }}>Ative ou contrate um produto para acessar os docs.</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes docsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
        @keyframes dpSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .dp-spin { animation: dpSpin 0.8s linear infinite; }
        .dp-sidebar-btn {
          text-align: left;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4375rem 0.75rem;
          border-radius: 7px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--ws-text);
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-family: var(--font);
        }
        .dp-sidebar-btn:hover {
          background: rgba(129,140,248,0.06);
        }
        .dp-sidebar-btn.active {
          background: rgba(129,140,248,0.1);
          border-color: rgba(129,140,248,0.18);
        }
        .dp-produto-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          font-family: var(--font);
        }
        .dp-produto-btn:hover {
          background: rgba(255,255,255,0.03);
        }
        .dp-produto-btn.active {
          background: rgba(129,140,248,0.08);
          border-color: rgba(129,140,248,0.18);
        }
        /* Divider vertical */
        .dp-divider {
          width: 1px;
          background: rgba(129,140,248,0.1);
          flex-shrink: 0;
        }
        /* Scrollbar */
        .dp-scroll::-webkit-scrollbar { width: 4px; }
        .dp-scroll::-webkit-scrollbar-track { background: transparent; }
        .dp-scroll::-webkit-scrollbar-thumb {
          background: rgba(129,140,248,0.15);
          border-radius: 4px;
        }
        details > summary::-webkit-details-marker,
        details > summary::marker { display: none; content: ''; }
      `}</style>

      <div style={{
        display: 'flex', gap: 0, minHeight: '620px', height: 'calc(100vh - 380px)',
        background: 'var(--ws-surface)',
        border: '1px solid var(--ws-accent-border)',
        borderRadius: '14px', overflow: 'hidden',
      }}>

        {/* ── Painel 1: Sidebar Endpoints ── */}
        <div className="dp-scroll" style={{
          width: '220px', flexShrink: 0,
          padding: '1rem 0.625rem',
          display: 'flex', flexDirection: 'column', gap: '0.125rem',
          overflowY: 'auto',
          borderRight: '1px solid rgba(129,140,248,0.1)',
        }}>
          {/* Selector de produto */}
          <p style={{
            fontSize: '0.625rem', fontWeight: 800,
            letterSpacing: '0.08em', color: 'var(--ws-muted)',
            marginBottom: '0.375rem', paddingLeft: '0.75rem',
            textTransform: 'uppercase',
          }}>
            Produtos
          </p>
          {produtosDisponiveis.map(p => (
            <button
              key={p.id}
              className={`dp-produto-btn${produtoSelecionado?.id === p.id ? ' active' : ''}`}
              onClick={() => selecionarProduto(p)}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: produtoSelecionado?.id === p.id ? p.cor : 'var(--ws-muted)',
                flexShrink: 0, opacity: produtoSelecionado?.id === p.id ? 1 : 0.4,
                transition: 'all 0.15s',
              }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{
                  fontSize: '0.78125rem', fontWeight: 600,
                  color: produtoSelecionado?.id === p.id ? p.cor : 'var(--ws-text)',
                  transition: 'color 0.15s',
                  display: 'block',
                }}>
                  {p.nome}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)' }}>
                  {p.versao}
                </span>
              </div>
            </button>
          ))}

          {/* Endpoints do produto selecionado */}
          {produtoSelecionado && (
            <>
              <div style={{
                height: 1, background: 'rgba(129,140,248,0.1)',
                margin: '0.625rem 0.75rem',
              }} />
              <p style={{
                fontSize: '0.5625rem', fontWeight: 800,
                letterSpacing: '0.08em', color: 'var(--ws-muted)',
                marginBottom: '0.25rem', paddingLeft: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Endpoints · {produtoSelecionado.endpoints.length}
              </p>
              {produtoSelecionado.endpoints.map(ep => {
                const c = METHOD_COLOR[ep.method]
                const isActive = endpointSelecionado?.path === ep.path && endpointSelecionado?.method === ep.method
                return (
                  <button
                    key={`${ep.method}${ep.path}`}
                    className={`dp-sidebar-btn${isActive ? ' active' : ''}`}
                    onClick={() => setEndpointSelecionado(ep)}
                  >
                    <span style={{
                      display: 'inline-block', minWidth: '34px',
                      fontSize: '0.5625rem', fontWeight: 800,
                      letterSpacing: '0.04em', fontFamily: 'monospace',
                      color: c.color,
                    }}>
                      {ep.method}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      color: isActive ? 'var(--ws-text)' : 'var(--ws-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {ep.path}
                    </span>
                    {isActive && <CaretRight size={9} weight="bold" style={{ flexShrink: 0, color: 'var(--ws-muted)' }} />}
                  </button>
                )
              })}

              {/* Link docs externos */}
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                <a
                  href="#"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.6875rem', color: 'var(--ws-muted)',
                    paddingLeft: '0.75rem', textDecoration: 'none', opacity: 0.7,
                  }}
                >
                  <ArrowSquareOut size={11} /> Docs completos
                </a>
              </div>
            </>
          )}
        </div>

        {/* ── Painel 2: Documentação Central ── */}
        <div className="dp-scroll" style={{
          flex: 1, minWidth: 0,
          padding: '1.5rem 1.75rem',
          overflowY: 'auto',
          borderRight: '1px solid rgba(129,140,248,0.1)',
        }}>
          {endpointSelecionado && produtoSelecionado
            ? <EndpointDetail
                ep={endpointSelecionado}
                cor={produtoSelecionado.cor}
                baseUrl={produtoSelecionado.baseUrl}
              />
            : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: '0.75rem',
                color: 'var(--ws-muted)',
              }}>
                <BookBookmark weight="duotone" size={32} />
                <p style={{ fontSize: '0.875rem' }}>Selecione um endpoint para ver a documentação.</p>
              </div>
            )
          }
        </div>

        {/* ── Painel 3: Playground ── */}
        <div className="dp-scroll" style={{
          width: '380px', flexShrink: 0,
          padding: '1rem 1.25rem',
          overflowY: 'auto',
          background: 'rgba(10,10,20,0.25)',
        }}>
          {endpointSelecionado && produtoSelecionado
            ? <PlaygroundPanel
                ep={endpointSelecionado}
                baseUrl={produtoSelecionado.baseUrl}
                cor={produtoSelecionado.cor}
              />
            : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: '0.75rem',
                color: 'var(--ws-muted)',
              }}>
                <Lightning weight="duotone" size={32} />
                <p style={{ fontSize: '0.8125rem' }}>Selecione um endpoint para usar o playground.</p>
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}
