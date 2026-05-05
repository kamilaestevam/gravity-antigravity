import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { User, EnvelopeSimple, Buildings, CheckSquare, Square, ShieldCheck, Crown, Lightning, Hourglass, Cube, House, Compass } from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import type { UsuarioOrg } from './Usuarios'
import {
  produtosWorkspaceApi,
  usuariosApi,
  type WorkspaceItem,
  type ProdutoWorkspaceItem,
} from '../../services/api-client'
import { mapRole, nivelToRole, type NivelAcesso, type BackendUserRole } from '../../types/niveis-acesso'
// Convenção canônica <slug>:<secao>:<acao> — FONTE ÚNICA: shared/permissoes-canonicas.ts (Mand. 07)
import {
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  TOGGLES_POR_PRODUTO,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
} from '../../../shared/index.js'

/**
 * Item da lista de chamadas a `PUT /api/v1/usuarios/:id/permissoes` que o
 * Usuarios.tsx deve disparar. O modal já fez o diff (originais × atuais) e
 * resolveu `slug → id_produto_gravity` via cache de `produtosPorWorkspace`.
 *
 * Uma chamada por (id_workspace, id_produto_gravity) — substituição atômica.
 * `permissoes: []` significa "limpar todas as permissões deste produto/workspace".
 */
export interface PermissaoSalvar {
  id_workspace: string
  id_produto_gravity: string
  /** Strings completas no formato `<slug>:<secao>:<acao>`. */
  permissoes: string[]
}

interface ModalEditarUsuarioProps {
  usuario: UsuarioOrg | null
  abaInicial?: string
  workspaces: WorkspaceItem[]
  workspacesSalvos: string[]
  carregandoWorkspaces?: boolean
  /**
   * Lista de tipos (UI label NivelAcesso) que o ator atual pode atribuir ao
   * alvo. Vem do hook `usePodeEditarUsuario` na tela. Vazio ⇒ select de tipo
   * fica desabilitado (somente leitura).
   */
  tiposPermitidos?: NivelAcesso[]
  aoFechar: () => void
  /**
   * Recebe as alterações para persistir. `permissoesParaPersistir` é a lista
   * mínima de chamadas necessárias (apenas (workspace, produto) que mudaram).
   * Se vazia, não há mudanças de permissão — apenas patente/workspaces.
   */
  aoSalvar: (
    dados: UsuarioOrg,
    permissoesParaPersistir: PermissaoSalvar[],
    workspaceIds: string[],
  ) => void
}

/** Mapa rótulo→id para render — derivado de SECOES_PRODUTO (shared). */
const SECOES_PRODUTO_RENDER: Array<{ id: typeof SECOES_PRODUTO[number]; rotulo: string }> = [
  { id: 'dashboard',    rotulo: 'Dashboard' },
  { id: 'kanban',       rotulo: 'Kanban' },
  { id: 'lista',        rotulo: 'Lista' },
  { id: 'configuracao', rotulo: 'Configuração' },
  { id: 'relatorios',   rotulo: 'Relatórios' },
]

const ACOES_PRODUTO_RENDER: Array<{ id: typeof ACOES_PRODUTO[number]; rotulo: string }> = [
  { id: 'ver',    rotulo: 'Ver' },
  { id: 'editar', rotulo: 'Editar' },
]

function PermissaoCheckbox({ label, selecionado, onChange, desabilitado }: { label: string, selecionado: boolean, onChange: (v: boolean) => void, desabilitado?: boolean }) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.45rem 0.75rem', borderRadius: '6px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: desabilitado ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        opacity: desabilitado ? 0.6 : 1
      }}
      onMouseEnter={e => { if(!desabilitado) (e.currentTarget.style.background = 'rgba(255,255,255,0.06)') }}
      onMouseLeave={e => { if(!desabilitado) (e.currentTarget.style.background = 'rgba(255,255,255,0.02)') }}
    >
      <div style={{ color: selecionado ? '#818cf8' : '#64748b', display: 'flex', alignItems: 'center' }}>
        {selecionado ? <CheckSquare size={18} weight="fill" /> : <Square size={18} weight="regular" />}
      </div>
      <input
        type="checkbox"
        checked={selecionado}
        disabled={desabilitado}
        onChange={e => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span style={{ fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 500 }}>{label}</span>
    </label>
  )
}

interface AbaDadosProps {
  nome: string
  email: string
  tipo: NivelAcesso
  /**
   * Lista de tipos (label UI) que o ator pode atribuir ao alvo. Usada para
   * filtrar o `<select>` de tipo. Vazia = select desabilitado.
   */
  tiposPermitidos: NivelAcesso[]
  workspaces: WorkspaceItem[]
  workspacesSalvos: string[]
  onValoresChange: (campo: 'tipo', valor: string) => void
}

const LABEL_TIPO_USUARIO: Record<NivelAcesso, string> = {
  'Super Admin': 'Super Admin — Controle total Gravity',
  'Admin':       'Admin — Administrador Gravity',
  'Master':      'Master — Acesso total na organização',
  'Standard':    'Standard — Acesso conforme permissões',
  'Fornecedor':  'Fornecedor — Acesso externo restrito',
}

