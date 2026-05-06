// Componente compartilhado: editor de vínculos usuario↔workspace na linha
// expandida da tabela. Padrão Assinaturas (cânone documentado em
// skills/ux/criacao-telas/SKILL.md), reusado por:
//
//   • src/pages/workspace/Usuarios.tsx       (Configurador — escopo da org)
//   • src/pages/admin/UsuariosAdmin.tsx      (Admin Panel — cross-org via SAdmin)
//
// Mand. 04 garante que MASTER/SAdmin/ADMIN nunca chegam aqui — o caller decide
// pelo branch acessoTotal antes de instanciar este componente.
//
// Decisão arquitetural 2026-05-05: o gating ("podeEditar") é responsabilidade
// do caller. Razão: cada tela tem regra de gating distinta:
//   - Usuarios.tsx       → usePodeEditarUsuario (Mand. 08, anti-self-edit)
//   - UsuariosAdmin.tsx  → opção α: só SUPER_ADMIN edita cross-org
// Manter o hook aqui dentro acoplaria o componente a um único contexto.

import React from 'react'
import { useTranslation } from 'react-i18next'
import { PauseCircle, PlayCircle, ShieldCheck } from '@phosphor-icons/react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { WorkspaceItem } from '../../services/api-client'

// ── Tipos do modo edição em lote (compartilhados) ─────────────────────────
export type EdicaoWorkspacePendente = { tipo: 'toggle'; ativo: boolean }
export type EdicoesPorUsuario = Record<string /* id_workspace */, EdicaoWorkspacePendente>

export interface ExpandidoEditorVinculosProps {
  /** Identificação do alvo — campos mínimos para id e label. */
  usuario: { id_usuario: string; nome_usuario: string }
  /** Decisão de gating do caller. Se false, render é read-only. */
  podeEditar: boolean
  /** Lista completa de workspaces disponíveis (catalogados na org do alvo). */
  workspaces: WorkspaceItem[]
  /** IDs dos workspaces vinculados no servidor (sem aplicar pendências). */
  vinculosServidor: string[]
  /** Pendências locais (rascunho) para este usuário. */
  edicoesPendentes: EdicoesPorUsuario | undefined
  /** IDs selecionados para ação em massa. */
  selecaoIds: string[]
  onSelecaoChange: (ids: string[]) => void
  onStagedToggle: (id_workspace: string) => void
  onAcaoEmMassa: (ids: string[], acao: 'habilitar' | 'bloquear') => void
  onDescartar: () => void
  onSalvar: () => void
  salvando: boolean
}

