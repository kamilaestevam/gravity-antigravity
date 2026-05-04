// pages/workspace/ModalEditarAssinatura.tsx
// Modal de edição de assinatura: distribuição por workspace.
// O nome/cobrança/valor vêm do catálogo do produto (ProdutoGravity)
// e não são editáveis pelo workspace; só admin (gravity_admin) altera.
//
// Aqui o usuário só configura:
//   - Workspaces habilitados/desabilitados
//
// Toggle persiste via PUT /api/v1/organizacoes/me/assinaturas/:slug/workspaces/:id_workspace.

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
} from '@phosphor-icons/react'
import type { AssinaturaProdutoGravity } from '../../schemas/assinatura-produto-gravity'

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

  useEffect(() => {
    if (assinatura) {
      setWorkspacesAtivos(
        assinatura.ativacoes_produto_gravity
          .filter((a) => a.ativo_produto_gravity_workspace)
          .map((a) => a.id_workspace),
      )
    }
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

  const tipoCobrancaLabel = assinatura
    ? t(
        `enum.tipo_cobranca_produto_gravity.${assinatura.produto.tipo_cobranca_produto_gravity}`,
        assinatura.produto.tipo_cobranca_produto_gravity,
      )
    : ''

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
      tamanho="md"
      altura="580px"
      abas={[
        {
          id: 'dados',
          rotulo: t('workspace.subscriptions.aba_dados'),
          conteudo: (
            <BannerRequisitosContexto requisitos={requisitos}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
                <CampoGeralGlobal label={t('workspace.subscriptions.tabela.produto')}>
                  <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Package size={16} color="var(--ws-muted)" />
                    <input
                      readOnly
                      value={assinatura?.produto.nome_produto_gravity ?? ''}
                      style={{ width: '100%', fontSize: '0.875rem' }}
                    />
                  </div>
                </CampoGeralGlobal>

                <CampoGeralGlobal label={t('workspace.subscriptions.tabela.cobranca')}>
                  <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Tag size={16} color="var(--ws-muted)" />
                    <input
                      readOnly
                      value={tipoCobrancaLabel}
                      style={{ width: '100%', fontSize: '0.875rem' }}
                    />
                  </div>
                </CampoGeralGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <CampoGeralGlobal label={t('workspace.subscriptions.tabela.valor')}>
                    <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <CurrencyDollar size={16} color="var(--ws-muted)" />
                      <input
                        readOnly
                        value={
                          assinatura
                            ? `${assinatura.produto.moeda_unitario_produto_gravity} ${assinatura.produto.preco_unitario_produto_gravity}`
                            : ''
                        }
                        style={{ width: '100%', fontSize: '0.875rem' }}
                      />
                    </div>
                  </CampoGeralGlobal>

                  <CampoGeralGlobal label={t('workspace.subscriptions.tabela.renovacao')}>
                    <div className="ws-input-icon-wrap" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <CalendarBlank size={16} color="var(--ws-muted)" />
                      <input
                        readOnly
                        value={
                          assinatura?.data_fim_periodo_assinatura_produto_gravity
                            ? new Date(assinatura.data_fim_periodo_assinatura_produto_gravity).toLocaleDateString('pt-BR')
                            : '—'
                        }
                        style={{ width: '100%', fontSize: '0.875rem' }}
                      />
                    </div>
                  </CampoGeralGlobal>
                </div>

                <BannerRequisitosGlobal />
              </div>
            </BannerRequisitosContexto>
          ),
        },
        {
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
        },
      ]}
    />
  )
}