// Resumo read-only dos workspaces vinculados, com mesma semântica da coluna
// ACESSO da tabela /workspace/usuarios:
// - Master/Super Admin/Admin (LIMBO): chip "✶ Todos os workspaces"
// - Standard/Fornecedor: chips com nomes de TODOS os workspaces (sem truncar)
function WorkspacesVinculadosResumo({ tipo, workspaces, workspacesSalvos }: {
  tipo: NivelAcesso
  workspaces: WorkspaceItem[]
  workspacesSalvos: string[]
}) {
  const acessoTotal = tipo === 'Master' || tipo === 'Super Admin' || tipo === 'Admin'

  if (acessoTotal) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.3rem 0.75rem', borderRadius: '9999px',
        background: 'rgba(129,140,248,0.1)', color: '#818cf8',
        fontSize: '0.8125rem', fontWeight: 600, fontStyle: 'italic',
        border: '1px solid rgba(129,140,248,0.2)',
      }}>
        ✶ Todos os workspaces
      </span>
    )
  }

  const vinculados = workspaces.filter(w => workspacesSalvos.includes(w.id_workspace))

  if (vinculados.length === 0) {
    return <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>Nenhum workspace vinculado</span>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
      {vinculados.map(w => (
        <span key={w.id_workspace} style={{
          padding: '0.2rem 0.625rem', borderRadius: '9999px',
          background: 'var(--ws-surface)', border: '1px solid var(--ws-accent-border)',
          color: 'var(--ws-text)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap',
        }}>
          {w.nome_workspace}
        </span>
      ))}
    </div>
  )
}

function AbaDados({ nome, email, tipo, tiposPermitidos, workspaces, workspacesSalvos, onValoresChange }: AbaDadosProps) {
  const { t } = useTranslation()
  // Inclui o tipo atual nas opções (mesmo que ator não pudesse setá-lo) — assim
  // o select mostra o valor vigente. Edição é bloqueada se tiposPermitidos vazio.
  const opcoesTipo: NivelAcesso[] = Array.from(new Set<NivelAcesso>([tipo, ...tiposPermitidos]))
  const tipoEditavel = tiposPermitidos.length > 0
  return (
    <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <CampoGeralGlobal label={t('workspace.users.tabela.nome_completo')}>
          <TooltipGlobal descricao="A edição de nome é feita pelo próprio usuário no perfil ou via suporte.">
            <div className="ws-input-icon-wrap">
              <User size={16} />
              <input
                value={nome}
                disabled
                style={{ width: '100%', color: 'var(--ws-muted)', cursor: 'not-allowed' }}
              />
            </div>
          </TooltipGlobal>
        </CampoGeralGlobal>

        <CampoGeralGlobal label={t('comum.email')}>
          <TooltipGlobal descricao="O e-mail é credencial de autenticação. Alterações exigem fluxo dedicado via suporte.">
            <div className="ws-input-icon-wrap">
              <EnvelopeSimple size={16} />
              <input
                type="email"
                value={email}
                disabled
                style={{ width: '100%', color: 'var(--ws-muted)', cursor: 'not-allowed' }}
              />
            </div>
          </TooltipGlobal>
        </CampoGeralGlobal>

        <CampoGeralGlobal label={t('workspace.users.tabela.tipo')}>
          <div className="ws-input-icon-wrap" style={{ padding: 0 }}>
            <select
              value={tipo}
              disabled={!tipoEditavel}
              onChange={e => onValoresChange('tipo', e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: tipoEditavel ? 'var(--ws-text)' : 'var(--ws-muted)',
                cursor: tipoEditavel ? 'pointer' : 'not-allowed',
                padding: '0 1rem 0 2.5rem',
                appearance: 'none',
                height: '100%'
              }}
            >
              {opcoesTipo.map((op) => (
                <option key={op} value={op}>{LABEL_TIPO_USUARIO[op] ?? op}</option>
              ))}
            </select>
            <ShieldCheck size={16} style={{ position: 'absolute', left: '0.875rem', color: 'var(--ws-muted)' }} />
          </div>
        </CampoGeralGlobal>

        <CampoGeralGlobal label={t('workspace.users.workspace_vinculado')}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem', borderRadius: '8px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            minHeight: '2.25rem',
          }}>
            <Buildings size={16} style={{ color: 'var(--ws-muted)', flexShrink: 0 }} />
            <WorkspacesVinculadosResumo tipo={tipo} workspaces={workspaces} workspacesSalvos={workspacesSalvos} />
          </div>
        </CampoGeralGlobal>
      </div>
    </div>
  )
}

function AbaWorkspacesVazio() {
  return (
    <div style={{
      padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem',
      background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)',
    }}>
      Nenhum workspace ativo encontrado nesta organização.
    </div>
  )
}

