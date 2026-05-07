// pages/workspace/ModalEditarAssinatura.tsx
// Modal "Configurar Assinatura" — espelho read-only completo do produto
// (todas as 6 abas de admin/produtos-gravity) + 1 aba editável (Distribuição
// por Workspace).
//
// Estratégia de dados (decisão dono 2026-05-06): lazy fetch quando o modal
// abre. Listagem em /me/assinaturas continua leve (8 campos do produto);
// modal busca produto completo via GET /api/v1/produtos/:slug, que retorna
// 20+ campos + faixas de preço + negociações ESPECÍFICAS da organização.
//
// Abas:
//   1. Dados Básicos      (read-only) — nome/desc/data lançamento/status/slug
//   2. Setup              (read-only) — chip único: sem/com setup
//   3. Valor do Produto   (read-only) — cobrança/valor + tabela de faixas (Padrão C)
//   4. Usuários           (read-only) — limite + custo extra
//   5. Help Desk          (read-only) — horas inclusas + custo hora extra
//   6. Tokens GABI        (read-only) — quota mensal
//   7. Negociações        (read-only) — acordos especiais da org (Padrão C)
//   8. Distribuição       (EDITÁVEL)  — workspaces habilitados (única ação)
//
// Footer "Salvar Alterações" só fica habilitado quando há diff em workspaces
// (dirty), independente da aba ativa — abas read-only nunca alteram dirty.

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import {
  Package, CurrencyDollar, CalendarBlank, Tag, TreeStructure,
  WarningCircle, Check, MagnifyingGlass, SelectionAll, Broom,
  Wrench, Sliders, Users, Headset, Coins, Handshake, CaretDown, CaretUp,
  Hash, FileText,
} from '@phosphor-icons/react'
import type { AssinaturaProdutoGravity } from '../../schemas/assinatura-produto-gravity'
import {
  produtoGravityCompletoResponseSchema,
  type ProdutoGravityCompleto,
} from '../../schemas/produto-gravity-completo'

interface Workspace {
  id_workspace:   string
  nome_workspace: string
  status_workspace: string
}

interface ModalEditarAssinaturaProps {
  assinatura: AssinaturaProdutoGravity | null
  workspaces: Workspace[]
  aoFechar: () => void
  aoSalvar: (workspacesAtivos: string[]) => Promise<void> | void
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { /* sem token */ }
  return headers
}

// ─── Helpers de display read-only ───────────────────────────────────────────