export function ExpandidoEditorVinculos(props: ExpandidoEditorVinculosProps) {
  const { t } = useTranslation()
  const {
    usuario, podeEditar, workspaces, vinculosServidor,
    edicoesPendentes, selecaoIds, onSelecaoChange,
    onStagedToggle, onAcaoEmMassa, onDescartar, onSalvar, salvando,
  } = props

  // Estado efetivo (servidor + pendência local) por workspace.
  function efetivoPorWorkspace(id_workspace: string): { ativo_efetivo: boolean } {
    const servidor = vinculosServidor.includes(id_workspace)
    const pendente = edicoesPendentes?.[id_workspace]
    return { ativo_efetivo: pendente ? pendente.ativo : servidor }
  }

  const totalSelecionados = selecaoIds.length
  const totalPendentes = edicoesPendentes ? Object.keys(edicoesPendentes).length : 0

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', background: 'var(--ws-surface)' }}>
      {/* Toolbar do expandido — espelha Assinaturas */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(129,140,248,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <ShieldCheck size={14} weight="duotone" color="var(--color-primary)" /> Permissões de Acesso por Workspace
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Toolbar de ações em massa — só aparece se há seleção e ator pode editar */}
          {podeEditar && totalSelecionados > 0 && (
            <>
              <TooltipGlobal descricao="Habilitar acesso dos workspaces selecionados (rascunho — clique em Salvar)">
                <BotaoGlobal
                  variante="secundario"
                  tamanho="pequeno"
                  icone={<PlayCircle size={14} weight="bold" />}
                  onClick={() => onAcaoEmMassa(selecaoIds, 'habilitar')}
                  disabled={salvando}
                >Habilitar</BotaoGlobal>
              </TooltipGlobal>
              <TooltipGlobal descricao="Bloquear acesso dos workspaces selecionados (rascunho — clique em Salvar)">
                <BotaoGlobal
                  variante="secundario"
                  tamanho="pequeno"
                  icone={<PauseCircle size={14} weight="bold" />}
                  onClick={() => onAcaoEmMassa(selecaoIds, 'bloquear')}
                  disabled={salvando}
                >Bloquear</BotaoGlobal>
              </TooltipGlobal>
              {totalPendentes > 0 && (
                <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
              )}
            </>
          )}

          {/* Toolbar Salvar/Descartar — só aparece se há pendentes e ator pode editar */}
          {podeEditar && totalPendentes > 0 && (
            <>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24',
                padding: '0.25rem 0.625rem', borderRadius: '9999px',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.25)',
                animation: salvando ? 'none' : 'ws-pulse-active 2s infinite',
              }}>{totalPendentes === 1 ? '1 alteração pendente' : `${totalPendentes} alterações pendentes`}</span>
              <BotaoGlobal
                variante="fantasma"
                tamanho="pequeno"
                onClick={onDescartar}
                disabled={salvando}
              >Descartar</BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                onClick={onSalvar}
                disabled={salvando}
                style={{ animation: salvando ? 'none' : 'ws-pulse-active 2s infinite' }}
              >{salvando ? 'Salvando…' : 'Salvar alterações'}</BotaoGlobal>
            </>
          )}
        </div>
      </div>

      <TabelaGlobal<WorkspaceItem>
        id={`usuario-workspaces-editor-${usuario.id_usuario}`}
        idKey="id_workspace"
        ocultarBadgeSelecionados
        dados={workspaces}
        tooltipBusca="Filtrar workspaces por nome"
        selecionadosExternos={podeEditar ? selecaoIds : undefined}
        onSelecionadosChange={podeEditar ? onSelecaoChange : undefined}
        bannerSelecaoCustom={podeEditar && totalSelecionados > 0 ? (
          <>
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, color: '#818cf8',
              padding: '0.25rem 0.625rem', borderRadius: '9999px',
              background: 'rgba(129,140,248,0.08)',
              border: '1px solid rgba(129,140,248,0.25)',
            }}>{totalSelecionados === 1 ? '1 selecionado' : `${totalSelecionados} selecionados`}</span>
            {totalSelecionados < workspaces.length && (
              <TooltipGlobal descricao="Estende a seleção para todos os workspaces da tabela">
                <button
                  type="button"
                  onClick={() => onSelecaoChange(workspaces.map((w) => w.id_workspace))}
                  disabled={salvando}
                  style={{
                    background: 'rgba(129,140,248,0.1)',
                    border: '1px solid rgba(129,140,248,0.3)',
                    color: '#818cf8',
                    fontSize: '0.75rem', fontWeight: 700,
                    padding: '0.3rem 0.75rem', borderRadius: '9999px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    opacity: salvando ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (salvando) return
                    e.currentTarget.style.background = 'rgba(129,140,248,0.2)'
                    e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(129,140,248,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'
                  }}
                >Selecionar todos os {workspaces.length} da tabela</button>
              </TooltipGlobal>
            )}
            {totalSelecionados === workspaces.length && workspaces.length > 0 && (
              <TooltipGlobal descricao="Desmarca todos os workspaces selecionados">
                <button
                  type="button"
                  onClick={() => onSelecaoChange([])}
                  disabled={salvando}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(148,163,184,0.3)',
                    color: '#94a3b8',
                    fontSize: '0.75rem', fontWeight: 600,
                    padding: '0.3rem 0.75rem', borderRadius: '9999px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    opacity: salvando ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (salvando) return
                    e.currentTarget.style.background = 'rgba(148,163,184,0.1)'
                    e.currentTarget.style.color = '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >Limpar seleção</button>
              </TooltipGlobal>
            )}
          </>
        ) : null}
        colunas={[
          {
            key: 'nome_workspace',
            label: t('workspace.users.nome_workspace'),
            tipo: 'texto',
            render: (v, item) => (
              <a
                href={`/workspace/workspaces?id=${item.id_workspace}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none' }}
                onClick={(ev) => ev.stopPropagation()}
              >{v as string}</a>
            ),
          },
          {
            key: 'id_workspace',
            label: 'STATUS DO WORKSPACE',
            tipo: 'texto',
            align: 'center',
            render: (_v, ws) => {
              const { ativo_efetivo } = efetivoPorWorkspace(ws.id_workspace)
              return (
                <span style={{
                  display: 'inline-flex',
                  padding: '0.15rem 0.5rem', borderRadius: '4px',
                  fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                  background: ativo_efetivo ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                  color: ativo_efetivo ? '#34d399' : 'var(--ws-muted)',
                  border: ativo_efetivo ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.1)',
                }}>{ativo_efetivo ? 'HABILITADO' : 'BLOQUEADO'}</span>
              )
            },
          },
          {
            key: 'id_workspace',
            label: 'AÇÕES',
            tipo: 'texto',
            align: 'right',
            render: (_v, ws) => {
              const { ativo_efetivo } = efetivoPorWorkspace(ws.id_workspace)
              if (!podeEditar) {
                // Read-only — sem botão, só badge inerte de status na coluna anterior
                return <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)' }}>—</span>
              }
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <TooltipGlobal descricao={
                    ativo_efetivo
                      ? 'Bloquear acesso (rascunho — clique em Salvar)'
                      : 'Habilitar acesso (rascunho — clique em Salvar)'
                  }>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onStagedToggle(ws.id_workspace)
                      }}
                      disabled={salvando}
                      style={{
                        background: 'transparent', border: 'none', cursor: salvando ? 'not-allowed' : 'pointer',
                        color: ativo_efetivo ? '#34d399' : 'var(--ws-muted)',
                        opacity: salvando ? 0.4 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '4px', transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { if (!salvando) e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {ativo_efetivo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
                    </button>
                  </TooltipGlobal>
                </div>
              )
            },
          },
        ]}
        mensagemVazio="Nenhum workspace cadastrado nesta organização."
      />
    </div>
  )
}