function AbaWorkspacesMaster({ workspaces }: { workspaces: WorkspaceItem[] }) {
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        role="note"
        aria-label="Informação sobre acesso Master"
        style={{
          padding: '0.875rem 1rem', borderRadius: '8px',
          background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.25)',
          fontSize: '0.8125rem', color: '#c7d2fe', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '0.625rem',
        }}
      >
        <ShieldCheck size={16} weight="fill" style={{ color: '#818cf8', flexShrink: 0 }} />
        Usuários Master têm acesso a todos os workspaces automaticamente. Para alterar, mude o tipo para Standard.
      </div>
      {workspaces.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
          Nenhum workspace encontrado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {workspaces.map((w) => (
            <div key={w.id_workspace} style={{
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.12)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7,
            }}>
              <Buildings size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', color: '#c7d2fe' }}>{w.nome_workspace}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AbaWorkspacesChecklistProps {
  workspaces: WorkspaceItem[]
  workspacesAtivos: string[]
  onToggle: (id_workspace: string, checked: boolean) => void
}

function AbaWorkspacesChecklist({ workspaces, workspacesAtivos, onToggle }: AbaWorkspacesChecklistProps) {
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {workspaces.map((w) => {
        const ativo = workspacesAtivos.includes(w.id_workspace)
        return (
          <label
            key={w.id_workspace}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
              background: ativo ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${ativo ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.15s', userSelect: 'none',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
              background: ativo ? 'rgba(129,140,248,0.2)' : 'transparent',
              border: `2px solid ${ativo ? '#818cf8' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}>
              {ativo && <span style={{ color: '#818cf8', fontSize: '11px', lineHeight: 1, fontWeight: 700 }}>✓</span>}
            </div>
            <input type="checkbox" checked={ativo} onChange={(ev) => onToggle(w.id_workspace, ev.target.checked)} style={{ display: 'none' }} />
            <Buildings size={14} style={{ color: ativo ? '#818cf8' : 'var(--ws-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: ativo ? 'var(--ws-text)' : 'var(--ws-muted)', fontWeight: ativo ? 600 : 400 }}>
              {w.nome_workspace}
            </span>
          </label>
        )
      })}
    </div>
  )
}

interface AbaWorkspacesProps {
  master: boolean
  workspaces: WorkspaceItem[]
  workspacesAtivos: string[]
  carregando: boolean
  onToggle: (id_workspace: string, checked: boolean) => void
}

function AbaWorkspaces({ master, workspaces, workspacesAtivos, carregando, onToggle }: AbaWorkspacesProps) {
  if (carregando) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
        Carregando workspaces...
      </div>
    )
  }
  if (master) return <AbaWorkspacesMaster workspaces={workspaces} />
  if (workspaces.length === 0) return <AbaWorkspacesVazio />
  return <AbaWorkspacesChecklist workspaces={workspaces} workspacesAtivos={workspacesAtivos} onToggle={onToggle} />
}

// ─── Aba Permissões — convenção <slug>:<secao>:<acao> ───────────────────────

interface AbaPermissoesProps {
  /** True para SAdmin/Admin/Master (Mandamento 04 — bypass total). */
  master: boolean
  /** Workspace atualmente selecionado (linhas em UsuarioPermissao são por ws). */
  workspaceSelecionado: string | null
  /** Apenas os workspaces aos quais o usuário está vinculado. */
  workspacesVinculados: WorkspaceItem[]
  /** Produtos contratados pelo workspace selecionado (DTO da rota /workspaces/:id/produtos). */
  produtos: ProdutoWorkspaceItem[]
  /** Permissões ativas do workspace selecionado, como Set para lookup O(1). */
  permissoesDoWorkspace: Set<string>
  carregandoProdutos: boolean
  /** Mensagem de erro de carga (Mandamento 08 — UI não silencia). */
  erroCargaPermissoes: string | null
  erroCargaProdutos: string | null
  /** Mensagem de erro do último save abortado (slug sem id_produto_gravity, etc.). */
  erroSalvar: string | null
  onSelecionarWorkspace: (id_workspace: string) => void
  onTogglePermissao: (chave: string, marcada: boolean) => void
  onSelecionarTudoProduto: (slug: string, marcadas: boolean) => void
}

function AvisoErroCarga({ mensagem, contexto }: { mensagem: string; contexto: string }) {
  return (
    <div style={{
      padding: '0.75rem 1rem', borderRadius: 8,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
      display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
    }}>
      <span style={{ color: '#ef4444', fontSize: '1rem', lineHeight: 1, marginTop: 1 }}>⚠</span>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fca5a5', margin: 0 }}>
          Falha ao carregar {contexto}
        </p>
        <p style={{ fontSize: '0.6875rem', color: '#fda4af', margin: '0.125rem 0 0' }}>
          {mensagem}. Feche e reabra o modal — não salve enquanto o aviso permanecer (risco de sobrescrita).
        </p>
      </div>
    </div>
  )
}

function BannerBypassMasterAdmin({ tipo }: { tipo: NivelAcesso }) {
  const isSAdmin = tipo === 'Super Admin'
  const isAdmin = tipo === 'Admin'
  const isMaster = tipo === 'Master'
  const cor = isSAdmin ? '#22c55e' : isAdmin ? '#06b6d4' : '#818cf8'
  const Icone = isSAdmin ? Lightning : isAdmin ? ShieldCheck : Crown
  const titulo = isSAdmin ? 'Super Admin — acesso global irrestrito'
                : isAdmin  ? 'Admin — acesso global irrestrito'
                :            'Master — acesso total à organização'
  return (
    <div style={{
      padding: '1rem 1.25rem', borderRadius: '10px',
      background: `${cor}10`, border: `1px solid ${cor}33`,
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    }}>
      <Icone size={18} weight="duotone" color={cor} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: cor, margin: 0, marginBottom: '0.25rem' }}>{titulo}</p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
          Este tipo de usuário tem acesso automático a todos os produtos e seções
          (Mandamento 04). Não há permissões granulares para configurar.
        </p>
      </div>
    </div>
  )
}

function CardEmBreve({ titulo, descricao, icone: Icone }: {
  titulo: string
  descricao: string
  icone: PhosphorIcon
}) {
  return (
    <div style={{
      padding: '1rem 1.25rem', borderRadius: '10px',
      background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)',
      opacity: 0.55, display: 'flex', alignItems: 'center', gap: '0.875rem',
    }}>
      <Icone size={18} weight="duotone" color="#64748b" />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', margin: 0 }}>{titulo}</p>
        <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '0.125rem 0 0' }}>{descricao}</p>
      </div>
      <span style={{
        fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        padding: '0.25rem 0.625rem', borderRadius: '999px',
        background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
        border: '1px solid rgba(245,158,11,0.25)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      }}>
        <Hourglass size={11} weight="duotone" /> Em breve
      </span>
    </div>
  )
}

function CardProdutoAtivo({ produto, permissoesDoWorkspace, onTogglePermissao, onSelecionarTudoProduto }: {
  produto: ProdutoWorkspaceItem
  permissoesDoWorkspace: Set<string>
  onTogglePermissao: (chave: string, marcada: boolean) => void
  onSelecionarTudoProduto: (slug: string, marcadas: boolean) => void
}) {
  const slug = produto.product_key
  const nome = produto.catalog?.name ?? slug
  const todasChavesProduto = SECOES_PRODUTO_RENDER.flatMap(s => ACOES_PRODUTO_RENDER.map(a => `${slug}:${s.id}:${a.id}`))
  const ativasNoProduto = todasChavesProduto.filter(c => permissoesDoWorkspace.has(c)).length

  return (
    <div style={{
      borderRadius: '10px', background: 'rgba(129,140,248,0.04)',
      border: '1px solid rgba(129,140,248,0.18)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(129,140,248,0.06)', borderBottom: '1px solid rgba(129,140,248,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Cube size={16} weight="duotone" color="#818cf8" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>{nome}</span>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>{ativasNoProduto}/{TOGGLES_POR_PRODUTO}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button type="button" onClick={() => onSelecionarTudoProduto(slug, true)}
            style={{ padding: '0.25rem 0.625rem', borderRadius: 4, background: 'transparent',
                     border: '1px solid #10b981', color: '#10b981', fontSize: '0.6875rem', fontWeight: 600,
                     cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckSquare size={11} weight="bold" /> Tudo
          </button>
          <button type="button" onClick={() => onSelecionarTudoProduto(slug, false)}
            style={{ padding: '0.25rem 0.625rem', borderRadius: 4, background: 'transparent',
                     border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.6875rem', fontWeight: 600,
                     cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Square size={11} weight="bold" /> Limpar
          </button>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem' }}>
        {/* Cabeçalho da grid 5×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(2, minmax(80px, 1fr))', gap: '0.375rem 0.75rem', alignItems: 'center' }}>
          <div />
          {ACOES_PRODUTO_RENDER.map(a => (
            <span key={a.id} style={{
              fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: a.id === 'ver' ? '#06b6d4' : '#22c55e', textAlign: 'center',
            }}>{a.rotulo}</span>
          ))}

          {SECOES_PRODUTO_RENDER.map(s => (
            <React.Fragment key={s.id}>
              <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 500, paddingLeft: '0.25rem' }}>
                {s.rotulo}
              </span>
              {ACOES_PRODUTO_RENDER.map(a => {
                const chave = `${slug}:${s.id}:${a.id}`
                const marcada = permissoesDoWorkspace.has(chave)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onTogglePermissao(chave, !marcada)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0.4rem', borderRadius: 6, cursor: 'pointer',
                      background: marcada ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.02)',
                      border: marcada ? '1px solid rgba(129,140,248,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: marcada ? '#818cf8' : '#475569', transition: 'all 0.15s',
                    }}
                  >
                    {marcada ? <CheckSquare size={16} weight="fill" /> : <Square size={16} weight="regular" />}
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function AbaPermissoes({
  master, tipo, workspaceSelecionado, workspacesVinculados, produtos, permissoesDoWorkspace,
  carregandoProdutos, erroCargaPermissoes, erroCargaProdutos, erroSalvar,
  onSelecionarWorkspace, onTogglePermissao, onSelecionarTudoProduto,
}: AbaPermissoesProps & { tipo: NivelAcesso }) {
  // Bypass — exibe apenas banner informativo
  if (master) {
    return (
      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <BannerBypassMasterAdmin tipo={tipo} />
      </div>
    )
  }

  // Standard/Fornecedor sem workspaces vinculados — orienta a vincular antes
  if (workspacesVinculados.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
        Vincule este usuário a pelo menos um workspace na aba "Workspaces Vinculados"
        antes de configurar permissões granulares.
      </div>
    )
  }

  const produtosAtivos = produtos.filter(p => PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(p.product_key) && p.is_active)
  const produtosEmBreve = produtos.filter(p => !PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(p.product_key) && p.is_active)

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Avisos de erro de carga (Mandamento 08) */}
      {erroCargaPermissoes && (
        <AvisoErroCarga mensagem={erroCargaPermissoes} contexto="permissões existentes" />
      )}
      {erroCargaProdutos && (
        <AvisoErroCarga mensagem={erroCargaProdutos} contexto="produtos contratados" />
      )}
      {erroSalvar && (
        <AvisoErroCarga mensagem={erroSalvar} contexto="salvar permissões" />
      )}

      {/* Seletor de workspace (só aparece se houver mais de 1 vinculado) */}
      {workspacesVinculados.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem',
                      background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Buildings size={16} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Workspace:</span>
          <select
            value={workspaceSelecionado ?? ''}
            onChange={e => onSelecionarWorkspace(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                     borderRadius: 6, color: 'var(--ws-text)', padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
          >
            {workspacesVinculados.map(w => (
              <option key={w.id_workspace} value={w.id_workspace}>{w.nome_workspace}</option>
            ))}
          </select>
        </div>
      )}

      {/* Bloco 1: Acesso geral (informativo, sem toggle) */}
      <div>
        <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: '#818cf8', marginBottom: '0.5rem' }}>Acesso geral</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <House size={16} color="#22c55e" weight="duotone" />
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>HUB</p>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0 }}>Acesso automático aos workspaces vinculados</p>
            </div>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Compass size={16} color="#22c55e" weight="duotone" />
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>CORE</p>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0 }}>Visão geral filtrada por permissões</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 2: Comunicação (Em breve) */}
      <div>
        <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: '#94a3b8', marginBottom: '0.5rem' }}>Comunicação</p>
        <CardEmBreve
          titulo="E-mail / WhatsApp / Gabi IA"
          descricao="Permissões granulares de canais de comunicação serão configuráveis em breve."
          icone={EnvelopeSimple}
        />
      </div>

      {/* Bloco 3: Produtos */}
      <div>
        <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: '#cbd5e1', marginBottom: '0.5rem' }}>Produtos contratados</p>
        {carregandoProdutos ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
            Carregando produtos...
          </div>
        ) : produtos.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
            Nenhum produto contratado neste workspace.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {produtosAtivos.map(p => (
              <CardProdutoAtivo
                key={p.id}
                produto={p}
                permissoesDoWorkspace={permissoesDoWorkspace}
                onTogglePermissao={onTogglePermissao}
                onSelecionarTudoProduto={onSelecionarTudoProduto}
              />
            ))}
            {produtosEmBreve.map(p => (
              <CardEmBreve
                key={p.id}
                titulo={p.catalog?.name ?? p.product_key}
                descricao="Permissões granulares deste produto serão habilitadas em breve."
                icone={Cube}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalEditarUsuario({ usuario, abaInicial = 'dados', workspaces, workspacesSalvos, carregandoWorkspaces = false, tiposPermitidos = [], aoFechar, aoSalvar }: ModalEditarUsuarioProps) {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  // Estado guarda o nível UI (NivelAcesso); enum DDD é derivado via nivelToRole no save.
  const [tipo, setTipo] = useState<NivelAcesso>('Standard')
  const [workspacesAtivos, setWorkspacesAtivos] = useState<string[]>([])

  // ─── Permissões granulares ───────────────────────────────────────────────
  // Map<id_workspace, Set<chave>> onde `chave` segue formato `<slug>:<secao>:<acao>`.
  // Manter como Record para serialização/diff trivial; converter para Set só na renderização.
  const [permissoesPorWorkspace, setPermissoesPorWorkspace] = useState<Record<string, string[]>>({})
  const [permissoesOriginaisPorWorkspace, setPermissoesOriginaisPorWorkspace] = useState<Record<string, string[]>>({})
  const [workspaceSelecionado, setWorkspaceSelecionado] = useState<string | null>(null)
  const [produtosPorWorkspace, setProdutosPorWorkspace] = useState<Record<string, ProdutoWorkspaceItem[]>>({})
  const [carregandoProdutos, setCarregandoProdutos] = useState(false)
  /** Mandamento 08 — rastreia falha de carga para UI exibir aviso (não silenciar). */
  const [erroCargaPermissoes, setErroCargaPermissoes] = useState<string | null>(null)
  const [erroCargaProdutos, setErroCargaProdutos] = useState<string | null>(null)
  /** Mensagem de erro do save (slug sem id_produto_gravity, etc.). Mand. 08. */
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  // Carga inicial: dados do usuário + permissões existentes (Mand. 09 — Zod no client).
  useEffect(() => {
    if (!usuario) return
    setNome(usuario.nome_usuario)
    setEmail(usuario.email_usuario)
    const nivel = mapRole(usuario.tipo_usuario)
    setTipo(nivel)
    setWorkspacesAtivos(workspacesSalvos)

    // Default workspace selecionado: primeiro vinculado.
    setWorkspaceSelecionado(workspacesSalvos[0] ?? null)

    // Busca permissões reais do banco. Master/SAdmin/Admin têm bypass — não há
    // linhas em UsuarioPermissao para eles (Mand. 04). Para Standard/Fornecedor,
    // carrega o estado atual do banco para popular os toggles.
    if (nivel !== 'Master' && nivel !== 'Super Admin' && nivel !== 'Admin') {
      usuariosApi.listarPermissoes(usuario.id_usuario)
        .then(resp => {
          const map: Record<string, string[]> = {}
          for (const p of resp.permissoes) {
            if (!map[p.id_workspace]) map[p.id_workspace] = []
            map[p.id_workspace].push(p.permissao_usuario)
          }
          setPermissoesPorWorkspace(map)
          setPermissoesOriginaisPorWorkspace(map)
          setErroCargaPermissoes(null)
        })
        .catch(err => {
          // Mandamento 08 — falha alto, sem fallback silencioso.
          // CRÍTICO: NÃO zerar permissoesOriginaisPorWorkspace aqui — se zerássemos,
          // o dirty-check compararia o estado atual contra um "vazio" e na hora do
          // PUT (Fase 02) apagaria todas as permissões reais do banco.
          // Manter o sentinel `null` em ambos sinaliza "estado desconhecido".
          // eslint-disable-next-line no-console
          console.warn('[ModalEditarUsuario] Falha ao carregar permissões do usuário', err)
          setErroCargaPermissoes(err instanceof Error ? err.message : 'Erro desconhecido')
        })
    } else {
      setPermissoesPorWorkspace({})
      setPermissoesOriginaisPorWorkspace({})
      setErroCargaPermissoes(null)
    }
  }, [usuario?.id_usuario, usuario?.tipo_usuario, usuario?.nome_usuario, usuario?.email_usuario, workspacesSalvos])

  // Carga lazy: produtos do workspace atualmente selecionado (cacheado por id_workspace).
  useEffect(() => {
    if (!workspaceSelecionado || produtosPorWorkspace[workspaceSelecionado]) return
    setCarregandoProdutos(true)
    produtosWorkspaceApi.listar(workspaceSelecionado)
      .then(resp => {
        setProdutosPorWorkspace(prev => ({ ...prev, [workspaceSelecionado]: resp.products }))
        setErroCargaProdutos(null)
      })
      .catch(err => {
        // Mandamento 08 — falha alto. Lista vazia + flag de erro evita renderizar
        // catálogo desatualizado, mas mostra aviso na UI.
        // eslint-disable-next-line no-console
        console.warn('[ModalEditarUsuario] Falha ao carregar produtos do workspace', err)
        setProdutosPorWorkspace(prev => ({ ...prev, [workspaceSelecionado]: [] }))
        setErroCargaProdutos(err instanceof Error ? err.message : 'Erro desconhecido')
      })
      .finally(() => setCarregandoProdutos(false))
  }, [workspaceSelecionado])

  // Nome/email são read-only. Apenas `tipo` é editável via select.
  const handleValoresChange = (_campo: 'tipo', valor: string) => {
    setTipo(valor as NivelAcesso)
  }

  const handleTogglePermissao = (chave: string, marcada: boolean) => {
    if (!workspaceSelecionado) return
    setPermissoesPorWorkspace(prev => {
      const atuais = prev[workspaceSelecionado] ?? []
      const novas = marcada ? Array.from(new Set([...atuais, chave])) : atuais.filter(p => p !== chave)
      return { ...prev, [workspaceSelecionado]: novas }
    })
  }

  const handleSelecionarTudoProduto = (slug: string, marcadas: boolean) => {
    if (!workspaceSelecionado) return
    const todasDoProduto = SECOES_PRODUTO_RENDER.flatMap(s => ACOES_PRODUTO_RENDER.map(a => `${slug}:${s.id}:${a.id}`))
    setPermissoesPorWorkspace(prev => {
      const atuais = prev[workspaceSelecionado] ?? []
      const semProduto = atuais.filter(p => !todasDoProduto.includes(p))
      const novas = marcadas ? [...semProduto, ...todasDoProduto] : semProduto
      return { ...prev, [workspaceSelecionado]: novas }
    })
  }

  const handleToggleWorkspace = (id_workspace: string, checked: boolean) => {
    setWorkspacesAtivos((prev) => checked ? [...prev, id_workspace] : prev.filter((id) => id !== id_workspace))
  }

  // Mandamento 04 (LIMBO): Master, Super Admin e Admin têm acesso total implícito
  // a todos os workspaces; checklist de vínculos e permissões granulares não se aplicam.
  const master = tipo === 'Master' || tipo === 'Super Admin' || tipo === 'Admin'

  // Workspaces vinculados (apenas linhas em UsuarioWorkspace) — para o seletor
  // da aba Permissões. Master/Admin/SAdmin não passam por aqui (banner cobre).
  const workspacesVinculados = useMemo<WorkspaceItem[]>(
    () => workspaces.filter(w => workspacesAtivos.includes(w.id_workspace)),
    [workspaces, workspacesAtivos],
  )

  // Total de toggles disponíveis = produtos ativos no ws selecionado × 10 (5 seções × 2 ações).
  const produtosDoWsSelecionado = workspaceSelecionado ? (produtosPorWorkspace[workspaceSelecionado] ?? []) : []
  const produtosAtivosNoWs = produtosDoWsSelecionado.filter(p => p.is_active && PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(p.product_key))
  const totalToggles = master ? 0 : produtosAtivosNoWs.length * TOGGLES_POR_PRODUTO
  const permissoesAtivasDoWs = workspaceSelecionado ? (permissoesPorWorkspace[workspaceSelecionado] ?? []) : []
  const permissoesDoWorkspaceSet = useMemo(() => new Set(permissoesAtivasDoWs), [permissoesAtivasDoWs])
  const countPermissoes = master ? '✶' : permissoesAtivasDoWs.length

  const requisitos = useMemo<RequisitoSalvar[]>(() => [
    { chave: 'nome',  ok: !!nome.trim(),  mensagem: 'Nome do usuário' },
    { chave: 'email', ok: !!email.trim(), mensagem: 'E-mail do usuário' },
    {
      chave: 'workspaces',
      ok: master || workspacesAtivos.length > 0,
      mensagem: 'Tipo Master/Admin ou pelo menos um workspace vinculado',
    },
    // Mandamento 08 — bloqueia save se a carga inicial falhou (evita save fantasma).
    {
      chave: 'carga_permissoes',
      ok: !erroCargaPermissoes,
      mensagem: 'Permissões existentes carregadas com sucesso',
    },
    {
      chave: 'carga_produtos',
      ok: !erroCargaProdutos,
      mensagem: 'Produtos do workspace carregados com sucesso',
    },
  ], [nome, email, master, workspacesAtivos, erroCargaPermissoes, erroCargaProdutos])

  const abas = useMemo(() => [
    {
      id: 'dados',
      rotulo: t('workspace.users.aba_dados'),
      icone: 'user',
      conteudo: (
        <BannerRequisitosContexto requisitos={requisitos}>
          <AbaDados nome={nome} email={email} tipo={tipo} tiposPermitidos={tiposPermitidos} workspaces={workspaces} workspacesSalvos={workspacesSalvos} onValoresChange={handleValoresChange} />
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <BannerRequisitosGlobal />
          </div>
        </BannerRequisitosContexto>
      ),
    },
    {
      id: 'permissoes',
      rotulo: master
        ? `${t('workspace.users.aba_permissoes')} (✶)`
        : `${t('workspace.users.aba_permissoes')} (${countPermissoes}/${totalToggles})`,
      icone: 'shield-check',
      conteudo: (
        <BannerRequisitosContexto requisitos={requisitos}>
          <AbaPermissoes
            master={master}
            tipo={tipo}
            workspaceSelecionado={workspaceSelecionado}
            workspacesVinculados={workspacesVinculados}
            produtos={produtosDoWsSelecionado}
            permissoesDoWorkspace={permissoesDoWorkspaceSet}
            carregandoProdutos={carregandoProdutos}
            erroCargaPermissoes={erroCargaPermissoes}
            erroCargaProdutos={erroCargaProdutos}
            erroSalvar={erroSalvar}
            onSelecionarWorkspace={setWorkspaceSelecionado}
            onTogglePermissao={handleTogglePermissao}
            onSelecionarTudoProduto={handleSelecionarTudoProduto}
          />
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <BannerRequisitosGlobal />
          </div>
        </BannerRequisitosContexto>
      ),
    },
    {
      id: 'espacos',
      rotulo: t('workspace.users.aba_espacos'),
      icone: 'buildings',
      conteudo: (
        <BannerRequisitosContexto requisitos={requisitos}>
          <AbaWorkspaces
            master={master}
            workspaces={workspaces}
            workspacesAtivos={workspacesAtivos}
            carregando={carregandoWorkspaces}
            onToggle={handleToggleWorkspace}
          />
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <BannerRequisitosGlobal />
          </div>
        </BannerRequisitosContexto>
      ),
    },
  ], [nome, email, tipo, tiposPermitidos, master, countPermissoes, totalToggles, workspaceSelecionado, workspacesVinculados, produtosDoWsSelecionado, permissoesDoWorkspaceSet, carregandoProdutos, erroCargaPermissoes, erroCargaProdutos, erroSalvar, workspacesAtivos, workspaces, workspacesSalvos, carregandoWorkspaces, requisitos])

  // Dirty: comparar mapa atual de permissões com mapa carregado do backend
  // (set-based diff, ignora ordem). Para Master/SAdmin/Admin, ignora permissões
  // (bypass — não há linhas no banco).
  const permissoesDirty = useMemo(() => {
    if (master) return false
    const idsTodos = new Set([...Object.keys(permissoesPorWorkspace), ...Object.keys(permissoesOriginaisPorWorkspace)])
    for (const wsId of idsTodos) {
      const atuais = new Set(permissoesPorWorkspace[wsId] ?? [])
      const originais = new Set(permissoesOriginaisPorWorkspace[wsId] ?? [])
      if (atuais.size !== originais.size) return true
      for (const k of atuais) if (!originais.has(k)) return true
    }
    return false
  }, [master, permissoesPorWorkspace, permissoesOriginaisPorWorkspace])

  const nivelOriginal: NivelAcesso | null = usuario ? mapRole(usuario.tipo_usuario) : null
  const dirty = !!(usuario && (
    nome !== usuario.nome_usuario ||
    email !== usuario.email_usuario ||
    tipo !== nivelOriginal ||
    permissoesDirty ||
    (!master && (
      workspacesAtivos.length !== workspacesSalvos.length ||
      workspacesAtivos.some((id) => !workspacesSalvos.includes(id))
    ))
  ))

  const handleSalvar = () => {
    if (!usuario) return
    const tipoBackend: BackendUserRole = nivelToRole(tipo)

    // ─── Diff de permissões: produz a lista mínima de PUTs ──────────────────
    // Para cada (workspace, slug_produto) que tenha conjunto diferente entre
    // originais e atuais, gera uma chamada. Substituição atômica (Fase 02).
    // Master/SAdmin/Admin: sem permissões granulares (Mand. 04).
    const slugsSemId: Array<{ id_workspace: string; slug: string }> = []
    const permissoesParaPersistir: PermissaoSalvar[] = master ? [] : (() => {
      const calls: PermissaoSalvar[] = []
      const wsIds = new Set([
        ...Object.keys(permissoesOriginaisPorWorkspace),
        ...Object.keys(permissoesPorWorkspace),
      ])

      for (const id_workspace of wsIds) {
        const origens = permissoesOriginaisPorWorkspace[id_workspace] ?? []
        const atuais = permissoesPorWorkspace[id_workspace] ?? []

        // Agrupa por slug (primeiro segmento da string canônica)
        const agrupar = (lista: string[]): Map<string, Set<string>> => {
          const out = new Map<string, Set<string>>()
          for (const p of lista) {
            const slug = p.split(':')[0]
            if (!slug) continue
            if (!out.has(slug)) out.set(slug, new Set())
            out.get(slug)!.add(p)
          }
          return out
        }

        const origPorSlug = agrupar(origens)
        const atuaisPorSlug = agrupar(atuais)
        const slugsAfetados = new Set([...origPorSlug.keys(), ...atuaisPorSlug.keys()])

        // Cache de produtos do workspace (já populado pelo useEffect lazy).
        // `product_key` é a chave canônica de slug em ProdutoGravityWorkspace
        // e bate com `catalog.slug` quando o catálogo está presente. Usar
        // product_key como fonte primária para tolerar `catalog === null`
        // (produto soft-deletado mas vínculo ainda ativo).
        const produtosDoWs = produtosPorWorkspace[id_workspace] ?? []
        const slugParaId = new Map<string, string>()
        for (const p of produtosDoWs) {
          // catalog.id é o id_produto_gravity necessário para o PUT.
          // Se catalog===null, não há como fazer o PUT — slug fica fora do map
          // e cai no erro abaixo (Mand. 08).
          if (p.catalog?.id) {
            slugParaId.set(p.product_key, p.catalog.id)
          }
        }

        for (const slug of slugsAfetados) {
          const setOrig = origPorSlug.get(slug) ?? new Set<string>()
          const setNovo = atuaisPorSlug.get(slug) ?? new Set<string>()

          // Sem mudança? pula (não gera PUT inútil)
          const igual = setOrig.size === setNovo.size && [...setOrig].every(p => setNovo.has(p))
          if (igual) continue

          const id_produto_gravity = slugParaId.get(slug)
          if (!id_produto_gravity) {
            // Mandamento 08 — falha alto. Sem id_produto_gravity, o PUT não pode
            // ser feito. Acumula para abortar o save inteiro com mensagem clara
            // (em vez de salvar parcialmente em silêncio).
            slugsSemId.push({ id_workspace, slug })
            continue
          }

          calls.push({
            id_workspace,
            id_produto_gravity,
            permissoes: [...setNovo],
          })
        }
      }
      return calls
    })()

    // Mandamento 08 — aborta o save inteiro se houver slug sem id_produto_gravity.
    // Cenário: produto descontratado entre o open do modal e o save, ou cache stale.
    // Salvar parcialmente seria pior — o usuário acha que limpou e ficou ativo no banco.
    if (slugsSemId.length > 0) {
      const detalhes = slugsSemId.map(s => `${s.slug}@${s.id_workspace}`).join(', ')
      // eslint-disable-next-line no-console
      console.warn('[ModalEditarUsuario] Save abortado — produtos sem id_produto_gravity no cache:', detalhes)
      setErroSalvar(
        `Não foi possível resolver ${slugsSemId.length} produto(s): ${detalhes}. ` +
        `Feche e reabra o modal para recarregar o catálogo antes de salvar.`,
      )
      return
    }
    setErroSalvar(null)

    aoSalvar(
      {
        ...usuario,
        nome_usuario: nome,
        email_usuario: email,
        tipo_usuario: tipoBackend,
      },
      permissoesParaPersistir,
      workspacesAtivos,
    )
  }

  return (
    <ModalFormularioAbasGlobal
      aberto={!!usuario}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<User size={20} weight="duotone" />}
      titulo={t('workspace.users.modal_editar_titulo')}
      subtitulo={t('workspace.users.modal_editar_subtitulo')}
      tamanho="lg"
      altura="650px"
      tipoAbas="pill"
      abaAtivaInicial={abaInicial}
      abas={abas}
      dirty={dirty}
      podesSalvar={requisitos.every(r => r.ok) && !erroCargaPermissoes && !erroCargaProdutos}
    />
  )
}