function formatDataPT(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

function formatMoeda(valor: string | null, moeda: string | null): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  const n = Number(valor)
  if (isNaN(n)) return String(valor)
  return `${moeda ?? 'BRL'} ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

const corStatusProduto: Record<string, { bg: string; color: string; border: string }> = {
  ATIVO:    { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  EM_BREVE: { bg: 'rgba(129,140,248,0.12)', color: '#818cf8', border: 'rgba(129,140,248,0.25)' },
  SUSPENSO: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  LEGADO:   { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.25)' },
  INATIVO:  { bg: 'rgba(100,116,139,0.10)', color: '#64748b', border: 'rgba(100,116,139,0.18)' },
}

// Display compacto de uma linha de detalhe (icone + label + valor texto puro)
function LinhaDetalhe({
  icone, valor, mono = false,
}: { icone: React.ReactNode; valor: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
      <span style={{ color: 'var(--ws-muted)', display: 'flex' }}>{icone}</span>
      <span style={{
        color: 'var(--ws-text)', fontWeight: 500, fontSize: '0.875rem',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>{valor}</span>
    </div>
  )
}

// Badge inline reusable
function Badge({ texto, cor, bg, border }: { texto: string; cor: string; bg: string; border: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.625rem', borderRadius: '9999px',
      fontSize: '0.6875rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: bg, color: cor, border: `1px solid ${border}`,
    }}>{texto}</span>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────

export function ModalEditarAssinatura({
  assinatura,
  workspaces,
  aoFechar,
  aoSalvar,
}: ModalEditarAssinaturaProps) {
  const { t } = useTranslation()
  const [workspacesAtivos, setWorkspacesAtivos] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Lazy fetch do produto completo (somente quando o modal abre).
  const [produtoCompleto, setProdutoCompleto] = useState<ProdutoGravityCompleto | null>(null)
  const [carregandoProduto, setCarregandoProduto] = useState(false)
  const [erroProduto, setErroProduto] = useState<string | null>(null)

  // Para Padrão C nas listas que crescem (faixas + negociações).
  const [mostrarTodasFaixas, setMostrarTodasFaixas] = useState(false)
  const [mostrarTodasNegociacoes, setMostrarTodasNegociacoes] = useState(false)

  useEffect(() => {
    if (assinatura) {
      setWorkspacesAtivos(
        assinatura.ativacoes_produto_gravity
          .filter((a) => a.ativo_produto_gravity_workspace)
          .map((a) => a.id_workspace),
      )
    }
  }, [assinatura])

  // Fetch produto completo quando modal abre (assinatura definida).
  useEffect(() => {
    if (!assinatura) {
      setProdutoCompleto(null)
      setErroProduto(null)
      return
    }

    let cancelado = false
    async function buscar() {
      setCarregandoProduto(true)
      setErroProduto(null)
      try {
        const headers = await getAuthHeaders()
        const slug = assinatura!.produto.slug_produto_gravity
        const res = await fetch(`/api/v1/produtos/${encodeURIComponent(slug)}`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = await res.json()
        const parsed = produtoGravityCompletoResponseSchema.safeParse(raw)
        if (!parsed.success) {
          console.error('[ModalEditarAssinatura] payload de /api/v1/produtos/:slug fora do contrato', parsed.error)
          throw new Error('Contrato inválido')
        }
        if (!cancelado) setProdutoCompleto(parsed.data.produto)
      } catch (err) {
        if (!cancelado) {
          setErroProduto(err instanceof Error ? err.message : 'Falha ao carregar produto')
        }
      } finally {
        if (!cancelado) setCarregandoProduto(false)
      }
    }
    buscar()
    return () => { cancelado = true }
  }, [assinatura])

  const dirty = (() => {
    if (!assinatura) return false
    const original = new Set(
      assinatura.ativacoes_produto_gravity
        .filter((a) => a.ativo_produto_gravity_workspace)
        .map((a) => a.id_workspace),
    )
    if (original.size !== workspacesAtivos.length) return true
    for (const id of workspacesAtivos) if (!original.has(id)) return true
    return false
  })()

  const toggleWorkspace = (id_workspace: string) => {
    setWorkspacesAtivos((prev) =>
      prev.includes(id_workspace)
        ? prev.filter((id) => id !== id_workspace)
        : [...prev, id_workspace],
    )
  }

  async function handleSalvar() {
    if (!assinatura) return
    setSalvando(true)
    try {
      const headers = await getAuthHeaders()
      const slug = assinatura.produto.slug_produto_gravity
      const original = new Map(
        assinatura.ativacoes_produto_gravity.map((a) => [a.id_workspace, a.ativo_produto_gravity_workspace]),
      )
      const promessas: Promise<unknown>[] = []
      for (const ws of workspaces) {
        const eraAtivo = !!original.get(ws.id_workspace)
        const ehAtivo = workspacesAtivos.includes(ws.id_workspace)
        if (eraAtivo !== ehAtivo) {
          promessas.push(
            fetch(
              `/api/v1/organizacoes/me/assinaturas/${encodeURIComponent(slug)}/workspaces/${encodeURIComponent(ws.id_workspace)}`,
              {
                method: 'PUT', headers,
                body: JSON.stringify({ ativo_produto_gravity_workspace: ehAtivo }),
              },
            ),
          )
        }
      }
      await Promise.all(promessas)
      await aoSalvar(workspacesAtivos)
    } finally {
      setSalvando(false)
    }
  }

  const requisitos: RequisitoSalvar[] = [
    {
      chave: 'nome',
      ok: !!assinatura?.produto.nome_produto_gravity,
      mensagem: 'Produto carregado',
    },
  ]

  // Padrão C — limites pra "ver todos" das listas que crescem.
  const FAIXAS_LIMITE = 4
  const NEGOC_LIMITE = 2

  // Estado de carregamento — placeholder genérico nas abas read-only enquanto
  // o produto completo está chegando.
  function PlaceholderCarregando({ titulo }: { titulo: string }) {
    return (
      <div style={{ paddingTop: '1rem', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
        {titulo}: {carregandoProduto ? 'Carregando…' : (erroProduto ? `Erro: ${erroProduto}` : '—')}
      </div>
    )
  }

  // ─── Abas read-only (consomem produtoCompleto) ──────────────────────────

  const abaDadosBasicos = {
    id: 'dados-basicos',
    rotulo: t('workspace.subscriptions.aba_dados_basicos', 'Dados Básicos'),
    conteudo: (
      <BannerRequisitosContexto requisitos={requisitos}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
          {!produtoCompleto ? <PlaceholderCarregando titulo="Dados Básicos" /> : (
            <>
              <CampoGeralGlobal label="Nome do Produto">
                <LinhaDetalhe icone={<Package size={16} />} valor={produtoCompleto.nome_produto_gravity} />
              </CampoGeralGlobal>

              <CampoGeralGlobal label="Slug">
                <LinhaDetalhe icone={<Hash size={16} />} valor={produtoCompleto.slug_produto_gravity} mono />
              </CampoGeralGlobal>

              <CampoGeralGlobal label="Descrição">
                <div style={{ padding: '0.5rem 0', color: 'var(--ws-text)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {produtoCompleto.descricao_produto_gravity || '—'}
                </div>
              </CampoGeralGlobal>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CampoGeralGlobal label="Status">
                  <div style={{ padding: '0.5rem 0' }}>
                    {(() => {
                      const s = produtoCompleto.status_produto_gravity
                      const c = corStatusProduto[s] ?? corStatusProduto.INATIVO
                      return <Badge texto={s} cor={c.color} bg={c.bg} border={c.border} />
                    })()}
                  </div>
                </CampoGeralGlobal>

                <CampoGeralGlobal label="Data de Lançamento">
                  <LinhaDetalhe
                    icone={<CalendarBlank size={16} />}
                    valor={formatDataPT(produtoCompleto.data_lancamento_produto_gravity)}
                  />
                </CampoGeralGlobal>
              </div>

              {produtoCompleto.publico_alvo_produto_gravity && (
                <CampoGeralGlobal label="Público-alvo">
                  <LinhaDetalhe icone={<Users size={16} />} valor={produtoCompleto.publico_alvo_produto_gravity} />
                </CampoGeralGlobal>
              )}
            </>
          )}
          <BannerRequisitosGlobal />
        </div>
      </BannerRequisitosContexto>
    ),
  }

  const abaSetup = {
    id: 'setup',
    rotulo: t('workspace.subscriptions.aba_setup', 'Setup'),
    conteudo: (
      <div style={{ paddingTop: '0.5rem' }}>
        {!produtoCompleto ? <PlaceholderCarregando titulo="Setup" /> : (
          produtoCompleto.possui_setup_produto_gravity ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
                <Wrench size={16} weight="duotone" color="var(--color-primary)" /> Taxa de Setup (one-time)
              </p>
              <Badge
                texto={`${formatMoeda(produtoCompleto.preco_setup_produto_gravity, produtoCompleto.moeda_setup_produto_gravity)} • ÚNICA`}
                cor="#a78bfa"
                bg="rgba(167,139,250,0.12)"
                border="rgba(167,139,250,0.25)"
              />
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                Cobrança única na ativação inicial do produto.
              </p>
            </div>
          ) : (
            <Badge
              texto="Sem taxa de setup"
              cor="#94a3b8"
              bg="rgba(148,163,184,0.10)"
              border="rgba(148,163,184,0.20)"
            />
          )
        )}
      </div>
    ),
  }

  const abaValorProduto = {
    id: 'valor-produto',
    rotulo: t('workspace.subscriptions.aba_valor_produto', 'Valor do Produto'),
    conteudo: (
      <div style={{ paddingTop: '0.5rem' }}>
        {!produtoCompleto ? <PlaceholderCarregando titulo="Valor do Produto" /> : (
          <>
            <p style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
              <Sliders size={16} weight="duotone" color="var(--color-primary)" /> Cobrança & Preços
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <CampoGeralGlobal label="Tipo de Cobrança">
                <LinhaDetalhe
                  icone={<Tag size={16} />}
                  valor={t(`enum.tipo_cobranca_produto_gravity.${produtoCompleto.tipo_cobranca_produto_gravity}`,
                    produtoCompleto.tipo_cobranca_produto_gravity)}
                />
              </CampoGeralGlobal>

              <CampoGeralGlobal label="Franquia (usuários inclusos)">
                <LinhaDetalhe
                  icone={<Users size={16} />}
                  valor={produtoCompleto.qtd_usuarios_base_produto_gravity ?? '—'}
                />
              </CampoGeralGlobal>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <CampoGeralGlobal label="Valor Unitário">
                <LinhaDetalhe
                  icone={<CurrencyDollar size={16} />}
                  valor={formatMoeda(produtoCompleto.preco_unitario_produto_gravity, produtoCompleto.moeda_unitario_produto_gravity)}
                  mono
                />
              </CampoGeralGlobal>
              <CampoGeralGlobal label="Valor Mínimo">
                <LinhaDetalhe
                  icone={<CurrencyDollar size={16} />}
                  valor={formatMoeda(produtoCompleto.preco_minimo_produto_gravity, produtoCompleto.moeda_minimo_produto_gravity)}
                  mono
                />
              </CampoGeralGlobal>
              <CampoGeralGlobal label="Valor Total">
                <LinhaDetalhe
                  icone={<CurrencyDollar size={16} />}
                  valor={formatMoeda(produtoCompleto.preco_total_produto_gravity, produtoCompleto.moeda_total_produto_gravity)}
                  mono
                />
              </CampoGeralGlobal>
            </div>

            {/* Faixas de Preço por Volume — Padrão C: mostra primeiras N, expande sob demanda */}
            <div>
              <p style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
                <Sliders size={14} weight="duotone" color="var(--color-primary)" />
                Faixas de Preço por Volume ({produtoCompleto.faixas_preco_produto_gravity.length})
              </p>

              {produtoCompleto.faixas_preco_produto_gravity.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                  Sem faixas de preço configuradas. O valor unitário se aplica a qualquer volume.
                </p>
              ) : (
                <>
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'rgba(129,140,248,0.05)' }}>
                        <tr>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--ws-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.6875rem' }}>De</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--ws-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.6875rem' }}>Até</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--ws-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.6875rem' }}>Preço Unitário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(mostrarTodasFaixas
                          ? produtoCompleto.faixas_preco_produto_gravity
                          : produtoCompleto.faixas_preco_produto_gravity.slice(0, FAIXAS_LIMITE)
                        ).map((f) => (
                          <tr key={f.id_faixa_preco_produto_gravity} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--ws-text)', fontFamily: 'monospace' }}>
                              {f.faixa_de_faixa_preco_produto_gravity}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--ws-text)', fontFamily: 'monospace' }}>
                              {f.faixa_ate_faixa_preco_produto_gravity ?? '∞'}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--ws-text)', fontFamily: 'monospace', textAlign: 'right' }}>
                              {formatMoeda(f.preco_faixa_preco_produto_gravity, f.moeda_faixa_preco_produto_gravity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {produtoCompleto.faixas_preco_produto_gravity.length > FAIXAS_LIMITE && (
                    <button
                      type="button"
                      onClick={() => setMostrarTodasFaixas((v) => !v)}
                      style={{
                        marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: 'transparent', border: 'none', color: '#818cf8',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0',
                        fontFamily: 'inherit',
                      }}
                    >
                      {mostrarTodasFaixas
                        ? <><CaretUp size={12} /> Ocultar</>
                        : <><CaretDown size={12} /> Ver todas as {produtoCompleto.faixas_preco_produto_gravity.length} faixas</>}
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    ),
  }

  const abaUsuarios = {
    id: 'usuarios',
    rotulo: t('workspace.subscriptions.aba_usuarios', 'Usuários'),
    conteudo: (
      <div style={{ paddingTop: '0.5rem' }}>
        {!produtoCompleto ? <PlaceholderCarregando titulo="Usuários" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
              <Users size={16} weight="duotone" color="var(--color-primary)" /> Limite de Usuários
            </p>

            {produtoCompleto.tipo_limite_usuario_produto_gravity === 'ILIMITADO' ? (
              <Badge
                texto="∞ Usuários Ilimitados"
                cor="#34d399"
                bg="rgba(52,211,153,0.12)"
                border="rgba(52,211,153,0.25)"
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <CampoGeralGlobal label="Usuários Inclusos">
                  <LinhaDetalhe
                    icone={<Users size={16} />}
                    valor={produtoCompleto.qtd_usuarios_base_produto_gravity ?? 0}
                  />
                </CampoGeralGlobal>

                <CampoGeralGlobal label="Custo por Usuário Extra">
                  <LinhaDetalhe
                    icone={<CurrencyDollar size={16} />}
                    valor={formatMoeda(
                      produtoCompleto.preco_usuario_extra_produto_gravity,
                      produtoCompleto.moeda_usuario_extra_produto_gravity,
                    )}
                    mono
                  />
                </CampoGeralGlobal>
              </div>
            )}
          </div>
        )}
      </div>
    ),
  }

  const abaHelpDesk = {
    id: 'help-desk',
    rotulo: t('workspace.subscriptions.aba_help_desk', 'Help Desk'),
    conteudo: (
      <div style={{ paddingTop: '0.5rem' }}>
        {!produtoCompleto ? <PlaceholderCarregando titulo="Help Desk" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
              <Headset size={16} weight="duotone" color="var(--color-primary)" /> Suporte Técnico
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <CampoGeralGlobal label="Horas Mensais Inclusas">
                <LinhaDetalhe
                  icone={<Headset size={16} />}
                  valor={`${produtoCompleto.horas_helpdesk_produto_gravity} h/mês`}
                />
              </CampoGeralGlobal>

              <CampoGeralGlobal label="Custo por Hora Extra">
                <LinhaDetalhe
                  icone={<CurrencyDollar size={16} />}
                  valor={formatMoeda(
                    produtoCompleto.preco_hora_extra_produto_gravity,
                    produtoCompleto.moeda_hora_extra_produto_gravity,
                  )}
                  mono
                />
              </CampoGeralGlobal>
            </div>
          </div>
        )}
      </div>
    ),
  }

  const abaTokens = {
    id: 'tokens',
    rotulo: t('workspace.subscriptions.aba_tokens', 'Tokens GABI'),
    conteudo: (
      <div style={{ paddingTop: '0.5rem' }}>
        {!produtoCompleto ? <PlaceholderCarregando titulo="Tokens GABI" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
              <Coins size={16} weight="duotone" color="var(--color-primary)" /> Quota Mensal de Tokens
            </p>

            <div style={{
              padding: '1.25rem', borderRadius: '12px',
              background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#818cf8', fontFamily: 'monospace' }}>
                {produtoCompleto.quota_gabi_mensal_produto_gravity.toLocaleString('pt-BR')}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                tokens / mês por organização
              </p>
            </div>

            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ws-muted)', lineHeight: 1.5 }}>
              Cota padrão de tokens GABI inclusa no plano. Reset automático no início de cada mês.
              Excedente é cobrado conforme política comercial.
            </p>
          </div>
        )}
      </div>
    ),
  }

  const abaNegociacoes = {
    id: 'negociacoes',
    rotulo: t('workspace.subscriptions.aba_negociacoes', 'Negociações'),
    conteudo: (
      <div style={{ paddingTop: '0.5rem' }}>
        {!produtoCompleto ? <PlaceholderCarregando titulo="Negociações" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
              <Handshake size={16} weight="duotone" color="var(--color-primary)" />
              Acordos Especiais ({produtoCompleto.negociacoes_produto_gravity.length})
            </p>

            {produtoCompleto.negociacoes_produto_gravity.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                Nenhuma negociação especial vigente para sua organização neste produto.
                Aplica-se a tabela padrão.
              </p>
            ) : (
              <>
                {(mostrarTodasNegociacoes
                  ? produtoCompleto.negociacoes_produto_gravity
                  : produtoCompleto.negociacoes_produto_gravity.slice(0, NEGOC_LIMITE)
                ).map((n) => (
                  <div
                    key={n.id_negociacao_especial_preco_produto_gravity}
                    style={{
                      padding: '0.875rem', borderRadius: '8px',
                      background: 'rgba(167,139,250,0.04)',
                      border: '1px solid rgba(167,139,250,0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                      <FileText size={16} color="#a78bfa" />
                      <span style={{ color: 'var(--ws-text)', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {n.acordo_negociacao_especial_preco_produto_gravity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {n.ilimitado_negociacao_especial_preco_produto_gravity ? (
                        <Badge
                          texto="VIGÊNCIA INDEFINIDA"
                          cor="#34d399"
                          bg="rgba(52,211,153,0.10)"
                          border="rgba(52,211,153,0.25)"
                        />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarBlank size={12} />
                          {formatDataPT(n.data_inicio_negociacao_especial_preco_produto_gravity)}
                          {' → '}
                          {formatDataPT(n.data_fim_negociacao_especial_preco_produto_gravity)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {produtoCompleto.negociacoes_produto_gravity.length > NEGOC_LIMITE && (
                  <button
                    type="button"
                    onClick={() => setMostrarTodasNegociacoes((v) => !v)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'transparent', border: 'none', color: '#818cf8',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0',
                      fontFamily: 'inherit',
                    }}
                  >
                    {mostrarTodasNegociacoes
                      ? <><CaretUp size={12} /> Ocultar</>
                      : <><CaretDown size={12} /> Ver todas as {produtoCompleto.negociacoes_produto_gravity.length} negociações</>}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    ),
  }

  // Aba 8 — DISTRIBUIÇÃO POR WORKSPACE (única editável)
  const abaDistribuicao = {
    id: 'distribuicao',
    rotulo: t('workspace.subscriptions.aba_distribuicao'),
    conteudo: (
      <div style={{ paddingTop: '0.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-text)' }}>
            <TreeStructure size={16} weight="duotone" color="var(--color-primary)" />{' '}
            {t('workspace.subscriptions.ativar_workspaces')}
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setWorkspacesAtivos(workspaces.map((w) => w.id_workspace))}
              style={{
                background: 'rgba(129,140,248,0.06)',
                border: '1px solid rgba(129,140,248,0.15)',
                color: '#818cf8',
                fontSize: '0.625rem', fontWeight: 700,
                padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <SelectionAll size={12} /> {t('tabela.selecionar_tudo')}
            </button>
            <button
              onClick={() => setWorkspacesAtivos([])}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--ws-muted)',
                fontSize: '0.625rem', fontWeight: 700,
                padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <Broom size={12} /> {t('tabela.limpar')}
            </button>
          </div>
        </div>

        <div className="ws-input-icon-wrap" style={{
          marginBottom: '1rem',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '8px',
        }}>
          <MagnifyingGlass size={16} color="var(--ws-muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar workspace..."
            style={{
              width: '100%', fontSize: '0.8125rem',
              background: 'transparent', border: 'none',
              color: 'var(--ws-text)', outline: 'none',
              paddingTop: '0.5rem', paddingBottom: '0.5rem',
            }}
          />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          overflowY: 'auto', flex: 1, paddingRight: '4px', maxHeight: '280px',
        }}>
          {workspaces
            .filter((w) => w.nome_workspace.toLowerCase().includes(search.toLowerCase()))
            .map((w) => {
              const ativo = workspacesAtivos.includes(w.id_workspace)
              return (
                <div
                  key={w.id_workspace}
                  onClick={() => toggleWorkspace(w.id_workspace)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem',
                    borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                    background: ativo ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
                    border: ativo ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '4px',
                    border: '1px solid',
                    borderColor: ativo ? '#34d399' : 'var(--ws-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: ativo ? '#34d399' : 'transparent',
                    color: '#fff', transition: 'all 0.2s',
                  }}>
                    {ativo && <Check size={12} weight="bold" />}
                  </div>
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 500,
                    color: ativo ? 'var(--ws-text)' : 'var(--ws-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{w.nome_workspace}</span>
                </div>
              )
            })}
        </div>

        {workspacesAtivos.length === 0 && (
          <div style={{
            marginTop: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#fbbf24', fontSize: '0.6875rem',
            background: 'rgba(251,191,36,0.05)',
            padding: '8px', borderRadius: '4px',
          }}>
            <WarningCircle size={14} /> {t('workspace.subscriptions.aviso_sem_workspace')}
          </div>
        )}
      </div>
    ),
  }

  return (
    <ModalFormularioAbasGlobal
      aberto={!!assinatura}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Package weight="duotone" size={22} color="var(--color-primary)" />}
      titulo={t('workspace.subscriptions.modal_titulo')}
      subtitulo={t('workspace.subscriptions.modal_subtitulo')}
      dirty={dirty}
      podesSalvar={dirty && !salvando && requisitos.every((r) => r.ok)}
      tamanho="lg"
      larguraMaxima="820px"
      altura="640px"

      abas={[
        abaDadosBasicos,
        abaSetup,
        abaValorProduto,
        abaUsuarios,
        abaHelpDesk,
        abaTokens,
        abaNegociacoes,
        abaDistribuicao,
      ]}
    />
  )
}
