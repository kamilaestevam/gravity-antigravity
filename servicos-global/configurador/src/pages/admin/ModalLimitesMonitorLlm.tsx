import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Plus, PencilSimple, Trash, Warning, Globe, Buildings, Cube } from '@phosphor-icons/react'
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'

/**
 * ModalLimitesMonitorLlm — F2-J do API Cockpit Monitor LLM
 *
 * CRUD de limites monetarios LLM. Suporta tres escopos:
 *   - GLOBAL       — aplicado a TODAS as orgs
 *   - ORGANIZACAO  — aplicado a UMA org (todos os modelos)
 *   - MODELO       — aplicado a UMA org + UM modelo especifico
 *
 * Comunicacao via proxy do Configurador:
 *   GET    /api/v1/api-cockpit/admin/llm-limites?id_organizacao=...
 *   POST   /api/v1/api-cockpit/admin/llm-limites          (body: { escopo, ... })
 *   PUT    /api/v1/api-cockpit/admin/llm-limites/:id?escopo=...&id_organizacao=...
 *   DELETE /api/v1/api-cockpit/admin/llm-limites/:id?escopo=...&id_organizacao=...
 *
 * v1: id_organizacao via input texto (CUID). v2: dropdown com lista de orgs.
 */

type Escopo = 'GLOBAL' | 'ORGANIZACAO' | 'MODELO'

interface LimiteGlobalRow {
  id_gabi_limite_monetario_global:                  string
  modelo_gabi_limite_monetario_global:              string | null
  limite_aviso_usd_gabi_limite_monetario_global:    string
  limite_bloqueio_usd_gabi_limite_monetario_global: string
  destinatarios_email_gabi_limite_monetario_global: string[]
  ativo_gabi_limite_monetario_global:               boolean
}

interface LimiteOrgRow {
  id_gabi_limite_monetario:                  string
  id_organizacao_gabi_limite_monetario:      string
  modelo_gabi_limite_monetario:              string | null
  limite_aviso_usd_gabi_limite_monetario:    string
  limite_bloqueio_usd_gabi_limite_monetario: string
  destinatarios_email_gabi_limite_monetario: string[]
  ativo_gabi_limite_monetario:               boolean
}

/** Linha unificada para exibicao na TabelaGlobal. */
interface LimiteUnificado {
  id:                  string
  escopo:              Escopo
  id_organizacao:      string | null
  modelo:              string | null
  limite_aviso_usd:    string
  limite_bloqueio_usd: string
  destinatarios_email: string[]
  ativo:               boolean
}

interface FormState {
  escopo:              Escopo
  id_organizacao:      string
  modelo:              string
  todos_modelos:       boolean
  limite_aviso_usd:    string
  limite_bloqueio_usd: string
  destinatarios_email: string[]
  ativo:               boolean
}

const FORM_INICIAL: FormState = {
  escopo:              'GLOBAL',
  id_organizacao:      '',
  modelo:              '',
  todos_modelos:       true,
  limite_aviso_usd:    '',
  limite_bloqueio_usd: '',
  destinatarios_email: [],
  ativo:               true,
}

// Formato monetario USD (pt-BR): "USD 1.000,00"
const fmtUSD = (s: string) =>
  'USD ' + new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(s))

/**
 * Aceita "1000.00" (en-US) OU "1.000,00" (pt-BR) e retorna o canonico
 * en-US ("1000.00") exigido pelo backend. Retorna null se invalido.
 */
function normalizarValorUsd(raw: string): string | null {
  const limpo = raw.trim()
  if (!limpo) return null
  // Se tem virgula -> pt-BR: remove pontos (milhar) e troca virgula por ponto
  const canonico = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo
  return /^\d{1,10}(\.\d{1,2})?$/.test(canonico) ? canonico : null
}

/**
 * Formata para exibicao em pt-BR com 2 decimais.
 * "80" -> "80,00"  ·  "1000.00" -> "1.000,00"  ·  "1.234,5" -> "1.234,50"
 * Mantem o input como digitado se invalido (deixa user corrigir).
 */
function formatarParaExibicao(raw: string): string {
  if (!raw.trim()) return ''
  const canonico = normalizarValorUsd(raw)
  if (!canonico) return raw
  return Number(canonico).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface Props {
  aberto:    boolean
  aoFechar:  () => void
}

export function ModalLimitesMonitorLlm({ aberto, aoFechar }: Props) {
  const [linhas, setLinhas]               = useState<LimiteUnificado[]>([])
  const [carregando, setCarregando]       = useState(false)
  const [erro, setErro]                   = useState<string | null>(null)
  const [filtroOrganizacao, setFiltroOrg] = useState<string>('')

  const [modoForm, setModoForm]   = useState<'lista' | 'criar' | 'editar'>('lista')
  const [editandoId, setEditId]   = useState<string | null>(null)
  const [form, setForm]           = useState<FormState>(FORM_INICIAL)
  const [novoEmail, setNovoEmail] = useState('')
  const [salvando, setSalvando]   = useState(false)

  // ── Carregar lista ────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const url = filtroOrganizacao.trim()
        ? `/api/v1/api-cockpit/admin/llm-limites?id_organizacao=${encodeURIComponent(filtroOrganizacao.trim())}`
        : '/api/v1/api-cockpit/admin/llm-limites'
      const r = await requisicaoAutenticada(url)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()

      const globais = (data.limites_globais ?? []) as LimiteGlobalRow[]
      const orgs    = (data.limites_org      ?? []) as LimiteOrgRow[]

      const unificado: LimiteUnificado[] = [
        ...globais.map((g): LimiteUnificado => ({
          id:                  g.id_gabi_limite_monetario_global,
          escopo:              g.modelo_gabi_limite_monetario_global ? 'MODELO' : 'GLOBAL',
          id_organizacao:      null,
          modelo:              g.modelo_gabi_limite_monetario_global,
          limite_aviso_usd:    g.limite_aviso_usd_gabi_limite_monetario_global,
          limite_bloqueio_usd: g.limite_bloqueio_usd_gabi_limite_monetario_global,
          destinatarios_email: g.destinatarios_email_gabi_limite_monetario_global,
          ativo:               g.ativo_gabi_limite_monetario_global,
        })),
        ...orgs.map((o): LimiteUnificado => ({
          id:                  o.id_gabi_limite_monetario,
          escopo:              o.modelo_gabi_limite_monetario ? 'MODELO' : 'ORGANIZACAO',
          id_organizacao:      o.id_organizacao_gabi_limite_monetario,
          modelo:              o.modelo_gabi_limite_monetario,
          limite_aviso_usd:    o.limite_aviso_usd_gabi_limite_monetario,
          limite_bloqueio_usd: o.limite_bloqueio_usd_gabi_limite_monetario,
          destinatarios_email: o.destinatarios_email_gabi_limite_monetario,
          ativo:               o.ativo_gabi_limite_monetario,
        })),
      ]
      setLinhas(unificado)
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err))
      setLinhas([])
    } finally {
      setCarregando(false)
    }
  }, [filtroOrganizacao])

  useEffect(() => {
    if (aberto) {
      void carregar()
      setModoForm('lista')
    }
  }, [aberto, carregar])

  // ── Acoes ─────────────────────────────────────────────────────────────
  const abrirCriar = () => {
    setEditId(null)
    setForm(FORM_INICIAL)
    setNovoEmail('')
    setModoForm('criar')
  }

  const abrirEditar = (linha: LimiteUnificado) => {
    setEditId(linha.id)
    setForm({
      escopo:              linha.escopo,
      id_organizacao:      linha.id_organizacao ?? '',
      modelo:              linha.modelo ?? '',
      todos_modelos:       linha.modelo === null,
      // Backend grava en-US ("100.00"); exibimos pt-BR ("100,00")
      limite_aviso_usd:    formatarParaExibicao(linha.limite_aviso_usd),
      limite_bloqueio_usd: formatarParaExibicao(linha.limite_bloqueio_usd),
      destinatarios_email: linha.destinatarios_email,
      ativo:               linha.ativo,
    })
    setNovoEmail('')
    setModoForm('editar')
  }

  const validarForm = (): string | null => {
    if (form.escopo !== 'GLOBAL' && !/^c[a-z0-9]{24}$/.test(form.id_organizacao.trim())) {
      return 'id_organizacao deve ser um CUID valido (c + 24 chars)'
    }
    if (!form.todos_modelos && form.modelo.trim().length === 0) {
      return 'modelo obrigatorio quando "todos os modelos" desmarcado'
    }
    const aviso    = normalizarValorUsd(form.limite_aviso_usd)
    const bloqueio = normalizarValorUsd(form.limite_bloqueio_usd)
    if (!aviso)    return 'limite_aviso_usd invalido (use 1000.00 ou 1.000,00)'
    if (!bloqueio) return 'limite_bloqueio_usd invalido (use 1000.00 ou 1.000,00)'
    if (Number(aviso) > Number(bloqueio)) {
      return 'aviso deve ser <= bloqueio'
    }
    // Sobrescreve no form para o salvar() pegar o canonico
    form.limite_aviso_usd    = aviso
    form.limite_bloqueio_usd = bloqueio
    if (form.destinatarios_email.length === 0) {
      return 'pelo menos 1 destinatario de e-mail'
    }
    if (form.destinatarios_email.length > 20) {
      return 'maximo de 20 destinatarios'
    }
    return null
  }

  const salvar = async () => {
    const v = validarForm()
    if (v) { setErro(v); return }
    setSalvando(true)
    setErro(null)
    try {
      const corpo = {
        escopo:              form.escopo,
        ...(form.escopo !== 'GLOBAL' && { id_organizacao: form.id_organizacao.trim() }),
        modelo:              form.todos_modelos ? null : form.modelo.trim(),
        limite_aviso_usd:    form.limite_aviso_usd,
        limite_bloqueio_usd: form.limite_bloqueio_usd,
        destinatarios_email: form.destinatarios_email,
        ativo:               form.ativo,
      }

      let r: Response
      if (modoForm === 'criar') {
        r = await requisicaoAutenticada('/api/v1/api-cockpit/admin/llm-limites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(corpo),
        })
      } else {
        const params = new URLSearchParams({ escopo: form.escopo })
        if (form.escopo !== 'GLOBAL') params.set('id_organizacao', form.id_organizacao.trim())
        const { escopo: _e, id_organizacao: _i, ...corpoUpdate } = corpo
        r = await requisicaoAutenticada(`/api/v1/api-cockpit/admin/llm-limites/${editandoId}?${params}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(corpoUpdate),
        })
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(j?.error?.message || `HTTP ${r.status}`)
      }
      setModoForm('lista')
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err))
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async (linha: LimiteUnificado) => {
    if (!confirm(`Excluir este limite (${linha.escopo})? Acao nao pode ser desfeita.`)) return
    setErro(null)
    try {
      const params = new URLSearchParams({ escopo: linha.escopo })
      if (linha.escopo !== 'GLOBAL' && linha.id_organizacao) {
        params.set('id_organizacao', linha.id_organizacao)
      }
      const r = await requisicaoAutenticada(`/api/v1/api-cockpit/admin/llm-limites/${linha.id}?${params}`, { method: 'DELETE' })
      if (!r.ok && r.status !== 204) {
        const j = await r.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(j?.error?.message || `HTTP ${r.status}`)
      }
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err))
    }
  }

  const adicionarEmail = () => {
    const e = novoEmail.trim()
    if (!e) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setErro('e-mail invalido'); return }
    if (form.destinatarios_email.includes(e)) { setNovoEmail(''); return }
    if (form.destinatarios_email.length >= 20) { setErro('maximo 20 destinatarios'); return }
    setForm({ ...form, destinatarios_email: [...form.destinatarios_email, e] })
    setNovoEmail('')
  }

  const removerEmail = (e: string) => {
    setForm({ ...form, destinatarios_email: form.destinatarios_email.filter((x) => x !== e) })
  }

  // ── Colunas da tabela ─────────────────────────────────────────────────
  const colunas: TabelaGlobalColuna<LimiteUnificado>[] = useMemo(() => [
    {
      key:   'escopo',
      label: 'Escopo',
      tipo:  'texto',
      render: (_v, row) => {
        const Icon = row.escopo === 'GLOBAL' ? Globe : row.escopo === 'ORGANIZACAO' ? Buildings : Cube
        const cor  = row.escopo === 'GLOBAL' ? '#818cf8' : row.escopo === 'ORGANIZACAO' ? '#34d399' : '#f59e0b'
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: cor, fontWeight: 600, fontSize: '0.8125rem' }}>
            <Icon size={14} weight="duotone" /> {row.escopo}
          </span>
        )
      },
    },
    {
      key:   'modelo',
      label: 'Modelo',
      tipo:  'texto',
      render: (_v, row) => row.modelo
        ? <code style={{ fontSize: '0.75rem' }}>{row.modelo}</code>
        : <span style={{ color: 'var(--ws-muted)', fontStyle: 'italic' }}>todos</span>,
    },
    {
      key:   'id_organizacao',
      label: 'Organização',
      tipo:  'texto',
      render: (_v, row) => row.id_organizacao
        ? <code style={{ fontSize: '0.7rem', opacity: 0.8 }}>{row.id_organizacao.slice(0, 12)}…</code>
        : <span style={{ color: 'var(--ws-muted)' }}>—</span>,
    },
    {
      key:   'limite_aviso_usd',
      label: 'Aviso',
      tipo:  'texto',
      align: 'center',
      render: (v) => fmtUSD(v as string),
    },
    {
      key:   'limite_bloqueio_usd',
      label: 'Bloqueio',
      tipo:  'texto',
      align: 'center',
      render: (v) => <span style={{ fontWeight: 600 }}>{fmtUSD(v as string)}</span>,
    },
    {
      key:   'destinatarios_email',
      label: 'E-mails',
      tipo:  'texto',
      align: 'center',
      render: (_v, row) => <span title={row.destinatarios_email.join(', ')}>{row.destinatarios_email.length}</span>,
    },
    {
      key:   'ativo',
      label: 'Ativo',
      tipo:  'texto',
      align: 'center',
      render: (v) => (v as boolean)
        ? <span style={{ color: '#34d399' }}>●</span>
        : <span style={{ color: 'var(--ws-muted)' }}>○</span>,
    },
    {
      key:   '_acoes' as keyof LimiteUnificado,
      label: 'Ações',
      tipo:  'texto',
      align: 'center',
      render: (_v, row) => (
        <span style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => abrirEditar(row)}
            aria-label="Editar limite"
            style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <PencilSimple size={16} weight="duotone" />
          </button>
          <button
            type="button"
            onClick={() => void excluir(row)}
            aria-label="Excluir limite"
            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }}
          >
            <Trash size={16} weight="duotone" />
          </button>
        </span>
      ),
    },
  ], [])

  // ── Render ────────────────────────────────────────────────────────────
  const tituloModal = modoForm === 'lista'
    ? 'Limites monetários · Monitor LLM'
    : modoForm === 'criar'
      ? 'Novo limite monetário'
      : 'Editar limite monetário'

  return (
    <ModalSemSessoesGlobal
      aberto={aberto}
      aoFechar={() => { setModoForm('lista'); aoFechar() }}
      titulo={tituloModal}
      tamanho="xl"
      altura="720px"
    >
      {erro && (
        <div role="alert" style={{
          margin:       '0 1.5rem 1rem',
          padding:      '0.625rem 0.875rem',
          borderRadius: '8px',
          background:   'rgba(248,113,113,0.1)',
          border:       '1px solid rgba(248,113,113,0.3)',
          color:        '#f87171',
          fontSize:     '0.8125rem',
          display:      'flex',
          alignItems:   'center',
          gap:          '0.5rem',
        }}>
          <Warning size={14} weight="fill" /> {erro}
        </div>
      )}

      {modoForm === 'lista' ? (
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
            <div style={{ flex: 1, maxWidth: '420px' }}>
              <CampoGeralGlobal label="Filtrar por organização (CUID, opcional)" htmlFor="filtro-org-limites">
                <input
                  id="filtro-org-limites"
                  type="text"
                  placeholder="Ex: cabc123…"
                  value={filtroOrganizacao}
                  onChange={(e) => setFiltroOrg(e.target.value)}
                  onBlur={() => void carregar()}
                  style={{
                    width:        '100%',
                    padding:      '0.5rem 0.75rem',
                    borderRadius: '6px',
                    background:   'var(--ws-bg-card, rgba(30,41,59,0.5))',
                    border:       '1px solid var(--border-color)',
                    color:        'var(--ws-text)',
                    fontSize:     '0.875rem',
                  }}
                />
              </CampoGeralGlobal>
            </div>
            <BotaoGlobal variante="primario" onClick={abrirCriar} icone={<Plus size={16} />}>
              Novo limite
            </BotaoGlobal>
          </div>

          <TabelaGlobal<LimiteUnificado>
            id="modal-llm-limites"
            colunas={colunas}
            dados={linhas}
            mensagemVazio={
              carregando
                ? 'Carregando limites...'
                : filtroOrganizacao
                  ? 'Sem limites para esta organização. Globais incluídos quando existirem.'
                  : 'Sem limites configurados. Clique em "Novo limite" para criar.'
            }
          />
        </div>
      ) : (
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '560px', overflowY: 'auto' }}>
          <CampoGeralGlobal label="Escopo *" htmlFor="form-escopo">
            <select
              id="form-escopo"
              value={form.escopo}
              onChange={(e) => setForm({ ...form, escopo: e.target.value as Escopo })}
              disabled={modoForm === 'editar'}  // nao permite trocar escopo na edicao
              style={selectStyle}
            >
              <option value="GLOBAL">GLOBAL — aplica a todas as organizações</option>
              <option value="ORGANIZACAO">ORGANIZAÇÃO — aplica a 1 org</option>
              <option value="MODELO">MODELO — aplica a 1 org + 1 modelo</option>
            </select>
          </CampoGeralGlobal>

          {form.escopo !== 'GLOBAL' && (
            <CampoGeralGlobal label="ID da organização (CUID) *" htmlFor="form-id-org">
              <input
                id="form-id-org"
                type="text"
                placeholder="c... (25 chars)"
                value={form.id_organizacao}
                onChange={(e) => setForm({ ...form, id_organizacao: e.target.value })}
                disabled={modoForm === 'editar'}
                style={inputStyle}
              />
            </CampoGeralGlobal>
          )}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.todos_modelos}
                onChange={(e) => setForm({ ...form, todos_modelos: e.target.checked, modelo: e.target.checked ? '' : form.modelo })}
              />
              Aplica a TODOS os modelos
            </label>
          </div>

          {!form.todos_modelos && (
            <CampoGeralGlobal label="Modelo *" htmlFor="form-modelo">
              <input
                id="form-modelo"
                type="text"
                placeholder="ex: gpt-4o-mini"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                style={inputStyle}
              />
            </CampoGeralGlobal>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <CampoGeralGlobal label="Limite de aviso · USD *" htmlFor="form-aviso">
              <div style={{ position: 'relative' }}>
                <span style={prefixoMoedaStyle}>USD</span>
                <input
                  id="form-aviso"
                  type="text"
                  placeholder="1.000,00"
                  value={form.limite_aviso_usd}
                  onChange={(e) => setForm({ ...form, limite_aviso_usd: e.target.value })}
                  onBlur={(e) => setForm({ ...form, limite_aviso_usd: formatarParaExibicao(e.target.value) })}
                  style={inputComPrefixoStyle}
                />
              </div>
            </CampoGeralGlobal>
            <CampoGeralGlobal label="Limite de bloqueio · USD *" htmlFor="form-bloqueio">
              <div style={{ position: 'relative' }}>
                <span style={prefixoMoedaStyle}>USD</span>
                <input
                  id="form-bloqueio"
                  type="text"
                  placeholder="1.500,00"
                  value={form.limite_bloqueio_usd}
                  onChange={(e) => setForm({ ...form, limite_bloqueio_usd: e.target.value })}
                  onBlur={(e) => setForm({ ...form, limite_bloqueio_usd: formatarParaExibicao(e.target.value) })}
                  style={inputComPrefixoStyle}
                />
              </div>
            </CampoGeralGlobal>
          </div>

          <CampoGeralGlobal label={`Destinatários de e-mail (${form.destinatarios_email.length}/20) *`} htmlFor="form-email">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {form.destinatarios_email.map((e) => (
                <span key={e} style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          '0.25rem',
                  padding:      '0.25rem 0.5rem',
                  borderRadius: '999px',
                  background:   'rgba(129,140,248,0.15)',
                  border:       '1px solid rgba(129,140,248,0.3)',
                  color:        '#c7d2fe',
                  fontSize:     '0.75rem',
                }}>
                  {e}
                  <button type="button" onClick={() => removerEmail(e)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0', marginLeft: '0.25rem' }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="form-email"
                type="email"
                placeholder="admin@gravity.com"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarEmail() } }}
                style={{ ...inputStyle, flex: 1 }}
              />
              <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={adicionarEmail}>+ Adicionar</BotaoGlobal>
            </div>
          </CampoGeralGlobal>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Ativo
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <BotaoGlobal variante="secundario" onClick={() => setModoForm('lista')} disabled={salvando}>Cancelar</BotaoGlobal>
            <BotaoGlobal variante="primario" onClick={() => void salvar()} disabled={salvando}>
              {salvando ? 'Salvando...' : (modoForm === 'criar' ? 'Criar' : 'Salvar')}
            </BotaoGlobal>
          </div>
        </div>
      )}
    </ModalSemSessoesGlobal>
  )
}

const inputStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '0.5rem 0.75rem',
  borderRadius: '6px',
  background:   'var(--ws-bg-card, rgba(30,41,59,0.5))',
  border:       '1px solid var(--border-color)',
  color:        'var(--ws-text)',
  fontSize:     '0.875rem',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
}

// Prefixo "USD" embutido no input monetario
const prefixoMoedaStyle: React.CSSProperties = {
  position:      'absolute',
  left:          '0.625rem',
  top:           '50%',
  transform:     'translateY(-50%)',
  fontSize:      '0.75rem',
  fontWeight:    600,
  color:         '#94a3b8',
  pointerEvents: 'none',
  letterSpacing: '0.02em',
}

const inputComPrefixoStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '3rem',
}

export default ModalLimitesMonitorLlm
